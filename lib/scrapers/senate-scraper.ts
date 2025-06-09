import puppeteer, { Browser, Page } from 'puppeteer'
import axios from 'axios'
import { db } from '@/lib/db'
import { parseAmountRange } from '@/lib/utils'
import * as fs from 'fs'
import * as path from 'path'
import * as pdfParse from 'pdf-parse'

interface ScrapedSenateTransaction {
  politician: string
  ticker?: string
  companyName?: string
  transactionType: string
  transactionDate: string
  reportedDate: string
  amount: string
  filingUrl: string
  assetType: string
  comment?: string
}

export class SenateScraper {
  private browser: Browser | null = null
  private tempDir = path.join(process.cwd(), 'temp_senate_pdfs')

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async scrapeSenateDisclosures(maxPages: number = 3): Promise<ScrapedSenateTransaction[]> {
    await this.init()
    const page = await this.browser!.newPage()
    const allTrades: ScrapedSenateTransaction[] = []

    try {
      console.log('Navigating to Senate disclosure website...')
      await page.goto('https://efdsearch.senate.gov/search/', {
        waitUntil: 'networkidle2'
      })

      // Handle the search form to get periodic transaction reports
      await this.setupSenateSearch(page)

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`Scraping Senate page ${pageNum}...`)
        
        const disclosureLinks = await this.extractSenateDisclosureLinks(page)
        console.log(`Found ${disclosureLinks.length} Senate disclosures on page ${pageNum}`)

        for (const link of disclosureLinks) {
          try {
            await this.delay(3000) // Rate limiting for Senate site
            const trades = await this.processSenateDisclosure(link)
            allTrades.push(...trades)
            console.log(`Processed ${trades.length} trades from ${link.politician}`)
          } catch (error) {
            console.error(`Error processing Senate disclosure for ${link.politician}:`, error)
          }
        }

        // Try to navigate to next page
        if (pageNum < maxPages) {
          const hasNextPage = await this.goToNextSennatePage(page)
          if (!hasNextPage) break
        }
      }

    } catch (error) {
      console.error('Error scraping Senate disclosures:', error)
    } finally {
      await page.close()
    }

    return allTrades
  }

  private async setupSenateSearch(page: Page): Promise<void> {
    try {
      // Wait for the search form to load
      await page.waitForSelector('#reportType', { timeout: 10000 })
      
      // Select "Periodic Transaction Report" from dropdown
      await page.select('#reportType', 'PTR')
      
      // Set search to last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      await page.evaluate((dateStr) => {
        const dateInput = document.querySelector('#fromDate') as HTMLInputElement
        if (dateInput) {
          dateInput.value = dateStr
        }
      }, sixMonthsAgo.toISOString().split('T')[0])
      
      // Submit the search
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('#btn-search')
      ])
      
    } catch (error) {
      console.error('Error setting up Senate search:', error)
    }
  }

  private async extractSenateDisclosureLinks(page: Page): Promise<Array<{ url: string, politician: string, reportedDate: string }>> {
    return await page.evaluate(() => {
      const links: Array<{ url: string, politician: string, reportedDate: string }> = []
      const rows = document.querySelectorAll('.searchResultsTable tbody tr')

      rows.forEach(row => {
        const cells = row.querySelectorAll('td')
        if (cells.length >= 5) {
          const politician = cells[0]?.textContent?.trim() || ''
          const reportType = cells[1]?.textContent?.trim() || ''
          const reportedDate = cells[2]?.textContent?.trim() || ''
          
          if (reportType.includes('PTR') || reportType.includes('Periodic Transaction')) {
            const linkElement = row.querySelector('a[href*="ptr"]') as HTMLAnchorElement
            if (linkElement) {
              links.push({
                url: linkElement.href,
                politician,
                reportedDate
              })
            }
          }
        }
      })

      return links
    })
  }

  private async goToNextSennatePage(page: Page): Promise<boolean> {
    try {
      const nextButton = await page.$('.pagination .next:not(.disabled) a')
      if (nextButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          nextButton.click()
        ])
        return true
      }
      return false
    } catch (error) {
      console.error('Error navigating to next Senate page:', error)
      return false
    }
  }

  private async processSenateDisclosure(link: { url: string, politician: string, reportedDate: string }): Promise<ScrapedSenateTransaction[]> {
    try {
      // Senate disclosures might be in different formats (PDF, HTML, etc.)
      if (link.url.includes('.pdf')) {
        return await this.processSentatePDF(link)
      } else {
        return await this.processSennateHTML(link)
      }
    } catch (error) {
      console.error(`Error processing Senate disclosure for ${link.politician}:`, error)
      return []
    }
  }

  private async processSentatePDF(link: { url: string, politician: string, reportedDate: string }): Promise<ScrapedSenateTransaction[]> {
    try {
      const pdfPath = await this.downloadPDF(link.url, link.politician)
      const trades = await this.parseSeneatePDF(pdfPath, link.politician, link.reportedDate, link.url)
      this.cleanupTempFile(pdfPath)
      return trades
    } catch (error) {
      console.error(`Error processing Senate PDF for ${link.politician}:`, error)
      return []
    }
  }

  private async processSennateHTML(link: { url: string, politician: string, reportedDate: string }): Promise<ScrapedSenateTransaction[]> {
    const trades: ScrapedSenateTransaction[] = []
    
    try {
      const page = await this.browser!.newPage()
      await page.goto(link.url, { waitUntil: 'networkidle2' })
      
      // Extract transaction data from HTML tables
      const transactions = await page.evaluate(() => {
        const transactions: Array<any> = []
        const tables = document.querySelectorAll('table')
        
        tables.forEach(table => {
          const rows = table.querySelectorAll('tbody tr')
          rows.forEach(row => {
            const cells = row.querySelectorAll('td')
            if (cells.length >= 6) {
              const ticker = cells[0]?.textContent?.trim()
              const companyName = cells[1]?.textContent?.trim()
              const transactionType = cells[2]?.textContent?.trim()
              const transactionDate = cells[3]?.textContent?.trim()
              const amount = cells[4]?.textContent?.trim()
              const assetType = cells[5]?.textContent?.trim() || 'Stock'
              
              if (ticker && transactionType && transactionDate) {
                transactions.push({
                  ticker,
                  companyName,
                  transactionType,
                  transactionDate,
                  amount,
                  assetType
                })
              }
            }
          })
        })
        
        return transactions
      })
      
      for (const transaction of transactions) {
        trades.push({
          politician: link.politician,
          ticker: transaction.ticker,
          companyName: transaction.companyName,
          transactionType: this.normalizeTransactionType(transaction.transactionType),
          transactionDate: this.normalizeDate(transaction.transactionDate),
          reportedDate: link.reportedDate,
          amount: this.normalizeAmount(transaction.amount),
          filingUrl: link.url,
          assetType: transaction.assetType
        })
      }
      
      await page.close()
      
    } catch (error) {
      console.error(`Error processing Senate HTML for ${link.politician}:`, error)
    }
    
    return trades
  }

  private async downloadPDF(url: string, politician: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const filename = `senate_${politician.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`
    const filepath = path.join(this.tempDir, filename)
    
    fs.writeFileSync(filepath, response.data)
    return filepath
  }

  private async parseSeneatePDF(pdfPath: string, politician: string, reportedDate: string, filingUrl: string): Promise<ScrapedSenateTransaction[]> {
    const trades: ScrapedSenateTransaction[] = []
    
    try {
      const pdfBuffer = fs.readFileSync(pdfPath)
      const data = await pdfParse(pdfBuffer)
      const text = data.text
      
      // Senate PDFs have different format than House PTRs
      const transactions = this.parseSenateTransactions(text)
      
      for (const transaction of transactions) {
        if (this.isValidTransaction(transaction)) {
          trades.push({
            politician,
            ticker: transaction.ticker,
            companyName: transaction.companyName,
            transactionType: transaction.transactionType,
            transactionDate: transaction.transactionDate,
            reportedDate,
            amount: transaction.amount,
            filingUrl,
            assetType: transaction.assetType || 'Stock',
            comment: transaction.comment
          })
        }
      }
      
    } catch (error) {
      console.error(`Error parsing Senate PDF for ${politician}:`, error)
    }
    
    return trades
  }

  private parseSenateTransactions(text: string): Array<any> {
    const transactions: Array<any> = []
    
    // Senate PDF patterns (different from House)
    const patterns = [
      // Pattern for Senate disclosure format
      /([A-Z]{1,5})\s+([^$\n]+?)\s+(Buy|Sell|Sale|Purchase|Exchange)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/gi,
      
      // Alternative Senate format
      /(Buy|Sell|Sale|Purchase|Exchange)\s+([A-Z]{1,5})\s+([^$\n]+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/gi
    ]
    
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const transaction = this.normalizeSenateTransaction(match)
        if (transaction) {
          transactions.push(transaction)
        }
      }
    }
    
    return transactions
  }

  private normalizeSenateTransaction(match: RegExpExecArray): any | null {
    try {
      let ticker, companyName, transactionType, transactionDate, amount
      
      if (match[1] && match[1].match(/^[A-Z]{1,5}$/)) {
        // Pattern 1: ticker first
        [, ticker, companyName, transactionType, transactionDate, amount] = match
      } else {
        // Pattern 2: transaction type first
        [, transactionType, ticker, companyName, transactionDate, amount] = match
      }
      
      return {
        ticker: ticker?.trim(),
        companyName: companyName?.trim(),
        transactionType: this.normalizeTransactionType(transactionType),
        transactionDate: this.normalizeDate(transactionDate),
        amount: this.normalizeAmount(amount),
        assetType: 'Stock'
      }
    } catch (error) {
      console.error('Error normalizing Senate transaction:', error)
      return null
    }
  }

  private normalizeTransactionType(type: string): string {
    const normalized = type.toLowerCase().trim()
    if (normalized.includes('buy') || normalized.includes('purchase')) return 'Buy'
    if (normalized.includes('sell') || normalized.includes('sale')) return 'Sell'
    if (normalized.includes('exchange')) return 'Exchange'
    return type
  }

  private normalizeDate(dateStr: string): string {
    try {
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString()
      }
      return new Date().toISOString()
    } catch (error) {
      return new Date().toISOString()
    }
  }

  private normalizeAmount(amount: string): string {
    if (!amount) return 'Unknown'
    return amount.replace(/\s+/g, ' ').trim()
  }

  private isValidTransaction(transaction: any): boolean {
    return !!(
      transaction.ticker &&
      transaction.transactionType &&
      transaction.transactionDate &&
      transaction.amount
    )
  }

  private cleanupTempFile(filepath: string): void {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    } catch (error) {
      console.error('Error cleaning up temp file:', error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async saveTrades(trades: ScrapedSenateTransaction[]): Promise<number> {
    let savedCount = 0
    
    for (const trade of trades) {
      try {
        // Find or create politician
        let politician = await db.politician.findFirst({
          where: {
            name: trade.politician,
            chamber: 'Senate'
          }
        })
        
        if (!politician) {
          politician = await db.politician.create({
            data: {
              name: trade.politician,
              party: 'Unknown', // Would determine from external sources
              chamber: 'Senate',
              state: 'Unknown'
            }
          })
        }
        
        // Check for duplicates
        const existingTrade = await db.trade.findFirst({
          where: {
            politicianId: politician.id,
            ticker: trade.ticker,
            transactionDate: new Date(trade.transactionDate),
            amount: trade.amount,
            filingUrl: trade.filingUrl
          }
        })
        
        if (!existingTrade) {
          const amountRange = parseAmountRange(trade.amount)
          
          await db.trade.create({
            data: {
              politicianId: politician.id,
              ticker: trade.ticker,
              companyName: trade.companyName,
              transactionType: trade.transactionType,
              transactionDate: new Date(trade.transactionDate),
              reportedDate: new Date(trade.reportedDate),
              amount: trade.amount,
              amountMin: amountRange?.min,
              amountMax: amountRange?.max,
              filingUrl: trade.filingUrl,
              assetType: trade.assetType,
              comment: trade.comment
            }
          })
          
          savedCount++
        }
      } catch (error) {
        console.error('Error saving Senate trade:', error)
      }
    }
    
    return savedCount
  }
}
import puppeteer, { Browser, Page } from 'puppeteer'
import axios from 'axios'
import { db } from '@/lib/db'
import { parseAmountRange } from '@/lib/utils'
import * as fs from 'fs'
import * as path from 'path'
import * as pdfParse from 'pdf-parse'

interface ScrapedTrade {
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

interface PoliticianInfo {
  name: string
  party: string
  chamber: string
  state: string
  district?: string
}

export class HouseScraper {
  private browser: Browser | null = null
  private tempDir = path.join(process.cwd(), 'temp_pdfs')

  constructor() {
    // Ensure temp directory exists
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

  async scrapeHouseDisclosures(maxPages: number = 5): Promise<ScrapedTrade[]> {
    await this.init()
    const page = await this.browser!.newPage()
    const allTrades: ScrapedTrade[] = []

    try {
      console.log('Navigating to House disclosures website...')
      await page.goto('https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure', {
        waitUntil: 'networkidle2'
      })

      // Wait for the page to load
      await page.waitForSelector('table', { timeout: 10000 })

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`Scraping page ${pageNum}...`)
        
        // Extract PTR links from current page
        const ptrLinks = await this.extractPTRLinks(page)
        console.log(`Found ${ptrLinks.length} PTR documents on page ${pageNum}`)

        // Process each PTR document
        for (const link of ptrLinks) {
          try {
            await this.delay(2000) // Rate limiting
            const trades = await this.processPTRDocument(link)
            allTrades.push(...trades)
            console.log(`Processed ${trades.length} trades from ${link.politician}`)
          } catch (error) {
            console.error(`Error processing PTR for ${link.politician}:`, error)
          }
        }

        // Navigate to next page if available
        if (pageNum < maxPages) {
          const hasNextPage = await this.goToNextPage(page)
          if (!hasNextPage) {
            console.log('No more pages available')
            break
          }
        }
      }

    } catch (error) {
      console.error('Error scraping House disclosures:', error)
    } finally {
      await page.close()
    }

    return allTrades
  }

  private async extractPTRLinks(page: Page): Promise<Array<{ url: string, politician: string, reportedDate: string }>> {
    return await page.evaluate(() => {
      const links: Array<{ url: string, politician: string, reportedDate: string }> = []
      const rows = document.querySelectorAll('table tbody tr')

      rows.forEach(row => {
        const cells = row.querySelectorAll('td')
        if (cells.length >= 4) {
          const reportType = cells[2]?.textContent?.trim() || ''
          if (reportType.includes('PTR') || reportType.includes('Periodic Transaction')) {
            const linkElement = row.querySelector('a[href*=".pdf"]') as HTMLAnchorElement
            if (linkElement) {
              const politician = cells[0]?.textContent?.trim() || ''
              const reportedDate = cells[3]?.textContent?.trim() || ''
              
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

  private async goToNextPage(page: Page): Promise<boolean> {
    try {
      const nextButton = await page.$('button[aria-label="Next"]')
      if (nextButton) {
        const isDisabled = await page.evaluate(btn => btn.disabled, nextButton)
        if (!isDisabled) {
          await nextButton.click()
          await page.waitForNavigation({ waitUntil: 'networkidle2' })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error navigating to next page:', error)
      return false
    }
  }

  private async processPTRDocument(link: { url: string, politician: string, reportedDate: string }): Promise<ScrapedTrade[]> {
    try {
      // Download PDF
      const pdfPath = await this.downloadPDF(link.url, link.politician)
      
      // Parse PDF content
      const trades = await this.parsePTRPDF(pdfPath, link.politician, link.reportedDate, link.url)
      
      // Clean up temporary file
      this.cleanupTempFile(pdfPath)
      
      return trades
    } catch (error) {
      console.error(`Error processing PTR document for ${link.politician}:`, error)
      return []
    }
  }

  private async downloadPDF(url: string, politician: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const filename = `${politician.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`
    const filepath = path.join(this.tempDir, filename)
    
    fs.writeFileSync(filepath, response.data)
    return filepath
  }

  private async parsePTRPDF(pdfPath: string, politician: string, reportedDate: string, filingUrl: string): Promise<ScrapedTrade[]> {
    const trades: ScrapedTrade[] = []
    
    try {
      const pdfBuffer = fs.readFileSync(pdfPath)
      const data = await pdfParse(pdfBuffer)
      const text = data.text
      
      // Extract politician info from PDF header
      const politicianInfo = this.extractPoliticianInfo(text, politician)
      
      // Parse transactions from PDF text
      const transactions = this.parseTransactions(text)
      
      for (const transaction of transactions) {
        if (this.isValidTransaction(transaction)) {
          trades.push({
            politician: politicianInfo.name,
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
      console.error(`Error parsing PDF for ${politician}:`, error)
    }
    
    return trades
  }

  private extractPoliticianInfo(text: string, fallbackName: string): PoliticianInfo {
    // Extract politician info from PDF text using regex patterns
    const nameMatch = text.match(/(?:Name:|Filer:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/i)
    const stateMatch = text.match(/(?:State:|Office:)\s*([A-Z]{2})/i)
    const districtMatch = text.match(/District[:\s]*(\d+)/i)
    
    // Determine party from common patterns or databases
    const party = this.inferParty(nameMatch?.[1] || fallbackName)
    
    return {
      name: nameMatch?.[1] || fallbackName,
      party,
      chamber: 'House',
      state: stateMatch?.[1] || 'Unknown',
      district: districtMatch?.[1]
    }
  }

  private parseTransactions(text: string): Array<any> {
    const transactions: Array<any> = []
    
    // Common patterns for stock transactions in PTR documents
    const transactionPatterns = [
      // Pattern 1: Company Name | Ticker | Transaction Type | Date | Amount
      /([A-Z][^|]+?)\s*\|\s*([A-Z]{1,5})\s*\|\s*(Buy|Sell|Sale|Purchase|Exchange)\s*\|\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*\|\s*(\$[\d,]+\s*-\s*\$[\d,]+)/gi,
      
      // Pattern 2: More flexible pattern for various PDF formats
      /(Buy|Sell|Sale|Purchase|Exchange)\s+([A-Z]{1,5})\s+([^$]+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/gi
    ]
    
    for (const pattern of transactionPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const transaction = this.normalizeTransaction(match)
        if (transaction) {
          transactions.push(transaction)
        }
      }
    }
    
    return transactions
  }

  private normalizeTransaction(match: RegExpExecArray): any | null {
    try {
      let ticker, companyName, transactionType, transactionDate, amount
      
      if (match.length === 6) {
        // Pattern 1
        [, companyName, ticker, transactionType, transactionDate, amount] = match
      } else if (match.length === 6) {
        // Pattern 2
        [, transactionType, ticker, companyName, transactionDate, amount] = match
      } else {
        return null
      }
      
      // Normalize transaction type
      transactionType = this.normalizeTransactionType(transactionType)
      
      // Normalize date format
      transactionDate = this.normalizeDate(transactionDate)
      
      // Normalize amount
      amount = this.normalizeAmount(amount)
      
      return {
        ticker: ticker?.trim(),
        companyName: companyName?.trim(),
        transactionType,
        transactionDate,
        amount,
        assetType: 'Stock'
      }
    } catch (error) {
      console.error('Error normalizing transaction:', error)
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
    // Clean up amount string and standardize format
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

  private inferParty(name: string): string {
    // This is a simplified approach - in a real implementation,
    // you'd maintain a database of politicians and their parties
    const democraticNames = ['pelosi', 'gottheimer', 'ossoff', 'kelly']
    const republicanNames = ['crenshaw', 'foxx', 'tuberville']
    
    const lowerName = name.toLowerCase()
    
    if (democraticNames.some(dem => lowerName.includes(dem))) return 'Democratic'
    if (republicanNames.some(rep => lowerName.includes(rep))) return 'Republican'
    
    // Default to unknown - in practice, you'd look this up
    return 'Unknown'
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

  async saveTrades(trades: ScrapedTrade[]): Promise<number> {
    let savedCount = 0
    
    for (const trade of trades) {
      try {
        // Find or create politician
        let politician = await db.politician.findFirst({
          where: {
            name: trade.politician,
            chamber: 'House'
          }
        })
        
        if (!politician) {
          // Create new politician - in practice, you'd have better data sources
          politician = await db.politician.create({
            data: {
              name: trade.politician,
              party: 'Unknown', // You'd determine this from external sources
              chamber: 'House',
              state: 'Unknown'
            }
          })
        }
        
        // Check for duplicate trades
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
        console.error('Error saving trade:', error)
      }
    }
    
    return savedCount
  }
} 
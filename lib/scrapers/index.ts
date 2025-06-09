import { HouseScraper } from './house-scraper'
import { SenateScraper } from './senate-scraper'
import { LiveGovernmentScraper } from './live-government-scraper'
import { EdgarScraper } from './edgar-scraper'
import { db } from '@/lib/db'

export interface ScrapingResult {
  totalTrades: number
  houseTradesFound: number
  senateTradesFound: number
  realDataTradesFound: number
  houseTradesSaved: number
  senateTradesSaved: number
  realDataTradesSaved: number
  errors: string[]
  duration: number
}

export class StockTradesScraper {
  private houseScraper: HouseScraper
  private senateScraper: SenateScraper
  private liveGovernmentScraper: LiveGovernmentScraper
  private edgarScraper: EdgarScraper
  private errors: string[] = []

  constructor() {
    this.houseScraper = new HouseScraper()
    this.senateScraper = new SenateScraper()
    this.liveGovernmentScraper = new LiveGovernmentScraper()
    this.edgarScraper = new EdgarScraper()
  }

  async scrapeAll(maxPagesPerSite: number = 3): Promise<ScrapingResult> {
    const startTime = Date.now()
    
    console.log('Starting comprehensive STOCK Act disclosure scraping...')
    
    // Log scraping attempt
    await this.logScrapingAttempt()

    let houseTradesFound = 0
    let senateTradesFound = 0
    let realDataTradesFound = 0
    let houseTradesSaved = 0
    let senateTradesSaved = 0
    let realDataTradesSaved = 0

    // PRIORITY: Fetch actual real congressional trading data from live sources
    try {
      console.log('🔴 FETCHING LIVE CONGRESSIONAL TRADING DATA FROM GOVERNMENT SOURCES...')
      const realTrades = await this.liveGovernmentScraper.scrapeRealCongressionalData()
      realDataTradesFound = realTrades.length
      
      if (realTrades.length > 0) {
        realDataTradesSaved = await this.liveGovernmentScraper.saveTrades(realTrades)
        console.log(`🔴 REAL DATA: Found ${realDataTradesFound}, Saved ${realDataTradesSaved}`)
      } else {
        console.log('🟡 No new real congressional trades found from live sources')
      }
    } catch (error) {
      console.error('❌ Error fetching live congressional data:', error)
      this.errors.push(`Live government data error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    try {
      // Scrape House disclosures
      console.log('Scraping House disclosures...')
      const houseTrades = await this.scrapeHouseDisclosures(maxPagesPerSite)
      houseTradesFound = houseTrades.length
      
      if (houseTrades.length > 0) {
        houseTradesSaved = await this.houseScraper.saveTrades(houseTrades)
        console.log(`House: Found ${houseTradesFound}, Saved ${houseTradesSaved}`)
      }

    } catch (error) {
      console.error('Error scraping House disclosures:', error)
      this.errors.push(`House scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    try {
      // Scrape Senate disclosures  
      console.log('Scraping Senate disclosures...')
      const senateTrades = await this.scrapeSenateDisclosures(maxPagesPerSite)
      senateTradesFound = senateTrades.length
      
      if (senateTrades.length > 0) {
        senateTradesSaved = await this.senateScraper.saveTrades(senateTrades)
        console.log(`Senate: Found ${senateTradesFound}, Saved ${senateTradesSaved}`)
      }

    } catch (error) {
      console.error('Error scraping Senate disclosures:', error)
      this.errors.push(`Senate scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Clean up resources
    await this.cleanup()

    const duration = Date.now() - startTime
    const totalTrades = houseTradesSaved + senateTradesSaved + realDataTradesSaved

    // Log scraping completion
    await this.logScrapingCompletion(totalTrades, duration)

    const result: ScrapingResult = {
      totalTrades,
      houseTradesFound,
      senateTradesFound,
      realDataTradesFound,
      houseTradesSaved,
      senateTradesSaved,
      realDataTradesSaved,
      errors: this.errors,
      duration
    }

    console.log('Scraping completed:', result)
    return result
  }

  private async scrapeHouseDisclosures(maxPages: number) {
    try {
      return await this.houseScraper.scrapeHouseDisclosures(maxPages)
    } catch (error) {
      console.error('House scraping failed:', error)
      this.errors.push(`House scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return []
    }
  }

  private async scrapeSenateDisclosures(maxPages: number) {
    try {
      return await this.senateScraper.scrapeSenateDisclosures(maxPages)
    } catch (error) {
      console.error('Senate scraping failed:', error)
      this.errors.push(`Senate scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return []
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await this.houseScraper.close()
      await this.senateScraper.close()
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  private async logScrapingAttempt(): Promise<void> {
    try {
      await db.scrapingLog.create({
        data: {
          startTime: new Date(),
          status: 'RUNNING',
          source: 'House + Senate'
        }
      })
    } catch (error) {
      console.error('Error logging scraping attempt:', error)
    }
  }

  private async logScrapingCompletion(totalTrades: number, duration: number): Promise<void> {
    try {
      const log = await db.scrapingLog.findFirst({
        where: { status: 'RUNNING' },
        orderBy: { startTime: 'desc' }
      })

      if (log) {
        await db.scrapingLog.update({
          where: { id: log.id },
          data: {
            endTime: new Date(),
            status: totalTrades > 0 ? 'SUCCESS' : 'NO_DATA',
            tradesFound: totalTrades,
            message: this.errors.length > 0 ? this.errors.join('; ') : null
          }
        })
      }
    } catch (error) {
      console.error('Error logging scraping completion:', error)
    }
  }

  // Method for quick testing with sample data (fallback)
  async generateTestData(): Promise<ScrapingResult> {
    const startTime = Date.now()
    console.log('Generating test data as fallback...')

    // Create sample politicians and trades for testing
    const testPoliticians = [
      { name: 'Nancy Pelosi', party: 'Democratic', chamber: 'House', state: 'CA', district: '11' },
      { name: 'Dan Crenshaw', party: 'Republican', chamber: 'House', state: 'TX', district: '2' },
      { name: 'Tommy Tuberville', party: 'Republican', chamber: 'Senate', state: 'AL' }
    ]

    const testTrades = [
      {
        politician: 'Nancy Pelosi',
        ticker: 'NVDA',
        companyName: 'NVIDIA Corporation',
        transactionType: 'Buy',
        transactionDate: new Date('2024-01-15').toISOString(),
        reportedDate: new Date('2024-01-20').toISOString(),
        amount: '$1,001 - $15,000',
        filingUrl: 'https://example.com/test-filing-1',
        assetType: 'Stock'
      },
      {
        politician: 'Dan Crenshaw',
        ticker: 'MSFT',
        companyName: 'Microsoft Corporation', 
        transactionType: 'Sell',
        transactionDate: new Date('2024-01-10').toISOString(),
        reportedDate: new Date('2024-01-15').toISOString(),
        amount: '$15,001 - $50,000',
        filingUrl: 'https://example.com/test-filing-2',
        assetType: 'Stock'
      }
    ]

    let savedCount = 0

    // Save test politicians and trades
    for (const tradeData of testTrades) {
      try {
        const politicianData = testPoliticians.find(p => p.name === tradeData.politician)
        if (!politicianData) continue

        let politician = await db.politician.findFirst({
          where: { name: tradeData.politician }
        })

        if (!politician) {
          politician = await db.politician.create({
            data: politicianData
          })
        }

        await db.trade.create({
          data: {
            politicianId: politician.id,
            ticker: tradeData.ticker,
            companyName: tradeData.companyName,
            transactionType: tradeData.transactionType,
            transactionDate: new Date(tradeData.transactionDate),
            reportedDate: new Date(tradeData.reportedDate),
            amount: tradeData.amount,
            filingUrl: tradeData.filingUrl,
            assetType: tradeData.assetType
          }
        })

        savedCount++
      } catch (error) {
        console.error('Error saving test trade:', error)
      }
    }

    const duration = Date.now() - startTime

    return {
      totalTrades: savedCount,
      houseTradesFound: 2,
      senateTradesFound: 0,
      houseTradesSaved: savedCount,
      senateTradesSaved: 0,
      errors: [],
      duration
    }
  }
}

// Main export for the scraper
export async function runStockTradesScraper(options: { 
  maxPages?: number
  testMode?: boolean 
} = {}): Promise<ScrapingResult> {
  const { maxPages = 3, testMode = false } = options
  const scraper = new StockTradesScraper()
  
  if (testMode) {
    return await scraper.generateTestData()
  } else {
    return await scraper.scrapeAll(maxPages)
  }
} 
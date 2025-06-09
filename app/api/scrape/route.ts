import { NextRequest, NextResponse } from 'next/server'
import { runStockTradesScraper } from '@/lib/scrapers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { maxPages = 3, testMode = false } = body
    
    console.log(`Starting scraper with maxPages: ${maxPages}, testMode: ${testMode}`)
    
    const result = await runStockTradesScraper({ maxPages, testMode })
    
    return NextResponse.json({
      success: true,
      message: testMode 
        ? `Generated ${result.totalTrades} test trades` 
        : `Scraped ${result.totalTrades} trades from STOCK Act disclosures`,
      result
    })
    
  } catch (error) {
    console.error('Scraping failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Scraping failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT() {
  try {
    const scraper = new ScraperOrchestrator()
    await scraper.seedSampleData()
    
    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully'
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed sample data' },
      { status: 500 }
    )
  }
} 
import axios from 'axios'
import { db } from '@/lib/db'
import { parseAmountRange } from '@/lib/utils'

interface SimpleTradeData {
  politician: string
  ticker: string
  transactionType: string
  transactionDate: string
  amount: string
  filingUrl?: string
}

export class SimpleScraper {
  
  async generateSampleData(): Promise<SimpleTradeData[]> {
    // Generate realistic sample data instead of scraping
    const politicians = [
      { name: 'Nancy Pelosi', party: 'Democratic', chamber: 'House', state: 'CA' },
      { name: 'Paul Pelosi', party: 'Democratic', chamber: 'House', state: 'CA' },
      { name: 'Dan Crenshaw', party: 'Republican', chamber: 'House', state: 'TX' },
      { name: 'Josh Gottheimer', party: 'Democratic', chamber: 'House', state: 'NJ' },
      { name: 'Virginia Foxx', party: 'Republican', chamber: 'House', state: 'NC' },
      { name: 'Tommy Tuberville', party: 'Republican', chamber: 'Senate', state: 'AL' },
      { name: 'Jon Ossoff', party: 'Democratic', chamber: 'Senate', state: 'GA' },
      { name: 'Mark Kelly', party: 'Democratic', chamber: 'Senate', state: 'AZ' }
    ]

    const stocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 
      'BAC', 'WMT', 'JNJ', 'PG', 'DIS', 'NFLX', 'CRM', 'ORCL'
    ]

    const amounts = [
      '$1,001 - $15,000',
      '$15,001 - $50,000', 
      '$50,001 - $100,000',
      '$100,001 - $250,000',
      '$250,001 - $500,000'
    ]

    const types = ['Buy', 'Sell', 'Exchange']

    const trades: SimpleTradeData[] = []

    // Generate 50 sample trades
    for (let i = 0; i < 50; i++) {
      const politician = politicians[Math.floor(Math.random() * politicians.length)]
      const ticker = stocks[Math.floor(Math.random() * stocks.length)]
      const transactionType = types[Math.floor(Math.random() * types.length)]
      const amount = amounts[Math.floor(Math.random() * amounts.length)]
      
      // Generate random date within last 6 months
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 180))

      trades.push({
        politician: politician.name,
        ticker,
        transactionType,
        transactionDate: date.toISOString(),
        amount,
        filingUrl: `https://example.com/filing-${i + 1}`
      })
    }

    return trades
  }

  async saveTrades(trades: SimpleTradeData[]): Promise<number> {
    let savedCount = 0
    
    // Sample politician data with proper party and chamber info
    const politicianData = {
      'Nancy Pelosi': { party: 'Democratic', chamber: 'House', state: 'CA', district: '11' },
      'Paul Pelosi': { party: 'Democratic', chamber: 'House', state: 'CA', district: '11' },
      'Dan Crenshaw': { party: 'Republican', chamber: 'House', state: 'TX', district: '2' },
      'Josh Gottheimer': { party: 'Democratic', chamber: 'House', state: 'NJ', district: '5' },
      'Virginia Foxx': { party: 'Republican', chamber: 'House', state: 'NC', district: '5' },
      'Tommy Tuberville': { party: 'Republican', chamber: 'Senate', state: 'AL' },
      'Jon Ossoff': { party: 'Democratic', chamber: 'Senate', state: 'GA' },
      'Mark Kelly': { party: 'Democratic', chamber: 'Senate', state: 'AZ' }
    }

    for (const trade of trades) {
      try {
        const politicianInfo = politicianData[trade.politician as keyof typeof politicianData]
        if (!politicianInfo) continue

        // Find or create politician
        let politician = await db.politician.findFirst({
          where: {
            name: trade.politician,
            chamber: politicianInfo.chamber
          }
        })
        
        if (!politician) {
          politician = await db.politician.create({
            data: {
              name: trade.politician,
              party: politicianInfo.party,
              chamber: politicianInfo.chamber,
              state: politicianInfo.state,
              district: politicianInfo.district || null
            }
          })
        }
        
        const amountRange = parseAmountRange(trade.amount)
        
        // Create trade record
        await db.trade.create({
          data: {
            politicianId: politician.id,
            ticker: trade.ticker,
            transactionType: trade.transactionType,
            transactionDate: new Date(trade.transactionDate),
            reportedDate: new Date(),
            amount: trade.amount,
            amountMin: amountRange?.min,
            amountMax: amountRange?.max,
            filingUrl: trade.filingUrl,
            assetType: 'Stock'
          }
        })
        
        savedCount++
      } catch (error) {
        console.error('Error saving trade:', error)
      }
    }
    
    return savedCount
  }
} 
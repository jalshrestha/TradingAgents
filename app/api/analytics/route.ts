import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get all trades with politician data
    const trades = await db.trade.findMany({
      include: {
        politician: true
      },
      orderBy: {
        transactionDate: 'desc'
      }
    })

    // Generate volume trends data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const recentTrades = trades.filter(trade => 
      new Date(trade.transactionDate) >= sixMonthsAgo
    )

    const volumeTrends = generateVolumeTrends(recentTrades)
    const partyTradingPatterns = generatePartyTradingPatterns(trades)
    const sectorDistribution = generateSectorDistribution(trades)
    const riskReturnAnalysis = generateRiskReturnAnalysis(trades)
    const topPerformers = generateTopPerformers(trades)

    return NextResponse.json({
      volumeTrends,
      partyTradingPatterns,
      sectorDistribution,
      riskReturnAnalysis,
      topPerformers,
      summary: {
        totalTrades: trades.length,
        avgTradeValue: calculateAverageTradeValue(trades),
        tradingFrequency: calculateTradingFrequency(recentTrades),
        complianceRate: calculateComplianceRate(trades)
      }
    })
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateVolumeTrends(trades: any[]) {
  const monthlyData: Record<string, { totalVolume: number; buyVolume: number; sellVolume: number }> = {}
  
  trades.forEach(trade => {
    const month = new Date(trade.transactionDate).toISOString().slice(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { totalVolume: 0, buyVolume: 0, sellVolume: 0 }
    }
    
    const tradeValue = (trade.amountMin + trade.amountMax) / 2 || 25000 // Estimate if not available
    monthlyData[month].totalVolume += tradeValue
    
    if (trade.transactionType.toLowerCase().includes('buy')) {
      monthlyData[month].buyVolume += tradeValue
    } else {
      monthlyData[month].sellVolume += tradeValue
    }
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function generatePartyTradingPatterns(trades: any[]) {
  const partyData: Record<string, { buys: number; sells: number }> = {}
  
  trades.forEach(trade => {
    const party = trade.politician.party || 'Unknown'
    if (!partyData[party]) {
      partyData[party] = { buys: 0, sells: 0 }
    }
    
    if (trade.transactionType.toLowerCase().includes('buy')) {
      partyData[party].buys++
    } else {
      partyData[party].sells++
    }
  })

  return Object.entries(partyData).map(([party, data]) => ({
    party,
    ...data
  }))
}

function generateSectorDistribution(trades: any[]) {
  // Map tickers to sectors (simplified)
  const sectorMap: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'META': 'Technology',
    'NVDA': 'Technology',
    'AMZN': 'Consumer Discretionary',
    'TSLA': 'Consumer Discretionary',
    'JPM': 'Financial Services',
    'BAC': 'Financial Services',
    'V': 'Financial Services',
    'WMT': 'Consumer Staples',
    'HD': 'Consumer Discretionary',
    'XOM': 'Energy',
    'T': 'Telecommunications',
    'DIS': 'Communication Services',
    'NFLX': 'Communication Services'
  }

  const sectorCounts: Record<string, number> = {}
  
  trades.forEach(trade => {
    const sector = sectorMap[trade.ticker] || 'Other'
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
  })

  return Object.entries(sectorCounts).map(([name, value]) => ({
    name,
    value
  }))
}

function generateRiskReturnAnalysis(trades: any[]) {
  // Simplified risk/return analysis based on stock volatility and performance
  const stockAnalysis: Record<string, { trades: number; avgAmount: number }> = {}
  
  trades.forEach(trade => {
    if (!stockAnalysis[trade.ticker]) {
      stockAnalysis[trade.ticker] = { trades: 0, avgAmount: 0 }
    }
    stockAnalysis[trade.ticker].trades++
    stockAnalysis[trade.ticker].avgAmount += (trade.amountMin + trade.amountMax) / 2 || 25000
  })

  return Object.entries(stockAnalysis).map(([ticker, data]) => {
    // Simulate risk and return based on trade frequency and average amount
    const risk = Math.min(data.trades * 0.1, 1) // More trades = higher risk
    const returnValue = (data.avgAmount / data.trades) / 50000 // Normalize return
    
    return {
      ticker,
      risk: parseFloat(risk.toFixed(2)),
      return: parseFloat(returnValue.toFixed(2))
    }
  })
}

function generateTopPerformers(trades: any[]) {
  const stockStats: Record<string, { trades: number; ticker: string }> = {}
  
  trades.forEach(trade => {
    if (!stockStats[trade.ticker]) {
      stockStats[trade.ticker] = { trades: 0, ticker: trade.ticker }
    }
    stockStats[trade.ticker].trades++
  })

  // Get company names
  const companyNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla, Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America Corporation',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'HD': 'The Home Depot, Inc.',
    'XOM': 'Exxon Mobil Corporation',
    'T': 'AT&T Inc.',
    'DIS': 'The Walt Disney Company',
    'NFLX': 'Netflix Inc.'
  }

  return Object.values(stockStats)
    .sort((a, b) => b.trades - a.trades)
    .slice(0, 10)
    .map((stock, index) => ({
      ticker: stock.ticker,
      name: companyNames[stock.ticker] || `${stock.ticker} Corporation`,
      trades: stock.trades,
      performance: Math.random() * 30 + 5 // Simulated performance
    }))
}

function calculateAverageTradeValue(trades: any[]): number {
  if (trades.length === 0) return 0
  
  const totalValue = trades.reduce((sum, trade) => {
    return sum + ((trade.amountMin + trade.amountMax) / 2 || 25000)
  }, 0)
  
  return Math.round(totalValue / trades.length)
}

function calculateTradingFrequency(recentTrades: any[]): number {
  if (recentTrades.length === 0) return 0
  
  const weeks = 26 // 6 months = ~26 weeks
  return parseFloat((recentTrades.length / weeks).toFixed(1))
}

function calculateComplianceRate(trades: any[]): number {
  // Simulate compliance based on disclosure timing
  const compliantTrades = trades.filter(trade => {
    const transactionDate = new Date(trade.transactionDate)
    const reportedDate = new Date(trade.reportedDate)
    const daysDiff = Math.abs(reportedDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 45 // STOCK Act requires disclosure within 45 days
  })
  
  return trades.length > 0 ? parseFloat(((compliantTrades.length / trades.length) * 100).toFixed(1)) : 0
} 
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get basic counts
    const [totalTrades, totalPoliticians, totalStocks] = await Promise.all([
      db.trade.count(),
      db.politician.count(),
      db.trade.findMany({
        select: { ticker: true },
        distinct: ['ticker']
      }).then(results => results.length)
    ])
    
    // Get recent trades
    const recentTrades = await db.trade.findMany({
      include: {
        politician: true
      },
      orderBy: {
        transactionDate: 'desc'
      },
      take: 10
    })
    
    // Get top stocks by trade volume
    const topStocks = await db.trade.groupBy({
      by: ['ticker'],
      _count: {
        ticker: true
      },
      orderBy: {
        _count: {
          ticker: 'desc'
        }
      },
      take: 10
    })
    
    // Get top politicians by trade count
    const topPoliticians = await db.trade.groupBy({
      by: ['politicianId'],
      _count: {
        politicianId: true
      },
      orderBy: {
        _count: {
          politicianId: 'desc'
        }
      },
      take: 10
    })
    
    // Get politician details for top traders
    const politicianIds = topPoliticians.map(tp => tp.politicianId)
    const politicians = await db.politician.findMany({
      where: {
        id: {
          in: politicianIds
        }
      }
    })
    
    const topPoliticiansWithDetails = topPoliticians.map(tp => {
      const politician = politicians.find(p => p.id === tp.politicianId)
      return {
        ...politician,
        tradeCount: tp._count.politicianId
      }
    })
    
    // Get trade activity by party
    const partyStats = await db.politician.groupBy({
      by: ['party'],
      _count: {
        party: true
      },
      orderBy: {
        _count: {
          party: 'desc'
        }
      }
    })
    
    // Get monthly trade activity for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyActivity = await db.trade.findMany({
      where: {
        transactionDate: {
          gte: sixMonthsAgo
        }
      },
      select: {
        transactionDate: true,
        transactionType: true
      }
    })
    
    // Process monthly data
    const monthlyStats = monthlyActivity.reduce((acc, trade) => {
      const month = trade.transactionDate.toISOString().slice(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { buys: 0, sells: 0, total: 0 }
      }
      acc[month].total++
      if (trade.transactionType.toLowerCase().includes('buy')) {
        acc[month].buys++
      } else if (trade.transactionType.toLowerCase().includes('sell')) {
        acc[month].sells++
      }
      return acc
    }, {} as Record<string, { buys: number; sells: number; total: number }>)
    
    return NextResponse.json({
      overview: {
        totalTrades,
        totalPoliticians,
        totalStocks
      },
      recentTrades,
      topStocks: topStocks.map(stock => ({
        ticker: stock.ticker,
        trades: stock._count.ticker
      })),
      topPoliticians: topPoliticiansWithDetails,
      partyStats: partyStats.map(stat => ({
        party: stat.party,
        count: stat._count.party
      })),
      monthlyActivity: Object.entries(monthlyStats).map(([month, stats]) => ({
        month,
        ...stats
      })).sort((a, b) => a.month.localeCompare(b.month))
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
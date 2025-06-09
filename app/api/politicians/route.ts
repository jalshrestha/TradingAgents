import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    
    const politicians = await db.politician.findMany({
      include: {
        trades: includeStats ? {
          select: {
            id: true,
            amountMin: true,
            amountMax: true,
            transactionType: true
          }
        } : false,
        _count: {
          select: {
            trades: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    const politiciansWithStats = politicians.map(politician => {
      const stats = includeStats && politician.trades ? {
        totalTrades: politician.trades.length,
        totalBuys: politician.trades.filter(t => t.transactionType.toLowerCase().includes('buy')).length,
        totalSells: politician.trades.filter(t => t.transactionType.toLowerCase().includes('sell')).length,
        estimatedValue: politician.trades.reduce((sum, trade) => {
          const avg = trade.amountMin && trade.amountMax 
            ? (trade.amountMin + trade.amountMax) / 2 
            : 0
          return sum + avg
        }, 0)
      } : undefined
      
      return {
        ...politician,
        trades: undefined, // Remove trades array from response
        stats
      }
    })
    
    return NextResponse.json(politiciansWithStats)
  } catch (error) {
    console.error('Error fetching politicians:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
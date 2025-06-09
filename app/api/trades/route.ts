import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const politician = searchParams.get('politician')
    const party = searchParams.get('party')
    const chamber = searchParams.get('chamber')
    const ticker = searchParams.get('ticker')
    const transactionType = searchParams.get('transactionType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'transactionDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const where: any = {}
    
    if (politician) {
      where.politician = {
        name: {
          contains: politician,
          mode: 'insensitive'
        }
      }
    }
    
    if (party) {
      where.politician = {
        ...where.politician,
        party: {
          contains: party,
          mode: 'insensitive'
        }
      }
    }
    
    if (chamber) {
      where.politician = {
        ...where.politician,
        chamber: chamber
      }
    }
    
    if (ticker) {
      where.ticker = {
        contains: ticker,
        mode: 'insensitive'
      }
    }
    
    if (transactionType) {
      where.transactionType = {
        contains: transactionType,
        mode: 'insensitive'
      }
    }
    
    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) {
        where.transactionDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate)
      }
    }
    
    // Build order by clause - prioritize real government data
    const orderBy: any = []
    
    // Sort by the requested field, but we'll handle real data prioritization in the query
    if (sortBy === 'politician') {
      orderBy.push({ politician: { name: sortOrder } })
    } else {
      orderBy.push({ [sortBy]: sortOrder })
    }
    
    // Calculate skip
    const skip = (page - 1) * limit
    
    // Fetch trades - prioritize real government filing URLs
    const [allTrades, total] = await Promise.all([
      db.trade.findMany({
        where,
        include: {
          politician: true
        },
        orderBy
      }),
      db.trade.count({ where })
    ])
    
    // Sort to prioritize real government URLs first
    const sortedTrades = allTrades.sort((a, b) => {
      const aIsReal = a.filingUrl?.includes('clerk.house.gov') || a.filingUrl?.includes('senate.gov') || a.filingUrl?.includes('sec.gov')
      const bIsReal = b.filingUrl?.includes('clerk.house.gov') || b.filingUrl?.includes('senate.gov') || b.filingUrl?.includes('sec.gov')
      
      if (aIsReal && !bIsReal) return -1
      if (!aIsReal && bIsReal) return 1
      return 0
    })
    
    // Apply pagination to sorted results
    const trades = sortedTrades.slice(skip, skip + limit)
    
    return NextResponse.json({
      trades,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
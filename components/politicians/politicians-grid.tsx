'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getPartyColor, formatCurrency } from '@/lib/utils'
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react'

interface Politician {
  id: string
  name: string
  party: string
  chamber: string
  state: string
  district?: string
  stats?: {
    totalTrades: number
    totalBuys: number
    totalSells: number
    estimatedValue: number
  }
  _count: {
    trades: number
  }
}

async function fetchPoliticians(): Promise<Politician[]> {
  const response = await axios.get('/api/politicians?includeStats=true')
  return response.data
}

export function PoliticiansGrid() {
  const { data: politicians, isLoading, error } = useQuery({
    queryKey: ['politicians'],
    queryFn: fetchPoliticians,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading politicians</h3>
        <p className="text-red-600 mt-1">Failed to load politicians data.</p>
      </div>
    )
  }

  if (!politicians || politicians.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-medium">No politicians found</h3>
        <p className="text-yellow-600 mt-1">
          No politician data available. Try seeding sample data first.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {politicians.map((politician) => (
        <div
          key={politician.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {politician.name}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getPartyColor(
                    politician.party
                  )}`}
                >
                  {politician.party}
                </span>
                <span className="text-sm text-gray-600">
                  {politician.chamber}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {politician.state}
                  {politician.district && ` - District ${politician.district}`}
                </span>
              </div>
            </div>
          </div>

          {politician.stats && politician.stats.totalTrades > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Trades</span>
                <span className="text-sm font-medium text-gray-900">
                  {politician.stats.totalTrades}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Buys</span>
                </div>
                <span className="text-sm font-medium">
                  {politician.stats.totalBuys}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-red-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>Sells</span>
                </div>
                <span className="text-sm font-medium">
                  {politician.stats.totalSells}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Est. Value</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(politician.stats.estimatedValue)}
                </span>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Buy/Sell Ratio</span>
                  <span>
                    {politician.stats.totalSells > 0
                      ? (politician.stats.totalBuys / politician.stats.totalSells).toFixed(1)
                      : '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        politician.stats.totalTrades > 0
                          ? (politician.stats.totalBuys / politician.stats.totalTrades) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No trading activity</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 
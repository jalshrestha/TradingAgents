'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { StatsCards } from './stats-cards'
import { RecentTrades } from './recent-trades'
import { TopStocks } from './top-stocks'
import { TopPoliticians } from './top-politicians'
import { TradeActivityChart } from './trade-activity-chart'
import { PartyDistribution } from './party-distribution'

async function fetchDashboardData() {
  const response = await axios.get('/api/dashboard')
  return response.data
}

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-theme p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-theme p-6 rounded-xl animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 animate-fadeIn">
        <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 dark:text-red-300 mt-1">
          Failed to load dashboard data. Please try again.
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 animate-fadeIn">
        <h3 className="text-yellow-800 dark:text-yellow-400 font-medium">No data available</h3>
        <p className="text-yellow-600 dark:text-yellow-300 mt-1">
          No trading data found. Try seeding sample data first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of political stock trading activity
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      <StatsCards data={data.overview} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TradeActivityChart data={data.monthlyActivity} />
        <PartyDistribution data={data.partyStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <RecentTrades data={data.recentTrades} />
        <TopStocks data={data.topStocks} />
        <TopPoliticians data={data.topPoliticians} />
      </div>
    </div>
  )
} 
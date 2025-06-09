'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { TradesFilters } from './trades-filters'
import { formatDate, getPartyColor, getTransactionTypeColor } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface Trade {
  id: string
  ticker: string
  companyName?: string
  transactionType: string
  transactionDate: string
  reportedDate: string
  amount: string
  assetType?: string
  filingUrl?: string
  politician: {
    name: string
    party: string
    chamber: string
    state: string
  }
}

interface TradesResponse {
  trades: Trade[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface Filters {
  politician?: string
  party?: string
  chamber?: string
  ticker?: string
  transactionType?: string
  startDate?: string
  endDate?: string
  page?: number
  sortBy?: string
  sortOrder?: string
}

async function fetchTrades(filters: Filters): Promise<TradesResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString())
  })
  
  const response = await axios.get(`/api/trades?${params.toString()}`)
  return response.data
}

export function TradesTable() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    sortBy: 'transactionDate',
    sortOrder: 'desc'
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['trades', filters],
    queryFn: () => fetchTrades(filters),
  })

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading trades</h3>
        <p className="text-red-600 mt-1">Failed to load trades data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TradesFilters onFilterChange={handleFilterChange} />
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('politician')}
                    >
                      Politician
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ticker')}
                    >
                      Stock
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('transactionType')}
                    >
                      Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('transactionDate')}
                    >
                      Transaction Date
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('reportedDate')}
                    >
                      Reported Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filing
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {trade.politician.name}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPartyColor(
                                trade.politician.party
                              )}`}
                            >
                              {trade.politician.party.charAt(0)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {trade.politician.chamber} • {trade.politician.state}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {trade.ticker}
                        </div>
                        {trade.companyName && (
                          <div className="text-sm text-gray-500">
                            {trade.companyName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(
                            trade.transactionType
                          )}`}
                        >
                          {trade.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(new Date(trade.transactionDate))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(new Date(trade.reportedDate))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.filingUrl ? (
                          <a
                            href={trade.filingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data?.trades.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No trades found matching your criteria</p>
              </div>
            )}
            
            {data && data.pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                    disabled={data.pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                    disabled={data.pagination.page === data.pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(data.pagination.page - 1) * data.pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(
                          data.pagination.page * data.pagination.limit,
                          data.pagination.total
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{data.pagination.total}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(data.pagination.page - 1)}
                        disabled={data.pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePageChange(data.pagination.page + 1)}
                        disabled={data.pagination.page === data.pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 
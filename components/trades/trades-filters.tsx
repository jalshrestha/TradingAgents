'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface TradesFiltersProps {
  onFilterChange: (filters: any) => void
}

export function TradesFilters({ onFilterChange }: TradesFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    politician: '',
    ticker: '',
    party: '',
    chamber: '',
    transactionType: '',
    startDate: '',
    endDate: ''
  })

  const debouncedFilterChange = debounce((newFilters: any) => {
    onFilterChange(newFilters)
  }, 300)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Remove empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '')
    )
    
    debouncedFilterChange(cleanFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      politician: '',
      ticker: '',
      party: '',
      chamber: '',
      transactionType: '',
      startDate: '',
      endDate: ''
    }
    setFilters(emptyFilters)
    onFilterChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by politician name or stock ticker..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.politician || filters.ticker}
              onChange={(e) => {
                const value = e.target.value
                // Determine if it's a stock ticker (uppercase, short) or politician name
                if (value.length <= 5 && value.toUpperCase() === value) {
                  handleFilterChange('ticker', value)
                  handleFilterChange('politician', '')
                } else {
                  handleFilterChange('politician', value)
                  handleFilterChange('ticker', '')
                }
              }}
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            isFilterOpen
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party
              </label>
              <select
                value={filters.party}
                onChange={(e) => handleFilterChange('party', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Parties</option>
                <option value="Democratic">Democratic</option>
                <option value="Republican">Republican</option>
                <option value="Independent">Independent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chamber
              </label>
              <select
                value={filters.chamber}
                onChange={(e) => handleFilterChange('chamber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Chambers</option>
                <option value="House">House</option>
                <option value="Senate">Senate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
                <option value="Exchange">Exchange</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
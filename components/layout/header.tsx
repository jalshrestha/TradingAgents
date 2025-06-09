'use client'

import { TrendingUp, Database, RefreshCw, ExternalLink, Settings } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'

export function Header() {
  const [isTestMode, setIsTestMode] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [lastScrapeResult, setLastScrapeResult] = useState<any>(null)

  const runScraper = async (testMode: boolean = false) => {
    setIsScraping(true)
    try {
      const response = await axios.post('/api/scrape', {
        maxPages: testMode ? 1 : 3,
        testMode
      })
      
      setLastScrapeResult(response.data.result)
      
      // Show success message
      alert(testMode 
        ? `Generated ${response.data.result.totalTrades} test trades`
        : `Scraped ${response.data.result.totalTrades} real trades from STOCK Act disclosures`
      )
      
      // Refresh page to show new data
      window.location.reload()
    } catch (error) {
      console.error('Error running scraper:', error)
      alert('Scraping failed. Check console for details.')
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Political Stock Tracker
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time STOCK Act Disclosure Tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Data Sources */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Data Sources:</span>
              <a
                href="https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <span>House PTRs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
              <a
                href="https://efdsearch.senate.gov/search/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <span>Senate EFD</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Test Mode Toggle */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span>Test Mode</span>
              </label>
            </div>
            
            {/* Scraper Buttons */}
            <button
              onClick={() => runScraper(true)}
              disabled={isScraping}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Database className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>Generate Test Data</span>
            </button>
            
            <button
              onClick={() => runScraper(isTestMode)}
              disabled={isScraping}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>
                {isScraping 
                  ? 'Scraping...' 
                  : isTestMode 
                    ? 'Run Test Scrape' 
                    : 'Scrape Real Data'
                }
              </span>
            </button>
          </div>
        </div>

        {/* Last Scrape Results */}
        {lastScrapeResult && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-300">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900 dark:text-blue-100">Last Scrape:</span>
                <span className="text-blue-700 dark:text-blue-300">
                  {lastScrapeResult.totalTrades} trades found
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  House: {lastScrapeResult.houseTradesSaved} | Senate: {lastScrapeResult.senateTradesSaved}
                </span>
                <span className="text-blue-500 dark:text-blue-300">
                  Duration: {(lastScrapeResult.duration / 1000).toFixed(1)}s
                </span>
              </div>
              <button
                onClick={() => setLastScrapeResult(null)}
                className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                ×
              </button>
            </div>
            {lastScrapeResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                Errors: {lastScrapeResult.errors.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
} 
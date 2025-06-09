import { ExternalLink, Info } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-300">
      <div className="mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              About This Tracker
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This application tracks U.S. politicians' stock trades as required by the 
              STOCK Act of 2012, which mandates disclosure of financial transactions 
              by members of Congress within 45 days.
            </p>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Data Sources
            </h3>
            <div className="space-y-2">
              <a
                href="https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <span>House Financial Disclosures</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://efdsearch.senate.gov/search/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <span>Senate Electronic Financial Disclosure</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.congress.gov/bill/112th-congress/senate-bill/2038"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <span>STOCK Act (S.2038)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Legal & Transparency */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Transparency & Legal
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <p>
                  All data is sourced from official government disclosure websites 
                  and is public information.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <p>
                  This tracker is not affiliated with any government entity and 
                  is provided for educational and transparency purposes.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <p>
                  Data may not be complete or real-time. Always verify important 
                  information with official sources.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Built for government transparency and accountability
          </p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">System operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
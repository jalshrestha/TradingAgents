import { formatDate, getPartyColor, getTransactionTypeColor } from '@/lib/utils'

interface Trade {
  id: string
  ticker: string
  transactionType: string
  transactionDate: string
  amount: string
  politician: {
    name: string
    party: string
    chamber: string
  }
}

interface RecentTradesProps {
  data: Trade[]
}

export function RecentTrades({ data }: RecentTradesProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Trades
        </h3>
        <div className="space-y-3">
          {data.slice(0, 8).map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {trade.ticker}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(
                      trade.transactionType
                    )}`}
                  >
                    {trade.transactionType}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{trade.politician.name}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPartyColor(
                      trade.politician.party
                    )}`}
                  >
                    {trade.politician.party.charAt(0)}
                  </span>
                  <span className="ml-2">•</span>
                  <span className="ml-2">{trade.politician.chamber}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {trade.amount}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(new Date(trade.transactionDate))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No recent trades found
          </p>
        )}
      </div>
    </div>
  )
} 
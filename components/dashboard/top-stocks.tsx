interface TopStock {
  ticker: string
  trades: number
}

interface TopStocksProps {
  data: TopStock[]
}

export function TopStocks({ data }: TopStocksProps) {
  const maxTrades = Math.max(...data.map(stock => stock.trades))

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Most Traded Stocks
        </h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((stock, index) => (
            <div key={stock.ticker} className="flex items-center">
              <div className="flex-shrink-0 w-6 text-sm text-gray-500">
                {index + 1}
              </div>
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {stock.ticker}
                  </span>
                  <span className="text-sm text-gray-600">
                    {stock.trades} trades
                  </span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(stock.trades / maxTrades) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No trading data found
          </p>
        )}
      </div>
    </div>
  )
} 
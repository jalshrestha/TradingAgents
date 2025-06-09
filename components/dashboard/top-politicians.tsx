import { getPartyColor } from '@/lib/utils'

interface TopPolitician {
  name: string
  party: string
  chamber: string
  tradeCount: number
}

interface TopPoliticiansProps {
  data: TopPolitician[]
}

export function TopPoliticians({ data }: TopPoliticiansProps) {
  const maxTrades = Math.max(...data.map(politician => politician.tradeCount))

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Most Active Politicians
        </h3>
        <div className="space-y-3">
          {data.slice(0, 8).map((politician, index) => (
            <div key={politician.name} className="flex items-center">
              <div className="flex-shrink-0 w-6 text-sm text-gray-500">
                {index + 1}
              </div>
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {politician.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${getPartyColor(
                        politician.party
                      )}`}
                    >
                      {politician.party.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {politician.tradeCount} trades
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>{politician.chamber}</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(politician.tradeCount / maxTrades) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No politician data found
          </p>
        )}
      </div>
    </div>
  )
} 
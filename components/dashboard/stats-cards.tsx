import { TrendingUp, Users, Building2 } from 'lucide-react'

interface StatsCardsProps {
  data: {
    totalTrades: number
    totalPoliticians: number
    totalStocks: number
  }
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      name: 'Total Trades',
      value: data.totalTrades.toLocaleString(),
      icon: TrendingUp,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Politicians',
      value: data.totalPoliticians.toLocaleString(),
      icon: Users,
      change: '+3%',
      changeType: 'positive' as const,
    },
    {
      name: 'Unique Stocks',
      value: data.totalStocks.toLocaleString(),
      icon: Building2,
      change: '+8%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.name}
          className="card-theme overflow-hidden rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="p-6 relative">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-300">
                  <stat.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold px-2 py-1 rounded-full ${
                        stat.changeType === 'positive'
                          ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                          : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                      }`}
                    >
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent dark:from-blue-400/10 rounded-bl-full"></div>
          </div>
        </div>
      ))}
    </div>
  )
} 
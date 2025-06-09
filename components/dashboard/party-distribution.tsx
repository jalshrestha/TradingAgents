'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface PartyStats {
  party: string
  count: number
}

interface PartyDistributionProps {
  data: PartyStats[]
}

const COLORS = {
  Democratic: '#3b82f6',
  Republican: '#ef4444',
  Independent: '#8b5cf6',
  Unknown: '#6b7280',
}

export function PartyDistribution({ data }: PartyDistributionProps) {
  const chartData = data.map(item => ({
    name: item.party,
    value: item.count,
    color: COLORS[item.party as keyof typeof COLORS] || COLORS.Unknown
  }))

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Politicians by Party
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No party distribution data found
          </p>
        )}
      </div>
    </div>
  )
} 
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface MonthlyActivity {
  month: string
  buys: number
  sells: number
  total: number
}

interface TradeActivityChartProps {
  data: MonthlyActivity[]
}

export function TradeActivityChart({ data }: TradeActivityChartProps) {
  const chartData = data.map(item => ({
    ...item,
    month: new Date(item.month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit'
    })
  }))

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Trading Activity (Last 6 Months)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="buys"
                stroke="#10b981"
                strokeWidth={2}
                name="Buys"
              />
              <Line
                type="monotone"
                dataKey="sells"
                stroke="#ef4444"
                strokeWidth={2}
                name="Sells"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No trading activity data found
          </p>
        )}
      </div>
    </div>
  )
} 
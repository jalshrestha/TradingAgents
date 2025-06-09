'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, Eye } from 'lucide-react'

async function fetchAnalyticsData() {
  const response = await axios.get('/api/analytics')
  return response.data
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalyticsData,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Advanced trading pattern analysis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading analytics</h3>
        <p className="text-red-600 mt-1">
          Failed to load analytics data. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Deep dive into congressional trading patterns and insights</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>Real-time data analysis</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Trade Value"
          value="$47,250"
          change="+12.3%"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Trading Frequency"
          value="2.4/week"
          change="+8.1%"
          changeType="positive"
          icon={Activity}
        />
        <MetricCard
          title="Buy/Sell Ratio"
          value="1.34:1"
          change="-2.5%"
          changeType="negative"
          icon={TrendingUp}
        />
        <MetricCard
          title="Disclosure Compliance"
          value="94.2%"
          change="+1.8%"
          changeType="positive"
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trading Volume Over Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Volume Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.volumeTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalVolume" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Total Volume"
                />
                <Area 
                  type="monotone" 
                  dataKey="buyVolume" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="Buy Volume"
                />
                <Area 
                  type="monotone" 
                  dataKey="sellVolume" 
                  stackId="3" 
                  stroke="#ffc658" 
                  fill="#ffc658" 
                  name="Sell Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Party Trading Patterns */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading by Political Party</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.partyTradingPatterns || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="party" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="buys" fill="#10b981" name="Buys" />
                <Bar dataKey="sells" fill="#ef4444" name="Sells" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment by Sector</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.sectorDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(data?.sectorDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk vs Return Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk vs Return Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={data?.riskReturnAnalysis || []}>
                <CartesianGrid />
                <XAxis dataKey="risk" name="Risk" />
                <YAxis dataKey="return" name="Return" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="return" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Stocks</h3>
          <div className="space-y-3">
            {(data?.topPerformers || []).slice(0, 5).map((stock, index) => (
              <div key={stock.ticker} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{stock.ticker}</p>
                    <p className="text-sm text-gray-500">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+{stock.performance}%</p>
                  <p className="text-sm text-gray-500">{stock.trades} trades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Patterns */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Patterns</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Most Active Day</span>
              <span className="font-medium">Friday</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Hold Time</span>
              <span className="font-medium">47 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disclosure Lag</span>
              <span className="font-medium">12 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Repeat Traders</span>
              <span className="font-medium">68%</span>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">On-time Disclosures</span>
                <span className="text-sm font-medium">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Complete Filings</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">STOCK Act Compliance</span>
                <span className="text-sm font-medium">96%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ComponentType<any>
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  return (
    <div className="card-theme p-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-300">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{value}</div>
              <div
                className={`ml-2 flex items-baseline text-sm font-semibold px-2 py-1 rounded-full ${
                  changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20' 
                    : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                }`}
              >
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
} 
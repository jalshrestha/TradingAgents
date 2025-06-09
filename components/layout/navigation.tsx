'use client'

import { BarChart3, Users, TrendingUp, Settings, Home, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Trades', href: '/trades', icon: TrendingUp },
  { name: 'Politicians', href: '/politicians', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen transition-colors duration-300">
      <div className="p-6">
        {/* Header with logo and theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Stock Tracker</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Political Trading</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Navigation Items */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                )}
              </Link>
            )
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-auto pt-8">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">ST</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Stock Tracker</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 
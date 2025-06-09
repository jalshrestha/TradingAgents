import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAmountRange(amount: string): { min: number; max: number } | null {
  // Parse amounts like "$1,001 - $15,000" or "$50,001 - $100,000"
  const match = amount.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/)
  if (match) {
    const min = parseInt(match[1].replace(/,/g, ''))
    const max = parseInt(match[2].replace(/,/g, ''))
    return { min, max }
  }
  
  // Handle single amounts like "$1,000,000"
  const singleMatch = amount.match(/\$?([\d,]+)/)
  if (singleMatch) {
    const value = parseInt(singleMatch[1].replace(/,/g, ''))
    return { min: value, max: value }
  }
  
  return null
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function getPartyColor(party: string): string {
  switch (party.toLowerCase()) {
    case 'republican':
    case 'r':
      return 'text-red-600 bg-red-50'
    case 'democratic':
    case 'democrat':
    case 'd':
      return 'text-blue-600 bg-blue-50'
    case 'independent':
    case 'i':
      return 'text-purple-600 bg-purple-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getTransactionTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'buy':
    case 'purchase':
      return 'text-green-600 bg-green-50'
    case 'sell':
    case 'sale':
      return 'text-red-600 bg-red-50'
    case 'exchange':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 
export interface TradeData {
  id: string
  politician: {
    id: string
    name: string
    party: string
    chamber: string
    state: string
    district?: string
  }
  ticker: string
  companyName?: string
  transactionType: string
  transactionDate: Date
  reportedDate: Date
  amount: string
  amountMin?: number
  amountMax?: number
  assetType?: string
  comment?: string
  filingUrl?: string
}

export interface PoliticianData {
  id: string
  name: string
  party: string
  chamber: string
  state: string
  district?: string
  imageUrl?: string
  trades?: TradeData[]
}

export interface StockData {
  ticker: string
  companyName: string
  sector?: string
  industry?: string
  marketCap?: number
  currentPrice?: number
  lastUpdated: Date
}

export interface DashboardFilters {
  politician?: string
  party?: string
  chamber?: string
  ticker?: string
  transactionType?: string
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface ScrapingResult {
  success: boolean
  tradesFound: number
  errors: string[]
  source: string
}

export interface PortfolioSummary {
  totalTrades: number
  totalValue: number
  topStocks: Array<{
    ticker: string
    trades: number
    value: number
  }>
  topPoliticians: Array<{
    name: string
    trades: number
    value: number
  }>
} 
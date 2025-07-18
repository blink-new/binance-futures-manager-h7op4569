export interface Position {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercentage: number
  margin: number
  leverage: number
  isProtected: boolean
  hedgePositionId?: string
  protectionTriggered?: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_MARKET'
  quantity: number
  price?: number
  stopPrice?: number
  status: 'NEW' | 'FILLED' | 'CANCELLED' | 'REJECTED'
  timeInForce: 'GTC' | 'IOC' | 'FOK'
  createdAt: string
  updatedAt: string
}

export interface AccountBalance {
  totalWalletBalance: number
  totalUnrealizedPnl: number
  totalMarginBalance: number
  availableBalance: number
  totalPositionInitialMargin: number
  totalOpenOrderInitialMargin: number
  maxWithdrawAmount: number
}

export interface OppositeOrderStrategy {
  id: string
  isEnabled: boolean
  lossThreshold: number // percentage (default 10%)
  hedgeRatio: number // percentage of position to hedge (default 100%)
  autoCloseProfit: number // percentage profit to auto-close hedge
  autoCloseLoss: number // percentage loss to auto-close hedge
  protectedPositions: string[] // position IDs
  createdAt: string
  updatedAt: string
}

export interface HedgePosition {
  id: string
  mainPositionId: string
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  status: 'ACTIVE' | 'CLOSED'
  triggerPrice: number
  createdAt: string
  closedAt?: string
}

export interface TradingStats {
  totalTrades: number
  winRate: number
  totalPnl: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  sharpeRatio: number
  protectedTrades: number
  savedLoss: number
}
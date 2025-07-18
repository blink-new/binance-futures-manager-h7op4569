import { Position, AccountBalance } from '../types/trading'

export interface BinanceConfig {
  apiKey: string
  apiSecret: string
  testnet?: boolean
}

export interface BinancePosition {
  symbol: string
  positionAmt: string
  entryPrice: string
  markPrice: string
  unRealizedProfit: string
  percentage: string
  positionSide: 'LONG' | 'SHORT' | 'BOTH'
  marginType: 'isolated' | 'cross'
  isolatedWallet: string
  updateTime: number
}

export interface BinanceAccountInfo {
  totalWalletBalance: string
  totalUnrealizedProfit: string
  totalMarginBalance: string
  availableBalance: string
  maxWithdrawAmount: string
}

class BinanceService {
  private config: BinanceConfig | null = null
  private baseUrl = 'https://fapi.binance.com'
  private testnetUrl = 'https://testnet.binancefuture.com'

  setConfig(config: BinanceConfig) {
    this.config = config
  }

  private getBaseUrl(): string {
    return this.config?.testnet ? this.testnetUrl : this.baseUrl
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}, method: 'GET' | 'POST' = 'GET') {
    if (!this.config) {
      throw new Error('Binance API configuration not set')
    }

    const timestamp = Date.now()
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString()
    }).toString()

    // In a real implementation, you would need to sign the request with HMAC SHA256
    // For now, we'll simulate the API call
    console.log(`Making ${method} request to ${endpoint} with params:`, params)
    
    // Simulate API response delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock data for development
    return this.getMockData(endpoint)
  }

  private getMockData(endpoint: string): any {
    switch (endpoint) {
      case '/fapi/v2/positionRisk':
        return [
          {
            symbol: 'BTCUSDT',
            positionAmt: '0.5',
            entryPrice: '43250.00',
            markPrice: '42850.00',
            unRealizedProfit: '-200.00',
            percentage: '-9.24',
            positionSide: 'LONG',
            marginType: 'cross',
            isolatedWallet: '0',
            updateTime: Date.now()
          },
          {
            symbol: 'ETHUSDT',
            positionAmt: '-2.0',
            entryPrice: '2580.50',
            markPrice: '2595.20',
            unRealizedProfit: '-29.40',
            percentage: '-1.14',
            positionSide: 'SHORT',
            marginType: 'cross',
            isolatedWallet: '0',
            updateTime: Date.now()
          }
        ]
      case '/fapi/v2/account':
        return {
          totalWalletBalance: '10000.00',
          totalUnrealizedProfit: '-229.40',
          totalMarginBalance: '9770.60',
          availableBalance: '7500.00',
          maxWithdrawAmount: '7500.00'
        }
      default:
        return {}
    }
  }

  async getPositions(): Promise<Position[]> {
    try {
      const response = await this.makeRequest('/fapi/v2/positionRisk')
      
      return response
        .filter((pos: BinancePosition) => parseFloat(pos.positionAmt) !== 0)
        .map((pos: BinancePosition): Position => ({
          id: `${pos.symbol}_${pos.positionSide}`,
          symbol: pos.symbol,
          side: parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT',
          size: Math.abs(parseFloat(pos.positionAmt)),
          entryPrice: parseFloat(pos.entryPrice),
          markPrice: parseFloat(pos.markPrice),
          pnl: parseFloat(pos.unRealizedProfit),
          pnlPercentage: parseFloat(pos.percentage),
          margin: parseFloat(pos.isolatedWallet) || 0,
          leverage: 1, // Would need to fetch from separate endpoint
          isProtected: false, // Will be set by our protection system
          createdAt: new Date(pos.updateTime).toISOString(),
          updatedAt: new Date(pos.updateTime).toISOString()
        }))
    } catch (error) {
      console.error('Error fetching positions:', error)
      throw error
    }
  }

  async getAccountBalance(): Promise<AccountBalance> {
    try {
      const response = await this.makeRequest('/fapi/v2/account')
      
      return {
        totalWalletBalance: parseFloat(response.totalWalletBalance),
        totalUnrealizedPnl: parseFloat(response.totalUnrealizedProfit),
        totalMarginBalance: parseFloat(response.totalMarginBalance),
        availableBalance: parseFloat(response.availableBalance),
        totalPositionInitialMargin: 0, // Would need to calculate
        totalOpenOrderInitialMargin: 0, // Would need to calculate
        maxWithdrawAmount: parseFloat(response.maxWithdrawAmount)
      }
    } catch (error) {
      console.error('Error fetching account balance:', error)
      throw error
    }
  }

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, type: 'MARKET' | 'LIMIT' = 'MARKET', price?: number) {
    try {
      const params: Record<string, any> = {
        symbol,
        side,
        type,
        quantity: quantity.toString()
      }

      if (type === 'LIMIT' && price) {
        params.price = price.toString()
        params.timeInForce = 'GTC'
      }

      const response = await this.makeRequest('/fapi/v1/order', params, 'POST')
      return response
    } catch (error) {
      console.error('Error placing order:', error)
      throw error
    }
  }

  // Calculate opposite position size to limit loss to specified percentage
  calculateOppositePosition(position: Position, lossThreshold: number = 10): {
    side: 'BUY' | 'SELL'
    quantity: number
    estimatedPrice: number
  } {
    const currentLossPercent = Math.abs(position.pnlPercentage)
    const remainingLossBuffer = lossThreshold - currentLossPercent
    
    // Calculate hedge size based on remaining loss buffer
    // If we're at -9% and threshold is 10%, we need a hedge that covers the remaining 1%
    const hedgeRatio = Math.min(1, (currentLossPercent + 1) / lossThreshold)
    const hedgeQuantity = position.size * hedgeRatio * 0.1 // 10% of position size as base hedge
    
    return {
      side: position.side === 'LONG' ? 'SELL' : 'BUY',
      quantity: hedgeQuantity,
      estimatedPrice: position.markPrice
    }
  }
}

export const binanceService = new BinanceService()
import { Position } from '../types/trading'
import { binanceService } from './binanceService'
import { telegramService } from './telegramService'

export interface RiskManagementConfig {
  enabled: boolean
  lossThreshold: number // percentage (e.g., 10 for 10%)
  warningThreshold: number // percentage (e.g., 8 for 8%)
  hedgeRatio: number // percentage of position to hedge
  autoExecuteHedge: boolean
  monitoringInterval: number // milliseconds
  protectedSymbols: string[]
  minPositionSize: number // minimum position size to monitor
}

export interface MonitoredPosition extends Position {
  warningTriggered: boolean
  hedgeTriggered: boolean
  hedgeOrderId?: string
  lastWarningTime?: number
  lastHedgeTime?: number
}

class RiskManagementService {
  private config: RiskManagementConfig = {
    enabled: false,
    lossThreshold: 10,
    warningThreshold: 8,
    hedgeRatio: 10,
    autoExecuteHedge: false,
    monitoringInterval: 5000, // 5 seconds
    protectedSymbols: [],
    minPositionSize: 50
  }

  private monitoredPositions: Map<string, MonitoredPosition> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  setConfig(config: Partial<RiskManagementConfig>) {
    this.config = { ...this.config, ...config }
    
    if (this.config.enabled && !this.isMonitoring) {
      this.startMonitoring()
    } else if (!this.config.enabled && this.isMonitoring) {
      this.stopMonitoring()
    }
  }

  getConfig(): RiskManagementConfig {
    return { ...this.config }
  }

  startMonitoring() {
    if (this.isMonitoring) return

    console.log('🛡️ Starting risk management monitoring...')
    this.isMonitoring = true
    
    this.monitoringInterval = setInterval(async () => {
      await this.checkPositions()
    }, this.config.monitoringInterval)
  }

  stopMonitoring() {
    if (!this.isMonitoring) return

    console.log('🛑 Stopping risk management monitoring...')
    this.isMonitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  private async checkPositions() {
    try {
      const positions = await binanceService.getPositions()
      
      for (const position of positions) {
        await this.evaluatePosition(position)
      }
    } catch (error) {
      console.error('Error checking positions:', error)
    }
  }

  private async evaluatePosition(position: Position) {
    // Skip if position is not in protected symbols list (if specified)
    if (this.config.protectedSymbols.length > 0 && 
        !this.config.protectedSymbols.includes(position.symbol)) {
      return
    }

    // Skip if position is too small
    if (Math.abs(position.pnl) < this.config.minPositionSize) {
      return
    }

    // Only monitor losing positions
    if (position.pnlPercentage >= 0) {
      return
    }

    const positionKey = `${position.symbol}_${position.side}`
    const currentLossPercent = Math.abs(position.pnlPercentage)
    
    let monitoredPosition = this.monitoredPositions.get(positionKey)
    if (!monitoredPosition) {
      monitoredPosition = {
        ...position,
        warningTriggered: false,
        hedgeTriggered: false
      }
      this.monitoredPositions.set(positionKey, monitoredPosition)
    } else {
      // Update position data
      Object.assign(monitoredPosition, position)
    }

    // Check for warning threshold (-8%)
    if (currentLossPercent >= this.config.warningThreshold && !monitoredPosition.warningTriggered) {
      await this.triggerWarning(monitoredPosition)
      monitoredPosition.warningTriggered = true
      monitoredPosition.lastWarningTime = Date.now()
    }

    // Check for hedge threshold (-9.99%)
    const hedgeThreshold = this.config.lossThreshold - 0.01 // 9.99% for 10% threshold
    if (currentLossPercent >= hedgeThreshold && !monitoredPosition.hedgeTriggered) {
      await this.triggerHedgeSignal(monitoredPosition)
      monitoredPosition.hedgeTriggered = true
      monitoredPosition.lastHedgeTime = Date.now()

      // Auto-execute hedge if enabled
      if (this.config.autoExecuteHedge) {
        await this.executeHedge(monitoredPosition)
      }
    }
  }

  private async triggerWarning(position: MonitoredPosition) {
    console.log(`⚠️ Warning triggered for ${position.symbol}: ${position.pnlPercentage.toFixed(2)}%`)
    
    await telegramService.sendWarningAlert(
      position.symbol,
      position.pnlPercentage,
      position.size,
      position.side
    )
  }

  private async triggerHedgeSignal(position: MonitoredPosition) {
    console.log(`🚨 Hedge signal triggered for ${position.symbol}: ${position.pnlPercentage.toFixed(2)}%`)
    
    const hedgeDetails = binanceService.calculateOppositePosition(
      position,
      this.config.lossThreshold
    )

    await telegramService.sendHedgeSignal(
      position.symbol,
      position.pnlPercentage,
      position.size,
      position.side,
      hedgeDetails
    )
  }

  private async executeHedge(position: MonitoredPosition) {
    try {
      console.log(`🔄 Executing hedge for ${position.symbol}...`)
      
      const hedgeDetails = binanceService.calculateOppositePosition(
        position,
        this.config.lossThreshold
      )

      const order = await binanceService.placeOrder(
        position.symbol,
        hedgeDetails.side,
        hedgeDetails.quantity,
        'MARKET'
      )

      position.hedgeOrderId = order.orderId

      await telegramService.sendHedgeExecuted(
        position.symbol,
        {
          side: hedgeDetails.side,
          quantity: hedgeDetails.quantity,
          executedPrice: hedgeDetails.estimatedPrice,
          orderId: order.orderId
        }
      )

      console.log(`✅ Hedge executed for ${position.symbol}, Order ID: ${order.orderId}`)
    } catch (error) {
      console.error(`❌ Failed to execute hedge for ${position.symbol}:`, error)
    }
  }

  // Manual hedge execution (called from UI)
  async manualHedge(positionId: string): Promise<boolean> {
    const position = Array.from(this.monitoredPositions.values())
      .find(p => p.id === positionId)
    
    if (!position) {
      console.error('Position not found for manual hedge')
      return false
    }

    try {
      await this.executeHedge(position)
      return true
    } catch (error) {
      console.error('Manual hedge execution failed:', error)
      return false
    }
  }

  // Get current monitoring status
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      monitoredPositionsCount: this.monitoredPositions.size,
      config: this.config,
      positions: Array.from(this.monitoredPositions.values())
    }
  }

  // Clear position from monitoring (when position is closed)
  removePosition(positionId: string) {
    for (const [key, position] of this.monitoredPositions.entries()) {
      if (position.id === positionId) {
        this.monitoredPositions.delete(key)
        break
      }
    }
  }

  // Get statistics
  getStats() {
    const positions = Array.from(this.monitoredPositions.values())
    const warningsTriggered = positions.filter(p => p.warningTriggered).length
    const hedgesTriggered = positions.filter(p => p.hedgeTriggered).length
    const totalLoss = positions.reduce((sum, p) => sum + Math.abs(p.pnl), 0)

    return {
      totalMonitoredPositions: positions.length,
      warningsTriggered,
      hedgesTriggered,
      totalLossAtRisk: totalLoss,
      averageLossPercent: positions.length > 0 
        ? positions.reduce((sum, p) => sum + Math.abs(p.pnlPercentage), 0) / positions.length 
        : 0
    }
  }
}

export const riskManagementService = new RiskManagementService()
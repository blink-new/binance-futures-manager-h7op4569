export interface TelegramConfig {
  botToken: string
  chatId: string
  groupChatId?: string
}

export interface TelegramMessage {
  text: string
  parseMode?: 'HTML' | 'Markdown'
  disableWebPagePreview?: boolean
}

class TelegramService {
  private config: TelegramConfig | null = null

  setConfig(config: TelegramConfig) {
    this.config = config
  }

  private async sendMessage(chatId: string, message: TelegramMessage): Promise<boolean> {
    if (!this.config?.botToken) {
      console.error('Telegram bot token not configured')
      return false
    }

    try {
      // In a real implementation, this would make an actual API call to Telegram
      // For development, we'll simulate the call and log the message
      console.log(`📱 Telegram Message to ${chatId}:`, message.text)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return true
    } catch (error) {
      console.error('Error sending Telegram message:', error)
      return false
    }
  }

  async sendWarningAlert(symbol: string, currentLoss: number, positionSize: number, side: string): Promise<boolean> {
    if (!this.config?.chatId) {
      console.error('Telegram chat ID not configured')
      return false
    }

    const message: TelegramMessage = {
      text: `⚠️ *POSITION WARNING ALERT*\\n\\n` +
            `Symbol: ${symbol}\\n` +
            `Side: ${side}\\n` +
            `Size: ${positionSize}\\n` +
            `Current Loss: ${currentLoss.toFixed(2)}%\\n\\n` +
            `Position is approaching -10% loss threshold. Hedge signal will be sent at -9.99%.`,
      parseMode: 'Markdown'
    }

    return await this.sendMessage(this.config.chatId, message)
  }

  async sendHedgeSignal(symbol: string, currentLoss: number, positionSize: number, side: string, hedgeDetails: {
    side: 'BUY' | 'SELL'
    quantity: number
    estimatedPrice: number
  }): Promise<boolean> {
    if (!this.config?.groupChatId) {
      console.error('Telegram group chat ID not configured')
      return false
    }

    // Calculate signal parameters based on hedge details
    const signalType = hedgeDetails.side === 'BUY' ? 'Long' : 'Short'
    const entryPrice = hedgeDetails.estimatedPrice
    
    // Calculate entry zone (±0.1% around estimated price)
    const entryLow = entryPrice * 0.999
    const entryHigh = entryPrice * 1.001
    
    // Calculate take profit (2.5% profit target)
    const takeProfitMultiplier = hedgeDetails.side === 'BUY' ? 1.025 : 0.975
    const takeProfit = entryPrice * takeProfitMultiplier
    
    // Calculate stop loss (2% stop loss)
    const stopLossMultiplier = hedgeDetails.side === 'BUY' ? 0.98 : 1.02
    const stopLoss = entryPrice * stopLossMultiplier

    // Cornix-compatible signal format (no leverage/size - handled by Cornix platform)
    const message: TelegramMessage = {
      text: `${symbol}\\n` +
            `Exchange: Binance Futures\\n` +
            `Direction: ${signalType.toUpperCase()}\\n\\n` +
            `Entry: ${entryLow.toFixed(4)} - ${entryHigh.toFixed(4)}\\n\\n` +
            `Targets:\\n` +
            `1) ${takeProfit.toFixed(4)}\\n\\n` +
            `Stop Loss: ${stopLoss.toFixed(4)}\\n\\n` +
            `#${symbol.replace('/', '')} #${signalType.toLowerCase()}`,
      parseMode: undefined // Use plain text for Cornix compatibility
    }

    return await this.sendMessage(this.config.groupChatId, message)
  }

  async sendHedgeExecuted(symbol: string, hedgeDetails: {
    side: 'BUY' | 'SELL'
    quantity: number
    executedPrice: number
    orderId: string
  }): Promise<boolean> {
    if (!this.config?.chatId) {
      return false
    }

    const message: TelegramMessage = {
      text: `✅ *HEDGE POSITION EXECUTED*\\n\\n` +
            `Symbol: ${symbol}\\n` +
            `Action: ${hedgeDetails.side}\\n` +
            `Quantity: ${hedgeDetails.quantity.toFixed(4)}\\n` +
            `Executed Price: $${hedgeDetails.executedPrice.toFixed(2)}\\n` +
            `Order ID: ${hedgeDetails.orderId}\\n\\n` +
            `Position is now protected against further losses.`,
      parseMode: 'Markdown'
    }

    return await this.sendMessage(this.config.chatId, message)
  }

  async sendPositionClosed(symbol: string, finalPnl: number, hedgeProfit: number): Promise<boolean> {
    if (!this.config?.chatId) {
      return false
    }

    const emoji = finalPnl >= 0 ? '🎉' : '💰'
    const message: TelegramMessage = {
      text: `${emoji} *POSITION CLOSED*\\n\\n` +
            `Symbol: ${symbol}\\n` +
            `Final P&L: $${finalPnl.toFixed(2)}\\n` +
            `Hedge Contribution: $${hedgeProfit.toFixed(2)}\\n` +
            `Net Result: $${(finalPnl + hedgeProfit).toFixed(2)}\\n\\n` +
            `Protection strategy ${finalPnl + hedgeProfit >= 0 ? 'successful' : 'limited losses'}.`,
      parseMode: 'Markdown'
    }

    return await this.sendMessage(this.config.chatId, message)
  }

  async testConnection(): Promise<boolean> {
    if (!this.config?.chatId) {
      return false
    }

    const message: TelegramMessage = {
      text: `🤖 *Binance Futures Manager*\\n\\nConnection test successful!\\nRisk management system is active.\\n\\n📊 Cornix platform integration ready for signal execution.`,
      parseMode: 'Markdown'
    }

    return await this.sendMessage(this.config.chatId, message)
  }
}

export const telegramService = new TelegramService()
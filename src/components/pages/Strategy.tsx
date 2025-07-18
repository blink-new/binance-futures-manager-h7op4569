import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { 
  Shield, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  DollarSign,
  Percent,
  Clock
} from 'lucide-react'

interface StrategyConfig {
  enabled: boolean
  lossThreshold: number
  hedgeRatio: number
  maxHedgeSize: number
  autoCloseProfit: number
  autoCloseLoss: number
  symbols: string[]
  minPositionSize: number
}

interface StrategyStats {
  totalProtectedTrades: number
  successfulHedges: number
  totalSavedLoss: number
  averageHedgeTime: number
  winRate: number
  activeHedges: number
}

const mockStrategyConfig: StrategyConfig = {
  enabled: true,
  lossThreshold: 10,
  hedgeRatio: 10,
  maxHedgeSize: 1000,
  autoCloseProfit: 5,
  autoCloseLoss: 15,
  symbols: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
  minPositionSize: 50
}

const mockStrategyStats: StrategyStats = {
  totalProtectedTrades: 47,
  successfulHedges: 34,
  totalSavedLoss: 2847.50,
  averageHedgeTime: 23,
  winRate: 72.3,
  activeHedges: 3
}

const mockRecentActivity = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30:25',
    action: 'HEDGE_OPENED',
    symbol: 'BTCUSDT',
    mainPosition: { size: 0.5, side: 'LONG', loss: -8.5 },
    hedgePosition: { size: 0.05, side: 'SHORT' },
    status: 'ACTIVE'
  },
  {
    id: '2',
    timestamp: '2024-01-15 13:45:12',
    action: 'HEDGE_CLOSED',
    symbol: 'ETHUSDT',
    mainPosition: { size: 2.0, side: 'SHORT', profit: 3.2 },
    hedgePosition: { size: 0.2, side: 'LONG' },
    savedLoss: 156.80,
    status: 'COMPLETED'
  },
  {
    id: '3',
    timestamp: '2024-01-15 12:15:08',
    action: 'HEDGE_OPENED',
    symbol: 'ADAUSDT',
    mainPosition: { size: 1000, side: 'LONG', loss: -9.8 },
    hedgePosition: { size: 100, side: 'SHORT' },
    status: 'ACTIVE'
  }
]

export default function Strategy() {
  const [config, setConfig] = useState<StrategyConfig>(mockStrategyConfig)
  const [stats] = useState<StrategyStats>(mockStrategyStats)

  const handleConfigChange = (key: keyof StrategyConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveConfig = () => {
    // Save configuration logic here
    console.log('Saving strategy config:', config)
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Strategy Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {config.enabled ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-500">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Protected Trades</p>
                <p className="text-2xl font-bold">{stats.totalProtectedTrades}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-green-500">${stats.totalSavedLoss.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-primary">{stats.winRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                How the Strategy Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Step 1: Warning (-8%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When position reaches -8% loss, a warning alert is sent to your personal Telegram chat.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Step 2: Signal (-9.99%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    At -9.99% loss, a formatted trading signal is sent to your Telegram group for hedge execution.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Step 3: Protection</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hedge position limits further losses and protects your capital from exceeding -10%.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Telegram Signal Format (Cornix Compatible):</h4>
                <div className="bg-background p-3 rounded border font-mono text-sm">
                  <div>FET/USDT</div>
                  <div>Exchanges: Binance Futures</div>
                  <div>Signal Type: Regular (Long)</div>
                  <div className="mt-2">Entry Zone:</div>
                  <div>0.6736 - 0.6743</div>
                  <div className="mt-2">Take-Profit Targets:</div>
                  <div>1) 0.6915</div>
                  <div className="mt-2">Stop Targets:</div>
                  <div>1) 0.6607</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Leverage and position size are configured in your Cornix platform settings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Strategy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Switch */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="strategy-enabled" className="text-base font-medium">
                    Enable Opposite Order Strategy
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically protect positions with opposite orders when loss threshold is reached
                  </p>
                </div>
                <Switch
                  id="strategy-enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                />
              </div>

              {config.enabled && (
                <>
                  {/* Loss Threshold */}
                  <div className="space-y-3">
                    <Label>Loss Threshold: {config.lossThreshold}%</Label>
                    <Slider
                      value={[config.lossThreshold]}
                      onValueChange={([value]) => handleConfigChange('lossThreshold', value)}
                      max={20}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Trigger hedge when position loss reaches this percentage
                    </p>
                  </div>

                  {/* Hedge Ratio */}
                  <div className="space-y-3">
                    <Label>Hedge Ratio: {config.hedgeRatio}%</Label>
                    <Slider
                      value={[config.hedgeRatio]}
                      onValueChange={([value]) => handleConfigChange('hedgeRatio', value)}
                      max={50}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Size of hedge position as percentage of main position
                    </p>
                  </div>

                  {/* Auto Close Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="auto-close-profit">Auto Close on Profit (%)</Label>
                      <Input
                        id="auto-close-profit"
                        type="number"
                        value={config.autoCloseProfit}
                        onChange={(e) => handleConfigChange('autoCloseProfit', parseFloat(e.target.value))}
                        min="1"
                        max="20"
                        step="0.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auto-close-loss">Auto Close on Loss (%)</Label>
                      <Input
                        id="auto-close-loss"
                        type="number"
                        value={config.autoCloseLoss}
                        onChange={(e) => handleConfigChange('autoCloseLoss', parseFloat(e.target.value))}
                        min="10"
                        max="30"
                        step="0.5"
                      />
                    </div>
                  </div>

                  {/* Position Size Limits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-position-size">Min Position Size ($)</Label>
                      <Input
                        id="min-position-size"
                        type="number"
                        value={config.minPositionSize}
                        onChange={(e) => handleConfigChange('minPositionSize', parseFloat(e.target.value))}
                        min="10"
                        step="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-hedge-size">Max Hedge Size ($)</Label>
                      <Input
                        id="max-hedge-size"
                        type="number"
                        value={config.maxHedgeSize}
                        onChange={(e) => handleConfigChange('maxHedgeSize', parseFloat(e.target.value))}
                        min="100"
                        step="100"
                      />
                    </div>
                  </div>

                  {/* Symbol Selection */}
                  <div className="space-y-2">
                    <Label>Protected Symbols</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.symbols.map((symbol) => (
                        <Badge key={symbol} variant="secondary">
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strategy will only apply to positions in these symbols
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Reset to Default</Button>
                <Button onClick={handleSaveConfig}>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium">{stats.winRate}%</span>
                  </div>
                  <Progress value={stats.winRate} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Successful Hedges</p>
                    <p className="text-lg font-bold text-green-500">{stats.successfulHedges}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Hedges</p>
                    <p className="text-lg font-bold text-primary">{stats.activeHedges}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Hedge Duration</span>
                    <span className="font-medium">{stats.averageHedgeTime} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">${stats.totalSavedLoss.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Loss Prevention</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold">$1,247.30</p>
                    <p className="text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">$423.80</p>
                    <p className="text-muted-foreground">This Week</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Saved per Trade</span>
                    <span className="font-medium">${(stats.totalSavedLoss / stats.successfulHedges).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Strategy Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.action === 'HEDGE_OPENED' ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.symbol}</span>
                          <Badge variant={activity.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.timestamp}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Main Position</p>
                          <p className="font-medium">
                            {activity.mainPosition.size} {activity.mainPosition.side}
                            {activity.mainPosition.loss && (
                              <span className="text-red-500 ml-2">
                                ({activity.mainPosition.loss}%)
                              </span>
                            )}
                            {activity.mainPosition.profit && (
                              <span className="text-green-500 ml-2">
                                (+{activity.mainPosition.profit}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hedge Position</p>
                          <p className="font-medium">
                            {activity.hedgePosition.size} {activity.hedgePosition.side}
                          </p>
                        </div>
                      </div>

                      {activity.savedLoss && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Loss Prevented: </span>
                          <span className="font-medium text-green-500">${activity.savedLoss}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
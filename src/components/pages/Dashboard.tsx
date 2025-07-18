import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Plus
} from 'lucide-react'

// Mock data - in real app this would come from API
const mockData = {
  balance: {
    totalWalletBalance: 50000,
    totalUnrealizedPnl: 2450.75,
    availableBalance: 35000,
    totalMarginBalance: 52450.75
  },
  positions: [
    {
      id: '1',
      symbol: 'BTCUSDT',
      side: 'LONG' as const,
      size: 0.5,
      entryPrice: 45000,
      markPrice: 46500,
      pnl: 750,
      pnlPercentage: 3.33,
      isProtected: true,
      leverage: 10
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      side: 'SHORT' as const,
      size: 2.0,
      entryPrice: 3200,
      markPrice: 3100,
      pnl: 200,
      pnlPercentage: 3.13,
      isProtected: false,
      leverage: 5
    },
    {
      id: '3',
      symbol: 'ADAUSDT',
      side: 'LONG' as const,
      size: 1000,
      entryPrice: 0.45,
      markPrice: 0.42,
      pnl: -30,
      pnlPercentage: -6.67,
      isProtected: true,
      leverage: 3
    }
  ],
  strategy: {
    isEnabled: true,
    protectedPositions: 2,
    totalPositions: 3,
    savedLoss: 1250.50
  }
}

export function Dashboard() {
  const { balance, positions, strategy } = mockData
  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const protectedPositions = positions.filter(p => p.isProtected)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <p className="text-muted-foreground">Monitor your futures positions and strategy performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={strategy.isEnabled ? "default" : "secondary"} className="bg-primary/10 text-primary">
            <Shield className="w-3 h-3 mr-1" />
            Protection {strategy.isEnabled ? 'Active' : 'Inactive'}
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.totalWalletBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Wallet balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
            {totalPnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalPnl / balance.totalWalletBalance) * 100).toFixed(2)}% of balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.availableBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For new positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Trades</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {strategy.protectedPositions}/{strategy.totalPositions}
            </div>
            <p className="text-xs text-muted-foreground">
              Saved: ${strategy.savedLoss.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Opposite Order Strategy Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Strategy Status</span>
                <Badge variant={strategy.isEnabled ? "default" : "secondary"}>
                  {strategy.isEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loss Threshold</span>
                <span className="text-sm font-medium">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hedge Ratio</span>
                <span className="text-sm font-medium">100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Protected Positions</span>
                <span className="text-sm font-bold text-primary">{strategy.protectedPositions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Positions</span>
                <span className="text-sm font-medium">{strategy.totalPositions}</span>
              </div>
              <Progress 
                value={(strategy.protectedPositions / strategy.totalPositions) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Saved</span>
                <span className="text-sm font-bold text-green-400">
                  ${strategy.savedLoss.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Hedges</span>
                <span className="text-sm font-medium">2</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={position.side === 'LONG' ? 'default' : 'secondary'}>
                      {position.side}
                    </Badge>
                    <span className="font-medium">{position.symbol}</span>
                    {position.isProtected && (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Size: {position.size} | Leverage: {position.leverage}x
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Entry</div>
                    <div className="font-medium">${position.entryPrice.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Mark</div>
                    <div className="font-medium">${position.markPrice.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">P&L</div>
                    <div className={`font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}
                    </div>
                    <div className={`text-xs ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ({position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%)
                    </div>
                  </div>
                  {Math.abs(position.pnlPercentage) > 8 && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
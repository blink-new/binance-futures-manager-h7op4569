import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  ShieldCheck, 
  Settings, 
  X,
  Target,
  AlertTriangle,
  DollarSign,
  Percent
} from 'lucide-react'

interface Position {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercent: number
  margin: number
  leverage: number
  isProtected: boolean
  hedgePosition?: {
    id: string
    size: number
    entryPrice: number
    pnl: number
  }
  stopLoss?: number
  takeProfit?: number
}

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTCUSDT',
    side: 'LONG',
    size: 0.5,
    entryPrice: 43250.00,
    markPrice: 43180.50,
    pnl: -34.75,
    pnlPercent: -0.16,
    margin: 2162.50,
    leverage: 10,
    isProtected: true,
    hedgePosition: {
      id: 'h1',
      size: 0.05,
      entryPrice: 43200.00,
      pnl: 0.98
    },
    stopLoss: 42000.00,
    takeProfit: 45000.00
  },
  {
    id: '2',
    symbol: 'ETHUSDT',
    side: 'SHORT',
    size: 2.0,
    entryPrice: 2580.50,
    markPrice: 2595.20,
    pnl: -29.40,
    pnlPercent: -0.57,
    margin: 516.10,
    leverage: 20,
    isProtected: false,
    takeProfit: 2450.00
  },
  {
    id: '3',
    symbol: 'ADAUSDT',
    side: 'LONG',
    size: 1000,
    entryPrice: 0.4850,
    markPrice: 0.4920,
    pnl: 70.00,
    pnlPercent: 14.43,
    margin: 97.00,
    leverage: 5,
    isProtected: true,
    hedgePosition: {
      id: 'h3',
      size: 100,
      entryPrice: 0.4900,
      pnl: -2.00
    },
    stopLoss: 0.4600,
    takeProfit: 0.5200
  }
]

export default function Positions() {
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)

  const handleProtectionToggle = (positionId: string) => {
    setPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, isProtected: !pos.isProtected }
        : pos
    ))
  }

  const handleClosePosition = (positionId: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== positionId))
  }

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const protectedPositions = positions.filter(pos => pos.isProtected).length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold">{positions.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${totalPnL.toFixed(2)}
                </p>
              </div>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Protected Positions</p>
                <p className="text-2xl font-bold text-primary">{protectedPositions}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Leverage</p>
                <p className="text-2xl font-bold">
                  {(positions.reduce((sum, pos) => sum + pos.leverage, 0) / positions.length).toFixed(1)}x
                </p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Mark Price</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead>Protection</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={position.side === 'LONG' ? 'default' : 'destructive'}>
                        {position.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{position.size}</TableCell>
                    <TableCell>${position.entryPrice.toFixed(2)}</TableCell>
                    <TableCell>${position.markPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`font-medium ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${position.pnl.toFixed(2)}
                        <div className="text-xs text-muted-foreground">
                          ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${position.margin.toFixed(2)}</TableCell>
                    <TableCell>{position.leverage}x</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={position.isProtected}
                          onCheckedChange={() => handleProtectionToggle(position.id)}
                        />
                        {position.isProtected ? (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Shield className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPosition(position)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Manage Position - {selectedPosition?.symbol}</DialogTitle>
                            </DialogHeader>
                            {selectedPosition && (
                              <PositionManagementDialog 
                                position={selectedPosition}
                                onClose={() => setIsManageDialogOpen(false)}
                                onUpdate={(updatedPosition) => {
                                  setPositions(prev => prev.map(pos => 
                                    pos.id === updatedPosition.id ? updatedPosition : pos
                                  ))
                                  setIsManageDialogOpen(false)
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleClosePosition(position.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface PositionManagementDialogProps {
  position: Position
  onClose: () => void
  onUpdate: (position: Position) => void
}

function PositionManagementDialog({ position, onClose, onUpdate }: PositionManagementDialogProps) {
  const [stopLoss, setStopLoss] = useState(position.stopLoss?.toString() || '')
  const [takeProfit, setTakeProfit] = useState(position.takeProfit?.toString() || '')
  const [protectionEnabled, setProtectionEnabled] = useState(position.isProtected)

  const handleSave = () => {
    const updatedPosition: Position = {
      ...position,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      isProtected: protectionEnabled
    }
    onUpdate(updatedPosition)
  }

  return (
    <Tabs defaultValue="orders" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="orders">Stop/Take Profit</TabsTrigger>
        <TabsTrigger value="protection">Protection Strategy</TabsTrigger>
        <TabsTrigger value="info">Position Info</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stopLoss">Stop Loss Price</Label>
            <Input
              id="stopLoss"
              type="number"
              step="0.01"
              placeholder="Enter stop loss price"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="takeProfit">Take Profit Price</Label>
            <Input
              id="takeProfit"
              type="number"
              step="0.01"
              placeholder="Enter take profit price"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Orders</Button>
        </div>
      </TabsContent>

      <TabsContent value="protection" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="protection">Enable Opposite Order Protection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically hedge position when loss approaches 10%
              </p>
            </div>
            <Switch
              id="protection"
              checked={protectionEnabled}
              onCheckedChange={setProtectionEnabled}
            />
          </div>

          {position.hedgePosition && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Hedge Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hedge Size:</span>
                  <span className="text-sm font-medium">{position.hedgePosition.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entry Price:</span>
                  <span className="text-sm font-medium">${position.hedgePosition.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hedge P&L:</span>
                  <span className={`text-sm font-medium ${position.hedgePosition.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${position.hedgePosition.pnl.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-500">Protection Strategy Info</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, the system will automatically open a hedge position when your main position 
                  approaches a 10% loss. The hedge will be sized to limit total loss and will be closed 
                  when the main position recovers or reaches target levels.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Protection</Button>
        </div>
      </TabsContent>

      <TabsContent value="info" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-medium">Position Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span>{position.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Side:</span>
                  <Badge variant={position.side === 'LONG' ? 'default' : 'destructive'} className="text-xs">
                    {position.side}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{position.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leverage:</span>
                  <span>{position.leverage}x</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-medium">Price & P&L</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Price:</span>
                  <span>${position.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mark Price:</span>
                  <span>${position.markPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unrealized P&L:</span>
                  <span className={position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin:</span>
                  <span>${position.margin.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
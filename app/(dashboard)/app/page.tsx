import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Activity, XCircle } from 'lucide-react'
import { getTrades, getTradeStats } from '@/lib/db/trades'
import { TradesTableInteractive } from '@/components/dashboard/trades-table-interactive'
import { Trade, TradeStats } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let trades: Trade[] = []
  let stats: TradeStats = {
    total: 0,
    totalBuys: 0,
    totalSells: 0,
    totalSkips: 0,
    totalPnL: 0,
    avgPrice: 0,
    winRate: 0
  }

  try {
    trades = await getTrades() // Pobierz wszystkie (bez limitu)
    stats = await getTradeStats()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Return empty state if error occurs
  }

  const statsCards = [
    {
      title: 'Total P&L',
      value: `$${stats.totalPnL.toFixed(2)}`,
      change: stats.totalPnL >= 0 ? 'Zysk' : 'Strata',
      icon: DollarSign,
      positive: stats.totalPnL >= 0
    },
    {
      title: 'Wszystkie Trades',
      value: stats.total.toString(),
      change: `${stats.totalBuys} buy / ${stats.totalSells} sell`,
      icon: Activity,
      positive: true
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      change: `${stats.total} trades`,
      icon: TrendingUp,
      positive: stats.winRate >= 50
    },
    {
      title: 'Skipped',
      value: stats.totalSkips.toString(),
      change: 'Pominięte transakcje',
      icon: XCircle,
      positive: true
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Trades</h2>
        <p className="text-muted-foreground">
          Wszystkie transakcje trading bota
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie Transakcje</CardTitle>
          <CardDescription>
            {trades.length > 0 ? `${trades.length} transakcji w bazie` : 'Brak transakcji w bazie danych'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradesTableInteractive trades={trades} />
        </CardContent>
      </Card>
    </div>
  )
}

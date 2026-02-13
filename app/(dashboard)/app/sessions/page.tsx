import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, TrendingUp, Activity, Timer } from 'lucide-react'
import { getMarketSessions, getMarketSessionStats } from '@/lib/db/market-sessions'
import { MarketSessionsTable } from '@/components/dashboard/market-sessions-table'
import { MarketSession } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function MarketSessionsPage() {
  let sessions: MarketSession[] = []
  let stats = {
    total: 0,
    totalPnL: 0,
    avgDuration: 0,
    totalTrades: 0
  }

  try {
    sessions = await getMarketSessions()
    stats = await getMarketSessionStats()
    console.log('[Sessions Page] Loaded:', sessions.length, 'sessions')
  } catch (error) {
    console.error('[Sessions Page] Error loading market sessions data:', error)
    // Return empty state if error occurs - nie rzucaj błędu
  }

  const statsCards = [
    {
      title: 'Total Sessions',
      value: stats.total.toString(),
      change: 'Wszystkie sesje',
      icon: Clock,
      positive: true
    },
    {
      title: 'Total P&L',
      value: `$${stats.totalPnL.toFixed(2)}`,
      change: stats.totalPnL >= 0 ? 'Zysk' : 'Strata',
      icon: TrendingUp,
      positive: stats.totalPnL >= 0
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      change: 'Wszystkie transakcje',
      icon: Activity,
      positive: true
    },
    {
      title: 'Avg Duration',
      value: `${Math.floor(stats.avgDuration / 60)}m ${stats.avgDuration % 60}s`,
      change: 'Średni czas trwania',
      icon: Timer,
      positive: true
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Market Sessions</h2>
        <p className="text-muted-foreground">
          Historia sesji tradingowych na rynkach
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
          <CardTitle>Wszystkie Sesje</CardTitle>
          <CardDescription>
            {sessions.length > 0 ? `${sessions.length} sesji w bazie` : 'Brak sesji w bazie danych'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketSessionsTable sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  )
}

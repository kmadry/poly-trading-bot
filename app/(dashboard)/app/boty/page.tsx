import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, TrendingUp, Activity, DollarSign } from 'lucide-react'
import { BotsTableFull } from '@/components/dashboard/bots-table-full'
import { botsData } from '@/lib/data/bots-data'
import { AddBotDialog } from '@/components/dashboard/add-bot-form'

export const dynamic = 'force-dynamic'

export default async function BotsPage() {
  const bots = botsData

  // Calculate stats
  const stats = {
    total: bots.length,
    active: bots.filter(b => b.status === 'LIVE').length,
    totalPnL: bots.reduce((sum, b) => sum + b.balance, 0),
    avgRoi: bots.filter(b => !isNaN(b.roiPerDay)).reduce((sum, b) => sum + b.roiPerDay, 0) / bots.filter(b => !isNaN(b.roiPerDay)).length,
  }

  const statsCards = [
    {
      title: 'Total Bots',
      value: stats.total.toString(),
      change: `${stats.active} aktywnych`,
      icon: Bot,
      positive: true
    },
    {
      title: 'Active Bots',
      value: stats.active.toString(),
      change: `${bots.filter(b => b.status === 'END').length} zakończonych`,
      icon: Activity,
      positive: true
    },
    {
      title: 'Total Balance',
      value: `$${stats.totalPnL.toFixed(2)}`,
      change: stats.totalPnL >= 0 ? 'Zysk' : 'Strata',
      icon: DollarSign,
      positive: stats.totalPnL >= 0
    },
    {
      title: 'Avg ROI/Day',
      value: `${(stats.avgRoi * 100).toFixed(2)}%`,
      change: 'Średni ROI dzienny',
      icon: TrendingUp,
      positive: stats.avgRoi >= 0
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Boty Tradingowe</h2>
          <p className="text-muted-foreground">
            Przegląd wszystkich botów tradingowych i ich wyników
          </p>
        </div>
        <AddBotDialog />
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
          <CardTitle>Wszystkie Boty</CardTitle>
          <CardDescription>
            {bots.length > 0 ? `${bots.length} botów w systemie` : 'Brak botów w systemie'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BotsTableFull bots={bots} />
        </CardContent>
      </Card>
    </div>
  )
}

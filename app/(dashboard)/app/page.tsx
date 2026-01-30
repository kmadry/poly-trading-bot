import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react'

const stats = [
  {
    title: 'Total Balance',
    value: '$12,345.67',
    change: '+12.5%',
    icon: DollarSign,
  },
  {
    title: 'Active Trades',
    value: '24',
    change: '+3',
    icon: Activity,
  },
  {
    title: 'Win Rate',
    value: '67.8%',
    change: '+2.3%',
    icon: TrendingUp,
  },
  {
    title: 'Total Markets',
    value: '156',
    change: '+12',
    icon: Users,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Witaj ponownie! Oto podsumowanie Twojej aktywności.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>
              Your latest trading activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Trump wins 2024 election
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Position: YES • Amount: $500
                  </p>
                </div>
                <div className="text-sm font-medium text-green-600">
                  +$125.50
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Bitcoin reaches $100k
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Position: NO • Amount: $300
                  </p>
                </div>
                <div className="text-sm font-medium text-red-600">
                  -$45.20
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Fed cuts rates in Q1
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Position: YES • Amount: $750
                  </p>
                </div>
                <div className="text-sm font-medium text-green-600">
                  +$220.80
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common trading operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted">
              <div className="font-medium">New Trade</div>
              <div className="text-sm text-muted-foreground">
                Start a new trading position
              </div>
            </button>
            <button className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted">
              <div className="font-medium">View Markets</div>
              <div className="text-sm text-muted-foreground">
                Browse available markets
              </div>
            </button>
            <button className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted">
              <div className="font-medium">Bot Settings</div>
              <div className="text-sm text-muted-foreground">
                Configure trading automation
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

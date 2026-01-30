import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TradingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Trading</h2>
        <p className="text-muted-foreground">
          Manage your active trades and positions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
          <CardDescription>
            Your current trading positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Trading interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

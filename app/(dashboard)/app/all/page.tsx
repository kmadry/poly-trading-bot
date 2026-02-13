import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTrades } from '@/lib/db/trades'
import { getMarketSessions } from '@/lib/db/market-sessions'
import { AllTable } from '@/components/dashboard/all-table'
import { Trade, MarketSession } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AllPage() {
  let trades: Trade[] = []
  let sessions: MarketSession[] = []

  try {
    trades = await getTrades()
    sessions = await getMarketSessions()
  } catch (error) {
    console.error('Error loading all data:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Data</h2>
        <p className="text-muted-foreground">
          Wszystkie transakcje i sesje w jednym miejscu
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trades & Sessions</CardTitle>
          <CardDescription>
            {trades.length} transakcji i {sessions.length} sesji w bazie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AllTable trades={trades} sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  )
}

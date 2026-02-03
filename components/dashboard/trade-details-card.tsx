'use client'

import { Trade } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface TradeDetailsCardProps {
  trade: Trade
}

export function TradeDetailsCard({ trade }: TradeDetailsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">
              {trade.market_question || trade.market_slug}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {trade.id} • Session: {trade.session_id || 'N/A'}
            </p>
          </div>
          <Badge variant={trade.type === 'BUY' ? 'default' : trade.type === 'SELL' ? 'secondary' : 'outline'}>
            {trade.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Outcome:</span>
            <p className="font-medium">{trade.outcome || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Price:</span>
            <p className="font-medium">{trade.price ? `$${trade.price}` : '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Size:</span>
            <p className="font-medium">{trade.size ? `$${trade.size}` : '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Shares:</span>
            <p className="font-medium">{trade.shares || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">P&L:</span>
            <p className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trade.pnl !== null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '-'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Result:</span>
            <p className="font-medium">{trade.result || '-'}</p>
          </div>
        </div>

        <div className="pt-2 border-t text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bot Instance:</span>
            <span className="font-mono">{trade.bot_instance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono">{trade.order_id || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timestamp:</span>
            <span>{format(new Date(trade.timestamp), 'PPp', { locale: pl })}</span>
          </div>
          {trade.market_end_time && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market End:</span>
              <span>{format(new Date(trade.market_end_time), 'PPp', { locale: pl })}</span>
            </div>
          )}
        </div>

        {trade.metadata && (
          <details className="pt-2 border-t">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Metadata (kliknij aby rozwinąć)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(trade.metadata, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

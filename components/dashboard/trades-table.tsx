import { Trade } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

interface TradesTableProps {
  trades: Trade[]
}

export function TradesTable({ trades }: TradesTableProps) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">Brak transakcji</p>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BUY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'SELL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'SKIP': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return null
    const isYes = outcome.toUpperCase() === 'YES'
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isYes 
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      }`}>
        {outcome}
      </span>
    )
  }

  const formatMetadataInline = (metadata: any) => {
    if (!metadata?.skip_reasons) return null
    
    const reasons = metadata.skip_reasons
    if (reasons.length === 0) return null
    
    // Dla pojedynczego reason - pokaż inline
    if (reasons.length === 1) {
      const reason = reasons[0]
      const details = reason.details || {}
      
      // Różne typy mają różne fieldy
      const value = details.actual_price || details.actual_spread || 'N/A'
      const threshold = details.threshold || 'N/A'
      
      return (
        <span className="text-xs">
          <span className="text-yellow-600 font-medium">{reason.type}</span>
          <span className="text-muted-foreground ml-1">
            ({threshold} → {value})
          </span>
        </span>
      )
    }
    
    // Dla wielu reasons - pokaż liczbę
    return (
      <span className="text-xs text-yellow-600 font-medium">
        {reasons.length} reasons
      </span>
    )
  }

  const formatMetadataPopup = (metadata: any) => {
    if (!metadata) return null
    
    // Skip reasons formatting
    if (metadata.skip_reasons) {
      return (
        <div className="space-y-1">
          <div className="font-semibold text-xs mb-2">Skip Reasons ({metadata.skip_reasons.length}):</div>
          {metadata.skip_reasons.map((reason: any, idx: number) => {
            const details = reason.details || {}
            const entries = Object.entries(details).map(([key, val]) => 
              `${key}: ${val}`
            ).join(', ')
            
            return (
              <div key={idx} className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                <div className="font-medium text-yellow-700 dark:text-yellow-300">
                  {idx + 1}. {reason.type}
                </div>
                {entries && (
                  <div className="ml-2 text-muted-foreground mt-1">
                    {entries}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )
    }
    
    return (
      <pre className="text-xs overflow-auto">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left font-medium">ID</th>
            <th className="p-2 text-left font-medium">Session</th>
            <th className="p-2 text-left font-medium">Type</th>
            <th className="p-2 text-left font-medium">Market</th>
            <th className="p-2 text-left font-medium">Outcome</th>
            <th className="p-2 text-right font-medium">Price</th>
            <th className="p-2 text-right font-medium">Size</th>
            <th className="p-2 text-right font-medium">Shares</th>
            <th className="p-2 text-right font-medium">P&L</th>
            <th className="p-2 text-left font-medium">Result</th>
            <th className="p-2 text-left font-medium">Order ID</th>
            <th className="p-2 text-left font-medium">Time</th>
            <th className="p-2 text-left font-medium">Bot</th>
            <th className="p-2 text-left font-medium">Metadata</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-2 font-mono text-xs text-muted-foreground">
                #{trade.id}
              </td>
              <td className="p-2 font-mono text-xs">
                {trade.session_id || '-'}
              </td>
              <td className="p-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getTypeColor(trade.type)}`}>
                  {trade.type}
                </span>
              </td>
              <td className="p-2 max-w-xs">
                <div className="truncate font-medium text-xs">
                  {trade.market_question || trade.market_slug}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {trade.market_slug}
                </div>
                {trade.series_slug && (
                  <div className="text-xs text-muted-foreground/70 truncate">
                    Series: {trade.series_slug}
                  </div>
                )}
              </td>
              <td className="p-2">
                {getOutcomeBadge(trade.outcome)}
              </td>
              <td className="p-2 text-right font-mono text-xs">
                {trade.price ? `$${trade.price.toFixed(4)}` : '-'}
              </td>
              <td className="p-2 text-right font-mono text-xs">
                {trade.size ? `$${trade.size.toFixed(2)}` : '-'}
              </td>
              <td className="p-2 text-right font-mono text-xs">
                {trade.shares ? trade.shares.toFixed(2) : '-'}
              </td>
              <td className="p-2 text-right font-mono font-semibold text-xs">
                {trade.pnl !== null ? (
                  <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                ) : '-'}
              </td>
              <td className="p-2 text-xs">
                {trade.result || '-'}
              </td>
              <td className="p-2 font-mono text-xs">
                {trade.order_id ? (
                  <span className="truncate max-w-[100px] inline-block" title={trade.order_id}>
                    {trade.order_id}
                  </span>
                ) : '-'}
              </td>
              <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true, locale: pl })}
              </td>
              <td className="p-2 text-xs text-muted-foreground truncate max-w-[120px]">
                {trade.bot_instance}
              </td>
              <td className="p-2 text-xs max-w-[200px]">
                {trade.metadata ? (
                  <div>
                    <div>{formatMetadataInline(trade.metadata)}</div>
                    {trade.metadata.skip_reasons && trade.metadata.skip_reasons.length > 1 && (
                      <details className="cursor-pointer mt-1">
                        <summary className="text-primary hover:underline text-xs">
                          Zobacz wszystkie
                        </summary>
                        <div className="mt-2 p-2 bg-muted rounded max-h-48 overflow-auto">
                          {formatMetadataPopup(trade.metadata)}
                        </div>
                      </details>
                    )}
                  </div>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

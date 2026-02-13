import { MarketSession } from '@/types/database'
import { format } from 'date-fns'

interface Props {
  session: MarketSession
  visibleColumns: Record<string, boolean>
  formatDuration: (startTime: string, endTime: string | null) => string
}

export function MarketSessionsTableRow({ session, visibleColumns, formatDuration }: Props) {
  const totalTrades = (session.total_entries || 0) + (session.total_exits || 0) + (session.total_skips || 0)
  
  const formatJSON = (data: any) => {
    if (!data) return '-'
    return (
      <details className="cursor-pointer">
        <summary className="text-primary hover:underline text-xs">Zobacz</summary>
        <pre className="mt-1 p-2 bg-muted rounded text-xs max-h-32 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    )
  }

  return (
    <>
      {visibleColumns.id && (
        <div className="p-2 text-center font-mono text-xs text-muted-foreground" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
          #{session.id}
        </div>
      )}
      {visibleColumns.marketId && (
        <div className="p-2 overflow-hidden" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
          <div className="truncate text-xs font-mono" title={session.market_id}>
            {session.market_id}
          </div>
        </div>
      )}
      {visibleColumns.market && (
        <div className="p-2 overflow-hidden" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>
          <div className="truncate font-medium text-xs" title={session.market_question || session.market_slug}>
            {session.market_question || session.market_slug}
          </div>
          {session.series_slug && !visibleColumns.seriesSlug && (
            <div className="text-xs text-muted-foreground/70 truncate" title={session.series_slug}>
              Series: {session.series_slug}
            </div>
          )}
        </div>
      )}
      {visibleColumns.seriesSlug && (
        <div className="p-2 overflow-hidden" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>
          <div className="truncate text-xs" title={session.series_slug || ''}>
            {session.series_slug || '-'}
          </div>
        </div>
      )}
      {visibleColumns.bot && (
        <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>
          <div className="text-xs text-muted-foreground truncate" title={session.bot_instance}>
            {session.bot_instance}
          </div>
        </div>
      )}
      {visibleColumns.sessionStart && (
        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
          {format(new Date(session.session_start), 'HH:mm dd-MM-yyyy')}
        </div>
      )}
      {visibleColumns.sessionEnd && (
        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
          {session.session_end ? format(new Date(session.session_end), 'HH:mm dd-MM-yyyy') : 'Active'}
        </div>
      )}
      {visibleColumns.duration && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '100px', flexGrow: 0}}>
          {formatDuration(session.session_start, session.session_end)}
        </div>
      )}
      {visibleColumns.marketStartTime && (
        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
          {session.market_start_time ? format(new Date(session.market_start_time), 'HH:mm dd-MM-yyyy') : '-'}
        </div>
      )}
      {visibleColumns.marketEndTime && (
        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
          {session.market_end_time ? format(new Date(session.market_end_time), 'HH:mm dd-MM-yyyy') : '-'}
        </div>
      )}
      {visibleColumns.totalEntries && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
          {session.total_entries || 0}
        </div>
      )}
      {visibleColumns.totalExits && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
          {session.total_exits || 0}
        </div>
      )}
      {visibleColumns.totalSkips && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
          {session.total_skips || 0}
        </div>
      )}
      {visibleColumns.trades && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '100px', flexGrow: 0}}>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold">{totalTrades}</span>
            <span className="text-xs text-muted-foreground">
              {session.total_entries || 0}E/{session.total_exits || 0}X/{session.total_skips || 0}SK
            </span>
          </div>
        </div>
      )}
      {visibleColumns.totalPnl && (
        <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
          {session.total_pnl !== null ? (
            <span className={session.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
              {session.total_pnl >= 0 ? '+' : ''}${session.total_pnl.toFixed(2)}
            </span>
          ) : '-'}
        </div>
      )}
      {visibleColumns.initialYesPrice && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
          {session.initial_yes_price ? `$${session.initial_yes_price.toFixed(4)}` : '-'}
        </div>
      )}
      {visibleColumns.initialNoPrice && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
          {session.initial_no_price ? `$${session.initial_no_price.toFixed(4)}` : '-'}
        </div>
      )}
      {visibleColumns.initialSpread && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
          {session.initial_spread ? session.initial_spread.toFixed(4) : '-'}
        </div>
      )}
      {visibleColumns.finalYesPrice && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
          {session.final_yes_price ? `$${session.final_yes_price.toFixed(4)}` : '-'}
        </div>
      )}
      {visibleColumns.finalNoPrice && (
        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
          {session.final_no_price ? `$${session.final_no_price.toFixed(4)}` : '-'}
        </div>
      )}
      {visibleColumns.finalOutcome && (
        <div className="p-2 text-center text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
          {session.final_outcome ? (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              session.final_outcome.toUpperCase() === 'YES' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {session.final_outcome}
            </span>
          ) : '-'}
        </div>
      )}
      {visibleColumns.strategyConfig && (
        <div className="p-2 text-xs" style={{flexBasis: '150px', flexGrow: 0}}>
          {formatJSON(session.strategy_config)}
        </div>
      )}
      {visibleColumns.metadata && (
        <div className="p-2 text-xs" style={{flexBasis: '150px', flexGrow: 0}}>
          {formatJSON(session.metadata)}
        </div>
      )}
    </>
  )
}

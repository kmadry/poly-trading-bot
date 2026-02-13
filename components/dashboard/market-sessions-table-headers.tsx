import { ArrowUpDown } from 'lucide-react'

type SortField = 'id' | 'session_start' | 'total_entries' | 'total_pnl' | 'market_slug' | 'bot_instance'

interface Props {
  visibleColumns: Record<string, boolean>
  sortField: SortField
  handleSort: (field: SortField) => void
}

export function MarketSessionsTableHeaders({ visibleColumns, sortField, handleSort }: Props) {
  return (
    <>
      {visibleColumns.id && (
        <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}} onClick={() => handleSort('id')}>
          <div className="flex items-center gap-1 justify-center">
            ID {sortField === 'id' && <ArrowUpDown className="h-3 w-3" />}
          </div>
        </div>
      )}
      {visibleColumns.marketId && (
        <div className="p-2 text-left font-medium" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
          <div className="truncate">Market ID</div>
        </div>
      )}
      {visibleColumns.market && (
        <div className="p-2 text-left font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}} onClick={() => handleSort('market_slug')}>
          <div className="flex items-center gap-1">
            Market {sortField === 'market_slug' && <ArrowUpDown className="h-3 w-3" />}
          </div>
        </div>
      )}
      {visibleColumns.seriesSlug && (
        <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>Series</div>
      )}
      {visibleColumns.bot && (
        <div className="p-2 text-left font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}} onClick={() => handleSort('bot_instance')}>
          <div className="flex items-center gap-1">
            Bot {sortField === 'bot_instance' && <ArrowUpDown className="h-3 w-3" />}
          </div>
        </div>
      )}
      {visibleColumns.sessionStart && (
        <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '140px', flexGrow: 0}} onClick={() => handleSort('session_start')}>
          <div className="flex items-center gap-1 justify-center">
            Session Start {sortField === 'session_start' && <ArrowUpDown className="h-3 w-3" />}
          </div>
        </div>
      )}
      {visibleColumns.sessionEnd && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Session End</div>
      )}
      {visibleColumns.duration && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '100px', flexGrow: 0}}>Duration</div>
      )}
      {visibleColumns.marketStartTime && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Market Start</div>
      )}
      {visibleColumns.marketEndTime && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Market End</div>
      )}
      {visibleColumns.totalEntries && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>Entries</div>
      )}
      {visibleColumns.totalExits && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>Exits</div>
      )}
      {visibleColumns.totalSkips && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>Skips</div>
      )}
      {visibleColumns.trades && (
        <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '100px', flexGrow: 0}} onClick={() => handleSort('total_entries')}>
          <div className="flex items-center gap-1 justify-center">
            Trades {sortField === 'total_entries' && <ArrowUpDown className="h-3 w-3" />}
          </div>
        </div>
      )}
      {visibleColumns.totalPnl && (
        <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '80px', flexGrow: 0}} onClick={() => handleSort('total_pnl')}>
          <div className="flex items-center gap-1 justify-center">
            P&L {sortField === 'total_pnl' && <ArrowUpDown className="h-3 w-3" />}
          </div>
        </div>
      )}
      {visibleColumns.initialYesPrice && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Init YES</div>
      )}
      {visibleColumns.initialNoPrice && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Init NO</div>
      )}
      {visibleColumns.initialSpread && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Init Spread</div>
      )}
      {visibleColumns.finalYesPrice && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Final YES</div>
      )}
      {visibleColumns.finalNoPrice && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Final NO</div>
      )}
      {visibleColumns.finalOutcome && (
        <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Outcome</div>
      )}
      {visibleColumns.strategyConfig && (
        <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0}}>Strategy</div>
      )}
      {visibleColumns.metadata && (
        <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0}}>Metadata</div>
      )}
    </>
  )
}

'use client'

import { MarketSession } from '@/types/database'
import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, Columns3, RotateCcw } from 'lucide-react'
import { MarketSessionsTableHeaders } from './market-sessions-table-headers'
import { MarketSessionsTableRow } from './market-sessions-table-row'

interface MarketSessionsTableProps {
  sessions: MarketSession[]
}

type SortField = 'id' | 'session_start' | 'total_entries' | 'total_pnl' | 'market_slug' | 'bot_instance'
type SortDirection = 'asc' | 'desc'

const DEFAULT_VISIBLE_COLUMNS = {
  id: true,
  marketId: false,
  market: true,
  seriesSlug: false,
  bot: true,
  sessionStart: true,
  sessionEnd: false,
  marketStartTime: false,
  marketEndTime: false,
  duration: true,
  totalEntries: false,
  totalExits: false,
  totalSkips: false,
  trades: true,
  totalPnl: true,
  initialYesPrice: true,
  initialNoPrice: false,
  initialSpread: false,
  finalYesPrice: true,
  finalNoPrice: false,
  finalOutcome: true,
  strategyConfig: false,
  metadata: false
}

export function MarketSessionsTable({ sessions }: MarketSessionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('session_start')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  
  // Multiselect filters
  const [selectedBots, setSelectedBots] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  
  // Range filters
  const [pnlRange, setPnlRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [timeRange, setTimeRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  
  // ID filter
  const [idFilter, setIdFilter] = useState('')
  
  // Column visibility - load from localStorage
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('marketSessionsVisibleColumns')
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved columns:', e)
      }
    }
  }, [])
  
  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('marketSessionsVisibleColumns', JSON.stringify(visibleColumns))
  }, [visibleColumns])
  
  // Get unique values for multiselect
  const uniqueBots = useMemo(() => Array.from(new Set(sessions.map(s => s.bot_instance).filter(Boolean))) as string[], [sessions])
  const uniqueOutcomes = useMemo(() => Array.from(new Set(sessions.map(s => s.final_outcome).filter((v): v is string => v !== null && v !== undefined))), [sessions])
  
  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }))
  }
  
  const selectAllColumns = () => {
    const allTrue = Object.keys(visibleColumns).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as typeof visibleColumns)
    setVisibleColumns(allTrue)
  }
  
  const deselectAllColumns = () => {
    const allFalse = Object.keys(visibleColumns).reduce((acc, key) => ({
      ...acc,
      [key]: key === 'id' // tylko ID zostaje true
    }), {} as typeof visibleColumns)
    setVisibleColumns(allFalse)
  }
  
  const restoreDefaultColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)
  }

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Active'
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const seconds = Math.floor((end - start) / 1000)
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const toggleFilter = (value: string, currentList: string[], setter: (list: string[]) => void) => {
    if (currentList.includes(value)) {
      setter(currentList.filter(v => v !== value))
    } else {
      setter([...currentList, value])
    }
    setCurrentPage(1)
  }
  
  const clearAllFilters = () => {
    setSelectedBots([])
    setSelectedOutcomes([])
    setPnlRange({ min: '', max: '' })
    setTimeRange({ from: '', to: '' })
    setIdFilter('')
    setSearchTerm('')
    setCurrentPage(1)
  }
  
  const hasActiveFilters = selectedBots.length > 0 || selectedOutcomes.length > 0 || 
    idFilter || pnlRange.min || pnlRange.max || timeRange.from || timeRange.to

  // Filtrowanie
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesSearch = (
          session.market_question?.toLowerCase().includes(term) ||
          session.market_slug.toLowerCase().includes(term) ||
          session.bot_instance.toLowerCase().includes(term) ||
          session.id.toString().includes(term)
        )
        if (!matchesSearch) return false
      }
      
      // ID filter
      if (idFilter && session.id.toString() !== idFilter) return false
      
      // Multiselect filters
      if (selectedBots.length > 0 && !selectedBots.includes(session.bot_instance)) return false
      if (selectedOutcomes.length > 0 && session.final_outcome && !selectedOutcomes.includes(session.final_outcome)) return false
      
      // Range filters - P&L
      if (pnlRange.min && session.total_pnl !== null && session.total_pnl < parseFloat(pnlRange.min)) return false
      if (pnlRange.max && session.total_pnl !== null && session.total_pnl > parseFloat(pnlRange.max)) return false
      
      // Range filters - Time
      if (timeRange.from && new Date(session.session_start) < new Date(timeRange.from)) return false
      if (timeRange.to && new Date(session.session_start) > new Date(timeRange.to)) return false
      
      return true
    })
  }, [sessions, searchTerm, idFilter, selectedBots, selectedOutcomes, pnlRange, timeRange])

  // Sortowanie
  const sortedSessions = useMemo(() => {
    const sorted = [...filteredSessions]
    
    sorted.sort((a, b) => {
      let aVal: any
      let bVal: any
      
      if (sortField === 'session_start') {
        aVal = new Date(a.session_start).getTime()
        bVal = new Date(b.session_start).getTime()
      } else if (sortField === 'market_slug') {
        aVal = a.market_question || a.market_slug
        bVal = b.market_question || b.market_slug
      } else if (sortField === 'bot_instance') {
        aVal = a.bot_instance
        bVal = b.bot_instance
      } else {
        aVal = a[sortField]
        bVal = b[sortField]
      }
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (sortDirection === 'asc') {
          return aVal.localeCompare(bVal)
        } else {
          return bVal.localeCompare(aVal)
        }
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return sorted
  }, [filteredSessions, sortField, sortDirection])

  // Paginacja
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage)
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedSessions.slice(start, start + itemsPerPage)
  }, [sortedSessions, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex gap-4 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Ukryj' : 'Pokaż'} filtry
          {hasActiveFilters && <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
            {[selectedBots.length, selectedOutcomes.length].reduce((a, b) => a + b)}
          </span>}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowColumns(!showColumns)}
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Kolumny
        </Button>
        
        <Input
          placeholder="Szukaj (market, bot, ID)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-xs h-9"
        />

        <div className="ml-auto text-sm text-muted-foreground">
          Wyniki: {filteredSessions.length} / {sessions.length}
        </div>
      </div>

      {/* Panel kolumn */}
      {showColumns && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Columns3 className="h-4 w-4" />
              Widoczne kolumny
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={restoreDefaultColumns}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Przywróć domyślne
              </Button>
              <Button variant="outline" size="sm" onClick={selectAllColumns}>
                Zaznacz wszystkie
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllColumns}>
                Odznacz wszystkie
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowColumns(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
            <div className="flex items-center space-x-2">
              <Checkbox id="col-id" checked={visibleColumns.id} disabled />
              <label htmlFor="col-id" className="text-sm cursor-not-allowed opacity-50">ID (zawsze)</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketId" checked={visibleColumns.marketId} onCheckedChange={() => toggleColumn('marketId')} />
              <label htmlFor="col-marketId" className="text-sm cursor-pointer">Market ID</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-market" checked={visibleColumns.market} onCheckedChange={() => toggleColumn('market')} />
              <label htmlFor="col-market" className="text-sm cursor-pointer">Market</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-seriesSlug" checked={visibleColumns.seriesSlug} onCheckedChange={() => toggleColumn('seriesSlug')} />
              <label htmlFor="col-seriesSlug" className="text-sm cursor-pointer">Series Slug</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-bot" checked={visibleColumns.bot} onCheckedChange={() => toggleColumn('bot')} />
              <label htmlFor="col-bot" className="text-sm cursor-pointer">Bot Instance</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-sessionStart" checked={visibleColumns.sessionStart} onCheckedChange={() => toggleColumn('sessionStart')} />
              <label htmlFor="col-sessionStart" className="text-sm cursor-pointer">Session Start</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-sessionEnd" checked={visibleColumns.sessionEnd} onCheckedChange={() => toggleColumn('sessionEnd')} />
              <label htmlFor="col-sessionEnd" className="text-sm cursor-pointer">Session End</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-duration" checked={visibleColumns.duration} onCheckedChange={() => toggleColumn('duration')} />
              <label htmlFor="col-duration" className="text-sm cursor-pointer">Duration</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketStartTime" checked={visibleColumns.marketStartTime} onCheckedChange={() => toggleColumn('marketStartTime')} />
              <label htmlFor="col-marketStartTime" className="text-sm cursor-pointer">Market Start Time</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketEndTime" checked={visibleColumns.marketEndTime} onCheckedChange={() => toggleColumn('marketEndTime')} />
              <label htmlFor="col-marketEndTime" className="text-sm cursor-pointer">Market End Time</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-totalEntries" checked={visibleColumns.totalEntries} onCheckedChange={() => toggleColumn('totalEntries')} />
              <label htmlFor="col-totalEntries" className="text-sm cursor-pointer">Total Entries</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-totalExits" checked={visibleColumns.totalExits} onCheckedChange={() => toggleColumn('totalExits')} />
              <label htmlFor="col-totalExits" className="text-sm cursor-pointer">Total Exits</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-totalSkips" checked={visibleColumns.totalSkips} onCheckedChange={() => toggleColumn('totalSkips')} />
              <label htmlFor="col-totalSkips" className="text-sm cursor-pointer">Total Skips</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-trades" checked={visibleColumns.trades} onCheckedChange={() => toggleColumn('trades')} />
              <label htmlFor="col-trades" className="text-sm cursor-pointer">Trades (E/X/SK)</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-totalPnl" checked={visibleColumns.totalPnl} onCheckedChange={() => toggleColumn('totalPnl')} />
              <label htmlFor="col-totalPnl" className="text-sm cursor-pointer">Total P&L</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-initialYesPrice" checked={visibleColumns.initialYesPrice} onCheckedChange={() => toggleColumn('initialYesPrice')} />
              <label htmlFor="col-initialYesPrice" className="text-sm cursor-pointer">Initial YES Price</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-initialNoPrice" checked={visibleColumns.initialNoPrice} onCheckedChange={() => toggleColumn('initialNoPrice')} />
              <label htmlFor="col-initialNoPrice" className="text-sm cursor-pointer">Initial NO Price</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-initialSpread" checked={visibleColumns.initialSpread} onCheckedChange={() => toggleColumn('initialSpread')} />
              <label htmlFor="col-initialSpread" className="text-sm cursor-pointer">Initial Spread</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-finalYesPrice" checked={visibleColumns.finalYesPrice} onCheckedChange={() => toggleColumn('finalYesPrice')} />
              <label htmlFor="col-finalYesPrice" className="text-sm cursor-pointer">Final YES Price</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-finalNoPrice" checked={visibleColumns.finalNoPrice} onCheckedChange={() => toggleColumn('finalNoPrice')} />
              <label htmlFor="col-finalNoPrice" className="text-sm cursor-pointer">Final NO Price</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-finalOutcome" checked={visibleColumns.finalOutcome} onCheckedChange={() => toggleColumn('finalOutcome')} />
              <label htmlFor="col-finalOutcome" className="text-sm cursor-pointer">Final Outcome</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-strategyConfig" checked={visibleColumns.strategyConfig} onCheckedChange={() => toggleColumn('strategyConfig')} />
              <label htmlFor="col-strategyConfig" className="text-sm cursor-pointer">Strategy Config</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-metadata" checked={visibleColumns.metadata} onCheckedChange={() => toggleColumn('metadata')} />
              <label htmlFor="col-metadata" className="text-sm cursor-pointer">Metadata</label>
            </div>
          </div>
        </div>
      )}

      {/* Panel filtrów */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtry
            </h3>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Wyczyść wszystkie
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* ID Input */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Session ID</Label>
              <Input
                type="number"
                placeholder="np. 123"
                value={idFilter}
                onChange={(e) => {
                  setIdFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 text-xs"
              />
            </div>
            
            {/* Bot Multiselect */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Bot Instance</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                {uniqueBots.map(bot => (
                  <div key={bot} className="flex items-center space-x-2">
                    <Checkbox
                      id={`bot-${bot}`}
                      checked={selectedBots.includes(bot)}
                      onCheckedChange={() => toggleFilter(bot, selectedBots, setSelectedBots)}
                    />
                    <label htmlFor={`bot-${bot}`} className="text-xs cursor-pointer truncate">
                      {bot} ({sessions.filter(s => s.bot_instance === bot).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Outcome Multiselect */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Final Outcome</Label>
              <div className="space-y-1 border rounded p-2">
                {uniqueOutcomes.map(outcome => (
                  <div key={outcome} className="flex items-center space-x-2">
                    <Checkbox
                      id={`outcome-${outcome}`}
                      checked={selectedOutcomes.includes(outcome)}
                      onCheckedChange={() => toggleFilter(outcome, selectedOutcomes, setSelectedOutcomes)}
                    />
                    <label htmlFor={`outcome-${outcome}`} className="text-xs cursor-pointer">
                      {outcome} ({sessions.filter(s => s.final_outcome === outcome).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time Range */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Time Range</Label>
              <Input
                type="datetime-local"
                value={timeRange.from}
                onChange={(e) => {
                  setTimeRange(prev => ({ ...prev, from: e.target.value }))
                  setCurrentPage(1)
                }}
                className="h-8 text-xs"
              />
              <Input
                type="datetime-local"
                value={timeRange.to}
                onChange={(e) => {
                  setTimeRange(prev => ({ ...prev, to: e.target.value }))
                  setCurrentPage(1)
                }}
                className="h-8 text-xs"
              />
            </div>
            
            {/* P&L Range */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">P&L Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={pnlRange.min}
                  onChange={(e) => {
                    setPnlRange(prev => ({ ...prev, min: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={pnlRange.max}
                  onChange={(e) => {
                    setPnlRange(prev => ({ ...prev, max: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto border rounded-lg">
        <div className="min-w-full text-sm">
          {/* Header */}
          <div className="flex items-center border-b bg-muted/50">
            <MarketSessionsTableHeaders 
              visibleColumns={visibleColumns} 
              sortField={sortField} 
              handleSort={handleSort} 
            />
          </div>
          
          {/* Body */}
          <div>
            {paginatedSessions.map((session) => (
              <div key={session.id} className="flex items-center border-b hover:bg-muted/50 transition-colors">
                <MarketSessionsTableRow 
                  session={session} 
                  visibleColumns={visibleColumns} 
                  formatDuration={formatDuration} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Strona {currentPage} z {totalPages} (pokazuje {paginatedSessions.length} z {sortedSessions.length})
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

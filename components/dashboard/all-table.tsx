'use client'

import { Trade, MarketSession } from '@/types/database'
import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Filter, X, Columns3, RotateCcw, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react'

interface AllTableProps {
  trades: Trade[]
  sessions: MarketSession[]
}

type ViewMode = 'trades' | 'sessions' | 'all'

// Default visible columns for trades
const DEFAULT_VISIBLE_TRADES_COLUMNS = {
  id: true,
  botInstance: true,
  sessionId: true,
  timestamp: true,
  marketId: false,
  marketSlug: false,
  marketQuestion: true,
  marketEndTime: false,
  seriesSlug: false,
  type: true,
  outcome: true,
  price: true,
  size: true,
  shares: true,
  orderId: true,
  pnl: true,
  roi: true,
  result: true,
  metadata: true
}

// Default visible columns for sessions
const DEFAULT_VISIBLE_SESSIONS_COLUMNS = {
  id: true,
  marketId: false,
  market: true,
  seriesSlug: false,
  bot: true,
  sessionStart: true,
  sessionEnd: false,
  duration: true,
  marketStartTime: false,
  marketEndTime: false,
  totalEntries: false,
  totalExits: false,
  totalSkips: false,
  trades: true,
  totalPnl: true,
  initialYesPrice: false,
  initialNoPrice: false,
  initialSpread: false,
  finalYesPrice: false,
  finalNoPrice: false,
  finalOutcome: true,
  strategyConfig: false,
  metadata: false
}

export function AllTable({ trades, sessions }: AllTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50


  // Column visibility
  const [visibleTradesColumns, setVisibleTradesColumns] = useState(DEFAULT_VISIBLE_TRADES_COLUMNS)
  const [visibleSessionsColumns, setVisibleSessionsColumns] = useState(DEFAULT_VISIBLE_SESSIONS_COLUMNS)

  // Panels state
  const [showTradesFilters, setShowTradesFilters] = useState(false)
  const [showSessionsFilters, setShowSessionsFilters] = useState(false)
  const [showTradesColumns, setShowTradesColumns] = useState(false)
  const [showSessionsColumns, setShowSessionsColumns] = useState(false)

  // Expanded sessions in "all" view
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())

  // Filters for trades
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  const [selectedBots, setSelectedBots] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sizeRange, setSizeRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sharesRange, setSharesRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [timeRange, setTimeRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [sessionFilter, setSessionFilter] = useState('')

  // Filters for sessions
  const [selectedSessionBots, setSelectedSessionBots] = useState<string[]>([])
  const [selectedFinalOutcomes, setSelectedFinalOutcomes] = useState<string[]>([])
  const [pnlRange, setPnlRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sessionTimeRange, setSessionTimeRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [sessionIdFilter, setSessionIdFilter] = useState('')

  // Load from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('allViewTradesColumns')
    const savedSessions = localStorage.getItem('allViewSessionsColumns')
    if (savedTrades) {
      try {
        setVisibleTradesColumns(JSON.parse(savedTrades))
      } catch (e) {
        console.error('Error loading saved trades columns:', e)
      }
    }
    if (savedSessions) {
      try {
        setVisibleSessionsColumns(JSON.parse(savedSessions))
      } catch (e) {
        console.error('Error loading saved sessions columns:', e)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('allViewTradesColumns', JSON.stringify(visibleTradesColumns))
  }, [visibleTradesColumns])

  useEffect(() => {
    localStorage.setItem('allViewSessionsColumns', JSON.stringify(visibleSessionsColumns))
  }, [visibleSessionsColumns])

  const toggleExpandSession = (sessionId: number) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  // Get trades for a session
  const getTradesForSession = (sessionId: number) => {
    return trades.filter(t => t.session_id === sessionId)
  }

  // Get unique values for filters
  const uniqueTypes = useMemo(() => Array.from(new Set(trades.map(t => t.type).filter(Boolean))) as string[], [trades])
  const uniqueOutcomes = useMemo(() => Array.from(new Set(trades.map(t => t.outcome).filter((v): v is string => v !== null && v !== undefined))), [trades])
  const uniqueBots = useMemo(() => Array.from(new Set(trades.map(t => t.bot_instance).filter(Boolean))) as string[], [trades])
  const uniqueResults = useMemo(() => Array.from(new Set(trades.map(t => t.result).filter((v): v is string => v !== null && v !== undefined))), [trades])
  
  const uniqueSessionBots = useMemo(() => Array.from(new Set(sessions.map(s => s.bot_instance).filter(Boolean))), [sessions])
  const uniqueFinalOutcomes = useMemo(() => Array.from(new Set(sessions.map(s => s.final_outcome).filter((v): v is string => v !== null && v !== undefined))), [sessions])

  // Column management functions
  const toggleTradesColumn = (column: keyof typeof visibleTradesColumns) => {
    setVisibleTradesColumns(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const toggleSessionsColumn = (column: keyof typeof visibleSessionsColumns) => {
    setVisibleSessionsColumns(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const restoreDefaultTradesColumns = () => {
    setVisibleTradesColumns(DEFAULT_VISIBLE_TRADES_COLUMNS)
  }

  const restoreDefaultSessionsColumns = () => {
    setVisibleSessionsColumns(DEFAULT_VISIBLE_SESSIONS_COLUMNS)
  }

  // Helper functions
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'entry':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'exit':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'skip':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return '-'
    const isYes = outcome.toUpperCase() === 'YES' || outcome.toUpperCase() === 'UP'
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isYes ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      }`}>
        {outcome}
      </span>
    )
  }

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Active'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatMetadataInline = (metadata: any): string => {
    if (!metadata) return '-'
    if (metadata.skip_reasons && Array.isArray(metadata.skip_reasons)) {
      const firstReason = metadata.skip_reasons[0]
      if (typeof firstReason === 'string') return firstReason
      if (typeof firstReason === 'object') return JSON.stringify(firstReason)
      return '-'
    }
    const keys = Object.keys(metadata).slice(0, 2)
    if (keys.length === 0) return '-'
    return keys.map(k => {
      const val = metadata[k]
      if (typeof val === 'string') return `${k}: ${val}`
      if (typeof val === 'number') return `${k}: ${val}`
      return k
    }).join(', ')
  }

  const formatMetadataPopup = (metadata: any) => {
    if (!metadata) return '-'
    if (metadata.skip_reasons && Array.isArray(metadata.skip_reasons)) {
      return (
        <ul className="list-disc pl-4 space-y-1">
          {metadata.skip_reasons.map((reason: any, i: number) => (
            <li key={i}>
              {typeof reason === 'string' ? reason : JSON.stringify(reason)}
            </li>
          ))}
        </ul>
      )
    }
    return <pre className="text-xs">{JSON.stringify(metadata, null, 2)}</pre>
  }

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

  // Filtering
  const filteredData = useMemo(() => {
    if (viewMode === 'trades') {
      return trades.filter(trade => {
        // Search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase()
          if (!(
            trade.market_question?.toLowerCase().includes(search) ||
            trade.market_slug?.toLowerCase().includes(search) ||
            trade.bot_instance?.toLowerCase().includes(search) ||
            trade.id.toString().includes(search)
          )) return false
        }

        // Session filter
        if (sessionFilter && trade.session_id?.toString() !== sessionFilter) return false

        // Multiselect filters
        if (selectedTypes.length > 0 && !selectedTypes.includes(trade.type)) return false
        if (selectedOutcomes.length > 0 && (!trade.outcome || !selectedOutcomes.includes(trade.outcome))) return false
        if (selectedBots.length > 0 && !selectedBots.includes(trade.bot_instance)) return false
        if (selectedResults.length > 0 && (!trade.result || !selectedResults.includes(trade.result))) return false

        // Range filters
        if (priceRange.min && trade.price !== null && trade.price < parseFloat(priceRange.min)) return false
        if (priceRange.max && trade.price !== null && trade.price > parseFloat(priceRange.max)) return false
        if (sizeRange.min && trade.size !== null && trade.size < parseFloat(sizeRange.min)) return false
        if (sizeRange.max && trade.size !== null && trade.size > parseFloat(sizeRange.max)) return false
        if (sharesRange.min && trade.shares !== null && trade.shares < parseFloat(sharesRange.min)) return false
        if (sharesRange.max && trade.shares !== null && trade.shares > parseFloat(sharesRange.max)) return false

        // Time range filter
        if (timeRange.from) {
          const tradeDate = new Date(trade.timestamp)
          const fromDate = new Date(timeRange.from)
          if (tradeDate < fromDate) return false
        }
        if (timeRange.to) {
          const tradeDate = new Date(trade.timestamp)
          const toDate = new Date(timeRange.to)
          if (tradeDate > toDate) return false
        }

        return true
      })
    } else if (viewMode === 'sessions' || viewMode === 'all') {
      return sessions.filter(session => {
        // Search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase()
          if (!(
            session.market_question?.toLowerCase().includes(search) ||
            session.market_slug?.toLowerCase().includes(search) ||
            session.bot_instance?.toLowerCase().includes(search) ||
            session.id.toString().includes(search)
          )) return false
        }

        // Session ID filter
        if (sessionIdFilter && session.id.toString() !== sessionIdFilter) return false

        // Multiselect filters
        if (selectedSessionBots.length > 0 && !selectedSessionBots.includes(session.bot_instance)) return false
        if (selectedFinalOutcomes.length > 0 && (!session.final_outcome || !selectedFinalOutcomes.includes(session.final_outcome))) return false

        // P&L range filter
        if (pnlRange.min && session.total_pnl !== null && session.total_pnl < parseFloat(pnlRange.min)) return false
        if (pnlRange.max && session.total_pnl !== null && session.total_pnl > parseFloat(pnlRange.max)) return false

        // Time range filter
        if (sessionTimeRange.from) {
          const sessionDate = new Date(session.session_start)
          const fromDate = new Date(sessionTimeRange.from)
          if (sessionDate < fromDate) return false
        }
        if (sessionTimeRange.to) {
          const sessionDate = new Date(session.session_start)
          const toDate = new Date(sessionTimeRange.to)
          if (sessionDate > toDate) return false
        }

        return true
      })
    }
    return []
  }, [viewMode, trades, sessions, searchTerm, sessionFilter, selectedTypes, selectedOutcomes, selectedBots, selectedResults, 
      priceRange, sizeRange, sharesRange, timeRange, sessionIdFilter, selectedSessionBots, selectedFinalOutcomes, 
      pnlRange, sessionTimeRange])

  // Active filters count for trades
  const activeTradesFiltersCount = useMemo(() => {
    return selectedTypes.length + selectedOutcomes.length + selectedBots.length + selectedResults.length +
      (sessionFilter ? 1 : 0) + (priceRange.min || priceRange.max ? 1 : 0) + (sizeRange.min || sizeRange.max ? 1 : 0) +
      (sharesRange.min || sharesRange.max ? 1 : 0) + (timeRange.from || timeRange.to ? 1 : 0)
  }, [selectedTypes, selectedOutcomes, selectedBots, selectedResults, sessionFilter, priceRange, sizeRange, 
      sharesRange, timeRange])

  // Active filters count for sessions
  const activeSessionsFiltersCount = useMemo(() => {
    return selectedSessionBots.length + selectedFinalOutcomes.length +
      (sessionIdFilter ? 1 : 0) + (pnlRange.min || pnlRange.max ? 1 : 0) + (sessionTimeRange.from || sessionTimeRange.to ? 1 : 0)
  }, [selectedSessionBots, selectedFinalOutcomes, sessionIdFilter, pnlRange, sessionTimeRange])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      {/* View Mode Radio Buttons */}
      <div className="flex items-center gap-6 p-4 border rounded-lg bg-muted/20">
        <Label className="font-semibold">Widok:</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="trades"
              checked={viewMode === 'trades'}
              onChange={(e) => {
                setViewMode(e.target.value as ViewMode)
                setCurrentPage(1)
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Trades</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="sessions"
              checked={viewMode === 'sessions'}
              onChange={(e) => {
                setViewMode(e.target.value as ViewMode)
                setCurrentPage(1)
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Sessions</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="all"
              checked={viewMode === 'all'}
              onChange={(e) => {
                setViewMode(e.target.value as ViewMode)
                setCurrentPage(1)
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">All</span>
          </label>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex gap-2 items-center flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSessionsFilters(!showSessionsFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtry Sessions
          {activeSessionsFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeSessionsFiltersCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTradesFilters(!showTradesFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtry Trades
          {activeTradesFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeTradesFiltersCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSessionsColumns(!showSessionsColumns)}
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Kolumny Sessions
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTradesColumns(!showTradesColumns)}
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Kolumny Trades
        </Button>

        <Input
          placeholder="Szukaj..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-xs h-9"
        />

        <div className="ml-auto text-sm text-muted-foreground">
          Wyniki: {filteredData.length}
        </div>
      </div>

      {/* Trades Column management panel */}
      {showTradesColumns && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Columns3 className="h-4 w-4" />
              Trades Columns
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={restoreDefaultTradesColumns}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Przywróć domyślne
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowTradesColumns(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-id" checked={visibleTradesColumns.id} disabled />
                  <label htmlFor="t-col-id" className="text-sm cursor-not-allowed opacity-50">ID (zawsze)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-botInstance" checked={visibleTradesColumns.botInstance} onCheckedChange={() => toggleTradesColumn('botInstance')} />
                  <label htmlFor="t-col-botInstance" className="text-sm cursor-pointer">Bot Instance</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-sessionId" checked={visibleTradesColumns.sessionId} onCheckedChange={() => toggleTradesColumn('sessionId')} />
                  <label htmlFor="t-col-sessionId" className="text-sm cursor-pointer">Session ID</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-timestamp" checked={visibleTradesColumns.timestamp} onCheckedChange={() => toggleTradesColumn('timestamp')} />
                  <label htmlFor="t-col-timestamp" className="text-sm cursor-pointer">Timestamp</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-marketId" checked={visibleTradesColumns.marketId} onCheckedChange={() => toggleTradesColumn('marketId')} />
                  <label htmlFor="t-col-marketId" className="text-sm cursor-pointer">Market ID</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-marketSlug" checked={visibleTradesColumns.marketSlug} onCheckedChange={() => toggleTradesColumn('marketSlug')} />
                  <label htmlFor="t-col-marketSlug" className="text-sm cursor-pointer">Market Slug</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-marketQuestion" checked={visibleTradesColumns.marketQuestion} onCheckedChange={() => toggleTradesColumn('marketQuestion')} />
                  <label htmlFor="t-col-marketQuestion" className="text-sm cursor-pointer">Market Question</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-marketEndTime" checked={visibleTradesColumns.marketEndTime} onCheckedChange={() => toggleTradesColumn('marketEndTime')} />
                  <label htmlFor="t-col-marketEndTime" className="text-sm cursor-pointer">Market End Time</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-seriesSlug" checked={visibleTradesColumns.seriesSlug} onCheckedChange={() => toggleTradesColumn('seriesSlug')} />
                  <label htmlFor="t-col-seriesSlug" className="text-sm cursor-pointer">Series Slug</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-type" checked={visibleTradesColumns.type} onCheckedChange={() => toggleTradesColumn('type')} />
                  <label htmlFor="t-col-type" className="text-sm cursor-pointer">Type</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-outcome" checked={visibleTradesColumns.outcome} onCheckedChange={() => toggleTradesColumn('outcome')} />
                  <label htmlFor="t-col-outcome" className="text-sm cursor-pointer">Outcome</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-price" checked={visibleTradesColumns.price} onCheckedChange={() => toggleTradesColumn('price')} />
                  <label htmlFor="t-col-price" className="text-sm cursor-pointer">Price</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-size" checked={visibleTradesColumns.size} onCheckedChange={() => toggleTradesColumn('size')} />
                  <label htmlFor="t-col-size" className="text-sm cursor-pointer">Size</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-shares" checked={visibleTradesColumns.shares} onCheckedChange={() => toggleTradesColumn('shares')} />
                  <label htmlFor="t-col-shares" className="text-sm cursor-pointer">Shares</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-orderId" checked={visibleTradesColumns.orderId} onCheckedChange={() => toggleTradesColumn('orderId')} />
                  <label htmlFor="t-col-orderId" className="text-sm cursor-pointer">Order ID</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-pnl" checked={visibleTradesColumns.pnl} onCheckedChange={() => toggleTradesColumn('pnl')} />
                  <label htmlFor="t-col-pnl" className="text-sm cursor-pointer">P&L</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-roi" checked={visibleTradesColumns.roi} onCheckedChange={() => toggleTradesColumn('roi')} />
                  <label htmlFor="t-col-roi" className="text-sm cursor-pointer">ROI %</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-result" checked={visibleTradesColumns.result} onCheckedChange={() => toggleTradesColumn('result')} />
                  <label htmlFor="t-col-result" className="text-sm cursor-pointer">Result</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="t-col-metadata" checked={visibleTradesColumns.metadata} onCheckedChange={() => toggleTradesColumn('metadata')} />
                  <label htmlFor="t-col-metadata" className="text-sm cursor-pointer">Metadata</label>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Sessions Column management panel */}
      {showSessionsColumns && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Columns3 className="h-4 w-4" />
              Sessions Columns
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={restoreDefaultSessionsColumns}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Przywróć domyślne
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSessionsColumns(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-id" checked={visibleSessionsColumns.id} disabled />
                  <label htmlFor="s-col-id" className="text-sm cursor-not-allowed opacity-50">ID (zawsze)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-marketId" checked={visibleSessionsColumns.marketId} onCheckedChange={() => toggleSessionsColumn('marketId')} />
                  <label htmlFor="s-col-marketId" className="text-sm cursor-pointer">Market ID</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-market" checked={visibleSessionsColumns.market} onCheckedChange={() => toggleSessionsColumn('market')} />
                  <label htmlFor="s-col-market" className="text-sm cursor-pointer">Market</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-seriesSlug" checked={visibleSessionsColumns.seriesSlug} onCheckedChange={() => toggleSessionsColumn('seriesSlug')} />
                  <label htmlFor="s-col-seriesSlug" className="text-sm cursor-pointer">Series</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-bot" checked={visibleSessionsColumns.bot} onCheckedChange={() => toggleSessionsColumn('bot')} />
                  <label htmlFor="s-col-bot" className="text-sm cursor-pointer">Bot</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-sessionStart" checked={visibleSessionsColumns.sessionStart} onCheckedChange={() => toggleSessionsColumn('sessionStart')} />
                  <label htmlFor="s-col-sessionStart" className="text-sm cursor-pointer">Session Start</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-sessionEnd" checked={visibleSessionsColumns.sessionEnd} onCheckedChange={() => toggleSessionsColumn('sessionEnd')} />
                  <label htmlFor="s-col-sessionEnd" className="text-sm cursor-pointer">Session End</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-duration" checked={visibleSessionsColumns.duration} onCheckedChange={() => toggleSessionsColumn('duration')} />
                  <label htmlFor="s-col-duration" className="text-sm cursor-pointer">Duration</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-marketStartTime" checked={visibleSessionsColumns.marketStartTime} onCheckedChange={() => toggleSessionsColumn('marketStartTime')} />
                  <label htmlFor="s-col-marketStartTime" className="text-sm cursor-pointer">Market Start</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-marketEndTime" checked={visibleSessionsColumns.marketEndTime} onCheckedChange={() => toggleSessionsColumn('marketEndTime')} />
                  <label htmlFor="s-col-marketEndTime" className="text-sm cursor-pointer">Market End</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-totalEntries" checked={visibleSessionsColumns.totalEntries} onCheckedChange={() => toggleSessionsColumn('totalEntries')} />
                  <label htmlFor="s-col-totalEntries" className="text-sm cursor-pointer">Entries</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-totalExits" checked={visibleSessionsColumns.totalExits} onCheckedChange={() => toggleSessionsColumn('totalExits')} />
                  <label htmlFor="s-col-totalExits" className="text-sm cursor-pointer">Exits</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-totalSkips" checked={visibleSessionsColumns.totalSkips} onCheckedChange={() => toggleSessionsColumn('totalSkips')} />
                  <label htmlFor="s-col-totalSkips" className="text-sm cursor-pointer">Skips</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-trades" checked={visibleSessionsColumns.trades} onCheckedChange={() => toggleSessionsColumn('trades')} />
                  <label htmlFor="s-col-trades" className="text-sm cursor-pointer">Total Trades</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-totalPnl" checked={visibleSessionsColumns.totalPnl} onCheckedChange={() => toggleSessionsColumn('totalPnl')} />
                  <label htmlFor="s-col-totalPnl" className="text-sm cursor-pointer">P&L</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-initialYesPrice" checked={visibleSessionsColumns.initialYesPrice} onCheckedChange={() => toggleSessionsColumn('initialYesPrice')} />
                  <label htmlFor="s-col-initialYesPrice" className="text-sm cursor-pointer">Init Yes Price</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-initialNoPrice" checked={visibleSessionsColumns.initialNoPrice} onCheckedChange={() => toggleSessionsColumn('initialNoPrice')} />
                  <label htmlFor="s-col-initialNoPrice" className="text-sm cursor-pointer">Init No Price</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-initialSpread" checked={visibleSessionsColumns.initialSpread} onCheckedChange={() => toggleSessionsColumn('initialSpread')} />
                  <label htmlFor="s-col-initialSpread" className="text-sm cursor-pointer">Init Spread</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-finalYesPrice" checked={visibleSessionsColumns.finalYesPrice} onCheckedChange={() => toggleSessionsColumn('finalYesPrice')} />
                  <label htmlFor="s-col-finalYesPrice" className="text-sm cursor-pointer">Final Yes Price</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-finalNoPrice" checked={visibleSessionsColumns.finalNoPrice} onCheckedChange={() => toggleSessionsColumn('finalNoPrice')} />
                  <label htmlFor="s-col-finalNoPrice" className="text-sm cursor-pointer">Final No Price</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-finalOutcome" checked={visibleSessionsColumns.finalOutcome} onCheckedChange={() => toggleSessionsColumn('finalOutcome')} />
                  <label htmlFor="s-col-finalOutcome" className="text-sm cursor-pointer">Final Outcome</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-strategyConfig" checked={visibleSessionsColumns.strategyConfig} onCheckedChange={() => toggleSessionsColumn('strategyConfig')} />
                  <label htmlFor="s-col-strategyConfig" className="text-sm cursor-pointer">Strategy Config</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s-col-metadata" checked={visibleSessionsColumns.metadata} onCheckedChange={() => toggleSessionsColumn('metadata')} />
                  <label htmlFor="s-col-metadata" className="text-sm cursor-pointer">Metadata</label>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Trades Filters panel */}
      {showTradesFilters && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtry Trades
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowTradesFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
              
              {/* Session ID filter */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Session ID</Label>
                <Input
                  type="number"
                  placeholder="np. 123"
                  value={sessionFilter}
                  onChange={(e) => {
                    setSessionFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Type multiselect */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Type</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueTypes.map(type => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes([...selectedTypes, type])
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type))
                          }
                          setCurrentPage(1)
                        }}
                      />
                      <span className="text-xs">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Outcome multiselect */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Outcome</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueOutcomes.map(outcome => (
                    <label key={outcome} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedOutcomes.includes(outcome)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOutcomes([...selectedOutcomes, outcome])
                          } else {
                            setSelectedOutcomes(selectedOutcomes.filter(o => o !== outcome))
                          }
                          setCurrentPage(1)
                        }}
                      />
                      <span className="text-xs">{outcome}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bot multiselect */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Bot Instance</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueBots.map(bot => (
                    <label key={bot} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedBots.includes(bot)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBots([...selectedBots, bot])
                          } else {
                            setSelectedBots(selectedBots.filter(b => b !== bot))
                          }
                          setCurrentPage(1)
                        }}
                      />
                      <span className="text-xs truncate max-w-[200px]" title={bot}>{bot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Result multiselect */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Result</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueResults.map(result => (
                    <label key={result} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedResults.includes(result)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedResults([...selectedResults, result])
                          } else {
                            setSelectedResults(selectedResults.filter(r => r !== result))
                          }
                          setCurrentPage(1)
                        }}
                      />
                      <span className="text-xs">{result}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Range filters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Price</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => {
                        setPriceRange(prev => ({ ...prev, min: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => {
                        setPriceRange(prev => ({ ...prev, max: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Size</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={sizeRange.min}
                      onChange={(e) => {
                        setSizeRange(prev => ({ ...prev, min: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={sizeRange.max}
                      onChange={(e) => {
                        setSizeRange(prev => ({ ...prev, max: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Shares</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={sharesRange.min}
                      onChange={(e) => {
                        setSharesRange(prev => ({ ...prev, min: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={sharesRange.max}
                      onChange={(e) => {
                        setSharesRange(prev => ({ ...prev, max: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Time</Label>
                  <div className="flex gap-2">
                    <Input
                      type="datetime-local"
                      value={timeRange.from}
                      onChange={(e) => {
                        setTimeRange(prev => ({ ...prev, from: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="datetime-local"
                      value={timeRange.to}
                      onChange={(e) => {
                        setTimeRange(prev => ({ ...prev, to: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Sessions Filters panel */}
      {showSessionsFilters && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtry Sessions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSessionsFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
              
              {/* Session ID filter */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Session ID</Label>
                <Input
                  type="number"
                  placeholder="np. 123"
                  value={sessionIdFilter}
                  onChange={(e) => {
                    setSessionIdFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Bot multiselect */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Bot Instance</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSessionBots.map(bot => (
                    <label key={bot} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedSessionBots.includes(bot)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSessionBots([...selectedSessionBots, bot])
                          } else {
                            setSelectedSessionBots(selectedSessionBots.filter(b => b !== bot))
                          }
                          setCurrentPage(1)
                        }}
                      />
                      <span className="text-xs truncate max-w-[200px]" title={bot}>{bot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Final Outcome multiselect */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Final Outcome</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueFinalOutcomes.map(outcome => (
                    <label key={outcome} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedFinalOutcomes.includes(outcome)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFinalOutcomes([...selectedFinalOutcomes, outcome])
                          } else {
                            setSelectedFinalOutcomes(selectedFinalOutcomes.filter(o => o !== outcome))
                          }
                          setCurrentPage(1)
                        }}
                      />
                      <span className="text-xs">{outcome}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Range filters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Total P&L</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={pnlRange.min}
                      onChange={(e) => {
                        setPnlRange(prev => ({ ...prev, min: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={pnlRange.max}
                      onChange={(e) => {
                        setPnlRange(prev => ({ ...prev, max: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Session Start Time</Label>
                  <div className="flex gap-2">
                    <Input
                      type="datetime-local"
                      value={sessionTimeRange.from}
                      onChange={(e) => {
                        setSessionTimeRange(prev => ({ ...prev, from: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="datetime-local"
                      value={sessionTimeRange.to}
                      onChange={(e) => {
                        setSessionTimeRange(prev => ({ ...prev, to: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'trades' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full text-sm">
              {/* Header */}
              <div className="flex items-center border-b bg-muted/50">
                {visibleTradesColumns.id && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>ID</div>
                )}
                {visibleTradesColumns.botInstance && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>Bot Instance</div>
                )}
                {visibleTradesColumns.sessionId && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>Session</div>
                )}
                {visibleTradesColumns.timestamp && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '125px', flexGrow: 1}}>Timestamp</div>
                )}
                {visibleTradesColumns.marketId && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>Market ID</div>
                )}
                {visibleTradesColumns.marketSlug && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '180px', flexGrow: 0, flexShrink: 1}}>Market Slug</div>
                )}
                {visibleTradesColumns.marketQuestion && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>Market Question</div>
                )}
                {visibleTradesColumns.marketEndTime && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Market End</div>
                )}
                {visibleTradesColumns.seriesSlug && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>Series</div>
                )}
                {visibleTradesColumns.type && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '85px', flexGrow: 0, flexShrink: 0}}>Type</div>
                )}
                {visibleTradesColumns.outcome && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 1}}>Outcome</div>
                )}
                {visibleTradesColumns.price && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 1}}>Price</div>
                )}
                {visibleTradesColumns.size && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 1}}>Size</div>
                )}
                {visibleTradesColumns.shares && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 1}}>Shares</div>
                )}
                {visibleTradesColumns.orderId && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '200px', flexGrow: 1, flexShrink: 1}}>Order ID</div>
                )}
                {visibleTradesColumns.pnl && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 1}}>P&L</div>
                )}
                {visibleTradesColumns.roi && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '75px', flexGrow: 1}}>ROI %</div>
                )}
                {visibleTradesColumns.result && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 1}}>Result</div>
                )}
                {visibleTradesColumns.metadata && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '200px', flexGrow: 0, flexShrink: 0}}>Metadata</div>
                )}
              </div>

              {/* Body */}
              <div>
                {paginatedData.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Brak danych do wyświetlenia
                  </div>
                ) : (
                  (paginatedData as Trade[]).map((trade) => (
                  <div key={trade.id} className="flex items-center border-b hover:bg-muted/50 transition-colors">
                    {visibleTradesColumns.id && (
                      <div className="p-2 text-center font-mono text-xs text-muted-foreground" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                        #{trade.id}
                      </div>
                    )}
                    {visibleTradesColumns.botInstance && (
                      <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>
                        <div className="text-xs text-muted-foreground truncate" title={trade.bot_instance}>
                          {trade.bot_instance}
                        </div>
                      </div>
                    )}
                    {visibleTradesColumns.sessionId && (
                      <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                        {trade.session_id || '-'}
                      </div>
                    )}
                    {visibleTradesColumns.timestamp && (
                      <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '125px', flexGrow: 1}}>
                        {format(new Date(trade.timestamp), 'HH:mm dd-MM-yyyy')}
                      </div>
                    )}
                    {visibleTradesColumns.marketId && (
                      <div className="p-2 overflow-hidden" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
                        <div className="truncate text-xs font-mono" title={trade.market_id || ''}>
                          {trade.market_id || '-'}
                        </div>
                      </div>
                    )}
                    {visibleTradesColumns.marketSlug && (
                      <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 0, flexShrink: 1}}>
                        <div className="truncate text-xs" title={trade.market_slug}>
                          {trade.market_slug}
                        </div>
                      </div>
                    )}
                    {visibleTradesColumns.marketQuestion && (
                      <div className="p-2 overflow-hidden" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>
                        <div className="truncate font-medium text-xs" title={trade.market_question || trade.market_slug}>
                          {trade.market_question || trade.market_slug}
                        </div>
                      </div>
                    )}
                    {visibleTradesColumns.marketEndTime && (
                      <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                        {trade.market_end_time ? format(new Date(trade.market_end_time), 'HH:mm dd-MM-yyyy') : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.seriesSlug && (
                      <div className="p-2 overflow-hidden" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>
                        <div className="text-xs text-muted-foreground/70 truncate" title={trade.series_slug || ''}>
                          {trade.series_slug || '-'}
                        </div>
                      </div>
                    )}
                    {visibleTradesColumns.type && (
                      <div className="p-2 flex items-center justify-center" style={{flexBasis: '85px', flexGrow: 0, flexShrink: 0}}>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getTypeColor(trade.type)}`}>
                          {trade.type}
                        </span>
                      </div>
                    )}
                    {visibleTradesColumns.outcome && (
                      <div className="p-2 flex items-center justify-center" style={{flexBasis: '80px', flexGrow: 1}}>
                        {getOutcomeBadge(trade.outcome)}
                      </div>
                    )}
                    {visibleTradesColumns.price && (
                      <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                        {trade.price ? `$${trade.price.toFixed(4)}` : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.size && (
                      <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                        {trade.size ? `$${trade.size.toFixed(2)}` : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.shares && (
                      <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                        {trade.shares ? trade.shares.toFixed(2) : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.orderId && (
                      <div className="p-2 text-center font-mono text-xs overflow-hidden" style={{flexBasis: '200px', flexGrow: 1, flexShrink: 1}}>
                        {trade.order_id ? (
                          <div className="truncate" title={trade.order_id}>
                            {trade.order_id}
                          </div>
                        ) : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.pnl && (
                      <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                        {trade.pnl !== null ? (
                          <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </span>
                        ) : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.roi && (
                      <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '75px', flexGrow: 1}}>
                        {trade.pnl !== null && trade.size !== null && trade.size !== 0 ? (
                          <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {((trade.pnl / trade.size) * 100).toFixed(2)}%
                          </span>
                        ) : '-'}
                      </div>
                    )}
                    {visibleTradesColumns.result && (
                      <div className="p-2 text-center text-xs" style={{flexBasis: '80px', flexGrow: 1}}>
                        {trade.result || '-'}
                      </div>
                    )}
                    {visibleTradesColumns.metadata && (
                      <div className="p-2 text-xs" style={{flexBasis: '200px', flexGrow: 0, flexShrink: 0}}>
                        {trade.metadata ? (
                          <div>
                            <div>{formatMetadataInline(trade.metadata)}</div>
                            {trade.metadata.skip_reasons && trade.metadata.skip_reasons.length > 1 && (
                              <details className="cursor-pointer mt-1">
                                <summary className="text-primary hover:underline text-xs">
                                  Zobacz wszystkie
                                </summary>
                                <div className="-ml-[400px] mt-1 p-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm max-h-96 overflow-auto flex justify-end" style={{maxWidth: '520px'}}>
                                  {formatMetadataPopup(trade.metadata)}
                                </div>
                              </details>
                            )}
                          </div>
                        ) : '-'}
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'sessions' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full text-sm">
              {/* Header */}
              <div className="flex items-center border-b bg-muted/50">
                {visibleSessionsColumns.id && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>ID</div>
                )}
                {visibleSessionsColumns.marketId && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>Market ID</div>
                )}
                {visibleSessionsColumns.market && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>Market</div>
                )}
                {visibleSessionsColumns.seriesSlug && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>Series</div>
                )}
                {visibleSessionsColumns.bot && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>Bot</div>
                )}
                {visibleSessionsColumns.sessionStart && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Session Start</div>
                )}
                {visibleSessionsColumns.sessionEnd && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Session End</div>
                )}
                {visibleSessionsColumns.duration && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '100px', flexGrow: 0}}>Duration</div>
                )}
                {visibleSessionsColumns.marketStartTime && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Market Start</div>
                )}
                {visibleSessionsColumns.marketEndTime && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>Market End</div>
                )}
                {visibleSessionsColumns.totalEntries && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>Entries</div>
                )}
                {visibleSessionsColumns.totalExits && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>Exits</div>
                )}
                {visibleSessionsColumns.totalSkips && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>Skips</div>
                )}
                {visibleSessionsColumns.trades && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '100px', flexGrow: 0}}>Trades</div>
                )}
                {visibleSessionsColumns.totalPnl && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '80px', flexGrow: 0}}>P&L</div>
                )}
                {visibleSessionsColumns.initialYesPrice && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Init Yes</div>
                )}
                {visibleSessionsColumns.initialNoPrice && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Init No</div>
                )}
                {visibleSessionsColumns.initialSpread && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Init Spread</div>
                )}
                {visibleSessionsColumns.finalYesPrice && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Final Yes</div>
                )}
                {visibleSessionsColumns.finalNoPrice && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Final No</div>
                )}
                {visibleSessionsColumns.finalOutcome && (
                  <div className="p-2 text-center font-medium" style={{flexBasis: '90px', flexGrow: 0}}>Outcome</div>
                )}
                {visibleSessionsColumns.strategyConfig && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0}}>Strategy</div>
                )}
                {visibleSessionsColumns.metadata && (
                  <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0}}>Metadata</div>
                )}
              </div>

              {/* Body */}
              <div>
                {paginatedData.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Brak danych do wyświetlenia
                  </div>
                ) : (
                  (paginatedData as MarketSession[]).map((session) => {
                    const totalTrades = (session.total_entries || 0) + (session.total_exits || 0) + (session.total_skips || 0)
                    return (
                    <div key={session.id} className="flex items-center border-b hover:bg-muted/50 transition-colors">
                      {visibleSessionsColumns.id && (
                        <div className="p-2 text-center font-mono text-xs text-muted-foreground" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                          #{session.id}
                        </div>
                      )}
                      {visibleSessionsColumns.marketId && (
                        <div className="p-2 overflow-hidden" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
                          <div className="truncate text-xs font-mono" title={session.market_id}>
                            {session.market_id}
                          </div>
                        </div>
                      )}
                      {visibleSessionsColumns.market && (
                        <div className="p-2 overflow-hidden" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>
                          <div className="truncate font-medium text-xs" title={session.market_question || session.market_slug}>
                            {session.market_question || session.market_slug}
                          </div>
                          {session.series_slug && !visibleSessionsColumns.seriesSlug && (
                            <div className="text-xs text-muted-foreground/70 truncate" title={session.series_slug}>
                              Series: {session.series_slug}
                            </div>
                          )}
                        </div>
                      )}
                      {visibleSessionsColumns.seriesSlug && (
                        <div className="p-2 overflow-hidden" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>
                          <div className="truncate text-xs" title={session.series_slug || ''}>
                            {session.series_slug || '-'}
                          </div>
                        </div>
                      )}
                      {visibleSessionsColumns.bot && (
                        <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>
                          <div className="text-xs text-muted-foreground truncate" title={session.bot_instance}>
                            {session.bot_instance}
                          </div>
                        </div>
                      )}
                      {visibleSessionsColumns.sessionStart && (
                        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                          {format(new Date(session.session_start), 'HH:mm dd-MM-yyyy')}
                        </div>
                      )}
                      {visibleSessionsColumns.sessionEnd && (
                        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                          {session.session_end ? format(new Date(session.session_end), 'HH:mm dd-MM-yyyy') : 'Active'}
                        </div>
                      )}
                      {visibleSessionsColumns.duration && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '100px', flexGrow: 0}}>
                          {formatDuration(session.session_start, session.session_end)}
                        </div>
                      )}
                      {visibleSessionsColumns.marketStartTime && (
                        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                          {session.market_start_time ? format(new Date(session.market_start_time), 'HH:mm dd-MM-yyyy') : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.marketEndTime && (
                        <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                          {session.market_end_time ? format(new Date(session.market_end_time), 'HH:mm dd-MM-yyyy') : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.totalEntries && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
                          {session.total_entries || 0}
                        </div>
                      )}
                      {visibleSessionsColumns.totalExits && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
                          {session.total_exits || 0}
                        </div>
                      )}
                      {visibleSessionsColumns.totalSkips && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
                          {session.total_skips || 0}
                        </div>
                      )}
                      {visibleSessionsColumns.trades && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '100px', flexGrow: 0}}>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-semibold">{totalTrades}</span>
                            <span className="text-xs text-muted-foreground">
                              {session.total_entries || 0}E/{session.total_exits || 0}X/{session.total_skips || 0}SK
                            </span>
                          </div>
                        </div>
                      )}
                      {visibleSessionsColumns.totalPnl && (
                        <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
                          {session.total_pnl !== null ? (
                            <span className={session.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {session.total_pnl >= 0 ? '+' : ''}${session.total_pnl.toFixed(2)}
                            </span>
                          ) : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.initialYesPrice && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
                          {session.initial_yes_price ? `$${session.initial_yes_price.toFixed(4)}` : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.initialNoPrice && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
                          {session.initial_no_price ? `$${session.initial_no_price.toFixed(4)}` : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.initialSpread && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
                          {session.initial_spread ? session.initial_spread.toFixed(4) : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.finalYesPrice && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
                          {session.final_yes_price ? `$${session.final_yes_price.toFixed(4)}` : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.finalNoPrice && (
                        <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '90px', flexGrow: 0}}>
                          {session.final_no_price ? `$${session.final_no_price.toFixed(4)}` : '-'}
                        </div>
                      )}
                      {visibleSessionsColumns.finalOutcome && (
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
                      {visibleSessionsColumns.strategyConfig && (
                        <div className="p-2 text-xs" style={{flexBasis: '150px', flexGrow: 0}}>
                          {formatJSON(session.strategy_config)}
                        </div>
                      )}
                      {visibleSessionsColumns.metadata && (
                        <div className="p-2 text-xs" style={{flexBasis: '150px', flexGrow: 0}}>
                          {formatJSON(session.metadata)}
                        </div>
                      )}
                    </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'all' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full text-sm">
              {/* Header for combined view */}
              <div className="flex items-center border-b bg-muted/50 font-medium sticky top-0">
                <div className="p-2 text-center" style={{flexBasis: '40px', flexGrow: 0, flexShrink: 0}}></div>
                {visibleSessionsColumns.id && (
                  <div className="p-2 text-center" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>ID</div>
                )}
                {visibleSessionsColumns.market && (
                  <div className="p-2 text-left" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>Market</div>
                )}
                {visibleSessionsColumns.bot && (
                  <div className="p-2 text-left" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>Bot</div>
                )}
                {visibleSessionsColumns.sessionStart && (
                  <div className="p-2 text-center" style={{flexBasis: '140px', flexGrow: 0}}>Start</div>
                )}
                {visibleSessionsColumns.duration && (
                  <div className="p-2 text-center" style={{flexBasis: '100px', flexGrow: 0}}>Duration</div>
                )}
                {visibleSessionsColumns.trades && (
                  <div className="p-2 text-center" style={{flexBasis: '100px', flexGrow: 0}}>Trades</div>
                )}
                {visibleSessionsColumns.totalPnl && (
                  <div className="p-2 text-center" style={{flexBasis: '80px', flexGrow: 0}}>P&L</div>
                )}
                {visibleSessionsColumns.finalOutcome && (
                  <div className="p-2 text-center" style={{flexBasis: '90px', flexGrow: 0}}>Outcome</div>
                )}
              </div>

              {/* Body - expandable sessions */}
              <div>
                {paginatedData.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Brak danych do wyświetlenia
                  </div>
                ) : (
                  (paginatedData as MarketSession[]).map((session) => {
                    const isExpanded = expandedSessions.has(session.id)
                    const sessionTrades = getTradesForSession(session.id)
                    const totalTrades = (session.total_entries || 0) + (session.total_exits || 0) + (session.total_skips || 0)
                    
                    return (
                    <div key={session.id}>
                      {/* Session row */}
                      <div 
                        className="flex items-center border-b hover:bg-muted/50 transition-colors cursor-pointer bg-muted/10"
                        onClick={() => toggleExpandSession(session.id)}
                      >
                        <div className="p-2 text-center" style={{flexBasis: '40px', flexGrow: 0, flexShrink: 0}}>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {visibleSessionsColumns.id && (
                          <div className="p-2 text-center font-mono text-xs font-semibold" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                            #{session.id}
                          </div>
                        )}
                        {visibleSessionsColumns.market && (
                          <div className="p-2 overflow-hidden" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>
                            <div className="truncate font-medium text-xs" title={session.market_question || session.market_slug}>
                              {session.market_question || session.market_slug}
                            </div>
                          </div>
                        )}
                        {visibleSessionsColumns.bot && (
                          <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>
                            <div className="text-xs text-muted-foreground truncate" title={session.bot_instance}>
                              {session.bot_instance}
                            </div>
                          </div>
                        )}
                        {visibleSessionsColumns.sessionStart && (
                          <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                            {format(new Date(session.session_start), 'HH:mm dd-MM-yyyy')}
                          </div>
                        )}
                        {visibleSessionsColumns.duration && (
                          <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '100px', flexGrow: 0}}>
                            {formatDuration(session.session_start, session.session_end)}
                          </div>
                        )}
                        {visibleSessionsColumns.trades && (
                          <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '100px', flexGrow: 0}}>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-semibold">{totalTrades}</span>
                              <span className="text-xs text-muted-foreground">
                                {session.total_entries || 0}E/{session.total_exits || 0}X/{session.total_skips || 0}SK
                              </span>
                            </div>
                          </div>
                        )}
                        {visibleSessionsColumns.totalPnl && (
                          <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '80px', flexGrow: 0}}>
                            {session.total_pnl !== null ? (
                              <span className={session.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {session.total_pnl >= 0 ? '+' : ''}${session.total_pnl.toFixed(2)}
                              </span>
                            ) : '-'}
                          </div>
                        )}
                        {visibleSessionsColumns.finalOutcome && (
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
                      </div>

                      {/* Expanded trades */}
                      {isExpanded && sessionTrades.length > 0 && (
                        <div className="bg-muted/5">
                          {/* Trades header */}
                          <div className="flex items-center border-b bg-muted/30 text-xs font-medium">
                            <div style={{flexBasis: '40px', flexGrow: 0, flexShrink: 0}}></div>
                            {visibleTradesColumns.id && (
                              <div className="p-1.5 text-center" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>Trade ID</div>
                            )}
                            {visibleTradesColumns.botInstance && (
                              <div className="p-1.5 text-left" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>Bot Instance</div>
                            )}
                            {visibleTradesColumns.sessionId && (
                              <div className="p-1.5 text-center" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>Session</div>
                            )}
                            {visibleTradesColumns.timestamp && (
                              <div className="p-1.5 text-center" style={{flexBasis: '125px', flexGrow: 1}}>Time</div>
                            )}
                            {visibleTradesColumns.marketId && (
                              <div className="p-1.5 text-left" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>Market ID</div>
                            )}
                            {visibleTradesColumns.marketSlug && (
                              <div className="p-1.5 text-left" style={{flexBasis: '180px', flexGrow: 0, flexShrink: 1}}>Market Slug</div>
                            )}
                            {visibleTradesColumns.marketQuestion && (
                              <div className="p-1.5 text-left" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>Market Question</div>
                            )}
                            {visibleTradesColumns.marketEndTime && (
                              <div className="p-1.5 text-center" style={{flexBasis: '140px', flexGrow: 0}}>Market End</div>
                            )}
                            {visibleTradesColumns.seriesSlug && (
                              <div className="p-1.5 text-left" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>Series</div>
                            )}
                            {visibleTradesColumns.type && (
                              <div className="p-1.5 text-center" style={{flexBasis: '85px', flexGrow: 0, flexShrink: 0}}>Type</div>
                            )}
                            {visibleTradesColumns.outcome && (
                              <div className="p-1.5 text-center" style={{flexBasis: '80px', flexGrow: 1}}>Outcome</div>
                            )}
                            {visibleTradesColumns.price && (
                              <div className="p-1.5 text-center" style={{flexBasis: '70px', flexGrow: 1}}>Price</div>
                            )}
                            {visibleTradesColumns.size && (
                              <div className="p-1.5 text-center" style={{flexBasis: '70px', flexGrow: 1}}>Size</div>
                            )}
                            {visibleTradesColumns.shares && (
                              <div className="p-1.5 text-center" style={{flexBasis: '70px', flexGrow: 1}}>Shares</div>
                            )}
                            {visibleTradesColumns.orderId && (
                              <div className="p-1.5 text-center" style={{flexBasis: '200px', flexGrow: 1, flexShrink: 1}}>Order ID</div>
                            )}
                            {visibleTradesColumns.pnl && (
                              <div className="p-1.5 text-center" style={{flexBasis: '70px', flexGrow: 1}}>P&L</div>
                            )}
                            {visibleTradesColumns.roi && (
                              <div className="p-1.5 text-center" style={{flexBasis: '75px', flexGrow: 1}}>ROI %</div>
                            )}
                            {visibleTradesColumns.result && (
                              <div className="p-1.5 text-center" style={{flexBasis: '80px', flexGrow: 1}}>Result</div>
                            )}
                            {visibleTradesColumns.metadata && (
                              <div className="p-1.5 text-left" style={{flexBasis: '200px', flexGrow: 0, flexShrink: 0}}>Metadata</div>
                            )}
                          </div>

                          {/* Trades rows */}
                          {sessionTrades.map((trade) => (
                            <div key={trade.id} className="flex items-center border-b hover:bg-muted/20 transition-colors text-xs">
                              <div style={{flexBasis: '40px', flexGrow: 0, flexShrink: 0}}></div>
                              {visibleTradesColumns.id && (
                                <div className="p-1.5 text-center font-mono text-muted-foreground" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                                  #{trade.id}
                                </div>
                              )}
                              {visibleTradesColumns.botInstance && (
                                <div className="p-1.5 overflow-hidden" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>
                                  <div className="text-xs text-muted-foreground truncate" title={trade.bot_instance}>
                                    {trade.bot_instance}
                                  </div>
                                </div>
                              )}
                              {visibleTradesColumns.sessionId && (
                                <div className="p-1.5 text-center font-mono" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                                  {trade.session_id || '-'}
                                </div>
                              )}
                              {visibleTradesColumns.timestamp && (
                                <div className="p-1.5 text-center text-muted-foreground whitespace-nowrap" style={{flexBasis: '125px', flexGrow: 1}}>
                                  {format(new Date(trade.timestamp), 'HH:mm dd-MM-yyyy')}
                                </div>
                              )}
                              {visibleTradesColumns.marketId && (
                                <div className="p-1.5 overflow-hidden" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
                                  <div className="truncate font-mono" title={trade.market_id || ''}>
                                    {trade.market_id || '-'}
                                  </div>
                                </div>
                              )}
                              {visibleTradesColumns.marketSlug && (
                                <div className="p-1.5 overflow-hidden" style={{flexBasis: '180px', flexGrow: 0, flexShrink: 1}}>
                                  <div className="truncate" title={trade.market_slug}>
                                    {trade.market_slug}
                                  </div>
                                </div>
                              )}
                              {visibleTradesColumns.marketQuestion && (
                                <div className="p-1.5 overflow-hidden" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>
                                  <div className="truncate font-medium" title={trade.market_question || trade.market_slug}>
                                    {trade.market_question || trade.market_slug}
                                  </div>
                                </div>
                              )}
                              {visibleTradesColumns.marketEndTime && (
                                <div className="p-1.5 text-center text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                                  {trade.market_end_time ? format(new Date(trade.market_end_time), 'HH:mm dd-MM-yyyy') : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.seriesSlug && (
                                <div className="p-1.5 overflow-hidden" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>
                                  <div className="text-muted-foreground/70 truncate" title={trade.series_slug || ''}>
                                    {trade.series_slug || '-'}
                                  </div>
                                </div>
                              )}
                              {visibleTradesColumns.type && (
                                <div className="p-1.5 flex items-center justify-center" style={{flexBasis: '85px', flexGrow: 0, flexShrink: 0}}>
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getTypeColor(trade.type)}`}>
                                    {trade.type}
                                  </span>
                                </div>
                              )}
                              {visibleTradesColumns.outcome && (
                                <div className="p-1.5 flex items-center justify-center" style={{flexBasis: '80px', flexGrow: 1}}>
                                  {getOutcomeBadge(trade.outcome)}
                                </div>
                              )}
                              {visibleTradesColumns.price && (
                                <div className="p-1.5 text-center font-mono" style={{flexBasis: '70px', flexGrow: 1}}>
                                  {trade.price ? `$${trade.price.toFixed(4)}` : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.size && (
                                <div className="p-1.5 text-center font-mono" style={{flexBasis: '70px', flexGrow: 1}}>
                                  {trade.size ? `$${trade.size.toFixed(2)}` : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.shares && (
                                <div className="p-1.5 text-center font-mono" style={{flexBasis: '70px', flexGrow: 1}}>
                                  {trade.shares ? trade.shares.toFixed(2) : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.orderId && (
                                <div className="p-1.5 text-center font-mono overflow-hidden" style={{flexBasis: '200px', flexGrow: 1, flexShrink: 1}}>
                                  {trade.order_id ? (
                                    <div className="truncate" title={trade.order_id}>
                                      {trade.order_id}
                                    </div>
                                  ) : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.pnl && (
                                <div className="p-1.5 text-center font-mono font-semibold" style={{flexBasis: '70px', flexGrow: 1}}>
                                  {trade.pnl !== null ? (
                                    <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                    </span>
                                  ) : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.roi && (
                                <div className="p-1.5 text-center font-mono font-semibold" style={{flexBasis: '75px', flexGrow: 1}}>
                                  {trade.pnl !== null && trade.size !== null && trade.size !== 0 ? (
                                    <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {((trade.pnl / trade.size) * 100).toFixed(2)}%
                                    </span>
                                  ) : '-'}
                                </div>
                              )}
                              {visibleTradesColumns.result && (
                                <div className="p-1.5 text-center" style={{flexBasis: '80px', flexGrow: 1}}>
                                  {trade.result || '-'}
                                </div>
                              )}
                              {visibleTradesColumns.metadata && (
                                <div className="p-1.5" style={{flexBasis: '200px', flexGrow: 0, flexShrink: 0}}>
                                  {trade.metadata ? (
                                    <div>
                                      <div className="truncate">{formatMetadataInline(trade.metadata)}</div>
                                    </div>
                                  ) : '-'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {isExpanded && sessionTrades.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground bg-muted/5 border-b">
                          Brak trades dla tej sesji
                        </div>
                      )}
                    </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Strona {currentPage} z {totalPages} ({filteredData.length} wyników)
        </div>
        <div className="flex items-center gap-2">
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
    </div>
  )
}

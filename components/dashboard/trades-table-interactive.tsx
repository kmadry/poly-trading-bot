'use client'

import { Trade } from '@/types/database'
import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Filter, X, Columns3, RotateCcw } from 'lucide-react'

interface TradesTableInteractiveProps {
  trades: Trade[]
}

type SortField = 'id' | 'timestamp' | 'type' | 'price' | 'pnl' | 'roi' | 'session_id' | 'market' | 'outcome' | 'size' | 'shares' | 'result' | 'order_id' | 'bot_instance'
type SortDirection = 'asc' | 'desc'

const DEFAULT_VISIBLE_COLUMNS = {
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

export function TradesTableInteractive({ trades }: TradesTableInteractiveProps) {
  // Basic filters
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  
  // Advanced filters panel
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  
  // Column visibility - load from localStorage
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tradesVisibleColumns')
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
    localStorage.setItem('tradesVisibleColumns', JSON.stringify(visibleColumns))
  }, [visibleColumns])
  
  // Multiselect filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  const [selectedBots, setSelectedBots] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  
  // Range filters
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sizeRange, setSizeRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sharesRange, setSharesRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [timeRange, setTimeRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  
  // Session filter
  const [sessionFilter, setSessionFilter] = useState('')
  
  // Get unique values for multiselect
  const uniqueTypes = useMemo(() => Array.from(new Set(trades.map(t => t.type).filter(Boolean))) as string[], [trades])
  const uniqueOutcomes = useMemo(() => Array.from(new Set(trades.map(t => t.outcome).filter((v): v is string => v !== null && v !== undefined))), [trades])
  const uniqueBots = useMemo(() => Array.from(new Set(trades.map(t => t.bot_instance).filter(Boolean))) as string[], [trades])
  const uniqueResults = useMemo(() => Array.from(new Set(trades.map(t => t.result).filter((v): v is string => v !== null && v !== undefined))), [trades])

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
    
    if (reasons.length === 1) {
      const reason = reasons[0]
      const details = reason.details || {}
      const value = details.actual_price || details.actual_spread || 'N/A'
      const threshold = details.threshold || 'N/A'
      
      // Format readable type name
      const typeName = reason.type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
      
      return (
        <div className="text-xs">
          <div className="font-semibold text-yellow-700 dark:text-yellow-400">
            {typeName}
          </div>
          <div className="text-muted-foreground text-[10px] mt-0.5">
            Limit: {threshold} • Actual: {value}
          </div>
        </div>
      )
    }
    
    return (
      <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
        {reasons.length} reasons
      </span>
    )
  }

  const formatMetadataPopup = (metadata: any) => {
    if (!metadata?.skip_reasons) return null
    
    return (
      <table className="text-xs border-collapse">
        <tbody>
          {metadata.skip_reasons.map((reason: any, idx: number) => {
            // Handle both string and object reasons
            if (typeof reason === 'string') {
              return (
                <tr key={idx}>
                  <td className="px-1 text-muted-foreground text-center" style={{width: '40px', minWidth: '40px'}}>{idx + 1}</td>
                  <td className="px-2 font-medium text-yellow-700 dark:text-yellow-400" colSpan={3}>{reason}</td>
                </tr>
              )
            }
            
            const details = reason.details || {}
            const actualValue = details.actual_price || details.actual_spread || 'N/A'
            
            // Format readable type name
            const typeName = (reason.type || 'Unknown')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
            
            return (
              <tr key={idx}>
                <td className="px-1 text-muted-foreground text-center" style={{width: '40px', minWidth: '40px'}}>{idx + 1}</td>
                <td className="px-2 font-medium text-yellow-700 dark:text-yellow-400" style={{maxWidth: '400px', wordWrap: 'break-word', whiteSpace: 'normal'}}>{typeName}</td>
                <td className="px-2 text-center font-mono" style={{width: '40px', minWidth: '40px'}}>{details.threshold || 'N/A'}</td>
                <td className="px-2 text-center font-mono font-semibold text-red-600 dark:text-red-400" style={{width: '40px', minWidth: '40px'}}>{actualValue}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  // Filtrowanie
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesSearch = (
          trade.market_question?.toLowerCase().includes(term) ||
          trade.market_slug.toLowerCase().includes(term) ||
          trade.bot_instance.toLowerCase().includes(term) ||
          trade.id.toString().includes(term)
        )
        if (!matchesSearch) return false
      }
      
      // Session filter
      if (sessionFilter && trade.session_id?.toString() !== sessionFilter) return false
      
      // Multiselect filters
      if (selectedTypes.length > 0 && !selectedTypes.includes(trade.type)) return false
      if (selectedOutcomes.length > 0 && trade.outcome && !selectedOutcomes.includes(trade.outcome)) return false
      if (selectedBots.length > 0 && !selectedBots.includes(trade.bot_instance)) return false
      if (selectedResults.length > 0 && trade.result && !selectedResults.includes(trade.result)) return false
      
      // Range filters - Price
      if (priceRange.min && trade.price !== null && trade.price < parseFloat(priceRange.min)) return false
      if (priceRange.max && trade.price !== null && trade.price > parseFloat(priceRange.max)) return false
      
      // Range filters - Size
      if (sizeRange.min && trade.size !== null && trade.size < parseFloat(sizeRange.min)) return false
      if (sizeRange.max && trade.size !== null && trade.size > parseFloat(sizeRange.max)) return false
      
      // Range filters - Shares
      if (sharesRange.min && trade.shares !== null && trade.shares < parseFloat(sharesRange.min)) return false
      if (sharesRange.max && trade.shares !== null && trade.shares > parseFloat(sharesRange.max)) return false
      
      // Range filters - Time
      if (timeRange.from && new Date(trade.timestamp) < new Date(timeRange.from)) return false
      if (timeRange.to && new Date(trade.timestamp) > new Date(timeRange.to)) return false
      
      return true
    })
  }, [trades, searchTerm, sessionFilter, selectedTypes, selectedOutcomes, selectedBots, selectedResults, priceRange, sizeRange, sharesRange, timeRange])

  // Sortowanie
  const sortedTrades = useMemo(() => {
    const sorted = [...filteredTrades]
    
    sorted.sort((a, b) => {
      let aVal: any
      let bVal: any
      
      // Handle special fields
      if (sortField === 'timestamp') {
        aVal = new Date(a.timestamp).getTime()
        bVal = new Date(b.timestamp).getTime()
      } else if (sortField === 'market') {
        aVal = a.market_question || a.market_slug
        bVal = b.market_question || b.market_slug
      } else if (sortField === 'bot_instance') {
        aVal = a.bot_instance
        bVal = b.bot_instance
      } else if (sortField === 'order_id') {
        aVal = a.order_id
        bVal = b.order_id
      } else if (sortField === 'session_id') {
        aVal = a.session_id
        bVal = b.session_id
      } else if (sortField === 'roi') {
        aVal = (a.pnl !== null && a.size !== null && a.size !== 0) ? (a.pnl / a.size) * 100 : null
        bVal = (b.pnl !== null && b.size !== null && b.size !== 0) ? (b.pnl / b.size) * 100 : null
      } else {
        aVal = a[sortField]
        bVal = b[sortField]
      }
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (sortDirection === 'asc') {
          return aVal.localeCompare(bVal)
        } else {
          return bVal.localeCompare(aVal)
        }
      }
      
      // Numeric comparison
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return sorted
  }, [filteredTrades, sortField, sortDirection])

  // Paginacja
  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage)
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedTrades.slice(start, start + itemsPerPage)
  }, [sortedTrades, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
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
    setSelectedTypes([])
    setSelectedOutcomes([])
    setSelectedBots([])
    setSelectedResults([])
    setPriceRange({ min: '', max: '' })
    setSizeRange({ min: '', max: '' })
    setSharesRange({ min: '', max: '' })
    setTimeRange({ from: '', to: '' })
    setSessionFilter('')
    setSearchTerm('')
    setCurrentPage(1)
  }
  
  const hasActiveFilters = selectedTypes.length > 0 || selectedOutcomes.length > 0 || selectedBots.length > 0 || 
    selectedResults.length > 0 || sessionFilter || priceRange.min || priceRange.max || 
    sizeRange.min || sizeRange.max || sharesRange.min || sharesRange.max || 
    timeRange.from || timeRange.to
  
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
            {[selectedTypes.length, selectedOutcomes.length, selectedBots.length, selectedResults.length].reduce((a, b) => a + b)}
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
          Wyniki: {filteredTrades.length} / {trades.length}
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
              <Checkbox id="col-botInstance" checked={visibleColumns.botInstance} onCheckedChange={() => toggleColumn('botInstance')} />
              <label htmlFor="col-botInstance" className="text-sm cursor-pointer">Bot Instance</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-sessionId" checked={visibleColumns.sessionId} onCheckedChange={() => toggleColumn('sessionId')} />
              <label htmlFor="col-sessionId" className="text-sm cursor-pointer">Session ID</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-timestamp" checked={visibleColumns.timestamp} onCheckedChange={() => toggleColumn('timestamp')} />
              <label htmlFor="col-timestamp" className="text-sm cursor-pointer">Timestamp</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketId" checked={visibleColumns.marketId} onCheckedChange={() => toggleColumn('marketId')} />
              <label htmlFor="col-marketId" className="text-sm cursor-pointer">Market ID</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketSlug" checked={visibleColumns.marketSlug} onCheckedChange={() => toggleColumn('marketSlug')} />
              <label htmlFor="col-marketSlug" className="text-sm cursor-pointer">Market Slug</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketQuestion" checked={visibleColumns.marketQuestion} onCheckedChange={() => toggleColumn('marketQuestion')} />
              <label htmlFor="col-marketQuestion" className="text-sm cursor-pointer">Market Question</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-marketEndTime" checked={visibleColumns.marketEndTime} onCheckedChange={() => toggleColumn('marketEndTime')} />
              <label htmlFor="col-marketEndTime" className="text-sm cursor-pointer">Market End Time</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-seriesSlug" checked={visibleColumns.seriesSlug} onCheckedChange={() => toggleColumn('seriesSlug')} />
              <label htmlFor="col-seriesSlug" className="text-sm cursor-pointer">Series Slug</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-type" checked={visibleColumns.type} onCheckedChange={() => toggleColumn('type')} />
              <label htmlFor="col-type" className="text-sm cursor-pointer">Type</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-outcome" checked={visibleColumns.outcome} onCheckedChange={() => toggleColumn('outcome')} />
              <label htmlFor="col-outcome" className="text-sm cursor-pointer">Outcome</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-price" checked={visibleColumns.price} onCheckedChange={() => toggleColumn('price')} />
              <label htmlFor="col-price" className="text-sm cursor-pointer">Price</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-size" checked={visibleColumns.size} onCheckedChange={() => toggleColumn('size')} />
              <label htmlFor="col-size" className="text-sm cursor-pointer">Size</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-shares" checked={visibleColumns.shares} onCheckedChange={() => toggleColumn('shares')} />
              <label htmlFor="col-shares" className="text-sm cursor-pointer">Shares</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-orderId" checked={visibleColumns.orderId} onCheckedChange={() => toggleColumn('orderId')} />
              <label htmlFor="col-orderId" className="text-sm cursor-pointer">Order ID</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-pnl" checked={visibleColumns.pnl} onCheckedChange={() => toggleColumn('pnl')} />
              <label htmlFor="col-pnl" className="text-sm cursor-pointer">P&L</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-roi" checked={visibleColumns.roi} onCheckedChange={() => toggleColumn('roi')} />
              <label htmlFor="col-roi" className="text-sm cursor-pointer">ROI %</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="col-result" checked={visibleColumns.result} onCheckedChange={() => toggleColumn('result')} />
              <label htmlFor="col-result" className="text-sm cursor-pointer">Result</label>
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
            {/* Session Input */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Session ID</Label>
              <Input
                type="number"
                placeholder="np. 123"
                value={sessionFilter}
                onChange={(e) => {
                  setSessionFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 text-xs"
              />
            </div>
            
            {/* Type Multiselect */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Type</Label>
              <div className="space-y-1">
                {uniqueTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                    />
                    <label htmlFor={`type-${type}`} className="text-xs cursor-pointer">
                      {type} ({trades.filter(t => t.type === type).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Outcome Multiselect */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Outcome</Label>
              <div className="space-y-1">
                {uniqueOutcomes.map(outcome => (
                  <div key={outcome} className="flex items-center space-x-2">
                    <Checkbox
                      id={`outcome-${outcome}`}
                      checked={selectedOutcomes.includes(outcome)}
                      onCheckedChange={() => toggleFilter(outcome, selectedOutcomes, setSelectedOutcomes)}
                    />
                    <label htmlFor={`outcome-${outcome}`} className="text-xs cursor-pointer">
                      {outcome} ({trades.filter(t => t.outcome === outcome).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bot Multiselect */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Bot Instance</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {uniqueBots.map(bot => (
                  <div key={bot} className="flex items-center space-x-2">
                    <Checkbox
                      id={`bot-${bot}`}
                      checked={selectedBots.includes(bot)}
                      onCheckedChange={() => toggleFilter(bot, selectedBots, setSelectedBots)}
                    />
                    <label htmlFor={`bot-${bot}`} className="text-xs cursor-pointer truncate">
                      {bot} ({trades.filter(t => t.bot_instance === bot).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Result Multiselect */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Result</Label>
              <div className="space-y-1">
                {uniqueResults.map(result => (
                  <div key={result} className="flex items-center space-x-2">
                    <Checkbox
                      id={`result-${result}`}
                      checked={selectedResults.includes(result)}
                      onCheckedChange={() => toggleFilter(result, selectedResults, setSelectedResults)}
                    />
                    <label htmlFor={`result-${result}`} className="text-xs cursor-pointer">
                      {result} ({trades.filter(t => t.result === result).length})
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
            
            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => {
                    setPriceRange(prev => ({ ...prev, min: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => {
                    setPriceRange(prev => ({ ...prev, max: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Size Range */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Size Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={sizeRange.min}
                  onChange={(e) => {
                    setSizeRange(prev => ({ ...prev, min: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={sizeRange.max}
                  onChange={(e) => {
                    setSizeRange(prev => ({ ...prev, max: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Shares Range */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Shares Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={sharesRange.min}
                  onChange={(e) => {
                    setSharesRange(prev => ({ ...prev, min: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={sharesRange.max}
                  onChange={(e) => {
                    setSharesRange(prev => ({ ...prev, max: e.target.value }))
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
            {visibleColumns.id && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}} onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1 justify-center">
                  ID {sortField === 'id' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.botInstance && (
              <div className="p-2 text-left font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}} onClick={() => handleSort('bot_instance')}>
                <div className="flex items-center gap-1">
                  Bot Instance {sortField === 'bot_instance' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.sessionId && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}} onClick={() => handleSort('session_id')}>
                <div className="flex items-center gap-1 justify-center">
                  Session {sortField === 'session_id' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.timestamp && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '125px', flexGrow: 1}} onClick={() => handleSort('timestamp')}>
                <div className="flex items-center gap-1 justify-center">
                  Timestamp {sortField === 'timestamp' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.marketId && (
              <div className="p-2 text-left font-medium" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
                Market ID
              </div>
            )}
            {visibleColumns.marketSlug && (
              <div className="p-2 text-left font-medium" style={{flexBasis: '180px', flexGrow: 0, flexShrink: 1}}>
                Market Slug
              </div>
            )}
            {visibleColumns.marketQuestion && (
              <div className="p-2 text-left font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}} onClick={() => handleSort('market')}>
                <div className="flex items-center gap-1">
                  Market Question {sortField === 'market' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.marketEndTime && (
              <div className="p-2 text-center font-medium" style={{flexBasis: '140px', flexGrow: 0}}>
                Market End
              </div>
            )}
            {visibleColumns.seriesSlug && (
              <div className="p-2 text-left font-medium" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>
                Series
              </div>
            )}
            {visibleColumns.type && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '85px', flexGrow: 0, flexShrink: 0}} onClick={() => handleSort('type')}>
                <div className="flex items-center gap-1 justify-center">
                  Type {sortField === 'type' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.outcome && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '80px', flexGrow: 1}} onClick={() => handleSort('outcome')}>
                <div className="flex items-center gap-1 justify-center">
                  Outcome {sortField === 'outcome' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.price && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 1}} onClick={() => handleSort('price')}>
                <div className="flex items-center gap-1 justify-center">
                  Price {sortField === 'price' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.size && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 1}} onClick={() => handleSort('size')}>
                <div className="flex items-center gap-1 justify-center">
                  Size {sortField === 'size' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.shares && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 1}} onClick={() => handleSort('shares')}>
                <div className="flex items-center gap-1 justify-center">
                  Shares {sortField === 'shares' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.orderId && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '200px', flexGrow: 1, flexShrink: 1}} onClick={() => handleSort('order_id')}>
                <div className="flex items-center gap-1 justify-center">
                  Order ID {sortField === 'order_id' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.pnl && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '70px', flexGrow: 1}} onClick={() => handleSort('pnl')}>
                <div className="flex items-center gap-1 justify-center">
                  P&L {sortField === 'pnl' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.roi && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '75px', flexGrow: 1}} onClick={() => handleSort('roi')}>
                <div className="flex items-center gap-1 justify-center">
                  ROI % {sortField === 'roi' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.result && (
              <div className="p-2 text-center font-medium cursor-pointer hover:bg-muted" style={{flexBasis: '80px', flexGrow: 1}} onClick={() => handleSort('result')}>
                <div className="flex items-center gap-1 justify-center">
                  Result {sortField === 'result' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </div>
            )}
            {visibleColumns.metadata && (
              <div className="p-2 text-left font-medium" style={{flexBasis: '200px', flexGrow: 0, flexShrink: 0}}>Metadata</div>
            )}
          </div>
          
          {/* Body */}
          <div>
            {paginatedTrades.map((trade) => (
              <div key={trade.id} className="flex items-center border-b hover:bg-muted/50 transition-colors">
                {visibleColumns.id && (
                  <div className="p-2 text-center font-mono text-xs text-muted-foreground" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                    #{trade.id}
                  </div>
                )}
                {visibleColumns.botInstance && (
                  <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 1, flexShrink: 1}}>
                    <div className="text-xs text-muted-foreground truncate" title={trade.bot_instance}>
                      {trade.bot_instance}
                    </div>
                  </div>
                )}
                {visibleColumns.sessionId && (
                  <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 0, flexShrink: 0}}>
                    {trade.session_id || '-'}
                  </div>
                )}
                {visibleColumns.timestamp && (
                  <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '125px', flexGrow: 1}}>
                    {format(new Date(trade.timestamp), 'HH:mm dd-MM-yyyy')}
                  </div>
                )}
                {visibleColumns.marketId && (
                  <div className="p-2 overflow-hidden" style={{flexBasis: '120px', flexGrow: 0, flexShrink: 1}}>
                    <div className="truncate text-xs font-mono" title={trade.market_id || ''}>
                      {trade.market_id || '-'}
                    </div>
                  </div>
                )}
                {visibleColumns.marketSlug && (
                  <div className="p-2 overflow-hidden" style={{flexBasis: '180px', flexGrow: 0, flexShrink: 1}}>
                    <div className="truncate text-xs" title={trade.market_slug}>
                      {trade.market_slug}
                    </div>
                  </div>
                )}
                {visibleColumns.marketQuestion && (
                  <div className="p-2 overflow-hidden" style={{flexBasis: '250px', flexGrow: 1, flexShrink: 1}}>
                    <div className="truncate font-medium text-xs" title={trade.market_question || trade.market_slug}>
                      {trade.market_question || trade.market_slug}
                    </div>
                  </div>
                )}
                {visibleColumns.marketEndTime && (
                  <div className="p-2 text-center text-xs text-muted-foreground whitespace-nowrap" style={{flexBasis: '140px', flexGrow: 0}}>
                    {trade.market_end_time ? format(new Date(trade.market_end_time), 'HH:mm dd-MM-yyyy') : '-'}
                  </div>
                )}
                {visibleColumns.seriesSlug && (
                  <div className="p-2 overflow-hidden" style={{flexBasis: '150px', flexGrow: 0, flexShrink: 1}}>
                    <div className="text-xs text-muted-foreground/70 truncate" title={trade.series_slug || ''}>
                      {trade.series_slug || '-'}
                    </div>
                  </div>
                )}
                {visibleColumns.type && (
                  <div className="p-2 flex items-center justify-center" style={{flexBasis: '85px', flexGrow: 0, flexShrink: 0}}>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getTypeColor(trade.type)}`}>
                      {trade.type}
                    </span>
                  </div>
                )}
                {visibleColumns.outcome && (
                  <div className="p-2 flex items-center justify-center" style={{flexBasis: '80px', flexGrow: 1}}>
                    {getOutcomeBadge(trade.outcome)}
                  </div>
                )}
                {visibleColumns.price && (
                  <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                    {trade.price ? `$${trade.price.toFixed(4)}` : '-'}
                  </div>
                )}
                {visibleColumns.size && (
                  <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                    {trade.size ? `$${trade.size.toFixed(2)}` : '-'}
                  </div>
                )}
                {visibleColumns.shares && (
                  <div className="p-2 text-center font-mono text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                    {trade.shares ? trade.shares.toFixed(2) : '-'}
                  </div>
                )}
                {visibleColumns.orderId && (
                  <div className="p-2 text-center font-mono text-xs overflow-hidden" style={{flexBasis: '200px', flexGrow: 1, flexShrink: 1}}>
                    {trade.order_id ? (
                      <div className="truncate" title={trade.order_id}>
                        {trade.order_id}
                      </div>
                    ) : '-'}
                  </div>
                )}
                {visibleColumns.pnl && (
                  <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '70px', flexGrow: 1}}>
                    {trade.pnl !== null ? (
                      <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    ) : '-'}
                  </div>
                )}
                {visibleColumns.roi && (
                  <div className="p-2 text-center font-mono font-semibold text-xs" style={{flexBasis: '75px', flexGrow: 1}}>
                    {trade.pnl !== null && trade.size !== null && trade.size !== 0 ? (
                      <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {((trade.pnl / trade.size) * 100).toFixed(2)}%
                      </span>
                    ) : '-'}
                  </div>
                )}
                {visibleColumns.result && (
                  <div className="p-2 text-center text-xs" style={{flexBasis: '80px', flexGrow: 1}}>
                    {trade.result || '-'}
                  </div>
                )}
                {visibleColumns.metadata && (
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
            ))}
          </div>
        </div>
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Strona {currentPage} z {totalPages} (pokazuje {paginatedTrades.length} z {sortedTrades.length})
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

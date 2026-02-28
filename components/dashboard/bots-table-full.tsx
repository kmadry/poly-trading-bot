'use client'

import React from 'react'
import { BotData } from '@/types/bots'
import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, ArrowUpDown, Columns3, RotateCcw, Copy } from 'lucide-react'
import { AddBotDialog } from './add-bot-form'

interface BotsTableProps {
  bots: BotData[]
}

type SortField = keyof BotData
type SortDirection = 'asc' | 'desc'

// Sekcje kolumn - stonowane, profesjonalne kolory
const COLUMN_SECTIONS = {
  info: {
    label: 'INFO',
    color: 'bg-slate-50 dark:bg-slate-900/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    columns: ['bot', 'status', 'owner', 'mode'] as const
  },
  wyniki: {
    label: 'WYNIKI',
    color: 'bg-emerald-50/30 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    columns: [
      'averageRate', 'positionsOnTime', 'transactions', 'missing', 
      'noReversalMomentum', 'lost', 'won', 'wonPerTransactions', 
      'wonPerPositions', 'edge', 'balance'
    ] as const
  },
  roi: {
    label: 'ROI',
    color: 'bg-blue-50/30 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    columns: [
      'averageEntry', 'profitPerPosition', 'profitPerDay', 
      'roiPerDay', 'profitPerMonth', 'roiPerMonth'
    ] as const
  },
  konfiguracja: {
    label: 'KONFIGURACJA',
    color: 'bg-violet-50/30 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    columns: [
      'botInstance', 'dryRun', 'crypto', 'interval', 'strategyName', 
      'orderSize', 'strategyMode', 'buyOpposite', 'exitPrice', 
      'exitBeforeCloseSec', 'momentumThreshold', 'entryThreshold', 
      'maxReversalEntryPrice', 'momentumConfirmationSec', 
      'momentumConfirmationTolerance', 'momentumConfirmationMethod', 
      'velocityMinTicks', 'velocityMinIncrease', 'maxSpread', 
      'warmupDelaySec', 'minTimeRemaining', 'maxReentries', 
      'stopLoss', 'aggressiveExitUnderbid', 'exitMaxRetries', 
      'exitPriceDecrement', 'config', 'serverIp'
    ] as const
  }
}

const DEFAULT_VISIBLE_COLUMNS = {
  // INFO
  bot: true,
  status: true,
  owner: true,
  mode: true,
  
  // WYNIKI
  averageRate: true,
  positionsOnTime: true,
  transactions: true,
  missing: false,
  noReversalMomentum: false,
  lost: true,
  won: true,
  wonPerTransactions: true,
  wonPerPositions: false,
  edge: true,
  balance: true,
  
  // ROI
  averageEntry: false,
  profitPerPosition: true,
  profitPerDay: true,
  roiPerDay: true,
  profitPerMonth: false,
  roiPerMonth: false,
  
  // KONFIGURACJA
  botInstance: true,
  dryRun: false,
  crypto: true,
  interval: true,
  strategyName: true,
  orderSize: true,
  strategyMode: false,
  buyOpposite: false,
  exitPrice: false,
  exitBeforeCloseSec: false,
  momentumThreshold: true,
  entryThreshold: false,
  maxReversalEntryPrice: false,
  momentumConfirmationSec: false,
  momentumConfirmationTolerance: false,
  momentumConfirmationMethod: false,
  velocityMinTicks: false,
  velocityMinIncrease: false,
  maxSpread: false,
  warmupDelaySec: false,
  minTimeRemaining: false,
  maxReentries: false,
  stopLoss: false,
  aggressiveExitUnderbid: false,
  exitMaxRetries: false,
  exitPriceDecrement: false,
  config: false,
  serverIp: true,
}

const COLUMN_LABELS: Record<keyof typeof DEFAULT_VISIBLE_COLUMNS, string> = {
  // INFO
  bot: 'Bot #',
  status: 'Status',
  owner: 'Nazwa/Owner',
  mode: 'Tryb',
  
  // WYNIKI
  averageRate: 'Średni kurs',
  positionsOnTime: 'Pozycje na czas',
  transactions: 'Transakcje',
  missing: 'Brakuje',
  noReversalMomentum: 'No reversal momentum',
  lost: 'Przegrane',
  won: 'Wygrane',
  wonPerTransactions: 'Wygrane/Transakcje',
  wonPerPositions: 'Wygrane/Pozycje',
  edge: 'Edge',
  balance: 'Bilans',
  averageEntry: 'Średnie Entry',
  profitPerPosition: 'Zysk/Pozycja',
  profitPerDay: 'Zysk/Dzień',
  roiPerDay: 'ROI/Dzień',
  profitPerMonth: 'Zysk/Miesiąc',
  roiPerMonth: 'ROI/Miesiąc',
  
  // KONFIGURACJA
  botInstance: 'BOT_INSTANCE',
  dryRun: 'DRY_RUN',
  crypto: 'Crypto',
  interval: 'Interwał',
  strategyName: 'Nazwa strategii',
  orderSize: 'ORDER_SIZE',
  strategyMode: 'STRATEGY_MODE',
  buyOpposite: 'BUY_OPPOSITE',
  exitPrice: 'EXIT_PRICE',
  exitBeforeCloseSec: 'EXIT_BEFORE_CLOSE_SEC',
  momentumThreshold: 'MOMENTUM_THRESHOLD',
  entryThreshold: 'ENTRY_THRESHOLD',
  maxReversalEntryPrice: 'MAX_REVERSAL_ENTRY_PRICE',
  momentumConfirmationSec: 'MOMENTUM_CONFIRMATION_SEC',
  momentumConfirmationTolerance: 'MOMENTUM_CONFIRMATION_TOLERANCE',
  momentumConfirmationMethod: 'MOMENTUM_CONFIRMATION_METHOD',
  velocityMinTicks: 'VELOCITY_MIN_TICKS',
  velocityMinIncrease: 'VELOCITY_MIN_INCREASE',
  maxSpread: 'MAX_SPREAD',
  warmupDelaySec: 'WARMUP_DELAY_SEC',
  minTimeRemaining: 'MIN_TIME_REMAINING',
  maxReentries: 'MAX_REENTRIES',
  stopLoss: 'STOP_LOSS',
  aggressiveExitUnderbid: 'AGGRESSIVE_EXIT_UNDERBID',
  exitMaxRetries: 'EXIT_MAX_RETRIES',
  exitPriceDecrement: 'EXIT_PRICE_DECREMENT',
  config: 'CONFIG',
  serverIp: 'SERVER_IP',
}

export function BotsTableFull({ bots }: BotsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('bot')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedOwner, setSelectedOwner] = useState<string[]>([])
  const itemsPerPage = 50
  
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  
  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('botsVisibleColumns')
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
    localStorage.setItem('botsVisibleColumns', JSON.stringify(visibleColumns))
  }, [visibleColumns])
  
  const uniqueStatuses = Array.from(new Set(bots.map(b => b.status)))
  const uniqueOwners = Array.from(new Set(bots.map(b => b.owner)))

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
      [key]: key === 'bot' // tylko Bot # zostaje true
    }), {} as typeof visibleColumns)
    setVisibleColumns(allFalse)
  }
  
  const restoreDefaultColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)
  }
  
  // Funkcja pomocnicza do określenia sekcji kolumny
  const getColumnSection = (column: keyof typeof visibleColumns) => {
    for (const [sectionKey, section] of Object.entries(COLUMN_SECTIONS)) {
      if ((section.columns as readonly string[]).includes(column)) {
        return { key: sectionKey, ...section }
      }
    }
    return null
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
    setSelectedStatus([])
    setSelectedOwner([])
    setSearchTerm('')
    setCurrentPage(1)
  }

  const hasActiveFilters = selectedStatus.length > 0 || selectedOwner.length > 0

  // Filtrowanie
  const filteredBots = useMemo(() => {
    return bots.filter(bot => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesSearch = (
          bot.botInstance.toLowerCase().includes(term) ||
          bot.owner.toLowerCase().includes(term) ||
          bot.strategyName.toLowerCase().includes(term) ||
          bot.crypto.toLowerCase().includes(term) ||
          bot.bot.toString().includes(term)
        )
        if (!matchesSearch) return false
      }
      
      if (selectedStatus.length > 0 && !selectedStatus.includes(bot.status)) return false
      if (selectedOwner.length > 0 && !selectedOwner.includes(bot.owner)) return false
      
      return true
    })
  }, [bots, searchTerm, selectedStatus, selectedOwner])

  // Sortowanie
  const sortedBots = useMemo(() => {
    const sorted = [...filteredBots]
    
    sorted.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return sorted
  }, [filteredBots, sortField, sortDirection])

  // Paginacja
  const totalPages = Math.ceil(sortedBots.length / itemsPerPage)
  const paginatedBots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedBots.slice(start, start + itemsPerPage)
  }, [sortedBots, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      'LIVE': 'default',
      'END': 'destructive',
      'WAITING': 'secondary'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  const formatNumber = (num: number | string, decimals: number = 2) => {
    if (typeof num === 'string') return num
    if (isNaN(num)) return '-'
    return num.toFixed(decimals)
  }

  const formatPercent = (num: number) => {
    if (isNaN(num)) return '-'
    return `${(num * 100).toFixed(1)}%`
  }

  const formatCurrency = (num: number) => {
    if (isNaN(num)) return '$0.00'
    return `$${num.toFixed(2)}`
  }

  const renderCell = (bot: BotData, field: keyof BotData) => {
    const value = bot[field]
    
    switch (field) {
      case 'bot':
        return <span className="font-bold text-base tabular-nums">#{value}</span>
      case 'status':
        return getStatusBadge(value as string)
      case 'averageRate':
      case 'momentumThreshold':
      case 'entryThreshold':
      case 'exitPrice':
      case 'momentumConfirmationTolerance':
      case 'velocityMinIncrease':
      case 'maxSpread':
      case 'aggressiveExitUnderbid':
      case 'exitPriceDecrement':
        return formatNumber(value as number, 3)
      case 'wonPerTransactions':
      case 'wonPerPositions':
      case 'edge':
      case 'roiPerDay':
      case 'roiPerMonth':
        return formatPercent(value as number)
      case 'balance':
      case 'profitPerPosition':
      case 'profitPerDay':
      case 'profitPerMonth':
      case 'averageEntry':
        const num = value as number
        return <span className={num >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
          {formatCurrency(num)}
        </span>
      case 'positionsOnTime':
      case 'transactions':
      case 'missing':
      case 'noReversalMomentum':
      case 'lost':
      case 'won':
      case 'orderSize':
      case 'velocityMinTicks':
      case 'warmupDelaySec':
      case 'minTimeRemaining':
      case 'maxReentries':
      case 'momentumConfirmationSec':
      case 'exitBeforeCloseSec':
      case 'exitMaxRetries':
        return (value as number).toLocaleString()
      case 'dryRun':
        return <Badge variant={value ? 'outline' : 'default'}>{value ? 'DRY' : 'LIVE'}</Badge>
      case 'botInstance':
      case 'serverIp':
        return <span className="font-mono text-xs text-muted-foreground">{value as string}</span>
      default:
        return value?.toString() || '-'
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
            {selectedStatus.length + selectedOwner.length}
          </span>}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowColumns(!showColumns)}
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Kolumny ({Object.values(visibleColumns).filter(Boolean).length}/{Object.keys(visibleColumns).length})
        </Button>
        
        <Input
          placeholder="Szukaj (bot, owner, strategy, crypto)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-xs h-9"
        />

        <div className="ml-auto text-sm text-muted-foreground">
          Wyniki: {filteredBots.length} / {bots.length}
        </div>
      </div>

      {/* Panel kolumn */}
      {showColumns && (
        <div className="border rounded-lg p-4 bg-card shadow-sm">
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
          
          <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {Object.entries(COLUMN_SECTIONS).map(([sectionKey, section]) => (
              <div key={sectionKey} className={`rounded-lg p-3 ${section.color}`}>
                <h4 className="font-semibold text-sm mb-3 tracking-wide">
                  {section.label}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.columns.map((col) => {
                    if (col === 'bot') {
                      return (
                        <div key={col} className="flex items-center space-x-2 opacity-50">
                          <Checkbox 
                            id={`col-${col}`} 
                            checked={true} 
                            disabled={true}
                          />
                          <label 
                            htmlFor={`col-${col}`} 
                            className="text-sm cursor-not-allowed"
                          >
                            {COLUMN_LABELS[col]} (przypięty)
                          </label>
                        </div>
                      )
                    }
                    return (
                      <div key={col} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`col-${col}`} 
                          checked={visibleColumns[col]} 
                          onCheckedChange={() => toggleColumn(col)}
                        />
                        <label 
                          htmlFor={`col-${col}`} 
                          className="text-sm cursor-pointer hover:text-foreground transition-colors"
                        >
                          {COLUMN_LABELS[col]}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel filtrów */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-card shadow-sm">
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
              <div className="space-y-1 border rounded-lg p-3 bg-muted/30">
                {uniqueStatuses.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatus.includes(status)}
                      onCheckedChange={() => toggleFilter(status, selectedStatus, setSelectedStatus)}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm cursor-pointer hover:text-foreground transition-colors">
                      {status} <span className="text-muted-foreground">({bots.filter(b => b.status === status).length})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner</label>
              <div className="space-y-1 max-h-32 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                {uniqueOwners.map(owner => (
                  <div key={owner} className="flex items-center space-x-2">
                    <Checkbox
                      id={`owner-${owner}`}
                      checked={selectedOwner.includes(owner)}
                      onCheckedChange={() => toggleFilter(owner, selectedOwner, setSelectedOwner)}
                    />
                    <label htmlFor={`owner-${owner}`} className="text-sm cursor-pointer hover:text-foreground transition-colors">
                      {owner} <span className="text-muted-foreground">({bots.filter(b => b.owner === owner).length})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-20">
            {/* Nagłówki sekcji */}
            <tr className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              {Object.entries(COLUMN_SECTIONS).map(([sectionKey, section]) => {
                const visibleColsInSection = section.columns.filter(col => visibleColumns[col as keyof typeof visibleColumns])
                if (visibleColsInSection.length === 0) return null
                
                // Bot ID ma fixed position więc nie jest w colspan
                const isStickySection = sectionKey === 'info'
                const colSpanCount = isStickySection && visibleColumns.bot ? visibleColsInSection.length - 1 : visibleColsInSection.length
                
                if (isStickySection && visibleColumns.bot) {
                  return (
                    <React.Fragment key={sectionKey}>
                      <th 
                        className="sticky left-0 z-30 p-3 text-center font-semibold text-xs tracking-wide border-r bg-background/95 backdrop-blur border-b"
                        style={{ minWidth: '70px' }}
                      >
                        ID
                      </th>
                      <th 
                        className="sticky z-30 p-3 text-center font-semibold text-xs tracking-wide border-r bg-background/95 backdrop-blur border-b"
                        style={{ left: '70px', minWidth: '80px' }}
                      >
                        KOPIUJ
                      </th>
                      {colSpanCount > 0 && (
                        <th 
                          colSpan={colSpanCount}
                          className={`p-3 text-center font-semibold text-xs tracking-wide border-r ${section.color}`}
                        >
                          {section.label}
                        </th>
                      )}
                    </React.Fragment>
                  )
                }
                
                return (
                  <th 
                    key={sectionKey}
                    colSpan={colSpanCount}
                    className={`p-3 text-center font-semibold text-xs tracking-wide border-r ${section.color}`}
                  >
                    {section.label}
                  </th>
                )
              })}
            </tr>
            
            {/* Nagłówki kolumn */}
            <tr className="bg-muted/50 border-b">
              {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((col, index) => {
                if (!visibleColumns[col]) return null
                const section = getColumnSection(col)
                const isSticky = col === 'bot'
                
                // Dodaj kolumnę "Kopiuj" zaraz po kolumnie "bot"
                if (col === 'bot') {
                  return (
                    <React.Fragment key={col}>
                      <th 
                        className={`p-2 text-left font-medium text-xs border-r cursor-pointer hover:bg-muted/80 transition-colors
                          sticky left-0 z-30 bg-background/95 backdrop-blur shadow-sm`}
                        onClick={() => handleSort(col as SortField)}
                        style={{ minWidth: '70px' }}
                      >
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          {COLUMN_LABELS[col]}
                          {sortField === col && <ArrowUpDown className="inline h-3 w-3" />}
                        </div>
                      </th>
                      <th 
                        className="p-2 text-center font-medium text-xs border-r sticky z-30 bg-background/95 backdrop-blur shadow-sm"
                        style={{ left: '70px', minWidth: '80px' }}
                      >
                        <Copy className="inline h-3 w-3" />
                      </th>
                    </React.Fragment>
                  )
                }
                
                return (
                  <th 
                    key={col}
                    className={`p-2 text-left font-medium text-xs border-r cursor-pointer hover:bg-muted/80 transition-colors
                      ${section?.color || ''}`}
                    onClick={() => handleSort(col as SortField)}
                    style={col === 'mode' ? { minWidth: '70px' } : col === 'botInstance' ? { minWidth: '270px' } : col === 'interval' ? { minWidth: '100px' } : undefined}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      {COLUMN_LABELS[col]}
                      {sortField === col && <ArrowUpDown className="inline h-3 w-3" />}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedBots.map((bot, idx) => (
              <tr key={bot.bot} className="border-b hover:bg-muted/30 transition-colors">
                {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((col) => {
                  if (!visibleColumns[col]) return null
                  const section = getColumnSection(col)
                  const isSticky = col === 'bot'
                  
                  // Dodaj kolumnę "Kopiuj" zaraz po kolumnie "bot"
                  if (col === 'bot') {
                    return (
                      <React.Fragment key={col}>
                        <td 
                          className={`p-2 border-r sticky left-0 z-10 bg-background/95 backdrop-blur font-semibold shadow-sm`}
                          style={{ minWidth: '70px' }}
                        >
                          {renderCell(bot, col as keyof BotData)}
                        </td>
                        <td 
                          className="p-2 border-r sticky z-10 bg-background/95 backdrop-blur shadow-sm text-center"
                          style={{ left: '70px', minWidth: '80px' }}
                        >
                          <AddBotDialog 
                            initialData={bot}
                            sourceBotId={bot.bot}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Copy className="h-3 w-3" />
                              </Button>
                            }
                          />
                        </td>
                      </React.Fragment>
                    )
                  }
                  
                  return (
                    <td 
                      key={col} 
                      className={`p-2 border-r ${section?.color || ''}`}
                      style={col === 'mode' ? { minWidth: '70px' } : col === 'botInstance' ? { minWidth: '270px' } : col === 'interval' ? { minWidth: '100px' } : undefined}
                    >
                      {renderCell(bot, col as keyof BotData)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Strona {currentPage} z {totalPages} (pokazuje {paginatedBots.length} z {sortedBots.length})
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

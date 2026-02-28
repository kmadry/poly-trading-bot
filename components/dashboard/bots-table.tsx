'use client'

import { BotData } from '@/types/bots'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, ArrowUpDown } from 'lucide-react'

interface BotsTableProps {
  bots: BotData[]
}

type SortField = keyof BotData
type SortDirection = 'asc' | 'desc'

export function BotsTable({ bots }: BotsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('bot')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedOwner, setSelectedOwner] = useState<string[]>([])
  const itemsPerPage = 50
  
  const [showFilters, setShowFilters] = useState(false)
  
  const uniqueStatuses = Array.from(new Set(bots.map(b => b.status)))
  const uniqueOwners = Array.from(new Set(bots.map(b => b.owner)))

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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">Status</label>
              <div className="space-y-1 border rounded p-2">
                {uniqueStatuses.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      checked={selectedStatus.includes(status)}
                      onChange={() => toggleFilter(status, selectedStatus, setSelectedStatus)}
                      className="rounded"
                    />
                    <label htmlFor={`status-${status}`} className="text-xs cursor-pointer">
                      {status} ({bots.filter(b => b.status === status).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Owner Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">Owner</label>
              <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                {uniqueOwners.map(owner => (
                  <div key={owner} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`owner-${owner}`}
                      checked={selectedOwner.includes(owner)}
                      onChange={() => toggleFilter(owner, selectedOwner, setSelectedOwner)}
                      className="rounded"
                    />
                    <label htmlFor={`owner-${owner}`} className="text-xs cursor-pointer">
                      {owner} ({bots.filter(b => b.owner === owner).length})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela - horizontal scroll */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b sticky top-0">
            <tr>
              {/* INFO */}
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('bot')}>
                Bot {sortField === 'bot' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('owner')}>
                Nazwa {sortField === 'owner' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('mode')}>
                Tryb {sortField === 'mode' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              
              {/* WYNIKI */}
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('averageRate')}>
                Średni kurs {sortField === 'averageRate' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('positionsOnTime')}>
                Pozycje {sortField === 'positionsOnTime' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('transactions')}>
                Transakcje {sortField === 'transactions' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('missing')}>
                Brakuje {sortField === 'missing' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('lost')}>
                Przegrane {sortField === 'lost' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('won')}>
                Wygrane {sortField === 'won' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('wonPerTransactions')}>
                Win/Trans {sortField === 'wonPerTransactions' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('edge')}>
                Edge {sortField === 'edge' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              
              {/* ROI */}
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('balance')}>
                Bilans {sortField === 'balance' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('profitPerPosition')}>
                Zysk/Poz {sortField === 'profitPerPosition' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('profitPerDay')}>
                Zysk/Dzień {sortField === 'profitPerDay' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('roiPerDay')}>
                ROI/Dzień {sortField === 'roiPerDay' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              
              {/* KONFIGURACJA */}
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('botInstance')}>
                Bot Instance {sortField === 'botInstance' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('crypto')}>
                Crypto {sortField === 'crypto' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('interval')}>
                Interwał {sortField === 'interval' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('strategyName')}>
                Strategia {sortField === 'strategyName' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('orderSize')}>
                Order Size {sortField === 'orderSize' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-right font-semibold border-r cursor-pointer hover:bg-muted" onClick={() => handleSort('momentumThreshold')}>
                Momentum {sortField === 'momentumThreshold' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
              <th className="p-2 text-left font-semibold cursor-pointer hover:bg-muted" onClick={() => handleSort('serverIp')}>
                Server IP {sortField === 'serverIp' && <ArrowUpDown className="inline h-3 w-3" />}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedBots.map((bot) => (
              <tr key={bot.bot} className="border-b hover:bg-muted/20 transition-colors">
                {/* INFO */}
                <td className="p-2 border-r">{bot.bot}</td>
                <td className="p-2 border-r">{getStatusBadge(bot.status)}</td>
                <td className="p-2 border-r">{bot.owner}</td>
                <td className="p-2 border-r">{bot.mode}</td>
                
                {/* WYNIKI */}
                <td className="p-2 text-right border-r">{formatNumber(bot.averageRate, 3)}</td>
                <td className="p-2 text-right border-r">{bot.positionsOnTime.toLocaleString()}</td>
                <td className="p-2 text-right border-r">{bot.transactions.toLocaleString()}</td>
                <td className="p-2 text-right border-r">{bot.missing.toLocaleString()}</td>
                <td className="p-2 text-right border-r">{bot.lost.toLocaleString()}</td>
                <td className="p-2 text-right border-r">{bot.won.toLocaleString()}</td>
                <td className="p-2 text-right border-r">{formatPercent(bot.wonPerTransactions)}</td>
                <td className="p-2 text-right border-r">{formatPercent(bot.edge)}</td>
                
                {/* ROI */}
                <td className={`p-2 text-right border-r font-semibold ${bot.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(bot.balance)}
                </td>
                <td className="p-2 text-right border-r">{formatCurrency(bot.profitPerPosition)}</td>
                <td className={`p-2 text-right border-r ${bot.profitPerDay >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(bot.profitPerDay)}
                </td>
                <td className={`p-2 text-right border-r ${bot.roiPerDay >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(bot.roiPerDay)}
                </td>
                
                {/* KONFIGURACJA */}
                <td className="p-2 border-r font-mono text-xs">{bot.botInstance}</td>
                <td className="p-2 border-r">{bot.crypto}</td>
                <td className="p-2 border-r">{bot.interval}</td>
                <td className="p-2 border-r">{bot.strategyName}</td>
                <td className="p-2 text-right border-r">{bot.orderSize}</td>
                <td className="p-2 text-right border-r">{formatNumber(bot.momentumThreshold, 2)}</td>
                <td className="p-2 font-mono text-xs">{bot.serverIp}</td>
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

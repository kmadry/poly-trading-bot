'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, Settings2, ArrowUpDown, ArrowUp, ArrowDown, X, Filter, Columns3, Plus, Pencil, Trash2, Copy, Play, Square } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AutocompleteInput } from '@/components/ui/autocomplete-input'

interface BotInstance {
  id: number
  instance_name: string
  owner_id: string
  desired_state: 'running' | 'stopped'
  actual_state: 'running' | 'stopped' | 'error'
  last_state_change: string | null
  strategy_config: any
  created_at: string
  updated_at: string
  server_id: string | null
}

interface ServerStatus {
  id: string
  desired_running: number
  available_slots: number
}

interface ColumnDef {
  key: string
  label: string
  getValue: (bot: BotInstance) => any
  format?: (value: any) => string
  sortable?: boolean
  filterable?: boolean
}

const STORAGE_KEY = 'boty2-visible-columns'

const defaultVisibleColumns = ['actions', 'id', 'instance_name', 'desired_state', 'actual_state', 'Nazwa', 'MARKET_INTERVAL', 'ORDER_SIZE', 'DRY_RUN']

export default function Boty2Page() {
  const [bots, setBots] = useState<BotInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(defaultVisibleColumns))
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBot, setEditingBot] = useState<BotInstance | null>(null)
  const [copyingFromBot, setCopyingFromBot] = useState<BotInstance | null>(null)
  const [killPreviousBot, setKillPreviousBot] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [nextBotId, setNextBotId] = useState<number>(1)
  const [servers, setServers] = useState<ServerStatus[]>([])
  const [formState, setFormState] = useState({
    crypto: 'Bitcoin',
    interval: '5m',
    strategyName: '',
    momentumConfirmationSec: 0,
    momentumThreshold: 0,
    dryRun: 'false',
    orderSize: '',
    buyOpposite: 'false',
    strategyMode: 'MOMENTUM',
    exitPrice: '',
    maxSpread: '',
    entryThreshold: '',
    velocityMinTicks: '',
    velocityMinIncrease: '',
    exitBeforeCloseSec: '',
    warmupDelaySec: '',
    minTimeRemaining: '',
    maxReversalEntryPrice: '',
    momentumConfirmationTolerance: '',
    stopLoss: '',
    maxReentries: '',
    exitMaxRetries: '',
    exitPriceDecrement: '',
    aggressiveExitUnderbid: '',
    momentumConfirmationMethod: 'CONTINUOUS',
    strategyEnabled: 'true',
    desiredState: 'stopped',
    serverId: ''
  })

  // Wyciągnij unikalne wartości z istniejących botów
  const suggestions = useMemo(() => {
    return {
      strategyName: Array.from(new Set(bots.map(b => b.strategy_config?.Nazwa).filter(Boolean))),
      orderSize: Array.from(new Set(bots.map(b => String(b.strategy_config?.ORDER_SIZE || '')).filter(Boolean))),
      exitPrice: Array.from(new Set(bots.map(b => String(b.strategy_config?.EXIT_PRICE || '')).filter(Boolean))),
      maxSpread: Array.from(new Set(bots.map(b => String(b.strategy_config?.MAX_SPREAD || '')).filter(Boolean))),
      entryThreshold: Array.from(new Set(bots.map(b => String(b.strategy_config?.ENTRY_THRESHOLD || '')).filter(Boolean))),
      momentumThreshold: Array.from(new Set(bots.map(b => String(b.strategy_config?.MOMENTUM_THRESHOLD || '')).filter(Boolean))),
      velocityMinTicks: Array.from(new Set(bots.map(b => String(b.strategy_config?.VELOCITY_MIN_TICKS || '')).filter(Boolean))),
      velocityMinIncrease: Array.from(new Set(bots.map(b => String(b.strategy_config?.VELOCITY_MIN_INCREASE || '')).filter(Boolean))),
      exitBeforeCloseSec: Array.from(new Set(bots.map(b => String(b.strategy_config?.EXIT_BEFORE_CLOSE_SEC || '')).filter(Boolean))),
      warmupDelaySec: Array.from(new Set(bots.map(b => String(b.strategy_config?.WARMUP_DELAY_SEC || '')).filter(Boolean))),
      minTimeRemaining: Array.from(new Set(bots.map(b => String(b.strategy_config?.MIN_TIME_REMAINING || '')).filter(Boolean))),
      maxReversalEntryPrice: Array.from(new Set(bots.map(b => String(b.strategy_config?.MAX_REVERSAL_ENTRY_PRICE || '')).filter(Boolean))),
      momentumConfirmationSec: Array.from(new Set(bots.map(b => String(b.strategy_config?.MOMENTUM_CONFIRMATION_SEC || '')).filter(Boolean))),
      momentumConfirmationTolerance: Array.from(new Set(bots.map(b => String(b.strategy_config?.MOMENTUM_CONFIRMATION_TOLERANCE || '')).filter(Boolean))),
      stopLoss: Array.from(new Set(bots.map(b => String(b.strategy_config?.STOP_LOSS || '')).filter(Boolean))),
      maxReentries: Array.from(new Set(bots.map(b => String(b.strategy_config?.MAX_REENTRIES || '')).filter(Boolean))),
      exitMaxRetries: Array.from(new Set(bots.map(b => String(b.strategy_config?.EXIT_MAX_RETRIES || '')).filter(Boolean))),
      exitPriceDecrement: Array.from(new Set(bots.map(b => String(b.strategy_config?.EXIT_PRICE_DECREMENT || '')).filter(Boolean))),
      aggressiveExitUnderbid: Array.from(new Set(bots.map(b => String(b.strategy_config?.AGGRESSIVE_EXIT_UNDERBID || '')).filter(Boolean))),
    }
  }, [bots])
  
  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const topScrollContentRef = useRef<HTMLDivElement>(null)

  // Definicje wszystkich kolumn
  const allColumns: ColumnDef[] = [
    { key: 'actions', label: 'Akcje', getValue: () => '', sortable: false, filterable: false },
    { key: 'id', label: 'ID', getValue: (bot) => bot.id, sortable: true, filterable: true },
    { key: 'instance_name', label: 'Instance Name', getValue: (bot) => bot.instance_name, sortable: true, filterable: true },
    { key: 'owner_id', label: 'Owner ID', getValue: (bot) => bot.owner_id, sortable: true, filterable: true },
    { key: 'desired_state', label: 'Desired State', getValue: (bot) => bot.desired_state, sortable: true, filterable: true },
    { key: 'actual_state', label: 'Actual State', getValue: (bot) => bot.actual_state, sortable: true, filterable: true },
    { key: 'server_id', label: 'Server ID', getValue: (bot) => bot.server_id || '', sortable: true, filterable: true },
    { key: 'last_state_change', label: 'Last State Change', getValue: (bot) => bot.last_state_change, format: formatDate, sortable: true, filterable: true },
    { key: 'created_at', label: 'Created At', getValue: (bot) => bot.created_at, format: formatDate, sortable: true, filterable: true },
    { key: 'updated_at', label: 'Updated At', getValue: (bot) => bot.updated_at, format: formatDate, sortable: true, filterable: true },
    
    // Strategy Config fields
    { key: 'Nazwa', label: 'Strategy Name', getValue: (bot) => bot.strategy_config?.Nazwa || '', sortable: true, filterable: true },
    { key: 'DRY_RUN', label: 'Dry Run', getValue: (bot) => bot.strategy_config?.DRY_RUN, format: (v) => v ? 'Yes' : 'No', sortable: true, filterable: true },
    { key: 'STRATEGY_MODE', label: 'Strategy Mode', getValue: (bot) => bot.strategy_config?.STRATEGY_MODE || '', sortable: true, filterable: true },
    { key: 'MARKET_INTERVAL', label: 'Interval', getValue: (bot) => bot.strategy_config?.MARKET_INTERVAL || '', sortable: true, filterable: true },
    { key: 'BASE_SERIES_SLUG', label: 'Base Series', getValue: (bot) => bot.strategy_config?.BASE_SERIES_SLUG || '', sortable: true, filterable: true },
    { key: 'BOT_INSTANCE', label: 'Bot Instance', getValue: (bot) => bot.strategy_config?.BOT_INSTANCE || '', sortable: true, filterable: true },
    { key: 'ORDER_SIZE', label: 'Order Size', getValue: (bot) => bot.strategy_config?.ORDER_SIZE || 0, sortable: true, filterable: true },
    { key: 'STRATEGY_ENABLED', label: 'Strategy Enabled', getValue: (bot) => bot.strategy_config?.STRATEGY_ENABLED, format: (v) => v ? 'Yes' : 'No', sortable: true, filterable: true },
    { key: 'BUY_OPPOSITE', label: 'Buy Opposite', getValue: (bot) => bot.strategy_config?.BUY_OPPOSITE, format: (v) => v ? 'Yes' : 'No', sortable: true, filterable: true },
    { key: 'EXIT_PRICE', label: 'Exit Price', getValue: (bot) => bot.strategy_config?.EXIT_PRICE || 0, sortable: true, filterable: true },
    { key: 'EXIT_BEFORE_CLOSE_SEC', label: 'Exit Before Close', getValue: (bot) => bot.strategy_config?.EXIT_BEFORE_CLOSE_SEC || 0, sortable: true, filterable: true },
    { key: 'MOMENTUM_THRESHOLD', label: 'Momentum Threshold', getValue: (bot) => bot.strategy_config?.MOMENTUM_THRESHOLD || 0, sortable: true, filterable: true },
    { key: 'ENTRY_THRESHOLD', label: 'Entry Threshold', getValue: (bot) => bot.strategy_config?.ENTRY_THRESHOLD || 0, sortable: true, filterable: true },
    { key: 'MAX_REVERSAL_ENTRY_PRICE', label: 'Max Reversal Entry', getValue: (bot) => bot.strategy_config?.MAX_REVERSAL_ENTRY_PRICE || '', sortable: true, filterable: true },
    { key: 'MOMENTUM_CONFIRMATION_SEC', label: 'Momentum Confirm Sec', getValue: (bot) => bot.strategy_config?.MOMENTUM_CONFIRMATION_SEC || 0, sortable: true, filterable: true },
    { key: 'MOMENTUM_CONFIRMATION_TOLERANCE', label: 'Momentum Tolerance', getValue: (bot) => bot.strategy_config?.MOMENTUM_CONFIRMATION_TOLERANCE || 0, sortable: true, filterable: true },
    { key: 'MOMENTUM_CONFIRMATION_METHOD', label: 'Momentum Method', getValue: (bot) => bot.strategy_config?.MOMENTUM_CONFIRMATION_METHOD || '', sortable: true, filterable: true },
    { key: 'VELOCITY_MIN_TICKS', label: 'Velocity Min Ticks', getValue: (bot) => bot.strategy_config?.VELOCITY_MIN_TICKS || 0, sortable: true, filterable: true },
    { key: 'VELOCITY_MIN_INCREASE', label: 'Velocity Min Increase', getValue: (bot) => bot.strategy_config?.VELOCITY_MIN_INCREASE || 0, sortable: true, filterable: true },
    { key: 'MAX_SPREAD', label: 'Max Spread', getValue: (bot) => bot.strategy_config?.MAX_SPREAD || 0, sortable: true, filterable: true },
    { key: 'WARMUP_DELAY_SEC', label: 'Warmup Delay', getValue: (bot) => bot.strategy_config?.WARMUP_DELAY_SEC || 0, sortable: true, filterable: true },
    { key: 'MIN_TIME_REMAINING', label: 'Min Time Remaining', getValue: (bot) => bot.strategy_config?.MIN_TIME_REMAINING || 0, sortable: true, filterable: true },
    { key: 'MAX_REENTRIES', label: 'Max Reentries', getValue: (bot) => bot.strategy_config?.MAX_REENTRIES || 0, sortable: true, filterable: true },
    { key: 'STOP_LOSS', label: 'Stop Loss', getValue: (bot) => bot.strategy_config?.STOP_LOSS || '', sortable: true, filterable: true },
    { key: 'AGGRESSIVE_EXIT_UNDERBID', label: 'Aggressive Exit', getValue: (bot) => bot.strategy_config?.AGGRESSIVE_EXIT_UNDERBID || 0, sortable: true, filterable: true },
    { key: 'EXIT_MAX_RETRIES', label: 'Exit Max Retries', getValue: (bot) => bot.strategy_config?.EXIT_MAX_RETRIES || 0, sortable: true, filterable: true },
    { key: 'EXIT_PRICE_DECREMENT', label: 'Exit Price Decrement', getValue: (bot) => bot.strategy_config?.EXIT_PRICE_DECREMENT || 0, sortable: true, filterable: true },
    { key: 'SECRETS_PATH', label: 'Secrets Path', getValue: (bot) => bot.strategy_config?.SECRETS_PATH || '', sortable: true, filterable: true },
  ]

  // Wczytaj kolumny z localStorage po zamontowaniu (client-side only)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setVisibleColumns(new Set(parsed))
      } catch (e) {
        console.error('Błąd parsowania kolumn z localStorage:', e)
      }
    }
  }, [])

  // Zapisz widoczne kolumny do localStorage
  useEffect(() => {
    if (mounted) {
      const columnsArray = Array.from(visibleColumns)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnsArray))
    }
  }, [visibleColumns, mounted])

  const fetchBots = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      
      const { data, error: fetchError } = await supabase
        .from('bot_instances')
        .select('*')
        .order('id', { ascending: true })

      if (fetchError) throw fetchError

      setBots(data || [])
    } catch (err: any) {
      console.error('Error fetching bots:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchServers = async () => {
    try {
      const supabase = createClient()
      
      console.log('🔍 Fetching servers from VIEW...')
      
      const { data, error } = await supabase
        .from('server_status')
        .select('*')
      
      console.log('📊 Response:', { 
        dataLength: data?.length, 
        hasError: !!error, 
        errorMessage: error?.message,
        rawData: data 
      })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ VIEW server_status zwrócił 0 rekordów. Sprawdź czy tabela servers ma dane.')
        
        // Próbuj bezpośrednio z tabeli servers jako fallback
        const { data: serversData, error: serversError } = await supabase
          .from('servers')
          .select('id, hostname, max_bots, is_active')
          .eq('is_active', true)
        
        console.log('🔄 Fallback - dane z tabeli servers:', serversData)
        
        if (!serversError && serversData && serversData.length > 0) {
          const fallbackServers = serversData.map((row: any) => ({
            id: row.id,
            desired_running: 0,
            available_slots: row.max_bots || 10
          }))
          setServers(fallbackServers)
          console.log('✅ Użyto fallback z tabeli servers:', fallbackServers.length)
          return
        }
      }
      
      const mappedServers = (data || []).map((row: any) => ({
        id: row.id,
        desired_running: row.desired_running || 0,
        available_slots: row.available_slots || 0
      }))
      
      setServers(mappedServers)
      console.log('✅ Ustawiono serwery:', mappedServers.length)
    } catch (err: any) {
      console.error('❌ Błąd pobierania serwerów:', err)
    }
  }

  useEffect(() => {
    fetchBots()
    fetchServers()
  }, [])

  // Pobierz userId, nextBotId i dane z bota przy otwieraniu dialogu
  useEffect(() => {
    if (showAddDialog) {
      const fetchUserAndBotId = async () => {
        const supabase = createClient()
        
        // Odśwież listę serwerów
        fetchServers()
        
        // Pobierz userId
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
        }
        
        // Pobierz następny bot ID
        const { data: lastBot } = await supabase
          .from('bot_instances')
          .select('id')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (lastBot) {
          setNextBotId(lastBot.id + 1)
        } else {
          setNextBotId(1)
        }
        
        // Określ z którego bota wczytać dane
        let sourceBot = null
        if (editingBot) {
          sourceBot = editingBot
        } else if (copyingFromBot) {
          sourceBot = copyingFromBot
        } else {
          // Pobierz bota z najnowszym last_state_change
          const { data: latestBot } = await supabase
            .from('bot_instances')
            .select('*')
            .not('last_state_change', 'is', null)
            .order('last_state_change', { ascending: false })
            .limit(1)
            .maybeSingle()
          sourceBot = latestBot
        }
        
        if (sourceBot && sourceBot.strategy_config) {
          const config = sourceBot.strategy_config
          
          // Mapowanie BASE_SERIES_SLUG na crypto
          const cryptoFromSlug = config.BASE_SERIES_SLUG?.includes('btc') ? 'Bitcoin' :
                                 config.BASE_SERIES_SLUG?.includes('eth') ? 'Ethereum' :
                                 config.BASE_SERIES_SLUG?.includes('sol') ? 'Solana' :
                                 config.BASE_SERIES_SLUG?.includes('xrp') ? 'XRP' : 'Bitcoin'
          
          setFormState({
            crypto: cryptoFromSlug,
            interval: config.MARKET_INTERVAL || '5m',
            strategyName: config.Nazwa || '',
            momentumConfirmationSec: config.MOMENTUM_CONFIRMATION_SEC || 0,
            momentumThreshold: config.MOMENTUM_THRESHOLD || 0,
            dryRun: String(config.DRY_RUN || false),
            orderSize: String(config.ORDER_SIZE || ''),
            buyOpposite: String(config.BUY_OPPOSITE || false),
            strategyMode: config.STRATEGY_MODE || 'MOMENTUM',
            exitPrice: String(config.EXIT_PRICE || ''),
            maxSpread: String(config.MAX_SPREAD || ''),
            entryThreshold: String(config.ENTRY_THRESHOLD || ''),
            velocityMinTicks: String(config.VELOCITY_MIN_TICKS || ''),
            velocityMinIncrease: String(config.VELOCITY_MIN_INCREASE || ''),
            exitBeforeCloseSec: String(config.EXIT_BEFORE_CLOSE_SEC || ''),
            warmupDelaySec: String(config.WARMUP_DELAY_SEC || ''),
            minTimeRemaining: String(config.MIN_TIME_REMAINING || ''),
            maxReversalEntryPrice: String(config.MAX_REVERSAL_ENTRY_PRICE || ''),
            momentumConfirmationTolerance: String(config.MOMENTUM_CONFIRMATION_TOLERANCE || ''),
            stopLoss: String(config.STOP_LOSS || ''),
            maxReentries: String(config.MAX_REENTRIES || ''),
            exitMaxRetries: String(config.EXIT_MAX_RETRIES || ''),
            exitPriceDecrement: String(config.EXIT_PRICE_DECREMENT || ''),
            aggressiveExitUnderbid: String(config.AGGRESSIVE_EXIT_UNDERBID || ''),
            momentumConfirmationMethod: config.MOMENTUM_CONFIRMATION_METHOD || '',
            strategyEnabled: String(config.STRATEGY_ENABLED !== false),
            desiredState: sourceBot.desired_state || 'stopped',
            serverId: sourceBot.server_id || ''
          })
        }
      }
      
      fetchUserAndBotId()
    } else {
      // Reset formularza i stanów po zamknięciu
      setEditingBot(null)
      setCopyingFromBot(null)
      setKillPreviousBot(false)
      setFormState({
        crypto: 'Bitcoin',
        interval: '5m',
        strategyName: '',
        momentumConfirmationSec: 0,
        momentumThreshold: 0,
        dryRun: 'false',
        orderSize: '',
        buyOpposite: 'false',
        strategyMode: 'MOMENTUM',
        exitPrice: '',
        maxSpread: '',
        entryThreshold: '',
        velocityMinTicks: '',
        velocityMinIncrease: '',
        exitBeforeCloseSec: '',
        warmupDelaySec: '',
        minTimeRemaining: '',
        maxReversalEntryPrice: '',
        momentumConfirmationTolerance: '',
        stopLoss: '',
        maxReentries: '',
        exitMaxRetries: '',
        exitPriceDecrement: '',
        aggressiveExitUnderbid: '',
        momentumConfirmationMethod: 'CONTINUOUS',
        strategyEnabled: 'true',
        desiredState: 'stopped',
        serverId: ''
      })
    }
  }, [showAddDialog])

  // Generuj instance_name automatycznie
  const generatedInstanceName = useMemo(() => {
    const { crypto, interval, strategyName, momentumConfirmationSec, momentumThreshold } = formState
    
    if (!userId) {
      return 'Ładowanie user.id...'
    }
    
    if (!crypto || !interval || !strategyName) {
      return 'Wypełnij wymagane pola'
    }

    // Mapowanie crypto na skróty
    const cryptoMap: Record<string, string> = {
      'Bitcoin': 'btc',
      'Ethereum': 'eth',
      'Solana': 'sol',
      'XRP': 'xrp'
    }

    // Mapowanie interwału na skróty
    const intervalMap: Record<string, string> = {
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h'
    }

    const cryptoShort = cryptoMap[crypto] || crypto.toLowerCase().substring(0, 3)
    const intervalShort = intervalMap[interval] || interval
    const strategyLower = strategyName.toLowerCase()
    const momentumSec = momentumConfirmationSec || 0
    const momentumThresh = Math.round((momentumThreshold || 0) * 100)
    
    // Format: {user.id}--{crypto}-{interval}-{strategia}-d{momentum_sec}-{threshold*100}--{nextBotId}
    return `${userId}--${cryptoShort}-${intervalShort}-${strategyLower}-d${momentumSec}-${momentumThresh}--${nextBotId}`
  }, [formState.crypto, formState.interval, formState.strategyName, formState.momentumConfirmationSec, formState.momentumThreshold, userId, nextBotId])

  const generatedConfig = useMemo(() => {
    if (!userId || generatedInstanceName === 'Ładowanie user.id...' || generatedInstanceName === 'Wypełnij wymagane pola') {
      return null
    }

    // Mapowanie crypto na base_series_slug
    const cryptoMap: Record<string, string> = {
      'Bitcoin': 'btc',
      'Ethereum': 'eth',
      'Solana': 'sol',
      'XRP': 'xrp'
    }
    const cryptoShort = cryptoMap[formState.crypto] || formState.crypto.toLowerCase().substring(0, 3)
    const baseSeriesSlug = `${cryptoShort}-updown-${formState.interval}`

    const config: any = {
      instance_name: generatedInstanceName,
      owner_id: userId,
      desired_state: formState.desiredState,
      strategy_config: {
        Nazwa: formState.strategyName,
        DRY_RUN: formState.dryRun === 'true',
        STOP_LOSS: formState.stopLoss ? parseFloat(formState.stopLoss) : null,
        EXIT_PRICE: formState.exitPrice ? parseFloat(formState.exitPrice) : null,
        MAX_SPREAD: formState.maxSpread ? parseFloat(formState.maxSpread) : null,
        ORDER_SIZE: formState.orderSize ? parseInt(formState.orderSize) : null,
        BOT_INSTANCE: generatedInstanceName,
        BUY_OPPOSITE: formState.buyOpposite === 'true',
        SECRETS_PATH: `/srv/polymarket/users/${userId}/.secrets`,
        MAX_REENTRIES: formState.maxReentries ? parseInt(formState.maxReentries) : null,
        STRATEGY_MODE: formState.strategyMode,
        ENTRY_THRESHOLD: formState.entryThreshold ? parseFloat(formState.entryThreshold) : null,
        MARKET_INTERVAL: formState.interval,
        BASE_SERIES_SLUG: baseSeriesSlug,
        EXIT_MAX_RETRIES: formState.exitMaxRetries ? parseInt(formState.exitMaxRetries) : null,
        STRATEGY_ENABLED: formState.strategyEnabled === 'true',
        WARMUP_DELAY_SEC: formState.warmupDelaySec ? parseInt(formState.warmupDelaySec) : null,
        MIN_TIME_REMAINING: formState.minTimeRemaining ? parseInt(formState.minTimeRemaining) : null,
        MOMENTUM_THRESHOLD: formState.momentumThreshold || null,
        VELOCITY_MIN_TICKS: formState.velocityMinTicks ? parseInt(formState.velocityMinTicks) : null,
        EXIT_PRICE_DECREMENT: formState.exitPriceDecrement ? parseFloat(formState.exitPriceDecrement) : null,
        EXIT_BEFORE_CLOSE_SEC: formState.exitBeforeCloseSec ? parseInt(formState.exitBeforeCloseSec) : null,
        VELOCITY_MIN_INCREASE: formState.velocityMinIncrease ? parseFloat(formState.velocityMinIncrease) : null,
        AGGRESSIVE_EXIT_UNDERBID: formState.aggressiveExitUnderbid ? parseFloat(formState.aggressiveExitUnderbid) : null,
        MAX_REVERSAL_ENTRY_PRICE: formState.maxReversalEntryPrice ? parseFloat(formState.maxReversalEntryPrice) : null,
        MOMENTUM_CONFIRMATION_SEC: formState.momentumConfirmationSec || null,
        MOMENTUM_CONFIRMATION_METHOD: formState.momentumConfirmationMethod || null,
        MOMENTUM_CONFIRMATION_TOLERANCE: formState.momentumConfirmationTolerance ? parseFloat(formState.momentumConfirmationTolerance) : null,
      }
    }

    // Dodaj server_id tylko gdy desired_state = 'running'
    if (formState.desiredState === 'running' && formState.serverId) {
      config.server_id = formState.serverId
    }

    return config
  }, [formState, userId, generatedInstanceName])

  // Synchronizacja scrollowania między górnym i dolnym scrollbarem
  useEffect(() => {
    const topScroll = topScrollRef.current
    const tableScroll = tableScrollRef.current
    const topScrollContent = topScrollContentRef.current

    if (!topScroll || !tableScroll || !topScrollContent) return

    // Synchronizacja szerokości - ustaw szerokość górnego scrolla na podstawie tabeli
    const syncWidth = () => {
      const table = tableScroll.querySelector('table')
      if (table) {
        const tableWidth = table.offsetWidth
        topScrollContent.style.width = `${tableWidth}px`
      }
    }

    // Synchronizuj szerokość na starcie
    syncWidth()

    // Obserwuj zmiany szerokości tabeli
    const resizeObserver = new ResizeObserver(() => {
      syncWidth()
    })

    const table = tableScroll.querySelector('table')
    if (table) {
      resizeObserver.observe(table)
    }

    const handleTopScroll = () => {
      if (tableScroll) {
        tableScroll.scrollLeft = topScroll.scrollLeft
      }
    }

    const handleTableScroll = () => {
      if (topScroll) {
        topScroll.scrollLeft = tableScroll.scrollLeft
      }
    }

    topScroll.addEventListener('scroll', handleTopScroll)
    tableScroll.addEventListener('scroll', handleTableScroll)

    return () => {
      topScroll.removeEventListener('scroll', handleTopScroll)
      tableScroll.removeEventListener('scroll', handleTableScroll)
      resizeObserver.disconnect()
    }
  }, [bots.length, visibleColumns.size])

  // Filtrowane i posortowane boty
  const processedBots = useMemo(() => {
    let result = [...bots]

    // Filtrowanie
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const column = allColumns.find(c => c.key === key)
        if (column) {
          result = result.filter(bot => {
            const cellValue = column.getValue(bot)
            const displayValue = column.format ? column.format(cellValue) : String(cellValue)
            return displayValue.toLowerCase().includes(value.toLowerCase())
          })
        }
      }
    })

    // Sortowanie
    if (sortColumn) {
      const column = allColumns.find(c => c.key === sortColumn)
      if (column) {
        result.sort((a, b) => {
          const aVal = column.getValue(a)
          const bVal = column.getValue(b)
          
          if (aVal === null || aVal === undefined) return 1
          if (bVal === null || bVal === undefined) return -1
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
          }
          
          const aStr = String(aVal).toLowerCase()
          const bStr = String(bVal).toLowerCase()
          
          if (sortDirection === 'asc') {
            return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
          } else {
            return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
          }
        })
      }
    }

    return result
  }, [bots, filters, sortColumn, sortDirection])

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortColumn(null)
        setSortDirection('asc')
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const handleAddBot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Mapowanie crypto na base_series_slug
    const cryptoMap: Record<string, string> = {
      'Bitcoin': 'btc',
      'Ethereum': 'eth',
      'Solana': 'sol',
      'XRP': 'xrp'
    }
    const cryptoShort = cryptoMap[formState.crypto] || formState.crypto.toLowerCase().substring(0, 3)
    const baseSeriesSlug = `${cryptoShort}-updown-${formState.interval}`
    
    // Zbierz dane z formularza
    const botData: any = {
      instance_name: generatedInstanceName,
      owner_id: userId,
      desired_state: formState.desiredState,
      strategy_config: {
        Nazwa: formState.strategyName,
        DRY_RUN: formData.get('dry_run') === 'true',
        STOP_LOSS: formState.stopLoss ? parseFloat(formState.stopLoss) : null,
        EXIT_PRICE: parseFloat(formState.exitPrice),
        MAX_SPREAD: parseFloat(formState.maxSpread),
        ORDER_SIZE: parseInt(formState.orderSize),
        BOT_INSTANCE: generatedInstanceName,
        BUY_OPPOSITE: formData.get('buy_opposite') === 'true',
        SECRETS_PATH: `/srv/polymarket/users/${userId}/.secrets`,
        MAX_REENTRIES: formState.maxReentries ? parseInt(formState.maxReentries) : null,
        STRATEGY_MODE: formState.strategyMode,
        ENTRY_THRESHOLD: parseFloat(formState.entryThreshold),
        MARKET_INTERVAL: formState.interval,
        BASE_SERIES_SLUG: baseSeriesSlug,
        EXIT_MAX_RETRIES: formState.exitMaxRetries ? parseInt(formState.exitMaxRetries) : null,
        STRATEGY_ENABLED: formData.get('strategy_enabled') === 'true',
        WARMUP_DELAY_SEC: parseInt(formState.warmupDelaySec),
        MIN_TIME_REMAINING: parseInt(formState.minTimeRemaining),
        MOMENTUM_THRESHOLD: formState.momentumThreshold,
        VELOCITY_MIN_TICKS: parseInt(formState.velocityMinTicks),
        EXIT_PRICE_DECREMENT: formState.exitPriceDecrement ? parseFloat(formState.exitPriceDecrement) : null,
        EXIT_BEFORE_CLOSE_SEC: parseInt(formState.exitBeforeCloseSec),
        VELOCITY_MIN_INCREASE: parseFloat(formState.velocityMinIncrease),
        AGGRESSIVE_EXIT_UNDERBID: formState.aggressiveExitUnderbid ? parseFloat(formState.aggressiveExitUnderbid) : null,
        MAX_REVERSAL_ENTRY_PRICE: parseFloat(formState.maxReversalEntryPrice),
        MOMENTUM_CONFIRMATION_SEC: formState.momentumConfirmationSec,
        MOMENTUM_CONFIRMATION_METHOD: formState.momentumConfirmationMethod || null,
        MOMENTUM_CONFIRMATION_TOLERANCE: parseFloat(formState.momentumConfirmationTolerance),
      }
    }

    // Dodaj server_id tylko gdy desired_state = 'running'
    if (formState.desiredState === 'running' && formState.serverId) {
      botData.server_id = formState.serverId
    }

    try {
      const supabase = createClient()

      if (editingBot) {
        // Tryb edycji - UPDATE istniejącego bota
        const updateData: any = {
          desired_state: formState.desiredState,
          strategy_config: botData.strategy_config
        }
        
        // Dodaj server_id jeśli running
        if (formState.desiredState === 'running' && formState.serverId) {
          updateData.server_id = formState.serverId
        } else if (formState.desiredState === 'stopped') {
          updateData.server_id = null
        }

        const { error } = await supabase
          .from('bot_instances')
          .update(updateData)
          .eq('id', editingBot.id)

        if (error) throw error

        alert('✅ Bot zaktualizowany pomyślnie!')
      } else {
        // Tryb dodawania - INSERT nowego bota
        
        // Jeśli kopiujemy i zaznaczono "zabij poprzedniego"
        if (copyingFromBot && killPreviousBot) {
          const { error: killError } = await supabase
            .from('bot_instances')
            .update({ desired_state: 'stopped' })
            .eq('id', copyingFromBot.id)

          if (killError) {
            console.error('Error killing previous bot:', killError)
            alert(`⚠️ Ostrzeżenie: Nie udało się zatrzymać poprzedniego bota: ${killError.message}`)
          }
        }

        const { error } = await supabase
          .from('bot_instances')
          .insert([botData])

        if (error) throw error

        alert('✅ Bot dodany pomyślnie!')
      }

      setShowAddDialog(false)
      fetchBots() // Odśwież listę
      fetchServers() // Odśwież listę serwerów
    } catch (err: any) {
      console.error('Error saving bot:', err)
      alert(`❌ Błąd: ${err.message}`)
    }
  }

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey)
      } else {
        newSet.add(columnKey)
      }
      return newSet
    })
  }

  const showDefaultColumns = () => {
    setVisibleColumns(new Set(defaultVisibleColumns))
  }

  const toggleAllColumns = () => {
    if (visibleColumns.size === allColumns.length) {
      // Jeśli wszystkie są pokazane, ukryj wszystkie oprócz 'actions'
      setVisibleColumns(new Set(['actions']))
    } else {
      // Jeśli są jakieś ukryte, pokaż wszystkie
      setVisibleColumns(new Set(allColumns.map(col => col.key)))
    }
  }

  const handleEdit = (bot: BotInstance) => {
    setEditingBot(bot)
    setShowAddDialog(true)
  }

  const handleDelete = async (bot: BotInstance) => {
    if (!confirm(`Czy na pewno chcesz usunąć bota "${bot.instance_name}"?`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bot_instances')
        .delete()
        .eq('id', bot.id)

      if (error) throw error

      alert('✅ Bot usunięty pomyślnie!')
      fetchBots()
      fetchServers()
    } catch (err: any) {
      console.error('Error deleting bot:', err)
      alert(`❌ Błąd: ${err.message}`)
    }
  }

  const handleCopy = (bot: BotInstance) => {
    setCopyingFromBot(bot)
    setKillPreviousBot(false)
    setShowAddDialog(true)
  }

  const handleToggleState = async (bot: BotInstance) => {
    const newState = bot.desired_state === 'running' ? 'stopped' : 'running'
    
    try {
      const supabase = createClient()
      const updateData: any = { desired_state: newState }
      
      // Jeśli uruchamiamy bota, musimy mieć server_id
      if (newState === 'running' && !bot.server_id) {
        alert('❌ Bot musi mieć przypisany server_id aby go uruchomić. Użyj edycji.')
        return
      }

      // Jeśli uruchamiamy bota, sprawdź czy jest miejsce na serwerze
      if (newState === 'running' && bot.server_id) {
        const server = servers.find(s => s.id === bot.server_id)
        if (server) {
          const isFull = server.desired_running >= server.available_slots
          if (isFull) {
            alert(`❌ Serwer ${bot.server_id} jest pełny (${server.desired_running}/${server.available_slots}). Wybierz inny serwer.`)
            return
          }
        }
      }

      const { error } = await supabase
        .from('bot_instances')
        .update(updateData)
        .eq('id', bot.id)

      if (error) throw error

      alert(`✅ Bot ${newState === 'running' ? 'uruchomiony' : 'zatrzymany'}!`)
      fetchBots()
      fetchServers()
    } catch (err: any) {
      console.error('Error toggling bot state:', err)
      alert(`❌ Błąd: ${err.message}`)
    }
  }

  const visibleColumnDefs = allColumns.filter(col => visibleColumns.has(col.key))

  const runningCount = bots.filter(b => b.actual_state === 'running').length
  const stoppedCount = bots.filter(b => b.actual_state === 'stopped').length
  const errorCount = bots.filter(b => b.actual_state === 'error').length

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Boty 2.0</h2>
          <p className="text-muted-foreground">
            Instancje botów z tabeli bot_instances
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj bota
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3 className="h-4 w-4 mr-2" />
                Kolumny ({visibleColumns.size}/{allColumns.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px] max-h-[500px] overflow-y-auto">
              <DropdownMenuLabel>Zarządzaj kolumnami</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex gap-2 px-2 pb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={showDefaultColumns}
                >
                  Domyślne
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={toggleAllColumns}
                >
                  {visibleColumns.size === allColumns.length ? 'Ukryj wszystkie' : 'Wszystkie'}
                </Button>
              </div>
              <DropdownMenuSeparator />
              {allColumns.map(column => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.has(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                  disabled={column.key === 'actions'}
                >
                  {column.label}
                  {column.key === 'actions' && <span className="ml-2 text-xs text-muted-foreground">(zawsze widoczna)</span>}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {Object.keys(filters).length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Wyczyść filtry
            </Button>
          )}
          
          <Button onClick={fetchBots} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łącznie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.length}</div>
            <p className="text-xs text-muted-foreground">Po filtrach: {processedBots.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uruchomione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{runningCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zatrzymane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stoppedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Błędy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista instancji botów</CardTitle>
          <CardDescription>
            Wszystkie boty z bazy danych - kliknij nagłówek aby sortować, włącz filtry aby wyszukiwać
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">
                ❌ Błąd: {error}
              </p>
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak botów w bazie danych
            </div>
          ) : (
            <div className="space-y-2">
              {/* Górny scrollbar */}
              <div 
                ref={topScrollRef}
                className="overflow-x-auto overflow-y-hidden"
                style={{ height: '17px' }}
              >
                <div ref={topScrollContentRef} style={{ height: '1px' }} />
              </div>
              
              {/* Główna tabela */}
              <div ref={tableScrollRef} className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {visibleColumnDefs.map(column => (
                      <th 
                        key={column.key} 
                        className={`px-4 py-3 text-left font-medium ${column.key === 'actions' ? 'sticky left-0 z-10 bg-muted/50' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {column.key === 'actions' ? (
                            // Dla kolumny akcji tylko label bez sortowania/filtrowania
                            <span>{column.label}</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSort(column.key)}
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                {column.label}
                                {sortColumn === column.key ? (
                                  sortDirection === 'asc' ? (
                                    <ArrowUp className="h-3 w-3" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3" />
                                  )
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                                )}
                              </button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`h-6 w-6 p-0 ${filters[column.key] ? 'bg-primary text-primary-foreground' : ''}`}
                                  >
                                    <Filter className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[250px]">
                                  <DropdownMenuLabel>Filtruj: {column.label}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <div className="p-2">
                                    <Input
                                      placeholder="Wpisz tekst..."
                                      value={filters[column.key] || ''}
                                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                                      className="h-8"
                                      autoFocus
                                    />
                                    {filters[column.key] && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => handleFilterChange(column.key, '')}
                                      >
                                        <X className="h-3 w-3 mr-2" />
                                        Wyczyść
                                      </Button>
                                    )}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedBots.map((bot) => (
                    <tr key={bot.id} className="border-b hover:bg-muted/50">
                      {visibleColumnDefs.map(column => {
                        const value = column.getValue(bot)
                        const displayValue = column.format ? column.format(value) : value
                        
                        // Special rendering for actions column
                        if (column.key === 'actions') {
                          return (
                            <td key={column.key} className="px-4 py-3 sticky left-0 z-10 bg-background">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(bot)}
                                  title="Edytuj"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(bot)}
                                  title="Usuń"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopy(bot)}
                                  title="Kopiuj"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={bot.desired_state === 'running' ? 'destructive' : 'default'}
                                  onClick={() => handleToggleState(bot)}
                                  title={bot.desired_state === 'running' ? 'Zatrzymaj' : 'Uruchom'}
                                >
                                  {bot.desired_state === 'running' ? (
                                    <Square className="h-3 w-3" />
                                  ) : (
                                    <Play className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          )
                        }
                        
                        // Special rendering for state columns
                        if (column.key === 'desired_state' || column.key === 'actual_state') {
                          return (
                            <td key={column.key} className="px-4 py-3">
                              <Badge variant={
                                value === 'running' ? 'default' :
                                value === 'stopped' ? 'secondary' :
                                value === 'error' ? 'destructive' : 'outline'
                              }>
                                {value === 'running' ? '▶️' : value === 'stopped' ? '⏸️' : '❌'} {value}
                              </Badge>
                            </td>
                          )
                        }
                        
                        // Special rendering for boolean columns
                        if (column.key === 'DRY_RUN' || column.key === 'STRATEGY_ENABLED' || column.key === 'BUY_OPPOSITE') {
                          return (
                            <td key={column.key} className="px-4 py-3">
                              {value ? (
                                <Badge variant="outline">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </td>
                          )
                        }
                        
                        return (
                          <td key={column.key} className="px-4 py-3 font-mono text-xs">
                            {displayValue !== null && displayValue !== undefined ? String(displayValue) : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog dodawania bota */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBot ? 'Edytuj bota' : copyingFromBot ? 'Kopiuj bota' : 'Dodaj nowego bota'}
            </DialogTitle>
            <DialogDescription>
              {editingBot 
                ? `Edytujesz bota: ${editingBot.instance_name}` 
                : copyingFromBot 
                ? `Tworzysz kopię bota: ${copyingFromBot.instance_name}` 
                : 'Wypełnij formularz aby dodać nową instancję bota'}
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-6" onSubmit={handleAddBot}>
            {/* Podstawowe informacje */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podstawowe informacje</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="owner_id">Owner ID</Label>
                  <Input
                    id="owner_id"
                    value={userId || 'Ładowanie...'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="desired_state">Desired State</Label>
                  <Select 
                    name="desired_state" 
                    value={formState.desiredState}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, desiredState: value }))}
                  >
                    <SelectTrigger id="desired_state">
                      <SelectValue placeholder="stopped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stopped">Stopped</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formState.desiredState === 'running' && (
                  <div className="space-y-2">
                    <Label htmlFor="server_id">Server ID</Label>
                    <Select 
                      name="server_id" 
                      value={formState.serverId}
                      onValueChange={(value) => setFormState(prev => ({ ...prev, serverId: value }))}
                      required={formState.desiredState === 'running'}
                    >
                      <SelectTrigger id="server_id">
                        <SelectValue placeholder="Wybierz serwer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {servers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Brak dostępnych serwerów
                          </div>
                        ) : (
                          servers.map(server => {
                            const isFull = server.desired_running >= server.available_slots
                            return (
                              <SelectItem 
                                key={server.id} 
                                value={server.id}
                                disabled={isFull}
                                className={isFull ? 'opacity-50' : ''}
                              >
                                {server.id} | {server.desired_running}/{server.available_slots}
                                {isFull && ' (pełny)'}
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strategy Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Strategy Config</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="nazwa">Nazwa (Strategy Name)</Label>
                  <AutocompleteInput
                    id="nazwa"
                    name="nazwa"
                    placeholder="LAX"
                    value={formState.strategyName}
                    onChange={(value) => setFormState(prev => ({ ...prev, strategyName: value }))}
                    suggestions={suggestions.strategyName}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dry_run">Dry Run</Label>
                  <Select 
                    name="dry_run" 
                    value={formState.dryRun}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, dryRun: value }))}
                  >
                    <SelectTrigger id="dry_run">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">False</SelectItem>
                      <SelectItem value="true">True</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order_size">Order Size</Label>
                  <AutocompleteInput
                    id="order_size"
                    name="order_size"
                    type="number"
                    placeholder="10"
                    value={formState.orderSize}
                    onChange={(value) => setFormState(prev => ({ ...prev, orderSize: value }))}
                    suggestions={suggestions.orderSize}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buy_opposite">Buy Opposite</Label>
                  <Select 
                    name="buy_opposite" 
                    value={formState.buyOpposite}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, buyOpposite: value }))}
                  >
                    <SelectTrigger id="buy_opposite">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy_mode">Strategy Mode</Label>
                  <Select 
                    name="strategy_mode" 
                    value={formState.strategyMode || 'MOMENTUM'}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, strategyMode: value }))}
                  >
                    <SelectTrigger id="strategy_mode">
                      <SelectValue placeholder="Wybierz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOMENTUM">MOMENTUM</SelectItem>
                      <SelectItem value="UP">UP</SelectItem>
                      <SelectItem value="DOWN">DOWN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crypto">Crypto</Label>
                  <Select 
                    name="crypto" 
                    defaultValue="Bitcoin"
                    onValueChange={(value) => setFormState(prev => ({ ...prev, crypto: value }))}
                  >
                    <SelectTrigger id="crypto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="Ethereum">Ethereum (ETH)</SelectItem>
                      <SelectItem value="Solana">Solana (SOL)</SelectItem>
                      <SelectItem value="XRP">XRP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="market_interval">Market Interval</Label>
                  <Select 
                    name="market_interval" 
                    defaultValue="5m"
                    onValueChange={(value) => setFormState(prev => ({ ...prev, interval: value }))}
                  >
                    <SelectTrigger id="market_interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">5 minut (5m)</SelectItem>
                      <SelectItem value="15m">15 minut (15m)</SelectItem>
                      <SelectItem value="1h">1 godzina (1h)</SelectItem>
                      <SelectItem value="4h">4 godziny (4h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                
                <div className="space-y-2">
                  <Label htmlFor="exit_price">Exit Price</Label>
                  <AutocompleteInput
                    id="exit_price"
                    name="exit_price"
                    type="number"
                    step="0.01"
                    placeholder="0.99"
                    value={formState.exitPrice}
                    onChange={(value) => setFormState(prev => ({ ...prev, exitPrice: value }))}
                    suggestions={suggestions.exitPrice}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_spread">Max Spread</Label>
                  <AutocompleteInput
                    id="max_spread"
                    name="max_spread"
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={formState.maxSpread}
                    onChange={(value) => setFormState(prev => ({ ...prev, maxSpread: value }))}
                    suggestions={suggestions.maxSpread}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entry_threshold">Entry Threshold</Label>
                  <AutocompleteInput
                    id="entry_threshold"
                    name="entry_threshold"
                    type="number"
                    step="0.01"
                    placeholder="0.6"
                    value={formState.entryThreshold}
                    onChange={(value) => setFormState(prev => ({ ...prev, entryThreshold: value }))}
                    suggestions={suggestions.entryThreshold}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="momentum_threshold">Momentum Threshold</Label>
                  <AutocompleteInput
                    id="momentum_threshold"
                    name="momentum_threshold"
                    type="number"
                    step="0.01"
                    placeholder="0.45"
                    value={String(formState.momentumThreshold)}
                    onChange={(value) => setFormState(prev => ({ ...prev, momentumThreshold: parseFloat(value) || 0 }))}
                    suggestions={suggestions.momentumThreshold}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="velocity_min_ticks">Velocity Min Ticks</Label>
                  <AutocompleteInput
                    id="velocity_min_ticks"
                    name="velocity_min_ticks"
                    type="number"
                    placeholder="2"
                    value={formState.velocityMinTicks}
                    onChange={(value) => setFormState(prev => ({ ...prev, velocityMinTicks: value }))}
                    suggestions={suggestions.velocityMinTicks}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="velocity_min_increase">Velocity Min Increase</Label>
                  <AutocompleteInput
                    id="velocity_min_increase"
                    name="velocity_min_increase"
                    type="number"
                    step="0.01"
                    placeholder="0.01"
                    value={formState.velocityMinIncrease}
                    onChange={(value) => setFormState(prev => ({ ...prev, velocityMinIncrease: value }))}
                    suggestions={suggestions.velocityMinIncrease}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exit_before_close_sec">Exit Before Close (sec)</Label>
                  <AutocompleteInput
                    id="exit_before_close_sec"
                    name="exit_before_close_sec"
                    type="number"
                    placeholder="-1"
                    value={formState.exitBeforeCloseSec}
                    onChange={(value) => setFormState(prev => ({ ...prev, exitBeforeCloseSec: value }))}
                    suggestions={suggestions.exitBeforeCloseSec}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="warmup_delay_sec">Warmup Delay (sec)</Label>
                  <AutocompleteInput
                    id="warmup_delay_sec"
                    name="warmup_delay_sec"
                    type="number"
                    placeholder="0"
                    value={formState.warmupDelaySec}
                    onChange={(value) => setFormState(prev => ({ ...prev, warmupDelaySec: value }))}
                    suggestions={suggestions.warmupDelaySec}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_time_remaining">Min Time Remaining</Label>
                  <AutocompleteInput
                    id="min_time_remaining"
                    name="min_time_remaining"
                    type="number"
                    placeholder="0"
                    value={formState.minTimeRemaining}
                    onChange={(value) => setFormState(prev => ({ ...prev, minTimeRemaining: value }))}
                    suggestions={suggestions.minTimeRemaining}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_reversal_entry_price">Max Reversal Entry Price</Label>
                  <AutocompleteInput
                    id="max_reversal_entry_price"
                    name="max_reversal_entry_price"
                    type="number"
                    step="0.01"
                    placeholder="0.99"
                    value={formState.maxReversalEntryPrice}
                    onChange={(value) => setFormState(prev => ({ ...prev, maxReversalEntryPrice: value }))}
                    suggestions={suggestions.maxReversalEntryPrice}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="momentum_confirmation_sec">Momentum Confirmation (sec)</Label>
                  <AutocompleteInput
                    id="momentum_confirmation_sec"
                    name="momentum_confirmation_sec"
                    type="number"
                    placeholder="0"
                    value={String(formState.momentumConfirmationSec)}
                    onChange={(value) => setFormState(prev => ({ ...prev, momentumConfirmationSec: parseInt(value) || 0 }))}
                    suggestions={suggestions.momentumConfirmationSec}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="momentum_confirmation_tolerance">Momentum Confirmation Tolerance</Label>
                  <AutocompleteInput
                    id="momentum_confirmation_tolerance"
                    name="momentum_confirmation_tolerance"
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={formState.momentumConfirmationTolerance}
                    onChange={(value) => setFormState(prev => ({ ...prev, momentumConfirmationTolerance: value }))}
                    suggestions={suggestions.momentumConfirmationTolerance}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy_enabled">Strategy Enabled</Label>
                  <Select 
                    name="strategy_enabled" 
                    value={formState.strategyEnabled}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, strategyEnabled: value }))}
                  >
                    <SelectTrigger id="strategy_enabled">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                
                <div className="space-y-2">
                  <Label htmlFor="stop_loss" className="text-muted-foreground">Stop Loss</Label>
                  <AutocompleteInput
                    id="stop_loss"
                    name="stop_loss"
                    type="number"
                    step="0.01"
                    placeholder="null"
                    value={formState.stopLoss}
                    onChange={(value) => setFormState(prev => ({ ...prev, stopLoss: value }))}
                    suggestions={suggestions.stopLoss}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_reentries" className="text-muted-foreground">Max Reentries</Label>
                  <AutocompleteInput
                    id="max_reentries"
                    name="max_reentries"
                    type="number"
                    placeholder="null"
                    value={formState.maxReentries}
                    onChange={(value) => setFormState(prev => ({ ...prev, maxReentries: value }))}
                    suggestions={suggestions.maxReentries}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exit_max_retries" className="text-muted-foreground">Exit Max Retries</Label>
                  <AutocompleteInput
                    id="exit_max_retries"
                    name="exit_max_retries"
                    type="number"
                    placeholder="null"
                    value={formState.exitMaxRetries}
                    onChange={(value) => setFormState(prev => ({ ...prev, exitMaxRetries: value }))}
                    suggestions={suggestions.exitMaxRetries}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exit_price_decrement" className="text-muted-foreground">Exit Price Decrement</Label>
                  <AutocompleteInput
                    id="exit_price_decrement"
                    name="exit_price_decrement"
                    type="number"
                    step="0.01"
                    placeholder="null"
                    value={formState.exitPriceDecrement}
                    onChange={(value) => setFormState(prev => ({ ...prev, exitPriceDecrement: value }))}
                    suggestions={suggestions.exitPriceDecrement}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aggressive_exit_underbid" className="text-muted-foreground">Aggressive Exit Underbid</Label>
                  <AutocompleteInput
                    id="aggressive_exit_underbid"
                    name="aggressive_exit_underbid"
                    type="number"
                    step="0.01"
                    placeholder="null"
                    value={formState.aggressiveExitUnderbid}
                    onChange={(value) => setFormState(prev => ({ ...prev, aggressiveExitUnderbid: value }))}
                    suggestions={suggestions.aggressiveExitUnderbid}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="momentum_confirmation_method" className="text-muted-foreground">Momentum Confirmation Method</Label>
                  <Select 
                    name="momentum_confirmation_method" 
                    value={formState.momentumConfirmationMethod || 'CONTINUOUS'}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, momentumConfirmationMethod: value }))}
                  >
                    <SelectTrigger id="momentum_confirmation_method">
                      <SelectValue placeholder="Wybierz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTINUOUS">CONTINUOUS</SelectItem>
                      <SelectItem value="ONCE">ONCE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="bot_instance">Bot Instance (generowany automatycznie)</Label>
                  <Input
                    id="bot_instance"
                    name="bot_instance"
                    value={generatedInstanceName}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generated Config - tylko przy dodawaniu/kopiowaniu, nie przy edycji */}
            {!editingBot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wygenerowany config</CardTitle>
                  <CardDescription>
                    Pełna konfiguracja, która zostanie zapisana do bazy danych
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="config_preview">Generated Configuration</Label>
                    <textarea
                      id="config_preview"
                      value={generatedConfig ? JSON.stringify(generatedConfig, null, 2) : 'Wypełnij wymagane pola...'}
                      disabled
                      rows={20}
                      className="w-full bg-muted font-mono text-xs p-3 rounded-md resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checkbox "zabij poprzedniego bota" - tylko przy kopiowaniu */}
            {copyingFromBot && (
              <div className="flex items-center space-x-2 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <Checkbox
                  id="kill_previous"
                  checked={killPreviousBot}
                  onCheckedChange={(checked) => setKillPreviousBot(checked as boolean)}
                />
                <Label
                  htmlFor="kill_previous"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <span className="text-2xl">☠️</span>
                  Zabij poprzedniego bota (ustaw desired_state na stopped)
                </Label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Anuluj
              </Button>
              <Button type="submit">
                {editingBot ? 'Zapisz zmiany' : copyingFromBot ? 'Utwórz kopię' : 'Dodaj bota'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pl-PL')
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Skull } from 'lucide-react'
import { BotData } from '@/types/bots'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'

interface AddBotDialogProps {
  initialData?: Partial<BotData>
  sourceBotId?: number
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function AddBotDialog({ initialData, sourceBotId, trigger, onSuccess }: AddBotDialogProps) {
  const [open, setOpen] = useState(false)
  const [killPreviousBot, setKillPreviousBot] = useState(false)
  const [desiredState, setDesiredState] = useState<'running' | 'stopped'>('stopped')
  const [userId, setUserId] = useState<string>('')
  const [nextBotId, setNextBotId] = useState<number>(1)
  
  const getInitialFormData = (): Partial<BotData> => ({
    bot: 0,
    status: 'WAITING' as 'LIVE' | 'END' | 'WAITING',
    owner: 'auto', // Będzie użyte user.id z sesji
    mode: 'Auto',
    // WYNIKI - domyślne wartości 0
    averageRate: 0,
    positionsOnTime: 0,
    transactions: 0,
    missing: 0,
    noReversalMomentum: 0,
    lost: 0,
    won: 0,
    wonPerTransactions: 0,
    wonPerPositions: 0,
    edge: 0,
    balance: 0,
    averageEntry: 0,
    profitPerPosition: 0,
    profitPerDay: 0,
    roiPerDay: 0,
    profitPerMonth: 0,
    roiPerMonth: 0,
    // KONFIGURACJA
    botInstance: '',
    dryRun: false,
    crypto: 'Bitcoin',
    interval: '5 minut',
    strategyName: '',
    orderSize: 0,
    strategyMode: 'MOMENTUM',
    buyOpposite: '',
    exitPrice: 0,
    exitBeforeCloseSec: 0,
    momentumThreshold: 0,
    entryThreshold: 0,
    maxReversalEntryPrice: '',
    momentumConfirmationSec: 0,
    momentumConfirmationTolerance: 0,
    momentumConfirmationMethod: '',
    velocityMinTicks: 0,
    velocityMinIncrease: 0,
    maxSpread: 0,
    warmupDelaySec: 0,
    minTimeRemaining: 0,
    maxReentries: 0,
    stopLoss: '',
    aggressiveExitUnderbid: 0,
    exitMaxRetries: 0,
    exitPriceDecrement: 0,
    config: '',
    serverIp: ''
  })

  const [formData, setFormData] = useState<Partial<BotData>>(getInitialFormData())

  // Pobierz user.id z sesji - tylko raz przy montowaniu
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  // Obsługa otwarcia/zamknięcia dialogu i pobierania następnego bot ID
  useEffect(() => {
    const fetchNextBotId = async () => {
      const supabase = createClient()
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
    }
    
    if (open) {
      fetchNextBotId()
      
      if (initialData) {
        setFormData({ ...getInitialFormData(), ...initialData, bot: 0 })
        setDesiredState('stopped')
      }
    } else {
      setFormData(getInitialFormData())
      setKillPreviousBot(false)
      setDesiredState('stopped')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Walidacja wymaganych pól
    if (!formData.botInstance) {
      alert('❌ Bot Instance jest wymagany! Kliknij przycisk "🤖 Generuj"')
      return
    }
    
    // Przygotuj dane do wysłania - tylko pola potrzebne dla strategy_config
    const dataToSend = {
      botInstance: formData.botInstance, // używamy nazwy botInstance, backend zmapuje na instance_name
      desiredState,
      killPreviousBot,
      sourceBotId,
      // Pola konfiguracyjne
      crypto: formData.crypto,
      interval: formData.interval,
      strategyName: formData.strategyName,
      dryRun: formData.dryRun,
      orderSize: formData.orderSize,
      strategyMode: formData.strategyMode,
      buyOpposite: formData.buyOpposite,
      exitPrice: formData.exitPrice,
      exitBeforeCloseSec: formData.exitBeforeCloseSec,
      momentumThreshold: formData.momentumThreshold,
      entryThreshold: formData.entryThreshold,
      maxReversalEntryPrice: formData.maxReversalEntryPrice,
      momentumConfirmationSec: formData.momentumConfirmationSec,
      momentumConfirmationTolerance: formData.momentumConfirmationTolerance,
      momentumConfirmationMethod: formData.momentumConfirmationMethod,
      velocityMinTicks: formData.velocityMinTicks,
      velocityMinIncrease: formData.velocityMinIncrease,
      maxSpread: formData.maxSpread,
      warmupDelaySec: formData.warmupDelaySec,
      minTimeRemaining: formData.minTimeRemaining,
      maxReentries: formData.maxReentries,
      stopLoss: formData.stopLoss,
      aggressiveExitUnderbid: formData.aggressiveExitUnderbid,
      exitMaxRetries: formData.exitMaxRetries,
      exitPriceDecrement: formData.exitPriceDecrement
    }
    
    console.log('Sending bot data to API:', dataToSend)
    
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Błąd podczas zapisywania bota')
      }

      console.log('Bot saved successfully:', result)
      alert(`✅ Bot zapisany pomyślnie! ${killPreviousBot && sourceBotId ? `\n💀 Bot ${sourceBotId} zostanie zabity!` : ''}`)
      setOpen(false)
      
      // Wywołaj callback aby odświeżyć listę botów
      if (onSuccess) {
        onSuccess()
      } else {
        // Fallback - przeładuj stronę jeśli nie ma callbacka
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Error saving bot:', error)
      alert(`❌ Błąd: ${error.message}`)
    }
  }

  const updateField = (field: keyof BotData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Generuj config w formacie JSON
  const generateConfig = () => {
    const cryptoMap: Record<string, string> = {
      'Bitcoin': 'btc',
      'Ethereum': 'eth',
      'Solana': 'sol',
      'XRP': 'xrp'
    }
    
    const intervalMap: Record<string, string> = {
      '5 minut': '5m',
      '15 minut': '15m',
      '1 godzina': '1h',
      '4 godziny': '4h'
    }
    
    const cryptoShort = cryptoMap[formData.crypto || ''] || 'btc'
    const intervalShort = intervalMap[formData.interval || ''] || '5m'
    
    return {
      BASE_SERIES_SLUG: `${cryptoShort}-updown-${intervalShort}`,
      MARKET_INTERVAL: intervalShort,
      STRATEGY_ENABLED: true,
      BOT_INSTANCE: formData.botInstance || '',
      DRY_RUN: formData.dryRun || false,
      Nazwa: formData.strategyName || '',
      ORDER_SIZE: formData.orderSize || 0,
      STRATEGY_MODE: formData.strategyMode || '',
      BUY_OPPOSITE: formData.buyOpposite || '',
      EXIT_PRICE: formData.exitPrice || 0,
      EXIT_BEFORE_CLOSE_SEC: formData.exitBeforeCloseSec || -1,
      MOMENTUM_THRESHOLD: formData.momentumThreshold || 0,
      ENTRY_THRESHOLD: formData.entryThreshold || 0,
      MAX_REVERSAL_ENTRY_PRICE: formData.maxReversalEntryPrice || '',
      MOMENTUM_CONFIRMATION_SEC: formData.momentumConfirmationSec || 0,
      MOMENTUM_CONFIRMATION_TOLERANCE: formData.momentumConfirmationTolerance || 0,
      MOMENTUM_CONFIRMATION_METHOD: formData.momentumConfirmationMethod || '',
      VELOCITY_MIN_TICKS: formData.velocityMinTicks || 0,
      VELOCITY_MIN_INCREASE: formData.velocityMinIncrease || 0,
      MAX_SPREAD: formData.maxSpread || 0,
      WARMUP_DELAY_SEC: formData.warmupDelaySec || 0,
      MIN_TIME_REMAINING: formData.minTimeRemaining || 0,
      MAX_REENTRIES: formData.maxReentries || 0,
      STOP_LOSS: formData.stopLoss || '',
      AGGRESSIVE_EXIT_UNDERBID: formData.aggressiveExitUnderbid || 0,
      EXIT_MAX_RETRIES: formData.exitMaxRetries || 0,
      EXIT_PRICE_DECREMENT: formData.exitPriceDecrement || 0,
      SECRETS_PATH: `/srv/polymarket/users/${userId}/.secrets`
    }
  }

  // Oblicz preview tylko gdy zmienią się zależności
  const botInstancePreview = useMemo(() => {
    const { crypto, interval, strategyName, momentumConfirmationSec, momentumThreshold } = formData
    
    if (!userId) {
      return 'Ładowanie user.id...'
    }
    
    if (!crypto || !interval || !strategyName) {
      const missing = []
      if (!crypto) missing.push('Crypto')
      if (!interval) missing.push('Interwał')
      if (!strategyName) missing.push('Strategia')
      
      return missing.join(', ')
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
      '5 minut': '5m',
      '15 minut': '15m',
      '1 godzina': '1h',
      '4 godziny': '4h'
    }

    const cryptoShort = cryptoMap[crypto] || crypto.toLowerCase().substring(0, 3)
    const intervalShort = intervalMap[interval] || interval
    const strategyLower = strategyName.toLowerCase()
    const momentumSec = momentumConfirmationSec || 0
    const momentumThresh = Math.round((momentumThreshold || 0) * 100)
    
    // Format: {user.id}--{crypto}-{interval}-{strategia}-d{momentum_sec}-{threshold*100}--{nextBotId}
    return `${userId}--${cryptoShort}-${intervalShort}-${strategyLower}-d${momentumSec}-${momentumThresh}--${nextBotId}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.crypto, formData.interval, formData.strategyName, formData.momentumConfirmationSec, formData.momentumThreshold, userId, nextBotId])

  const handleGenerateBotInstance = () => {
    const result = botInstancePreview
    
    // Jeśli result zawiera nazwy brakujących pól lub jest komunikatem błędu
    if (!result || result.includes(',') || result.includes('Ładowanie') || result.includes('Brakujące')) {
      alert(`Wypełnij najpierw brakujące pola:\n${result || 'Crypto, Interwał, Strategia'}`)
      return
    }
    
    updateField('botInstance', result)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj bota
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{sourceBotId ? `Kopiuj bota #${sourceBotId}` : 'Dodaj nowego bota'}</DialogTitle>
          <DialogDescription>
            {sourceBotId ? 'Konfiguracja została skopiowana. Dostosuj ustawienia.' : 'Wprowadź konfigurację dla nowego bota tradingowego'}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* INFO */}
            <Card>
        <CardHeader>
          <CardTitle>Informacje podstawowe</CardTitle>
          <CardDescription>Podstawowe dane o bocie</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="owner">Owner (z logowania)</Label>
            <Input
              id="owner"
              value={userId || 'Ładowanie...'}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desiredState">Stan początkowy *</Label>
            <Select value={desiredState} onValueChange={(value: 'running' | 'stopped') => setDesiredState(value)}>
              <SelectTrigger id="desiredState">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stopped">🛑 Stopped (zatrzymany)</SelectItem>
                <SelectItem value="running">▶️ Running (uruchomiony)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Zabij poprzedniego bota - tylko gdy kopiujemy */}
      {sourceBotId && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-red-600" />
              Zabij poprzedniego bota?
            </CardTitle>
            <CardDescription>
              💀 Zdecyduj czy bot #{sourceBotId} powinien zostać zabity po utworzeniu nowego
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="killPrevious">Akcja</Label>
              <Select 
                value={killPreviousBot ? 'kill' : 'keep'} 
                onValueChange={(value) => setKillPreviousBot(value === 'kill')}
              >
                <SelectTrigger id="killPrevious">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">✅ Zostaw bota #{sourceBotId} przy życiu</SelectItem>
                  <SelectItem value="kill">💀 ZABIJ BOTA #{sourceBotId} (R.I.P. 🪦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KONFIGURACJA - Podstawowa */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguracja podstawowa</CardTitle>
          <CardDescription>Podstawowe ustawienia bota</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="botInstance">Bot Instance *</Label>
            <div className="flex gap-2">
              <Input
                id="botInstance"
                required
                value={formData.botInstance}
                onChange={(e) => updateField('botInstance', e.target.value)}
                placeholder="np. damian--btc-15m-reversal-d20-25-A"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateBotInstance}
                className="whitespace-nowrap"
              >
                🤖 Generuj
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                // Sprawdź czy to prawidłowa nazwa (zawiera podwójne myślniki) czy komunikat błędu
                if (botInstancePreview && botInstancePreview.includes('--') && !botInstancePreview.includes(',') && !botInstancePreview.includes('Ładowanie')) {
                  return <>Podgląd: <span className="font-mono text-emerald-600 dark:text-emerald-400">{botInstancePreview}</span></>
                } else if (botInstancePreview && (botInstancePreview.includes(',') || botInstancePreview.includes('Brakujące'))) {
                  return <>❌ Brakujące pola: <span className="text-red-600 dark:text-red-400 font-semibold">{botInstancePreview}</span></>
                } else if (botInstancePreview && botInstancePreview.includes('Ładowanie')) {
                  return <>⏳ {botInstancePreview}</>
                } else {
                  return <>Format: {'{user.id}'}--{'{crypto}'}-{'{interval}'}-{'{strategia}'}-d{'{momentum_sec}'}-{'{threshold*100}'}--{'{bot_id}'}</>
                }
              })()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crypto">Crypto *</Label>
            <Select value={formData.crypto} onValueChange={(value) => updateField('crypto', value)} required>
              <SelectTrigger id="crypto">
                <SelectValue placeholder="Wybierz kryptowalutę" />
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
            <Label htmlFor="interval">Interwał *</Label>
            <Select value={formData.interval} onValueChange={(value) => updateField('interval', value)} required>
              <SelectTrigger id="interval">
                <SelectValue placeholder="Wybierz interwał" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5 minut">5 minut (5m)</SelectItem>
                <SelectItem value="15 minut">15 minut (15m)</SelectItem>
                <SelectItem value="1 godzina">1 godzina (1h)</SelectItem>
                <SelectItem value="4 godziny">4 godziny (4h)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategyName">Strategia *</Label>
            <Input
              id="strategyName"
              required
              value={formData.strategyName}
              onChange={(e) => updateField('strategyName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderSize">Wielkość zlecenia *</Label>
            <Input
              id="orderSize"
              type="number"
              step="0.01"
              required
              value={formData.orderSize}
              onChange={(e) => updateField('orderSize', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategyMode">Tryb strategii</Label>
            <Select value={formData.strategyMode} onValueChange={(value) => updateField('strategyMode', value)}>
              <SelectTrigger id="strategyMode">
                <SelectValue placeholder="Wybierz tryb strategii" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOWN">DOWN</SelectItem>
                <SelectItem value="UP">UP</SelectItem>
                <SelectItem value="MOMENTUM">MOMENTUM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dryRun">Dry Run</Label>
            <Select 
              value={formData.dryRun ? 'true' : 'false'} 
              onValueChange={(value) => updateField('dryRun', value === 'true')}
            >
              <SelectTrigger id="dryRun">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KONFIGURACJA - Wyjście i ceny */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguracja wyjścia i cen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="exitPrice">Exit Price</Label>
            <Input
              id="exitPrice"
              type="number"
              step="0.01"
              value={formData.exitPrice}
              onChange={(e) => updateField('exitPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitBeforeCloseSec">Exit Before Close (sek)</Label>
            <Input
              id="exitBeforeCloseSec"
              type="number"
              value={formData.exitBeforeCloseSec}
              onChange={(e) => updateField('exitBeforeCloseSec', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyOpposite">Buy Opposite</Label>
            <Input
              id="buyOpposite"
              value={formData.buyOpposite}
              onChange={(e) => updateField('buyOpposite', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aggressiveExitUnderbid">Aggressive Exit Underbid</Label>
            <Input
              id="aggressiveExitUnderbid"
              type="number"
              step="0.01"
              value={formData.aggressiveExitUnderbid}
              onChange={(e) => updateField('aggressiveExitUnderbid', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitMaxRetries">Exit Max Retries</Label>
            <Input
              id="exitMaxRetries"
              type="number"
              value={formData.exitMaxRetries}
              onChange={(e) => updateField('exitMaxRetries', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitPriceDecrement">Exit Price Decrement</Label>
            <Input
              id="exitPriceDecrement"
              type="number"
              step="0.01"
              value={formData.exitPriceDecrement}
              onChange={(e) => updateField('exitPriceDecrement', parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* KONFIGURACJA - Momentum i thresholdy */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguracja momentum i progów</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="momentumThreshold">Momentum Threshold</Label>
            <Input
              id="momentumThreshold"
              type="number"
              step="0.01"
              value={formData.momentumThreshold}
              onChange={(e) => updateField('momentumThreshold', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryThreshold">Entry Threshold</Label>
            <Input
              id="entryThreshold"
              type="number"
              step="0.01"
              value={formData.entryThreshold}
              onChange={(e) => updateField('entryThreshold', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxReversalEntryPrice">Max Reversal Entry Price</Label>
            <Input
              id="maxReversalEntryPrice"
              value={formData.maxReversalEntryPrice}
              onChange={(e) => updateField('maxReversalEntryPrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="momentumConfirmationSec">Momentum Confirmation (sek)</Label>
            <Input
              id="momentumConfirmationSec"
              type="number"
              value={formData.momentumConfirmationSec}
              onChange={(e) => updateField('momentumConfirmationSec', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="momentumConfirmationTolerance">Momentum Confirmation Tolerance</Label>
            <Input
              id="momentumConfirmationTolerance"
              type="number"
              step="0.01"
              value={formData.momentumConfirmationTolerance}
              onChange={(e) => updateField('momentumConfirmationTolerance', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="momentumConfirmationMethod">Momentum Confirmation Method</Label>
            <Select 
              value={formData.momentumConfirmationMethod} 
              onValueChange={(value) => updateField('momentumConfirmationMethod', value)}
            >
              <SelectTrigger id="momentumConfirmationMethod">
                <SelectValue placeholder="Wybierz metodę" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTINUOUS">CONTINUOUS</SelectItem>
                <SelectItem value="ONCE">ONCE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KONFIGURACJA - Velocity i spread */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguracja velocity i spread</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="velocityMinTicks">Velocity Min Ticks</Label>
            <Input
              id="velocityMinTicks"
              type="number"
              value={formData.velocityMinTicks}
              onChange={(e) => updateField('velocityMinTicks', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="velocityMinIncrease">Velocity Min Increase</Label>
            <Input
              id="velocityMinIncrease"
              type="number"
              step="0.01"
              value={formData.velocityMinIncrease}
              onChange={(e) => updateField('velocityMinIncrease', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSpread">Max Spread</Label>
            <Input
              id="maxSpread"
              type="number"
              step="0.01"
              value={formData.maxSpread}
              onChange={(e) => updateField('maxSpread', parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* KONFIGURACJA - Timing i limity */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguracja timing i limity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="warmupDelaySec">Warmup Delay (sek)</Label>
            <Input
              id="warmupDelaySec"
              type="number"
              value={formData.warmupDelaySec}
              onChange={(e) => updateField('warmupDelaySec', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minTimeRemaining">Min Time Remaining</Label>
            <Input
              id="minTimeRemaining"
              type="number"
              value={formData.minTimeRemaining}
              onChange={(e) => updateField('minTimeRemaining', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxReentries">Max Reentries</Label>
            <Input
              id="maxReentries"
              type="number"
              value={formData.maxReentries}
              onChange={(e) => updateField('maxReentries', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopLoss">Stop Loss</Label>
            <Input
              id="stopLoss"
              value={formData.stopLoss}
              onChange={(e) => updateField('stopLoss', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* KONFIGURACJA - Wygenerowany Config */}
      <Card>
        <CardHeader>
          <CardTitle>Wygenerowana konfiguracja</CardTitle>
          <CardDescription>
            Config wygenerowany automatycznie na podstawie ustawień (tylko do podglądu)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generatedConfig">Strategy Config (JSON)</Label>
            <Textarea
              id="generatedConfig"
              value={JSON.stringify(generateConfig(), null, 2)}
              disabled
              className="bg-muted text-muted-foreground font-mono text-xs"
              rows={20}
            />
          </div>
        </CardContent>
      </Card>

            {/* Przyciski */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit">
                Zapisz bota
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

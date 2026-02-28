import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Pobierz zalogowanego użytkownika
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - musisz być zalogowany' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Mapowanie crypto na skróty dla BASE_SERIES_SLUG
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
    
    const cryptoShort = cryptoMap[body.crypto] || body.crypto.toLowerCase().substring(0, 3)
    const intervalShort = intervalMap[body.interval] || body.interval
    const strategyLower = body.strategyName?.toLowerCase() || 'trend'
    
    // Użyj user.id jako owner
    const ownerId = user.id
    
    // Generuj config w formacie env variables jako JSON
    const strategyConfig = {
      BASE_SERIES_SLUG: `${cryptoShort}-updown-${intervalShort}`,
      MARKET_INTERVAL: intervalShort,
      STRATEGY_ENABLED: true,
      BOT_INSTANCE: body.botInstance,
      DRY_RUN: body.dryRun || false,
      Nazwa: body.strategyName,
      ORDER_SIZE: body.orderSize || 0,
      STRATEGY_MODE: body.strategyMode || '',
      BUY_OPPOSITE: body.buyOpposite || '',
      EXIT_PRICE: body.exitPrice || 0,
      EXIT_BEFORE_CLOSE_SEC: body.exitBeforeCloseSec || -1,
      MOMENTUM_THRESHOLD: body.momentumThreshold || 0,
      ENTRY_THRESHOLD: body.entryThreshold || 0,
      MAX_REVERSAL_ENTRY_PRICE: body.maxReversalEntryPrice || '',
      MOMENTUM_CONFIRMATION_SEC: body.momentumConfirmationSec || 0,
      MOMENTUM_CONFIRMATION_TOLERANCE: body.momentumConfirmationTolerance || 0,
      MOMENTUM_CONFIRMATION_METHOD: body.momentumConfirmationMethod || '',
      VELOCITY_MIN_TICKS: body.velocityMinTicks || 0,
      VELOCITY_MIN_INCREASE: body.velocityMinIncrease || 0,
      MAX_SPREAD: body.maxSpread || 0,
      WARMUP_DELAY_SEC: body.warmupDelaySec || 0,
      MIN_TIME_REMAINING: body.minTimeRemaining || 0,
      MAX_REENTRIES: body.maxReentries || 0,
      STOP_LOSS: body.stopLoss || '',
      AGGRESSIVE_EXIT_UNDERBID: body.aggressiveExitUnderbid || 0,
      EXIT_MAX_RETRIES: body.exitMaxRetries || 0,
      EXIT_PRICE_DECREMENT: body.exitPriceDecrement || 0,
      SECRETS_PATH: `/srv/polymarket/users/${ownerId}/.secrets`
    }
    
    // Przygotuj dane do zapisu
    const botData = {
      instance_name: body.botInstance, // Wymagane pole, unikalne
      owner_id: user.id,
      desired_state: body.desiredState || 'stopped',
      strategy_config: strategyConfig
    }

    console.log('Saving bot data:', botData)

    // Zapisz do bazy danych
    const { data, error } = await supabase
      .from('bot_instances')
      .insert([botData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Jeśli trzeba zabić poprzedniego bota
    if (body.killPreviousBot && body.sourceBotId) {
      console.log('Killing previous bot:', body.sourceBotId)
      await supabase
        .from('bot_instances')
        .update({ desired_state: 'stopped' })
        .eq('id', body.sourceBotId)
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

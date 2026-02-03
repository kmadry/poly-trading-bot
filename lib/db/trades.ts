import { createClient } from '@/lib/supabase/server'
import { Trade, TradeStats } from '@/types/database'

export async function getTrades(limit?: number): Promise<Trade[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('trades')
    .select('*')
    .order('timestamp', { ascending: false })
  
  // Jeśli podano limit, użyj go; inaczej pobierz wszystkie (max 1000 w Supabase)
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching trades:', error)
    return []
  }
  
  return data || []
}

export async function getTradeStats(): Promise<TradeStats> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('trades')
    .select('*')
  
  if (error) {
    console.error('Error fetching trade stats:', error)
    return {
      total: 0,
      totalBuys: 0,
      totalSells: 0,
      totalSkips: 0,
      totalPnL: 0,
      avgPrice: 0,
      winRate: 0
    }
  }
  
  const trades = data || []
  
  const totalBuys = trades.filter(t => t.type === 'BUY').length
  const totalSells = trades.filter(t => t.type === 'SELL').length
  const totalSkips = trades.filter(t => t.type === 'SKIP').length
  
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  
  const tradesWithPrice = trades.filter(t => t.price !== null)
  const avgPrice = tradesWithPrice.length > 0
    ? tradesWithPrice.reduce((sum, t) => sum + (t.price || 0), 0) / tradesWithPrice.length
    : 0
  
  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length
  const winRate = trades.length > 0 
    ? Math.round((profitableTrades / trades.length) * 100)
    : 0
  
  return {
    total: trades.length,
    totalBuys,
    totalSells,
    totalSkips,
    totalPnL,
    avgPrice,
    winRate
  }
}

export async function getRecentTrades(limit = 10): Promise<Trade[]> {
  return getTrades(limit)
}

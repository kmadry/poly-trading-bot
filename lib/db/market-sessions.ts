import { createClient } from '@/lib/supabase/server'
import { MarketSession } from '@/types/database'

export async function getMarketSessions(limit?: number): Promise<MarketSession[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('market_sessions')
    .select('*')
    .order('session_start', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching market sessions:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return []
  }
  
  console.log('Fetched market sessions:', data?.length || 0, 'sessions')
  if (data && data.length > 0) {
    console.log('First session:', JSON.stringify(data[0], null, 2))
  }
  
  return data || []
}

export async function getMarketSessionStats() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('market_sessions')
    .select('*')
  
  if (error) {
    console.error('Error fetching market session stats:', error)
    return {
      total: 0,
      totalPnL: 0,
      avgDuration: 0,
      totalTrades: 0
    }
  }
  
  const sessions = data || []
  
  const totalPnL = sessions.reduce((sum, s) => sum + (s.total_pnl || 0), 0)
  const totalTrades = sessions.reduce((sum, s) => {
    const entries = s.total_entries || 0
    const exits = s.total_exits || 0
    const skips = s.total_skips || 0
    return sum + entries + exits + skips
  }, 0)
  
  // Oblicz średni czas trwania sesji
  const sessionsWithEnd = sessions.filter(s => s.session_end !== null)
  const avgDuration = sessionsWithEnd.length > 0
    ? sessionsWithEnd.reduce((sum, s) => {
        const start = new Date(s.session_start).getTime()
        const end = new Date(s.session_end!).getTime()
        return sum + (end - start) / 1000 // w sekundach
      }, 0) / sessionsWithEnd.length
    : 0
  
  return {
    total: sessions.length,
    totalPnL,
    avgDuration: Math.round(avgDuration),
    totalTrades
  }
}

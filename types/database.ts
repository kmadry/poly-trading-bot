export type TradeType = 'BUY' | 'SELL' | 'SKIP' | string
export type TradeOutcome = 'YES' | 'NO' | string | null

export interface Trade {
  id: number
  bot_instance: string
  session_id: number | null
  timestamp: string // timestamptz from Supabase
  market_id: string | null
  market_slug: string
  market_question: string | null
  market_end_time: string | null // timestamptz from Supabase
  series_slug: string | null
  type: TradeType
  outcome: TradeOutcome
  price: number | null // numeric(10,4) from Supabase
  size: number | null // numeric(10,2) from Supabase
  shares: number | null // numeric(10,2) from Supabase
  order_id: string | null
  pnl: number | null // numeric(10,2) from Supabase - profit/loss
  result: string | null
  metadata: Record<string, any> | null // jsonb from Supabase
}

export interface TradeStats {
  total: number
  totalBuys: number
  totalSells: number
  totalSkips: number
  totalPnL: number
  avgPrice: number
  winRate: number
}

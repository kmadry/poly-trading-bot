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

export interface MarketSession {
  id: number
  bot_instance: string
  market_id: string
  market_slug: string
  market_question: string | null
  series_slug: string | null
  session_start: string
  session_end: string | null
  market_start_time: string | null
  market_end_time: string | null
  total_entries: number | null
  total_exits: number | null
  total_skips: number | null
  total_pnl: number | null
  initial_yes_price: number | null
  initial_no_price: number | null
  initial_spread: number | null
  final_outcome: string | null
  final_yes_price: number | null
  final_no_price: number | null
  strategy_config: Record<string, any> | null
  metadata: Record<string, any> | null
}

export interface BotData {
  // INFO
  bot: number
  status: 'LIVE' | 'END' | 'WAITING'
  owner: string
  mode: string
  
  // WYNIKI
  averageRate: number
  positionsOnTime: number
  transactions: number
  missing: number
  noReversalMomentum: number
  lost: number
  won: number
  wonPerTransactions: number
  wonPerPositions: number
  edge: number
  balance: number
  averageEntry: number
  profitPerPosition: number
  profitPerDay: number
  roiPerDay: number
  profitPerMonth: number
  roiPerMonth: number
  
  // KONFIGURACJA
  botInstance: string
  dryRun: boolean
  crypto: string
  interval: string
  strategyName: string
  orderSize: number
  strategyMode: string
  buyOpposite: string
  exitPrice: number
  exitBeforeCloseSec: number
  momentumThreshold: number
  entryThreshold: number
  maxReversalEntryPrice: string
  momentumConfirmationSec: number
  momentumConfirmationTolerance: number
  momentumConfirmationMethod: string
  velocityMinTicks: number
  velocityMinIncrease: number
  maxSpread: number
  warmupDelaySec: number
  minTimeRemaining: number
  maxReentries: number
  stopLoss: string
  aggressiveExitUnderbid: number
  exitMaxRetries: number
  exitPriceDecrement: number
  config: string
  serverIp: string
}

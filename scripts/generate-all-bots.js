/**
 * Skrypt do wygenerowania wszystkich 119 botów z danych użytkownika
 * Uruchom: node scripts/generate-all-bots.js > lib/data/bots-data-all.ts
 */

// Helper functions
const parsePercent = (str) => {
  if (!str || str === '#DIV/0!' || str === '0,0%' || str === '0%') return 0
  const cleaned = str.replace('%', '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num / 100
}

const parseCurrency = (str) => {
  if (!str || str === '#DIV/0!' || str === '$0,00' || str === '$0.00' || str === '$0' || str.includes('#DIV')) return 0
  const cleaned = str.replace('$', '').replace(',', '').replace(' ', '').replace('\u00A0', '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

const parseNumber = (str) => {
  if (typeof str === 'number') return str
  if (!str || str === '#DIV/0!' || str === '' || str.includes('#DIV')) return 0
  const cleaned = str.toString().replace(',', '.').replace(' ', '').replace('\u00A0', '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// Raw data from user (copy-paste the table data here)
// Format: bot, status, owner, mode, etc...
const rawData = `1	END	Dawid	Hajs	0,000	0	0	0	0	0	0	0,0%	#DIV/0!	0,0%	0,00	$0,00	#DIV/0!	#DIV/0!	#DIV/0!	#DIV/0!	#DIV/0!	btc-15m-trend-d20-55-A	false	Bitcoin	15 minut	Trend	35	MOMENTUM		0,99	-1	0,55	0,95		20	0,01	CONTINUOUS	2	0,01	0,00	0	0	0		0,03	99	0,01		34.255.132.185
2	END	Dawid	Hajs	0,651	2 843	207	2 636	0	69	134	64,7%	4,7%	-0,4%	-13,38	$11,06	$0,00	-$0,5	-4,1%	-$14	-122,6%	btc-15m-trend-d40-55-A	false	Bitcoin	15 minut	Trend	25	MOMENTUM		0,99	-1	0,55	0,95		40	0,01	CONTINUOUS	2	0,01	0,00	0	0	0		0,03	99	0,01		34.255.132.185`

// Since the data is too large to paste here, I'll create a template
// that shows how to structure the data

console.log(`import { BotData } from '@/types/bots'

export const botsData: BotData[] = [`)

// Parse and output each bot
// This is a template - in real use, you'd paste all 119 rows of data above
const lines = rawData.split('\n')
lines.forEach((line, index) => {
  const cells = line.split('\t')
  if (cells.length < 48) return
  
  const [
    botNum, status, owner, mode,
    avgRate, posOnTime, trans, missing, noRevMom, lost, won,
    wonPerTrans, wonPerPos, edge, balance, avgEntry, profitPerPos,
    profitPerDay, roiPerDay, profitPerMonth, roiPerMonth,
    botInstance, dryRunStr, crypto, interval, strategyName,
    orderSize, strategyMode, buyOpposite, exitPrice, exitBeforeClose,
    momentumThresh, entryThresh, maxRevEntryPrice, momentumConfSec,
    momentumConfTol, momentumConfMethod, velocityMinTicks, velocityMinInc,
    maxSpread, warmupDelay, minTimeRem, maxReentries, stopLoss,
    aggressiveExitUnderbid, exitMaxRetries, exitPriceDecrement, config, serverIp
  ] = cells

  console.log(`  {
    bot: ${parseInt(botNum)},
    status: '${status}' as 'LIVE' | 'END' | 'WAITING',
    owner: '${owner}',
    mode: '${mode}',
    averageRate: ${parseNumber(avgRate)},
    positionsOnTime: ${parseNumber(posOnTime)},
    transactions: ${parseNumber(trans)},
    missing: ${parseNumber(missing)},
    noReversalMomentum: ${parseNumber(noRevMom)},
    lost: ${parseNumber(lost)},
    won: ${parseNumber(won)},
    wonPerTransactions: ${parsePercent(wonPerTrans)},
    wonPerPositions: ${parsePercent(wonPerPos)},
    edge: ${parsePercent(edge)},
    balance: ${parseCurrency(balance)},
    averageEntry: ${parseCurrency(avgEntry)},
    profitPerPosition: ${parseCurrency(profitPerPos)},
    profitPerDay: ${parseCurrency(profitPerDay)},
    roiPerDay: ${parsePercent(roiPerDay)},
    profitPerMonth: ${parseCurrency(profitPerMonth)},
    roiPerMonth: ${parsePercent(roiPerMonth)},
    botInstance: '${botInstance}',
    dryRun: ${dryRunStr.toLowerCase() === 'true'},
    crypto: '${crypto}',
    interval: '${interval}',
    strategyName: '${strategyName}',
    orderSize: ${parseNumber(orderSize)},
    strategyMode: '${strategyMode}',
    buyOpposite: '${buyOpposite || ''}',
    exitPrice: ${parseNumber(exitPrice)},
    exitBeforeCloseSec: ${parseNumber(exitBeforeClose)},
    momentumThreshold: ${parseNumber(momentumThresh)},
    entryThreshold: ${parseNumber(entryThresh)},
    maxReversalEntryPrice: '${maxRevEntryPrice || ''}',
    momentumConfirmationSec: ${parseNumber(momentumConfSec)},
    momentumConfirmationTolerance: ${parseNumber(momentumConfTol)},
    momentumConfirmationMethod: '${momentumConfMethod || ''}',
    velocityMinTicks: ${parseNumber(velocityMinTicks)},
    velocityMinIncrease: ${parseNumber(velocityMinInc)},
    maxSpread: ${parseNumber(maxSpread)},
    warmupDelaySec: ${parseNumber(warmupDelay)},
    minTimeRemaining: ${parseNumber(minTimeRem)},
    maxReentries: ${parseNumber(maxReentries)},
    stopLoss: '${stopLoss || ''}',
    aggressiveExitUnderbid: ${parseNumber(aggressiveExitUnderbid)},
    exitMaxRetries: ${parseNumber(exitMaxRetries)},
    exitPriceDecrement: ${parseNumber(exitPriceDecrement)},
    config: '',
    serverIp: '${serverIp}'
  },`)
})

console.log(`]`)

console.error('\n\n=== INSTRUKCJA ===')
console.error('1. Skopiuj wszystkie dane botów (119 wierszy) do zmiennej rawData powyżej')
console.error('2. Uruchom: node scripts/generate-all-bots.js > lib/data/bots-data-all.ts')
console.error('3. Zmień nazwę pliku bots-data.ts na bots-data-old.ts')
console.error('4. Zmień nazwę pliku bots-data-all.ts na bots-data.ts')

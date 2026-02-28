/**
 * Skrypt pomocniczy do parsowania danych botów z formatu CSV/TSV
 * 
 * Użycie:
 * 1. Zapisz dane w formacie TSV (tab-separated values) do pliku bots-raw-data.tsv
 * 2. Uruchom: npx ts-node scripts/parse-bots-data.ts
 * 3. Skopiuj wygenerowany kod do lib/data/bots-data.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Helper function to parse percentage string to decimal
const parsePercent = (str: string): number => {
  if (!str || str === '#DIV/0!' || str === '0,0%' || str === '0%') return 0
  // Remove % and convert comma to dot
  const cleaned = str.replace('%', '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num / 100
}

// Helper function to parse currency string to number
const parseCurrency = (str: string): number => {
  if (!str || str === '#DIV/0!' || str === '$0,00' || str === '$0.00') return 0
  // Remove $ and convert comma to dot
  const cleaned = str.replace('$', '').replace(',', '').replace(' ', '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// Helper function to parse number with comma
const parseNumber = (str: string | number): number => {
  if (typeof str === 'number') return str
  if (!str || str === '#DIV/0!' || str === '') return 0
  // Remove spaces and convert comma to dot
  const cleaned = str.toString().replace(',', '.').replace(' ', '').replace('\u00A0', '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// Helper function to parse boolean
const parseBoolean = (str: string): boolean => {
  return str.toLowerCase() === 'true' || str.toLowerCase() === 'false'
}

// Function to parse a single row of data
function parseBotRow(cells: string[]): string {
  // Zakładamy, że kolumny są w tej kolejności jak w danych użytkownika
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

  const dryRun = dryRunStr?.toLowerCase() === 'true'

  return `  {
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
    dryRun: ${dryRun},
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
  },`
}

// Main function
function main() {
  const inputFile = path.join(__dirname, 'bots-raw-data.tsv')
  
  if (!fs.existsSync(inputFile)) {
    console.error('Plik bots-raw-data.tsv nie istnieje!')
    console.log('Utwórz plik bots-raw-data.tsv z danymi w formacie TSV (tab-separated)')
    return
  }

  const content = fs.readFileSync(inputFile, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  // Skip header
  const dataLines = lines.slice(1)
  
  console.log('import { BotData } from \'@/types/bots\'')
  console.log('')
  console.log('export const botsData: BotData[] = [')
  
  dataLines.forEach(line => {
    const cells = line.split('\t')
    if (cells.length > 10) {
      try {
        console.log(parseBotRow(cells))
      } catch (error) {
        console.error('Błąd parsowania linii:', error)
      }
    }
  })
  
  console.log(']')
}

main()

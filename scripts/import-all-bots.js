const fs = require('fs');

// Helper functions
const parsePercent = (str) => {
  if (!str || str === '#DIV/0!' || str === '0,0%' || str === '0%' || str.includes('#DIV')) return 0;
  const cleaned = str.replace('%', '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num / 100;
};

const parseCurrency = (str) => {
  if (!str || str === '#DIV/0!' || str === '$0,00' || str === '$0.00' || str === '$0' || str.includes('#DIV')) return 0;
  const cleaned = str.replace('$', '').replace(',', '').replace(' ', '').replace('\u00A0', '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const parseNumber = (str) => {
  if (typeof str === 'number') return str;
  if (!str || str === '#DIV/0!' || str === '' || str.includes('#DIV')) return 0;
  const cleaned = str.toString().replace(',', '.').replace(' ', '').replace('\u00A0', '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Read data from file
if (!fs.existsSync('temp-bots-data.txt')) {
  console.error('ERROR: Plik temp-bots-data.txt nie istnieje!');
  console.error('\nInstrukcja:');
  console.error('1. Skopiuj dane z Excela (wszystkie wiersze, bez nagłówka)');
  console.error('2. Wklej do pliku temp-bots-data.txt');
  console.error('3. Upewnij się że kolumny są oddzielone TABulatorami (nie spacjami)');
  console.error('4. Uruchom ponownie: node scripts/import-all-bots.js > lib/data/bots-data-new.ts');
  process.exit(1);
}

const data = fs.readFileSync('temp-bots-data.txt', 'utf-8');
const lines = data.split('\n').filter(line => line.trim());

console.error(`\n=== Importowanie ${lines.length} botów ===\n`);

// Start output
console.log(`import { BotData } from '@/types/bots'\n\nexport const botsData: BotData[] = [`);

let successCount = 0;
let errorCount = 0;

// Process each line
lines.forEach((line, index) => {
  const cells = line.split('\t');
  
  if (cells.length < 48) {
    console.error(`OSTRZEŻENIE: Linia ${index + 1} ma tylko ${cells.length} kolumn (oczekiwano 48+), pomijam...`);
    errorCount++;
    return;
  }

  try {
    // Obsługa dwóch formatów: 48 kolumn (bez CONFIG) i 49 kolumn (z CONFIG)
    const hasConfig = cells.length >= 49;
    
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
      aggressiveExitUnderbid, exitMaxRetries, exitPriceDecrement, 
      ...rest
    ] = cells;
    
    // Jeśli jest 49 kolumn: config, serverIp
    // Jeśli jest 48 kolumn: serverIp
    const config = hasConfig ? rest[0] : '';
    const serverIp = hasConfig ? rest[1] : rest[0];

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
    config: '${(config || '').replace(/'/g, "\\'").substring(0, 100)}',
    serverIp: '${(serverIp || '').trim()}'
  },`);
    
    successCount++;
  } catch (error) {
    console.error(`BŁĄD: Nie udało się przetworzyć linii ${index + 1}: ${error.message}`);
    errorCount++;
  }
});

console.log(`]`);

console.error(`\n=== Podsumowanie ===`);
console.error(`✅ Pomyślnie zaimportowano: ${successCount} botów`);
if (errorCount > 0) {
  console.error(`❌ Błędy: ${errorCount}`);
}
console.error(`\nNastępne kroki:`);
console.error(`1. Sprawdź wygenerowany plik: cat lib/data/bots-data-new.ts | head -50`);
console.error(`2. Jeśli wszystko OK, zastąp stary plik:`);
console.error(`   mv lib/data/bots-data.ts lib/data/bots-data-backup.ts`);
console.error(`   mv lib/data/bots-data-new.ts lib/data/bots-data.ts`);
console.error(`3. Zrestartuj dev server: npm run dev`);
console.error(`4. Otwórz: http://localhost:3002/app/boty\n`);

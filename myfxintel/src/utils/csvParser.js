/**
 * MyFXIntel CSV Parser
 * Supports: Myfxbook CSV and MT4/Blueberry CSV formats
 */

// ─── DETECT FORMAT ────────────────────────────────────────────────────────────
export function detectFormat(text) {
  const firstLines = text.slice(0, 500).toLowerCase();
  // MT4/Blueberry has 'closed transactions:' header and YYYY.MM.DD date format
  if (firstLines.includes('closed transactions:') || /\d{4}\.\d{2}\.\d{2}/.test(text.slice(0, 300))) {
    return 'mt4';
  }
  // Myfxbook has 'Tags,Ticket,Open Date' header
  if (firstLines.includes('tags,ticket,open date') || firstLines.includes('open date,close date')) {
    return 'myfxbook';
  }
  // Fallback: check for MM/DD/YYYY date format (Myfxbook)
  if (/\d{2}\/\d{2}\/\d{4}/.test(text.slice(0, 500))) {
    return 'myfxbook';
  }
  return 'unknown';
}

// ─── PARSE DATE ───────────────────────────────────────────────────────────────
function parseDate(str) {
  if (!str || str.trim() === '') return null;
  str = str.trim();

  // MT4 format: 2026.03.25 05:27:38
  const mt4Match = str.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (mt4Match) {
    return new Date(`${mt4Match[1]}-${mt4Match[2]}-${mt4Match[3]}T${mt4Match[4]}:${mt4Match[5]}:${mt4Match[6]}`);
  }

  // Myfxbook format: 03/27/2026 14:47
  const mfxMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (mfxMatch) {
    return new Date(`${mfxMatch[3]}-${mfxMatch[1]}-${mfxMatch[2]}T${mfxMatch[4]}:${mfxMatch[5]}:00`);
  }

  return new Date(str);
}

// ─── PARSE MYFXBOOK CSV ───────────────────────────────────────────────────────
function parseMyfxbook(text) {
  const trades = [];
  const deposits = [];
  const withdrawals = [];
  const lines = text.split('\n');

  // Find header row
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('tags') && lines[i].toLowerCase().includes('ticket') && lines[i].toLowerCase().includes('open date')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return trades;

  const headers = parseCSVLine(lines[headerIdx]).map(h => h.trim().toLowerCase());

  const idx = {
    ticket: headers.indexOf('ticket'),
    openDate: headers.indexOf('open date'),
    closeDate: headers.indexOf('close date'),
    symbol: headers.indexOf('symbol'),
    action: headers.indexOf('action'),
    lots: headers.indexOf('units/lots'),
    sl: headers.indexOf('sl'),
    tp: headers.indexOf('tp'),
    openPrice: headers.indexOf('open price'),
    closePrice: headers.indexOf('close price'),
    commission: headers.indexOf('commission'),
    swap: headers.indexOf('swap'),
    pips: headers.indexOf('pips'),
    profit: headers.indexOf('profit'),
    comment: headers.indexOf('comment'),
    magicNumber: headers.indexOf('magic number'),
  };

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Stop at Open Orders section
    if (line.toLowerCase().startsWith('open orders')) break;

    const cols = parseCSVLine(line);
    if (cols.length < 5) continue;

    const action = (cols[idx.action] || '').trim();
    const actionLower = action.toLowerCase();

    // Capture deposits and withdrawals separately
    if (actionLower === 'deposit' || actionLower === 'credit') {
      const amount = parseFloat(cols[idx.profit]) || 0;
      if (amount !== 0) deposits.push({ amount: Math.abs(amount), date: parseDate(cols[idx.closeDate]) });
      continue;
    }
    if (actionLower === 'withdrawal') {
      const amount = parseFloat(cols[idx.profit]) || 0;
      if (amount !== 0) withdrawals.push({ amount: Math.abs(amount), date: parseDate(cols[idx.closeDate]) });
      continue;
    }
    // Only include Buy and Sell
    if (actionLower !== 'buy' && actionLower !== 'sell') continue;

    const profit = parseFloat(cols[idx.profit]) || 0;
    const openDate = parseDate(cols[idx.openDate]);
    const closeDate = parseDate(cols[idx.closeDate]);
    if (!openDate || !closeDate) continue;

    trades.push({
      ticket: cols[idx.ticket]?.trim() || '',
      openDate,
      closeDate,
      symbol: (cols[idx.symbol] || 'XAUUSD').trim().toUpperCase(),
      action: actionLower === 'buy' ? 'Buy' : 'Sell',
      lots: parseFloat(cols[idx.lots]) || 0,
      sl: parseFloat(cols[idx.sl]) || 0,
      tp: parseFloat(cols[idx.tp]) || 0,
      openPrice: parseFloat(cols[idx.openPrice]) || 0,
      closePrice: parseFloat(cols[idx.closePrice]) || 0,
      commission: parseFloat(cols[idx.commission]) || 0,
      swap: parseFloat(cols[idx.swap]) || 0,
      pips: parseFloat(cols[idx.pips]) || 0,
      profit,
      comment: cols[idx.comment]?.trim() || '',
      magicNumber: cols[idx.magicNumber]?.trim() || '',
      source: 'myfxbook',
    });
  }

  return { trades, deposits, withdrawals };
}

// ─── PARSE MT4/BLUEBERRY CSV ──────────────────────────────────────────────────
function parseMT4(text) {
  const trades = [];
  const deposits = [];
  const withdrawals = [];
  const lines = text.split('\n');

  // Find 'Closed Transactions:' section
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('closed transactions:')) {
      startIdx = i + 1;
      break;
    }
  }
  if (startIdx === -1) return trades;

  // Find the header row (Ticket,Open Time,Type,...)
  let headerIdx = -1;
  for (let i = startIdx; i < Math.min(startIdx + 5, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('ticket') && lower.includes('open time') && lower.includes('type')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) headerIdx = startIdx; // fallback

  const dataStart = headerIdx + 1;

  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Stop at Open Trades or Working Orders sections
    const lineLower = line.toLowerCase();
    if (
      lineLower.startsWith('open trades:') ||
      lineLower.startsWith('working orders:') ||
      lineLower.startsWith('summary:') ||
      lineLower.startsWith('deposit/withdrawal:')
    ) break;

    const cols = parseCSVLine(line);
    if (cols.length < 10) continue;

    // Col indices (0-based): Ticket, Open Time, Type, Size, Item, Price, S/L, T/P, Close Time, Close Price, Commission, Taxes, Swap, Profit
    const type = (cols[2] || '').trim().toLowerCase();

    // Only real trades (buy or sell, not buy stop / sell stop / balance / cancelled)
    if (type === 'balance' || type === 'credit') {
      const amount = parseFloat(cols[13]) || 0;
      if (amount > 0) deposits.push({ amount, date: parseDate(cols[1]) });
      else if (amount < 0) withdrawals.push({ amount: Math.abs(amount), date: parseDate(cols[1]) });
      continue;
    }
    if (type !== 'buy' && type !== 'sell') continue;

    // Check if cancelled (close price column may say 'cancelled')
    const closePriceRaw = (cols[9] || '').trim().toLowerCase();
    if (closePriceRaw === 'cancelled' || closePriceRaw === '') continue;

    const profit = parseFloat(cols[13]) || 0;
    const openDate = parseDate(cols[1]);
    const closeDate = parseDate(cols[8]);
    if (!openDate) continue;

    // Symbol cleanup: remove .pi suffix etc
    const symbolRaw = (cols[4] || 'XAUUSD').trim().toUpperCase();
    const symbol = symbolRaw.replace(/\.(PI|PRO|ECN|RAW)$/i, '');

    trades.push({
      ticket: cols[0]?.trim() || '',
      openDate,
      closeDate: closeDate || openDate,
      symbol,
      action: type === 'buy' ? 'Buy' : 'Sell',
      lots: parseFloat(cols[3]) || 0,
      sl: parseFloat(cols[6]) || 0,
      tp: parseFloat(cols[7]) || 0,
      openPrice: parseFloat(cols[5]) || 0,
      closePrice: parseFloat(cols[9]) || 0,
      commission: parseFloat(cols[10]) || 0,
      swap: parseFloat(cols[12]) || 0,
      pips: 0, // MT4 doesn't include pips directly
      profit,
      comment: cols[14]?.trim() || '',
      magicNumber: '',
      source: 'mt4',
    });
  }

  return { trades, deposits, withdrawals };
}

// ─── CSV LINE PARSER (handles quoted fields) ──────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
export function parseCSV(text) {
  const format = detectFormat(text);

  let result = { trades: [], deposits: [], withdrawals: [] };
  if (format === 'myfxbook') {
    result = parseMyfxbook(text);
  } else if (format === 'mt4') {
    result = parseMT4(text);
  } else {
    result = parseMyfxbook(text);
    if (result.trades.length === 0) result = parseMT4(text);
  }

  // Sort by close date ascending
  result.trades.sort((a, b) => a.closeDate - b.closeDate);

  return {
    trades: result.trades,
    deposits: result.deposits || [],
    withdrawals: result.withdrawals || [],
    format,
    count: result.trades.length,
  };
}

// ─── DERIVED ANALYTICS ────────────────────────────────────────────────────────
export function computeAnalytics(trades) {
  if (!trades || trades.length === 0) return null;

  const realTrades = trades.filter(t => t.profit !== 0 || t.comment.includes('[tp]') || t.comment.includes('[sl]'));
  const winners = realTrades.filter(t => t.profit > 0);
  const losers = realTrades.filter(t => t.profit < 0);

  const totalProfit = realTrades.reduce((s, t) => s + t.profit, 0);
  const grossProfit = winners.reduce((s, t) => s + t.profit, 0);
  const grossLoss = Math.abs(losers.reduce((s, t) => s + t.profit, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const winRate = realTrades.length > 0 ? (winners.length / realTrades.length) * 100 : 0;

  const bestTrade = realTrades.reduce((best, t) => (!best || t.profit > best.profit) ? t : best, null);
  const worstTrade = realTrades.reduce((worst, t) => (!worst || t.profit < worst.profit) ? t : worst, null);

  // Day of week breakdown
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay = {};
  days.forEach(d => { byDay[d] = { trades: [], profit: 0, wins: 0, losses: 0 }; });

  realTrades.forEach(t => {
    const day = days[t.closeDate.getDay()];
    byDay[day].trades.push(t);
    byDay[day].profit += t.profit;
    if (t.profit > 0) byDay[day].wins++;
    else byDay[day].losses++;
  });

  // Monthly breakdown
  const byMonth = {};
  realTrades.forEach(t => {
    const key = `${t.closeDate.getFullYear()}-${String(t.closeDate.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { trades: [], profit: 0, wins: 0, losses: 0 };
    byMonth[key].trades.push(t);
    byMonth[key].profit += t.profit;
    if (t.profit > 0) byMonth[key].wins++;
    else byMonth[key].losses++;
  });

  // Weekly breakdown
  function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().slice(0, 10);
  }
  const byWeek = {};
  realTrades.forEach(t => {
    const key = getWeekKey(t.closeDate);
    if (!byWeek[key]) byWeek[key] = { trades: [], profit: 0, wins: 0, losses: 0 };
    byWeek[key].trades.push(t);
    byWeek[key].profit += t.profit;
    if (t.profit > 0) byWeek[key].wins++;
    else byWeek[key].losses++;
  });

  // Price zone analysis ($50 buckets)
  const priceZones = {};
  realTrades.forEach(t => {
    if (!t.openPrice) return;
    const bucket = Math.floor(t.openPrice / 50) * 50;
    const key = `${bucket}-${bucket + 50}`;
    if (!priceZones[key]) priceZones[key] = { trades: [], profit: 0, wins: 0, losses: 0, min: bucket, max: bucket + 50 };
    priceZones[key].trades.push(t);
    priceZones[key].profit += t.profit;
    if (t.profit > 0) priceZones[key].wins++;
    else priceZones[key].losses++;
  });

  return {
    totalTrades: realTrades.length,
    winners: winners.length,
    losers: losers.length,
    winRate,
    totalProfit,
    grossProfit,
    grossLoss,
    profitFactor,
    bestTrade,
    worstTrade,
    byDay,
    byMonth,
    byWeek,
    priceZones,
    trades: realTrades,
  };
}

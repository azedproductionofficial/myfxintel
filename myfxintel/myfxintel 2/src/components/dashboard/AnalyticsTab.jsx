import React, { useState, useMemo } from 'react'

// ─── BASE HISTORICAL DATA (Dec 2025 – Mar 2026) ───────────────────────────────
const BASE_HISTORY = {
  Monday: [
    { date: '2025-12-08', pnl: -58.98 }, { date: '2025-12-22', pnl: 47.71 },
    { date: '2025-12-29', pnl: -53.01 }, { date: '2026-01-12', pnl: 62.30 },
    { date: '2026-01-19', pnl: 8.22 },   { date: '2026-01-26', pnl: 13.50 },
    { date: '2026-02-02', pnl: -9.19 },  { date: '2026-02-09', pnl: -23.89 },
    { date: '2026-02-23', pnl: 81.00 },  { date: '2026-03-02', pnl: 2.57 },
    { date: '2026-03-09', pnl: -126.36 },
  ],
  Tuesday: [
    { date: '2025-12-09', pnl: 18.42 },  { date: '2025-12-16', pnl: 0.90 },
    { date: '2025-12-23', pnl: -19.43 }, { date: '2026-01-13', pnl: 1.43 },
    { date: '2026-01-20', pnl: 9.16 },   { date: '2026-01-27', pnl: 72.81 },
    { date: '2026-02-03', pnl: 13.50 },  { date: '2026-02-17', pnl: 61.06 },
    { date: '2026-02-24', pnl: 12.67 },  { date: '2026-03-03', pnl: 228.06 },
    { date: '2026-03-10', pnl: -59.61 },
  ],
  Wednesday: [
    { date: '2025-12-10', pnl: -2.59 },  { date: '2025-12-17', pnl: -20.59 },
    { date: '2025-12-24', pnl: 6.47 },   { date: '2026-01-07', pnl: -11.33 },
    { date: '2026-01-14', pnl: -70.36 }, { date: '2026-01-28', pnl: 11.97 },
    { date: '2026-02-04', pnl: 14.00 },  { date: '2026-02-11', pnl: 92.55 },
    { date: '2026-02-25', pnl: 2.00 },   { date: '2026-03-04', pnl: -2.73 },
    { date: '2026-03-11', pnl: 29.63 },
  ],
  Thursday: [
    { date: '2025-12-11', pnl: 93.10 },  { date: '2025-12-18', pnl: 176.28 },
    { date: '2026-01-08', pnl: -0.13 },  { date: '2026-01-15', pnl: -20.02 },
    { date: '2026-01-22', pnl: 21.70 },  { date: '2026-01-29', pnl: 16.08 },
    { date: '2026-02-05', pnl: 21.71 },  { date: '2026-02-12', pnl: 41.00 },
    { date: '2026-02-19', pnl: -26.17 }, { date: '2026-02-26', pnl: -46.79 },
    { date: '2026-03-05', pnl: 38.65 },  { date: '2026-03-12', pnl: 10.67 },
    { date: '2026-03-19', pnl: 18.73 },  { date: '2026-03-26', pnl: 33.25 },
  ],
  Friday: [
    { date: '2025-12-12', pnl: 0.50 },   { date: '2025-12-19', pnl: -14.53 },
    { date: '2025-12-26', pnl: -13.10 }, { date: '2026-01-09', pnl: -15.59 },
    { date: '2026-01-16', pnl: 60.44 },  { date: '2026-01-23', pnl: 4.77 },
    { date: '2026-01-30', pnl: 54.57 },  { date: '2026-02-06', pnl: -21.25 },
    { date: '2026-02-13', pnl: -19.22 }, { date: '2026-02-20', pnl: 0.16 },
    { date: '2026-02-27', pnl: 79.26 },  { date: '2026-03-06', pnl: 24.88 },
    { date: '2026-03-13', pnl: 8.28 },   { date: '2026-03-20', pnl: 86.67 },
  ],
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHORT_TO_LONG = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday' }

function sgn(n) { return (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(2) }
function cl(n)  { return n > 0 ? '#10b981' : n < 0 ? '#ef4444' : '#3d4f6a' }
function wc(w)  { return w >= 70 ? '#10b981' : w >= 50 ? '#f59e0b' : '#ef4444' }
function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}
function getMonthLabel(dateStr) {
  const dt = new Date(dateStr + 'T12:00:00Z')
  return MONTH_NAMES[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear()
}
function getDOW(dateStr) {
  return DAY_SHORT[new Date(dateStr + 'T12:00:00Z').getUTCDay()]
}
function parseMonthKey(s) {
  const [m, y] = s.split(' ')
  return new Date(parseInt(y), MONTH_NAMES.indexOf(m))
}

// Convert base history to flat trade list
function getBaseTradeList() {
  const trades = []
  Object.entries(BASE_HISTORY).forEach(([, entries]) => {
    entries.forEach(e => trades.push({ date: e.date, profit: e.pnl }))
  })
  return trades
}

// Build day map from base history directly (preserves correct day attribution)
function getBaseDayMap() {
  const dayMap = {}
  DAYS.forEach(d => { dayMap[d] = BASE_HISTORY[d].map(e => ({ date: e.date, profit: e.pnl })) })
  return dayMap
}

// Build day map from CSV trades using actual dates
function buildDayMapFromCSV(trades) {
  const dayMap = {}
  DAYS.forEach(d => { dayMap[d] = [] })
  trades.forEach(t => {
    const dow = getDOW(t.date)
    const dayName = SHORT_TO_LONG[dow]
    if (dayName) dayMap[dayName].push(t)
  })
  return dayMap
}

function computeMonthStats(trades) {
  const monthMap = {}
  trades.forEach(t => {
    const mo = getMonthLabel(t.date)
    if (!monthMap[mo]) monthMap[mo] = []
    monthMap[mo].push(t)
  })
  return Object.keys(monthMap)
    .sort((a, b) => parseMonthKey(a) - parseMonthKey(b))
    .map(mo => {
      const ts = monthMap[mo]
      const pnl = ts.reduce((s, t) => s + t.profit, 0)
      const wins = ts.filter(t => t.profit > 0).length
      const losses = ts.filter(t => t.profit <= 0).length
      const wr = ts.length > 0 ? Math.round((wins / ts.length) * 100) : 0
      const gw = ts.filter(t => t.profit > 0).reduce((s, t) => s + t.profit, 0)
      const gl = Math.abs(ts.filter(t => t.profit < 0).reduce((s, t) => s + t.profit, 0))
      const pf = gl > 0 ? gw / gl : 999
      const best = ts.reduce((a, b) => b.profit > a.profit ? b : a, ts[0])
      const worst = ts.reduce((a, b) => b.profit < a.profit ? b : a, ts[0])
      const dow = {}
      ts.forEach(t => {
        const d = getDOW(t.date)
        if (!dow[d]) dow[d] = { pnl: 0, wins: 0, losses: 0, count: 0 }
        dow[d].pnl += t.profit; dow[d].count++
        if (t.profit > 0) dow[d].wins++; else dow[d].losses++
      })
      return { mo, pnl, wins, losses, wr, pf, best, worst, dow, count: ts.length, gw, gl }
    })
}

function buildWeekMap(trades) {
  const weekMap = {}
  trades.forEach(t => {
    const dt = new Date(t.date + 'T12:00:00Z')
    const day = dt.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const mon = new Date(dt)
    mon.setUTCDate(dt.getUTCDate() + diff)
    const key = mon.toISOString().slice(0, 10)
    if (!weekMap[key]) weekMap[key] = { pnl: 0, days: {} }
    weekMap[key].pnl += t.profit
    const dow = DAY_SHORT[dt.getUTCDay()]
    if (!weekMap[key].days[dow]) weekMap[key].days[dow] = 0
    weekMap[key].days[dow] += t.profit
  })
  return weekMap
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ color, text }) {
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}35`, borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, marginRight: '5px' }}>
      {text}
    </span>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: '#111c30', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}

function DayCard({ dayName, entries }) {
  const wins = entries.filter(e => e.profit > 0).length
  const losses = entries.filter(e => e.profit <= 0).length
  const total = entries.reduce((s, e) => s + e.profit, 0)
  const wr = entries.length > 0 ? Math.round((wins / entries.length) * 100) : 0
  const best = entries.length > 0 ? entries.reduce((a, b) => b.profit > a.profit ? b : a, entries[0]) : null
  const worst = entries.length > 0 ? entries.reduce((a, b) => b.profit < a.profit ? b : a, entries[0]) : null
  const maxAbs = Math.max(...entries.map(e => Math.abs(e.profit)), 1)
  const accentColor = total >= 0 ? '#10b981' : '#ef4444'

  let running = 0
  const withRunning = entries.map(e => { running += e.profit; return { ...e, running } })

  return (
    <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(90deg, ${accentColor}10, transparent)`, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '30px', background: accentColor, borderRadius: '2px' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{dayName}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{entries.length} weeks · {wins}W/{losses}L · {wr}% WR</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: accentColor }}>{sgn(total)}</div>
          <div style={{ fontSize: '9px', color: '#3d4f6a' }}>Best: {best ? sgn(best.profit) : '--'}</div>
        </div>
      </div>

      {/* Mini bar */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '44px' }}>
        {entries.map((e, i) => {
          const h = Math.max(3, Math.round((Math.abs(e.profit) / maxAbs) * 40))
          return <div key={i} title={`${fmtDate(e.date)}: ${sgn(e.profit)}`} style={{ flex: 1, height: `${h}px`, background: e.profit > 0 ? '#10b981' : '#ef4444', borderRadius: '2px 2px 0 0', alignSelf: 'flex-end', opacity: 0.85 }} />
        })}
      </div>

      {/* Trade rows */}
      <div style={{ padding: '8px 16px 14px' }}>
        {withRunning.map((e, i) => {
          const barPct = Math.min(100, Math.round((Math.abs(e.profit) / maxAbs) * 75))
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: i < withRunning.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span style={{ fontSize: '10px', width: '12px', flexShrink: 0 }}>{e.profit > 0 ? '✓' : '✗'}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', width: '90px', flexShrink: 0 }}>{fmtDate(e.date)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ width: `${barPct}%`, height: '4px', minWidth: '2px', background: e.profit > 0 ? '#10b981' : '#ef4444', borderRadius: '2px', opacity: 0.7 }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: e.profit > 0 ? '#10b981' : '#ef4444', width: '58px', textAlign: 'right', flexShrink: 0 }}>{sgn(e.profit)}</span>
              <span style={{ fontSize: '9px', color: e.running > 0 ? '#10b981' : '#ef4444', width: '52px', textAlign: 'right', flexShrink: 0, opacity: 0.7 }}>
                {e.running >= 0 ? '+' : '-'}${Math.abs(Math.round(e.running))}
              </span>
            </div>
          )
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '9px', color: '#3d4f6a' }}>Worst: {worst ? sgn(worst.profit) : '--'}</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>Total: {sgn(total)}</span>
        </div>
      </div>
    </div>
  )
}

function WeeklyTable({ weekMap, dayMap }) {
  const weeks = Object.keys(weekMap).sort()
  const shortMap = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri' }
  const dayColors = { Monday: '#ef4444', Tuesday: '#10b981', Wednesday: '#f59e0b', Thursday: '#10b981', Friday: '#f59e0b' }
  const dayTotals = {}
  DAYS.forEach(d => { dayTotals[d] = (dayMap[d] || []).reduce((s, e) => s + e.profit, 0) })
  const grandTotal = Object.values(dayTotals).reduce((s, v) => s + v, 0)

  return (
    <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '130px repeat(5,1fr) 90px 34px', background: '#111c30', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px' }}>
        <span style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em' }}>WEEK OF</span>
        {DAYS.map(d => <span key={d} style={{ fontSize: '9px', color: dayColors[d], letterSpacing: '0.08em', textAlign: 'right' }}>{shortMap[d]}</span>)}
        <span style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', textAlign: 'right' }}>TOTAL</span>
        <span />
      </div>

      {weeks.map((wk, idx) => {
        const w = weekMap[wk]
        const dt = new Date(wk + 'T12:00:00Z')
        const label = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        return (
          <div key={wk} style={{ display: 'grid', gridTemplateColumns: '130px repeat(5,1fr) 90px 34px', padding: '9px 16px', borderBottom: idx < weeks.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: idx % 2 === 1 ? '#111c30' : 'transparent' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{label}</span>
            {DAYS.map(d => {
              const val = w.days[shortMap[d]]
              return <span key={d} style={{ fontSize: '10px', fontWeight: 600, textAlign: 'right', color: val === undefined ? '#3d4f6a' : val >= 0 ? '#10b981' : '#ef4444' }}>
                {val === undefined ? '—' : (val >= 0 ? '+' : '') + '$' + Math.abs(Math.round(val))}
              </span>
            })}
            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', color: w.pnl >= 0 ? '#10b981' : '#ef4444', textAlign: 'right' }}>
              {w.pnl >= 0 ? '+' : '-'}${Math.abs(w.pnl).toFixed(2)}
            </span>
            <span style={{ textAlign: 'center', fontSize: '10px' }}>{w.pnl >= 0 ? '✓' : '✗'}</span>
          </div>
        )
      })}

      <div style={{ display: 'grid', gridTemplateColumns: '130px repeat(5,1fr) 90px 34px', padding: '11px 16px', background: '#111c30', borderTop: '2px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>TOTAL</span>
        {DAYS.map(d => <span key={d} style={{ fontSize: '10px', fontWeight: 700, color: dayTotals[d] >= 0 ? '#10b981' : '#ef4444', textAlign: 'right' }}>
          {dayTotals[d] >= 0 ? '+' : '-'}${Math.abs(Math.round(dayTotals[d]))}
        </span>)}
        <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', color: grandTotal >= 0 ? '#10b981' : '#ef4444', textAlign: 'right' }}>
          {grandTotal >= 0 ? '+' : '-'}${Math.abs(grandTotal).toFixed(2)}
        </span>
        <span />
      </div>
    </div>
  )
}

function DayRanking({ dayMap }) {
  const medals = ['🥇', '🥈', '🥉', '4th', '5th']
  const sorted = [...DAYS].sort((a, b) => {
    const at = (dayMap[a] || []).reduce((s, e) => s + e.profit, 0)
    const bt = (dayMap[b] || []).reduce((s, e) => s + e.profit, 0)
    return bt - at
  })
  return (
    <div>
      <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em', marginBottom: '14px' }}>DAY RANKING</div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {sorted.map((day, i) => {
          const entries = dayMap[day] || []
          const total = entries.reduce((s, e) => s + e.profit, 0)
          const wins = entries.filter(e => e.profit > 0).length
          const losses = entries.filter(e => e.profit <= 0).length
          const wr = entries.length > 0 ? Math.round((wins / entries.length) * 100) : 0
          const bord = total >= 0 ? (i < 2 ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)') : 'rgba(255,255,255,0.06)'
          const bg = total >= 0 ? (i < 2 ? 'rgba(16,185,129,0.03)' : 'rgba(245,158,11,0.03)') : 'rgba(239,68,68,0.03)'
          return (
            <div key={day} style={{ background: `linear-gradient(135deg,${bg},#0c1424)`, border: `1px solid ${bord}`, borderRadius: '12px', padding: '16px 20px', flex: '1 1 0', minWidth: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>{medals[i]}</span>
                <span style={{ fontSize: '9px', color: '#3d4f6a' }}>{wins}W/{losses}L</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{day}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: cl(total) }}>{sgn(total)}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '4px' }}>{wr}% WR · {entries.length} wks</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthlyAnalysis({ monthStats }) {
  const [expanded, setExpanded] = useState(false)
  const [openMonths, setOpenMonths] = useState({})

  const tP = monthStats.reduce((s, m) => s + m.pnl, 0)
  const tT = monthStats.reduce((s, m) => s + m.count, 0)
  const tW = monthStats.reduce((s, m) => s + m.wins, 0)
  const tWr = tT > 0 ? Math.round((tW / tT) * 100) : 0
  const pM = monthStats.filter(m => m.pnl > 0).length
  const avg = tP / Math.max(monthStats.length, 1)

  return (
    <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '14px' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: '#d4a843' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Monthly Analysis</span>
          <Badge color="#10b981" text={pM + '/' + monthStats.length + ' Profitable'} />
          <Badge color="#d4a843" text={'Avg ' + sgn(avg) + '/mo'} />
        </div>
        <span style={{ fontSize: '10px', color: '#3d4f6a', background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '4px 10px' }}>
          {expanded ? 'Hide' : 'Show Monthly'}
        </span>
      </div>

      {expanded && (
        <div>
          {/* Grand total */}
          <div style={{ background: 'rgba(212,168,67,0.03)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
              <StatBox label="Total EA Profit" value={sgn(tP)} color={cl(tP)} />
              <StatBox label="Total Trades" value={'' + tT} color="#d4a843" />
              <StatBox label="Overall WR" value={tWr + '%'} color={wc(tWr)} />
              <StatBox label="Profitable Months" value={pM + '/' + monthStats.length} color="#10b981" />
            </div>
          </div>

          {/* Month cards */}
          {monthStats.map(m => {
            const isOpen = openMonths[m.mo]
            return (
              <div key={m.mo} style={{ background: '#0c1424', border: `1px solid ${m.pnl >= 0 ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: '6px' }}
                  onClick={() => setOpenMonths(p => ({ ...p, [m.mo]: !p[m.mo] }))}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#d4a843', minWidth: '75px', fontFamily: 'var(--font-display)' }}>📅 {m.mo}</span>
                    <Badge color={cl(m.pnl)} text={sgn(m.pnl)} />
                    <Badge color="#3b82f6" text={m.count + ' trades'} />
                    <Badge color={wc(m.wr)} text={m.wr + '% WR'} />
                    <Badge color={m.pf >= 2 ? '#10b981' : m.pf >= 1 ? '#f59e0b' : '#ef4444'} text={'PF ' + (m.pf === 999 ? '∞' : m.pf.toFixed(2)) + 'x'} />
                    <Badge color={m.pnl >= 0 ? '#10b981' : '#ef4444'} text={m.pnl >= 0 ? '✅ PROFIT' : '❌ LOSS'} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#3d4f6a' }}>{isOpen ? '[-]' : '[+]'}</span>
                </div>

                {isOpen && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '10px' }}>
                      <StatBox label="P&L" value={sgn(m.pnl)} color={cl(m.pnl)} />
                      <StatBox label="Win/Loss" value={m.wins + 'W/' + m.losses + 'L'} />
                      <StatBox label="Gross Win" value={'+$' + m.gw.toFixed(2)} color="#10b981" />
                      <StatBox label="Gross Loss" value={'-$' + m.gl.toFixed(2)} color="#ef4444" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Best Trade</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>{m.best ? sgn(m.best.profit) : '--'}</div>
                        {m.best && <div style={{ fontSize: '9px', color: '#3d4f6a', marginTop: '2px' }}>{m.best.date} · {getDOW(m.best.date)}</div>}
                      </div>
                      <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Worst Trade</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444' }}>{m.worst ? sgn(m.worst.profit) : '--'}</div>
                        {m.worst && <div style={{ fontSize: '9px', color: '#3d4f6a', marginTop: '2px' }}>{m.worst.date} · {getDOW(m.worst.date)}</div>}
                      </div>
                    </div>
                    <div style={{ background: '#111c30', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Day of Week</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px' }}>
                        {['Mon','Tue','Wed','Thu','Fri'].map(d => {
                          const dd = m.dow[d] || { pnl: 0, wins: 0, count: 0 }
                          const dwr = dd.count > 0 ? Math.round((dd.wins / dd.count) * 100) : 0
                          return (
                            <div key={d} style={{ background: '#070d1a', borderRadius: '6px', padding: '8px', textAlign: 'center', opacity: dd.count > 0 ? 1 : 0.3 }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: '#d4a843', marginBottom: '3px' }}>{d}</div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: cl(dd.pnl) }}>{dd.count > 0 ? sgn(dd.pnl) : '--'}</div>
                              {dd.count > 0 && <div style={{ fontSize: '9px', color: wc(dwr) }}>{dwr}% WR</div>}
                              <div style={{ fontSize: '9px', color: '#3d4f6a' }}>{dd.count > 0 ? dd.count + ' trades' : '--'}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Monthly comparison table */}
          {monthStats.length > 1 && (
            <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginTop: '4px' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Monthly Comparison</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr>{['Month','Trades','WR','EA P&L','PF','vs $150','Result'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#3d4f6a', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 600 }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {monthStats.map(m => (
                    <tr key={m.mo} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '7px 8px', color: '#d4a843', fontWeight: 700 }}>{m.mo}</td>
                      <td style={{ padding: '7px 8px' }}>{m.count}</td>
                      <td style={{ padding: '7px 8px', color: wc(m.wr), fontWeight: 600 }}>{m.wr}%</td>
                      <td style={{ padding: '7px 8px', color: cl(m.pnl), fontWeight: 700 }}>{sgn(m.pnl)}</td>
                      <td style={{ padding: '7px 8px', color: m.pf >= 2 ? '#10b981' : m.pf >= 1 ? '#f59e0b' : '#ef4444' }}>{m.pf === 999 ? '∞' : m.pf.toFixed(2)}x</td>
                      <td style={{ padding: '7px 8px', color: cl(m.pnl) }}>{Math.round(m.pnl / 150 * 100)}%</td>
                      <td style={{ padding: '7px 8px' }}><span style={{ background: (m.pnl >= 0 ? '#10b981' : '#ef4444') + '18', color: m.pnl >= 0 ? '#10b981' : '#ef4444', border: `1px solid ${m.pnl >= 0 ? '#10b981' : '#ef4444'}35`, borderRadius: '4px', padding: '2px 7px', fontSize: '10px', fontWeight: 700 }}>{m.pnl >= 0 ? '✅ PROFIT' : '❌ LOSS'}</span></td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(212,168,67,0.03)', borderTop: '2px solid rgba(212,168,67,0.3)' }}>
                    <td style={{ padding: '7px 8px', color: '#d4a843', fontWeight: 700 }}>TOTAL</td>
                    <td style={{ padding: '7px 8px', fontWeight: 700 }}>{tT}</td>
                    <td style={{ padding: '7px 8px', color: wc(tWr), fontWeight: 700 }}>{tWr}%</td>
                    <td style={{ padding: '7px 8px', color: cl(tP), fontWeight: 700 }}>{sgn(tP)}</td>
                    <td style={{ padding: '7px 8px', color: '#3d4f6a' }}>--</td>
                    <td style={{ padding: '7px 8px', color: cl(tP) }}>{Math.round(tP / 150 * 100)}%</td>
                    <td style={{ padding: '7px 8px' }}><span style={{ background: 'rgba(212,168,67,0.18)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.35)', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', fontWeight: 700 }}>{pM}/{monthStats.length} ✅</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AnalyticsTab({ trades }) {
  const usingCSV = trades && trades.length > 0

  const dayMap = useMemo(() => usingCSV ? buildDayMapFromCSV(trades) : getBaseDayMap(), [trades, usingCSV])
  const allTrades = useMemo(() => usingCSV ? trades : getBaseTradeList(), [trades, usingCSV])
  const monthStats = useMemo(() => computeMonthStats(allTrades), [allTrades])
  const weekMap = useMemo(() => buildWeekMap(allTrades), [allTrades])

  const totalPnL = allTrades.reduce((s, t) => s + t.profit, 0)
  const winWeeks = Object.values(weekMap).filter(w => w.pnl > 0).length
  const totalWeeks = Object.keys(weekMap).length
  const weekWR = totalWeeks > 0 ? Math.round((winWeeks / totalWeeks) * 100) : 0
  const totalDeposits = 150.53
  const roi = ((totalPnL / totalDeposits) * 100).toFixed(1)

  return (
    <div>
      {/* Data source banner */}
      <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📂</div>
          <div>
            <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', marginBottom: '3px' }}>DATA SOURCE</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{usingCSV ? 'CSV Upload — Live Data' : 'Base Data (Dec 2025 – Mar 2026)'}</div>
            <div style={{ fontSize: '10px', color: '#3d4f6a', marginTop: '3px' }}>{usingCSV ? `${trades.length} trades imported` : 'Headway account · XAUUSD · Dec 2025–Mar 2026'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[{ label: 'Total P&L', val: sgn(totalPnL), color: cl(totalPnL) }, { label: 'Win Weeks', val: winWeeks + '/' + totalWeeks, color: '#f59e0b' }, { label: 'Weekly WR', val: weekWR + '%', color: '#f59e0b' }].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'TOTAL DEPOSITED', value: '$' + totalDeposits.toFixed(2), sub: '1 deposit', color: '#3b82f6', emoji: '⬇️' },
          { label: 'TOTAL WITHDRAWN', value: '—', sub: 'Not tracked in base data', color: '#3d4f6a', emoji: '⬆️' },
          { label: 'TRADING P&L', value: sgn(totalPnL), sub: 'from EA trades only', color: cl(totalPnL), emoji: '📈' },
          { label: 'RETURN ON DEPOSIT', value: (totalPnL >= 0 ? '+' : '') + roi + '%', sub: `$${totalPnL.toFixed(2)} on $${totalDeposits}`, color: cl(totalPnL), emoji: '🎯' },
        ].map(({ label, value, sub, color, emoji }) => (
          <div key={label} style={{ background: color + '0a', border: `1px solid ${color}30`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em' }}>{label}</div>
              <span style={{ fontSize: '14px' }}>{emoji}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '10px', color: '#3d4f6a' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Day-by-day */}
      <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em', marginBottom: '14px' }}>DAY-BY-DAY BREAKDOWN</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {DAYS.map(day => <DayCard key={day} dayName={day} entries={dayMap[day] || []} />)}
      </div>

      {/* Weekly */}
      <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em', marginBottom: '14px' }}>WEEKLY BREAKDOWN</div>
      <WeeklyTable weekMap={weekMap} dayMap={dayMap} />

      {/* Ranking */}
      <DayRanking dayMap={dayMap} />

      {/* Monthly */}
      <MonthlyAnalysis monthStats={monthStats} />

      {/* PDF */}
      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>Download Analytics Report</div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Generates a professional PDF with all analytics, weekly breakdown, and trading rules.
            <span style={{ color: '#3d4f6a' }}> {usingCSV ? 'Using uploaded CSV data.' : 'Using base data.'}</span>
          </div>
        </div>
        <button onClick={() => alert('PDF export — coming soon')} style={{ padding: '11px 28px', borderRadius: '9px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '0.05em', flexShrink: 0, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', boxShadow: '0 4px 16px rgba(220,38,38,0.35)' }}>
          Download PDF Report
        </button>
      </div>
    </div>
  )
}

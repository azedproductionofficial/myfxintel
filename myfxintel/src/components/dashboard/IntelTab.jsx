import React, { useState, useCallback, useEffect } from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

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

const WEEK_CONFIGS = {
  '2026-03-09': {
    label: '09–13 Mar 2026', goldPrice: '$5,169',
    days: {
      Monday:    { events: ['China CPI release (Morning)', '⚠️ Sunday gap trades: -$126.36 included'], context: 'Sunday Mar 8 gap trades fired at 23:42 and mostly stopped out (-$126.36), attributed to Monday. China CPI also released. Gold ~$5,169.' },
      Tuesday:   { events: ['No major scheduled data', 'Clean calendar day'], context: 'No major US data. Clean calendar. Last Tuesday Mar 3 was massive +$228.' },
      Wednesday: { events: ['🔴 US CPI February — 8:30 AM ET', 'Highest impact event of the week'], context: 'February CPI. January CPI was 2.4% YoY. JPM warns tariffs push inflation higher.' },
      Thursday:  { events: ['US PPI data — 8:30 AM ET', 'Bank of England Governor speech'], context: 'PPI at 8:30 AM ET. BoE Governor speech — mainly GBP impact.' },
      Friday:    { events: ['US Core PCE data', 'US Q4 GDP estimate', 'Michigan Consumer Sentiment'], context: 'Core PCE + GDP + Michigan Sentiment. Multiple data releases.' },
    }
  },
  '2026-03-16': {
    label: '16–20 Mar 2026', goldPrice: '~$5,020',
    days: {
      Monday:    { events: ['NY Empire State Manufacturing Index'], context: 'Low-tier data. Gold sold off sharply last week. FOMC looming Wednesday.' },
      Tuesday:   { events: ['US Retail Sales — 8:30 AM ET', '🔴 FOMC eve — pre-decision positioning'], context: 'Retail Sales at 8:30 ET. FOMC tomorrow. Pre-Fed positioning = choppy ranges likely.' },
      Wednesday: { events: ['🔴 FOMC Rate Decision — 2:00 PM ET', '🔴 Powell Press Conference — 2:30 PM ET'], context: 'Fed expected to HOLD at 3.75%. Dot plot + Powell forward guidance = massive volatility.' },
      Thursday:  { events: ['🔴 US PPI — 8:30 AM ET', 'US Jobless Claims — 8:30 AM ET'], context: 'Post-FOMC day. PPI + Jobless Claims at 8:30 ET. Continuation moves often big.' },
      Friday:    { events: ['Michigan Consumer Sentiment (Final)', 'Quad Witching — options expiry day'], context: 'Quad Witching + post-FOMC rebalancing. Unusual vol patterns. Weekly close.' },
    }
  },
}

const DECISION_FRAMEWORK = [
  { cond: 'FOMC day (eve + decision)', verdict: 'SKIP PM', color: '#ef4444' },
  { cond: 'Post-FOMC Thursday', verdict: 'FULL SEND', color: '#10b981' },
  { cond: 'Hot CPI + any day', verdict: 'SKIP', color: '#ef4444' },
  { cond: 'Clean Tuesday', verdict: 'FULL SEND', color: '#10b981' },
  { cond: 'Clean Thursday', verdict: 'FULL SEND', color: '#10b981' },
  { cond: 'Quad Witching Friday', verdict: 'CAUTIOUS', color: '#f59e0b' },
  { cond: 'Monday any week', verdict: 'CAUTIOUS', color: '#f59e0b' },
  { cond: 'Geopolitical shock', verdict: 'SKIP', color: '#ef4444' },
]

function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
function toKey(date) { return date.toISOString().slice(0, 10) }
function fmtDate(date) { return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
function getDayDate(monday, idx) { const d = new Date(monday); d.setDate(d.getDate() + idx); return d }

function computeStats(entries) {
  const wins = entries.filter(e => e.pnl > 0).length
  const losses = entries.filter(e => e.pnl < 0).length
  const total = entries.reduce((s, e) => s + e.pnl, 0)
  const wr = entries.length > 0 ? Math.round((wins / entries.length) * 100) : 0
  let label = 'WEAK', color = '#ef4444'
  if (total > 200 || wr >= 80) { label = 'STRONG'; color = '#22c55e' }
  else if (total > 50 || wr >= 60) { label = 'GOOD'; color = '#22c55e' }
  else if (total > 0 || wr >= 50) { label = 'MIXED'; color = '#f59e0b' }
  return { total, wins, losses, wr, label, color }
}

function verdictStyle(text) {
  if (!text) return {}
  const u = text.toUpperCase()
  if (u.includes('SKIP')) return { color: '#ef4444', label: 'SKIP' }
  if (u.includes('CAUTIOUS')) return { color: '#f59e0b', label: 'CAUTIOUS' }
  if (u.includes('TRADE')) return { color: '#22c55e', label: 'TRADE' }
  return { color: '#94a3b8', label: 'ANALYSING' }
}

async function callClaude(messages, system) {
  const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages, system }) })
  const data = await res.json()
  return data.content?.[0]?.text || 'No response.'
}

export default function IntelTab({ trades }) {
  const today = new Date()
  const [weekStart, setWeekStart] = useState(getMondayOf(today))
  const [weekPickerVal, setWeekPickerVal] = useState(toKey(getMondayOf(today)))
  const [activeDay, setActiveDay] = useState(DAYS[Math.min(Math.max(today.getDay() - 1, 0), 4)])
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [showAskAI, setShowAskAI] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const weekKey = toKey(weekStart)
  const weekConfig = WEEK_CONFIGS[weekKey]

  const getHistory = useCallback((day) => {
    const base = [...(BASE_HISTORY[day] || [])]
    if (trades && trades.length > 0) {
      const baseDates = new Set(base.map(e => e.date))
      const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      const SHORT_TO_LONG = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday' }
      const byDate = {}
      trades.forEach(t => {
        let dateStr = null
        if (t.date && typeof t.date === 'string') {
          dateStr = t.date
        } else if (t.closeDate) {
          const d = t.closeDate instanceof Date ? t.closeDate : new Date(t.closeDate)
          if (!isNaN(d)) {
            dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          }
        }
        if (!dateStr) return
        let dow = DAY_SHORT[new Date(dateStr + 'T12:00:00Z').getUTCDay()]
        // Sunday gap trades → Monday
        if (dow === 'Sun') dow = 'Mon'
        if (SHORT_TO_LONG[dow] !== day) return
        if (!byDate[dateStr]) byDate[dateStr] = 0
        byDate[dateStr] += t.profit
      })
      Object.entries(byDate).forEach(([date, pnl]) => {
        if (!baseDates.has(date)) base.push({ date, pnl })
      })
    }
    return base.sort((a, b) => a.date.localeCompare(b.date))
  }, [trades])

  const navigate = (dir) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dir * 7)
    setWeekStart(d)
    setWeekPickerVal(toKey(d))
    setAnalyses({})
  }

  const handlePickerChange = (val) => {
    setWeekPickerVal(val)
    setWeekStart(getMondayOf(new Date(val)))
    setAnalyses({})
  }

  useEffect(() => {
    window.__analyseAll = () => DAYS.forEach(d => analyse(d))
    window.__askAI = () => setShowAskAI(s => !s)
    return () => { delete window.__analyseAll; delete window.__askAI }
  }, [weekStart, weekConfig])

  const analyse = useCallback(async (day, promptOverride) => {
    setLoading(l => ({ ...l, [day]: true }))
    const hist = getHistory(day)
    const stats = computeStats(hist)
    const dayIndex = DAYS.indexOf(day)
    const dayDate = getDayDate(weekStart, dayIndex)
    const dateStr = dayDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const cfg = weekConfig?.days?.[day]
    const events = cfg?.events?.join(', ') || 'No specific events noted'
    const context = cfg?.context || ''
    const goldPrice = weekConfig?.goldPrice || 'unknown'

    const prompt = promptOverride || `Today is ${dateStr}. Analyse the gold trading outlook.
- Events: ${events}
- ${context}
- Gold this week: ${goldPrice}
- ${day} history: ${stats.wins}W/${stats.losses}L, $${stats.total.toFixed(2)}, ${stats.wr}% WR
- Last 3 ${day}s: ${hist.slice(-3).map(e => `${e.date} $${e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(2)}`).join(', ')}
- Trader runs breakout EA on XAUUSD H1. Should they trade today? TRADE/CAUTIOUS/SKIP verdict. Max 150 words.`

    const system = `You are a sharp gold (XAUUSD) trading analyst. Give direct actionable verdicts for a breakout EA on H1.
Format: 1. **VERDICT: [TRADE/CAUTIOUS/SKIP]** 2. **Why** (2-3 sentences) 3. **Key risk** 4. **Timing tip**. Under 150 words.`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system)
      setAnalyses(a => ({ ...a, [day]: text }))
    } catch {
      setAnalyses(a => ({ ...a, [day]: '⚠️ Error fetching analysis.' }))
    }
    setLoading(l => ({ ...l, [day]: false }))
  }, [weekStart, weekConfig, getHistory])

  const hist = getHistory(activeDay)
  const stats = computeStats(hist)
  const analysis = analyses[activeDay]
  const isLoading = loading[activeDay]
  const verdict = verdictStyle(analysis)
  const maxAbs = Math.max(...hist.map(e => Math.abs(e.pnl)), 1)
  const dayIndex = DAYS.indexOf(activeDay)
  const activeDayDate = getDayDate(weekStart, dayIndex)
  const cfg = weekConfig?.days?.[activeDay]

  const dayRanking = [...DAYS].sort((a, b) => {
    const at = BASE_HISTORY[a].reduce((s, e) => s + e.pnl, 0)
    const bt = BASE_HISTORY[b].reduce((s, e) => s + e.pnl, 0)
    return bt - at
  })

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '220px', background: '#0c1424', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        {/* Week header + navigator */}
        <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em', marginBottom: '8px' }}>
            {weekConfig?.label || fmtDate(weekStart) + ' WEEK'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => navigate(-1)} style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <input type="date" value={weekPickerVal} onChange={e => handlePickerChange(e.target.value)}
              style={{ flex: 1, height: '26px', padding: '0 6px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#e8edf5', fontSize: '10px', fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={() => navigate(1)} style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>
        </div>

        {/* Day buttons */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {DAYS.map((day, i) => {
            const h = getHistory(day)
            const s = computeStats(h)
            const isActive = day === activeDay
            const v = verdictStyle(analyses[day])
            const isLd = !!loading[day]
            const dayDate = getDayDate(weekStart, i)

            return (
              <button key={day} onClick={() => setActiveDay(day)} className="day-btn" style={{
                width: '100%',
                background: isActive ? 'linear-gradient(90deg,rgba(212,168,67,0.12),transparent)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${isActive ? '#d4a843' : 'transparent'}`,
                padding: '11px 14px', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#d4a843' : '#e8edf5' }}>{day}</span>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {isLd && <span style={{ fontSize: '9px', color: '#7c3aed', animation: 'pulse 1s infinite' }}>●</span>}
                    {analyses[day] && !isLd && <span style={{ fontSize: '9px', color: v.color }}>●</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: s.color, letterSpacing: '0.06em' }}>{s.label}</span>
                  <span style={{ fontSize: '9px', color: '#3d4f6a' }}>·</span>
                  <span style={{ fontSize: '9px', color: s.total >= 0 ? '#10b981' : '#ef4444' }}>{s.total >= 0 ? '+' : '-'}${Math.abs(Math.round(s.total))}</span>
                  <span style={{ fontSize: '9px', color: '#3d4f6a' }}>·</span>
                  <span style={{ fontSize: '9px', color: '#7a8ba8' }}>{s.wr}%</span>
                </div>
                <div style={{ fontSize: '9px', color: '#3d4f6a' }}>{fmtDate(dayDate)}</div>
              </button>
            )
          })}
        </div>

        {/* Day ranking */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', marginBottom: '8px' }}>DAY RANKING</div>
          {dayRanking.map((day, i) => {
            const total = BASE_HISTORY[day].reduce((s, e) => s + e.pnl, 0)
            return (
              <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#3d4f6a', width: '14px' }}>#{i + 1}</span>
                  <span style={{ fontSize: '11px', color: '#7a8ba8' }}>{day.slice(0, 3)}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: total >= 0 ? '#10b981' : '#ef4444' }}>
                  {total >= 0 ? '+' : '-'}${Math.abs(Math.round(total))}
                </span>
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <main className="grid-lines" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {/* Ask AI bar */}
        {showAskAI && (
          <div style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
              placeholder={`Ask about gold this week...`}
              style={{ flex: 1, background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', color: '#e8edf5', padding: '10px', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', minHeight: '50px', outline: 'none' }} />
            <button onClick={() => { if (customPrompt.trim()) { analyse(activeDay, customPrompt); setCustomPrompt(''); setShowAskAI(false) } }}
              style={{ background: '#d4a843', border: 'none', color: '#0a0e1a', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' }}>ASK</button>
          </div>
        )}

        {/* Day header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: '#e8edf5', margin: 0 }}>{activeDay}</h1>
              <span style={{ fontSize: '13px', color: '#7a8ba8' }}>{fmtDate(activeDayDate)}</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {cfg ? cfg.events.map((ev, i) => (
                <span key={i} style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '10px',
                  background: ev.includes('🔴') ? '#450a0a' : '#111c30',
                  border: `1px solid ${ev.includes('🔴') ? '#7f1d1d' : 'rgba(255,255,255,0.06)'}`,
                  color: ev.includes('🔴') ? '#fca5a5' : '#3d4f6a',
                }}>{ev}</span>
              )) : (
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', color: '#3d4f6a' }}>No events configured</span>
              )}
            </div>
          </div>
          <button onClick={() => analyse(activeDay)} disabled={isLoading} className="action-btn" style={{
            padding: '10px 20px', borderRadius: '9px', fontSize: '12px', fontFamily: 'inherit',
            fontWeight: 700, border: 'none', letterSpacing: '0.06em', cursor: isLoading ? 'not-allowed' : 'pointer',
            background: isLoading ? '#1e293b' : 'linear-gradient(135deg,#d4a843,#a07828)',
            color: isLoading ? '#475569' : '#0d1929', boxShadow: isLoading ? 'none' : 'rgba(212,168,67,0.12) 0 4px 16px',
          }}>
            {isLoading ? '⏳ ANALYSING...' : '🔍 ANALYSE DAY'}
          </button>
        </div>

        {/* 5 stat boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Total P&L', val: (stats.total >= 0 ? '+' : '') + '$' + stats.total.toFixed(2), color: stats.total >= 0 ? '#10b981' : '#ef4444' },
            { label: 'Win Rate', val: stats.wr + '%', color: stats.wr >= 70 ? '#10b981' : stats.wr >= 55 ? '#f59e0b' : '#ef4444' },
            { label: 'Wins', val: stats.wins, color: '#10b981' },
            { label: 'Losses', val: stats.losses, color: '#ef4444' },
            { label: 'Weeks', val: hist.length, color: '#7a8ba8' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Forward Analysis */}
        <div style={{ background: '#0c1424', border: `1px solid ${analysis ? verdict.color + '55' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '20px', marginBottom: '16px', minHeight: '170px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: analysis ? verdict.color : '#3d4f6a' }} />
              <span style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em' }}>FORWARD ANALYSIS</span>
            </div>
            {analysis && (
              <div style={{ background: verdict.color + '20', border: `1px solid ${verdict.color}`, color: verdict.color, padding: '3px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>
                {verdict.label}
              </div>
            )}
          </div>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#7c3aed', padding: '16px 0' }}>
              <div style={{ width: '18px', height: '18px', border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Fetching market intelligence...</span>
            </div>
          )}
          {!isLoading && !analysis && (
            <div style={{ padding: '16px 0', color: '#3d4f6a' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</div>
              <div style={{ fontSize: '12px', lineHeight: 1.8 }}>Click <strong style={{ color: '#d4a843' }}>ANALYSE DAY</strong> for AI verdict on {activeDay}</div>
              <div style={{ fontSize: '10px', color: '#3d4f6a', marginTop: '4px' }}>macro events · historical patterns · timing</div>
            </div>
          )}
          {!isLoading && analysis && (
            <div style={{ fontSize: '13px', lineHeight: '1.9', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
              {analysis.split('\n').map((line, i) => {
                if (line.includes('**')) {
                  const parts = line.split('**')
                  return (
                    <div key={i} style={{ marginBottom: '3px' }}>
                      {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#f1f5f9' }}>{p}</strong> : <span key={j}>{p}</span>)}
                    </div>
                  )
                }
                return <div key={i} style={{ marginBottom: line === '' ? '8px' : '1px' }}>{line}</div>
              })}
            </div>
          )}
        </div>

        {/* History collapsible */}
        <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          <button onClick={() => setShowHistory(s => !s)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '13px 18px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em' }}>{activeDay.toUpperCase()} HISTORY</span>
              <span style={{ fontSize: '9px', padding: '1px 7px', borderRadius: '10px', background: '#111c30', color: '#7a8ba8', border: '1px solid rgba(255,255,255,0.06)' }}>{hist.length} weeks</span>
            </div>
            <span style={{ fontSize: '10px', color: '#3d4f6a', transform: showHistory ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </button>
          {showHistory && (
            <div style={{ padding: '0 18px 16px' }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '48px', marginBottom: '12px' }}>
                {hist.map((e, i) => {
                  const h = Math.max(3, Math.round((Math.abs(e.pnl) / maxAbs) * 44))
                  return <div key={i} title={`${e.date}: $${e.pnl.toFixed(2)}`} style={{ flex: 1, height: `${h}px`, background: e.pnl > 0 ? '#16a34a' : '#dc2626', borderRadius: '2px 2px 0 0', alignSelf: 'flex-end', opacity: 0.85 }} />
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '5px' }}>
                {hist.map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: '#0f172a', borderRadius: '5px', fontSize: '11px' }}>
                    <span style={{ color: '#475569' }}>{e.date}</span>
                    <span style={{ color: e.pnl > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(2)} {e.pnl > 0 ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Week Context + Decision Framework */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', marginBottom: '12px' }}>WEEK CONTEXT</div>
            {cfg ? (
              <>
                <div style={{ fontSize: '11px', color: '#7a8ba8', lineHeight: 1.8 }}>{cfg.context}</div>
                {weekConfig?.goldPrice && (
                  <div style={{ marginTop: '10px', padding: '8px', background: '#111c30', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#475569' }}>Gold this week: </span>
                    <span style={{ fontSize: '13px', color: '#d4a843', fontWeight: 700 }}>{weekConfig.goldPrice}</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: '11px', color: '#3d4f6a' }}>No context for this week. Upload CSV or navigate to a known week.</div>
            )}
          </div>
          <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', marginBottom: '12px' }}>DECISION FRAMEWORK</div>
            {DECISION_FRAMEWORK.map(r => (
              <div key={r.cond} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#7a8ba8' }}>{r.cond}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', color: r.color, background: r.color + '15', border: `1px solid ${r.color}30`, letterSpacing: '0.06em' }}>{r.verdict}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

import React, { useState, useCallback, useRef } from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// ─── BASE HISTORICAL DATA ─────────────────────────────────────────────────────
const BASE_HISTORY = {
  Monday: [
    { date: '08 Dec 2025', pnl: -58.98 }, { date: '22 Dec 2025', pnl: 47.71 },
    { date: '29 Dec 2025', pnl: -53.01 }, { date: '12 Jan 2026', pnl: 62.30 },
    { date: '19 Jan 2026', pnl: 8.22 },   { date: '26 Jan 2026', pnl: 13.50 },
    { date: '02 Feb 2026', pnl: -9.19 },  { date: '09 Feb 2026', pnl: -23.89 },
    { date: '23 Feb 2026', pnl: 81.00 },  { date: '02 Mar 2026', pnl: 2.57 },
    { date: '09 Mar 2026', pnl: -126.36 },
  ],
  Tuesday: [
    { date: '09 Dec 2025', pnl: 18.42 },  { date: '16 Dec 2025', pnl: 0.90 },
    { date: '23 Dec 2025', pnl: -19.43 }, { date: '13 Jan 2026', pnl: 1.43 },
    { date: '20 Jan 2026', pnl: 9.16 },   { date: '27 Jan 2026', pnl: 72.81 },
    { date: '03 Feb 2026', pnl: 13.50 },  { date: '17 Feb 2026', pnl: 61.06 },
    { date: '24 Feb 2026', pnl: 12.67 },  { date: '03 Mar 2026', pnl: 228.06 },
    { date: '10 Mar 2026', pnl: -59.61 },
  ],
  Wednesday: [
    { date: '10 Dec 2025', pnl: -2.59 },  { date: '17 Dec 2025', pnl: -20.59 },
    { date: '24 Dec 2025', pnl: 6.47 },   { date: '07 Jan 2026', pnl: -11.33 },
    { date: '14 Jan 2026', pnl: -70.36 }, { date: '28 Jan 2026', pnl: 11.97 },
    { date: '04 Feb 2026', pnl: 14.00 },  { date: '11 Feb 2026', pnl: 92.55 },
    { date: '25 Feb 2026', pnl: 2.00 },   { date: '04 Mar 2026', pnl: -2.73 },
    { date: '11 Mar 2026', pnl: 29.63 },
  ],
  Thursday: [
    { date: '11 Dec 2025', pnl: 93.10 },  { date: '18 Dec 2025', pnl: 176.28 },
    { date: '08 Jan 2026', pnl: -0.13 },  { date: '15 Jan 2026', pnl: -20.02 },
    { date: '22 Jan 2026', pnl: 21.70 },  { date: '29 Jan 2026', pnl: 16.08 },
    { date: '05 Feb 2026', pnl: 21.71 },  { date: '12 Feb 2026', pnl: 41.00 },
    { date: '19 Feb 2026', pnl: -26.17 }, { date: '26 Feb 2026', pnl: -46.79 },
    { date: '05 Mar 2026', pnl: 38.65 },  { date: '12 Mar 2026', pnl: 10.67 },
    { date: '19 Mar 2026', pnl: 18.73 },  { date: '26 Mar 2026', pnl: 33.25 },
  ],
  Friday: [
    { date: '12 Dec 2025', pnl: 0.50 },   { date: '19 Dec 2025', pnl: -14.53 },
    { date: '26 Dec 2025', pnl: -13.10 }, { date: '09 Jan 2026', pnl: -15.59 },
    { date: '16 Jan 2026', pnl: 60.44 },  { date: '23 Jan 2026', pnl: 4.77 },
    { date: '30 Jan 2026', pnl: 54.57 },  { date: '06 Feb 2026', pnl: -21.25 },
    { date: '13 Feb 2026', pnl: -19.22 }, { date: '20 Feb 2026', pnl: 0.16 },
    { date: '27 Feb 2026', pnl: 79.26 },  { date: '06 Mar 2026', pnl: 24.88 },
    { date: '13 Mar 2026', pnl: 8.28 },   { date: '20 Mar 2026', pnl: 86.67 },
  ],
}

// ─── WEEK CONFIGS ─────────────────────────────────────────────────────────────
const WEEK_CONFIGS = {
  '2026-03-09': {
    label: '09–13 Mar 2026', goldPrice: '$5,169',
    days: {
      Monday:    { events: ['China CPI release (Morning)', '⚠️ Sunday gap trades: -$126.36 included'], context: 'Sunday Mar 8 gap trades fired at 23:42 and mostly stopped out (-$126.36), attributed to Monday. China CPI also released. Gold ~$5,169.' },
      Tuesday:   { events: ['No major scheduled data', 'Clean calendar day'], context: 'No major US data. Clean calendar. Last Tuesday Mar 3 was massive +$228.' },
      Wednesday: { events: ['🔴 US CPI February — 8:30 AM ET', 'Highest impact event of the week'], context: 'February CPI. January CPI was 2.4% YoY. JPM warns tariffs push inflation higher.' },
      Thursday:  { events: ['US PPI data — 8:30 AM ET', 'Bank of England Governor speech'], context: 'PPI at 8:30 AM ET. BoE Governor speech — mainly GBP impact.' },
      Friday:    { events: ['US Core PCE data', 'US Q4 GDP estimate', 'Michigan Consumer Sentiment', 'Canada Labor data'], context: 'Core PCE + GDP + Michigan Sentiment + Canada jobs. Multiple data releases.' },
    }
  },
  '2026-03-16': {
    label: '16–20 Mar 2026', goldPrice: '~$5,020',
    days: {
      Monday:    { events: ['NY Empire State Manufacturing Index', 'Weekend gap risk — gold at $5,020'], context: 'Low-tier data. Gold sold off sharply last week. FOMC looming Wednesday.' },
      Tuesday:   { events: ['US Retail Sales — 8:30 AM ET', '🔴 FOMC eve — pre-decision positioning'], context: 'Retail Sales at 8:30 ET. FOMC tomorrow. Pre-Fed positioning = choppy ranges likely.' },
      Wednesday: { events: ['🔴 FOMC Rate Decision — 2:00 PM ET', '🔴 Powell Press Conference — 2:30 PM ET', 'Biggest gold event of the week'], context: 'Fed expected to HOLD at 3.75%. Dot plot + Powell forward guidance = massive volatility.' },
      Thursday:  { events: ['🔴 US PPI February — 8:30 AM ET', 'US Jobless Claims — 8:30 AM ET', 'Post-FOMC continuation moves'], context: 'Post-FOMC day. PPI + Jobless Claims at 8:30 ET. Continuation moves often big.' },
      Friday:    { events: ['Michigan Consumer Sentiment (Final)', 'Quad Witching — options expiry day', 'Post-FOMC weekly close'], context: 'Quad Witching + post-FOMC rebalancing. Unusual vol patterns. Weekly close.' },
    }
  },
}

const DECISION_FRAMEWORK = [
  { cond: 'FOMC day (eve + decision)', verdict: 'SKIP PM', color: '#ef4444' },
  { cond: 'Post-FOMC Thursday', verdict: 'FULL SEND', color: '#10b981' },
  { cond: 'Hot CPI + any day', verdict: 'SKIP', color: '#ef4444' },
  { cond: 'No news + Tuesday', verdict: 'FULL SEND', color: '#10b981' },
  { cond: 'No news + Thursday', verdict: 'FULL SEND', color: '#10b981' },
  { cond: 'Quad Witching Friday', verdict: 'CAUTIOUS', color: '#f59e0b' },
  { cond: 'Monday any week', verdict: 'CAUTIOUS', color: '#f59e0b' },
  { cond: 'Geopolitical shock', verdict: 'SKIP', color: '#ef4444' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toKey(date) { return date.toISOString().slice(0, 10) }

function fmtDate(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getDayDate(mondayDate, dayIndex) {
  const d = new Date(mondayDate)
  d.setDate(d.getDate() + dayIndex)
  return d
}

function computeStats(entries) {
  const real = entries.filter(e => e.pnl !== 0)
  const wins = real.filter(e => e.pnl > 0).length
  const losses = real.filter(e => e.pnl < 0).length
  const total = entries.reduce((s, e) => s + e.pnl, 0)
  const wr = real.length > 0 ? Math.round(wins / real.length * 100) : 0
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
  if (u.includes('CAUTIOUS') || u.includes('CAUTION')) return { color: '#f59e0b', label: 'CAUTIOUS' }
  if (u.includes('TRADE')) return { color: '#22c55e', label: 'TRADE' }
  return { color: '#94a3b8', label: 'ANALYSING' }
}

async function callClaude(messages, system) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'No response.'
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IntelTab({ trades }) {
  const today = new Date()
  const [weekStart, setWeekStart] = useState(getMondayOf(today))
  const [activeDay, setActiveDay] = useState(DAYS[Math.min(Math.max(today.getDay() - 1, 0), 4)])
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [weekPickerVal, setWeekPickerVal] = useState(toKey(getMondayOf(today)))

  const weekKey = toKey(weekStart)
  const weekConfig = WEEK_CONFIGS[weekKey]
  const isCurrentWeek = weekKey === toKey(getMondayOf(today))

  // Merge CSV trades into history if available
  const getHistory = useCallback((day) => {
    const base = [...(BASE_HISTORY[day] || [])]
    if (trades && trades.length > 0) {
      // Add CSV trades that aren't already in base data
      const baseDates = new Set(base.map(e => e.date))
      trades.forEach(t => {
        const dt = new Date(t.closeDate || t.date)
        if (!dt || isNaN(dt)) return
        const dow = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dt.getDay()]
        if (dow !== day) return
        const label = fmtDate(dt)
        if (!baseDates.has(label)) {
          base.push({ date: label, pnl: t.profit })
        }
      })
    }
    return base.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [trades])

  const navigate = (dir) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dir * 7)
    setWeekStart(d)
    setWeekPickerVal(toKey(d))
    setAnalyses({})
    setActiveDay('Monday')
  }

  const handlePickerChange = (val) => {
    setWeekPickerVal(val)
    const d = getMondayOf(new Date(val))
    setWeekStart(d)
    setAnalyses({})
    setActiveDay('Monday')
  }

  const buildPrompt = (day, dayDate, hist, stats) => {
    const dateStr = dayDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const cfg = weekConfig?.days?.[day]
    const events = cfg?.events?.join(', ') || 'No specific events noted'
    const context = cfg?.context || ''
    const goldPrice = weekConfig?.goldPrice || 'unknown'
    return `Today is ${dateStr}. Analyse the gold trading outlook for today. Key context:
- Events today: ${events}
- ${context}
- Gold price this week: ${goldPrice}
- Historical ${day} stats: ${stats.wins}W/${stats.losses}L, total $${stats.total.toFixed(2)}, win rate ${stats.wr}%
- Last 3 ${day}s: ${hist.slice(-3).map(e => `${e.date} $${e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(2)}`).join(', ')}
- The trader runs a breakout EA (pending order strategy) on XAUUSD H1

Should the trader run their EA today? Give a TRADE / CAUTIOUS / SKIP verdict with reasoning and timing. Be concise, direct, like a sharp trading analyst. Max 150 words.`
  }

  const analyse = useCallback(async (day, promptOverride) => {
    setLoading(l => ({ ...l, [day]: true }))
    const hist = getHistory(day)
    const stats = computeStats(hist)
    const dayIndex = DAYS.indexOf(day)
    const dayDate = getDayDate(weekStart, dayIndex)
    const prompt = promptOverride || buildPrompt(day, dayDate, hist, stats)

    const system = `You are a sharp, experienced gold (XAUUSD) trading analyst. You give direct, actionable daily verdicts for a trader running a breakout pending-order EA on XAUUSD H1.

Your response format:
1. **VERDICT: [TRADE / CAUTIOUS / SKIP]** (bold, first line)
2. **Why** in 2-3 sentences
3. **Key risk to watch**
4. **Timing tip**

Keep total response under 150 words. Direct like a Bloomberg terminal analyst.`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system)
      setAnalyses(a => ({ ...a, [day]: text }))
    } catch {
      setAnalyses(a => ({ ...a, [day]: '⚠️ Error fetching analysis. Check API key.' }))
    }
    setLoading(l => ({ ...l, [day]: false }))
  }, [weekStart, weekConfig, getHistory])

  const runAll = () => DAYS.forEach(d => analyse(d))

  const hist = getHistory(activeDay)
  const stats = computeStats(hist)
  const analysis = analyses[activeDay]
  const isLoading = loading[activeDay]
  const verdict = verdictStyle(analysis)
  const maxAbs = Math.max(...hist.map(e => Math.abs(e.pnl)), 1)
  const dayIndex = DAYS.indexOf(activeDay)
  const activeDayDate = getDayDate(weekStart, dayIndex)
  const cfg = weekConfig?.days?.[activeDay]

  // Week summary for sidebar
  const weekSummary = DAYS.map((day, i) => {
    const d = getDayDate(weekStart, i)
    const label = fmtDate(d)
    const found = BASE_HISTORY[day]?.find(e => e.date === label)
    return { day, pnl: found ? found.pnl : null }
  })
  const weekTotal = weekSummary.reduce((s, d) => s + (d.pnl ?? 0), 0)

  // All-time stats
  const allEntries = Object.values(BASE_HISTORY).flat()
  const allTimeTotal = allEntries.reduce((s, e) => s + e.pnl, 0)
  const bestDay = Object.entries(BASE_HISTORY).reduce((best, [day, entries]) => {
    const total = entries.reduce((s, e) => s + e.pnl, 0)
    return total > best.total ? { day, total } : best
  }, { day: '', total: -Infinity })
  const allWins = allEntries.filter(e => e.pnl > 0).length
  const allWR = Math.round(allWins / allEntries.length * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: '600px' }}>
      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => navigate(-1)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <input type="date" value={weekPickerVal} onChange={e => handlePickerChange(e.target.value)}
            style={{ height: '30px', padding: '0 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: 'var(--text)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={() => navigate(1)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>

        {weekConfig && <span style={{ fontSize: '11px', color: '#7a8ba8' }}>{weekConfig.label}</span>}
        {isCurrentWeek && <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '9px', fontWeight: 600, background: 'rgba(212,168,67,0.13)', border: '1px solid rgba(212,168,67,0.27)', color: '#d4a843', letterSpacing: '0.12em' }}>THIS WEEK</span>}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button onClick={runAll} style={{ height: '30px', padding: '0 14px', borderRadius: '6px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#d4a843,#a07828)', color: '#0d1929' }}>⚡ ANALYSE ALL</button>
          <button onClick={() => setShowCustom(s => !s)} style={{ height: '30px', padding: '0 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer' }}>+ Ask AI</button>
        </div>
      </div>

      {/* Custom AI prompt */}
      {showCustom && (
        <div style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', marginBottom: '12px', display: 'flex', gap: '10px' }}>
          <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
            placeholder={`Ask about gold this week... e.g. "If FOMC is hawkish, should I trade Thursday?"`}
            style={{ flex: 1, background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text)', padding: '10px', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', minHeight: '50px', outline: 'none' }} />
          <button onClick={() => { if (customPrompt.trim()) { analyse(activeDay, customPrompt); setCustomPrompt(''); setShowCustom(false) } }}
            style={{ background: '#d4a843', border: 'none', color: '#0a0e1a', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' }}>ASK</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', flexShrink: 0, background: '#0a0e1a', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 14px 8px', fontSize: '9px', color: '#334155', letterSpacing: '0.12em' }}>
            {weekConfig?.label || fmtDate(weekStart)} — SELECT DAY
          </div>

          {DAYS.map((day, i) => {
            const h = getHistory(day)
            const s = computeStats(h)
            const isActive = day === activeDay
            const v = verdictStyle(analyses[day])
            const isLd = !!loading[day]
            const dayDate = getDayDate(weekStart, i)
            const dayPnl = weekSummary[i]?.pnl

            return (
              <button key={day} onClick={() => setActiveDay(day)} style={{
                width: '100%', background: isActive ? '#0f172a' : 'transparent',
                border: 'none', borderLeft: `3px solid ${isActive ? '#d4a843' : 'transparent'}`,
                color: isActive ? '#f1f5f9' : '#475569', padding: '10px 14px',
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px',
                display: 'flex', flexDirection: 'column', gap: '3px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: isActive ? 700 : 500 }}>{day}</span>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {isLd && <span style={{ fontSize: '9px', color: '#7c3aed', animation: 'pulse 1s infinite' }}>●</span>}
                    {analyses[day] && !isLd && <span style={{ fontSize: '9px', color: v.color }}>●</span>}
                    {dayPnl !== null && dayPnl !== undefined && (
                      <span style={{ fontSize: '10px', color: dayPnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                        {dayPnl >= 0 ? '+' : ''}${dayPnl.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: s.color, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: '10px', color: '#334155' }}>•</span>
                  <span style={{ fontSize: '10px', color: s.total >= 0 ? '#22c55e' : '#ef4444' }}>{s.total >= 0 ? '+' : ''}${s.total.toFixed(0)}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#334155' }}>{fmtDate(dayDate)}</div>
              </button>
            )
          })}

          {/* Day ranking in sidebar */}
          <div style={{ margin: '14px 10px 0', padding: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', color: '#334155', marginBottom: '8px', letterSpacing: '0.1em' }}>ALL-TIME DAY RANKING</div>
            {[...DAYS].sort((a, b) => {
              const at = BASE_HISTORY[a].reduce((s, e) => s + e.pnl, 0)
              const bt = BASE_HISTORY[b].reduce((s, e) => s + e.pnl, 0)
              return bt - at
            }).map((d, i) => {
              const total = BASE_HISTORY[d].reduce((s, e) => s + e.pnl, 0)
              return (
                <div key={d} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#334155' }}>#{i + 1}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{d.slice(0, 3)}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: total >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {total >= 0 ? '+' : ''}${total.toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Day header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#f1f5f9', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {activeDay}
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 400 }}>{fmtDate(activeDayDate)}</span>
              </h2>
              <div style={{ marginTop: '8px', display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                {cfg ? cfg.events.map((ev, i) => (
                  <span key={i} style={{
                    background: ev.includes('🔴') ? '#450a0a' : '#0f172a',
                    border: `1px solid ${ev.includes('🔴') ? '#7f1d1d' : '#1e293b'}`,
                    color: ev.includes('🔴') ? '#fca5a5' : '#64748b',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                  }}>{ev}</span>
                )) : (
                  <span style={{ background: '#0f172a', border: '1px solid #1e293b', color: '#475569', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>
                    No event data for this week — AI uses historical context only
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => analyse(activeDay)} disabled={isLoading} style={{
              background: isLoading ? '#1e293b' : 'linear-gradient(135deg,#d4a843,#f59e0b)',
              border: 'none', color: isLoading ? '#475569' : '#0a0e1a',
              padding: '10px 18px', borderRadius: '8px', fontSize: '12px',
              fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 700,
            }}>
              {isLoading ? '⏳ ANALYSING...' : '🔍 ANALYSE DAY'}
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Historical P&L', val: `${stats.total >= 0 ? '+' : ''}$${stats.total.toFixed(2)}`, color: stats.total > 0 ? '#22c55e' : '#ef4444' },
              { label: 'Win Rate', val: `${stats.wr}%`, color: stats.wr >= 70 ? '#22c55e' : stats.wr >= 55 ? '#f59e0b' : '#ef4444' },
              { label: 'Wins', val: stats.wins, color: '#22c55e' },
              { label: 'Losses', val: stats.losses, color: '#ef4444' },
              { label: 'Weeks Traded', val: hist.length, color: '#94a3b8' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#334155', marginBottom: '5px', letterSpacing: '0.08em' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* AI analysis */}
          <div style={{ background: '#0a0e1a', border: `1px solid ${analysis ? verdict.color + '55' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', padding: '18px', marginBottom: '16px', minHeight: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '0.12em' }}>AI MARKET ANALYSIS</div>
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
              <div style={{ color: '#475569', fontSize: '13px', padding: '16px 0', lineHeight: 2 }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>🔍</div>
                Click <strong style={{ color: '#d4a843' }}>ANALYSE DAY</strong> for AI verdict on {activeDay} {fmtDate(activeDayDate)}<br />
                <span style={{ fontSize: '11px', color: '#334155' }}>macro events · historical patterns · timing guidance</span>
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

          {/* History section */}
          <div style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' }}>
            <button onClick={() => setShowHistory(s => !s)} style={{
              width: '100%', background: 'transparent', border: 'none', color: '#64748b',
              padding: '12px 18px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '11px', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between',
            }}>
              <span>📊 {activeDay.toUpperCase()} FULL HISTORY ({hist.length} weeks recorded)</span>
              <span>{showHistory ? '▲ HIDE' : '▼ SHOW'}</span>
            </button>
            {showHistory && (
              <div style={{ padding: '0 18px 16px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '60px', marginBottom: '12px' }}>
                  {hist.map((e, i) => {
                    const barH = Math.max(4, Math.round((Math.abs(e.pnl) / maxAbs) * 56))
                    return <div key={i} title={`${e.date}: $${e.pnl.toFixed(2)}`} style={{ flex: 1, height: `${barH}px`, background: e.pnl > 0 ? '#16a34a' : e.pnl < 0 ? '#dc2626' : '#334155', borderRadius: '2px 2px 0 0', alignSelf: 'flex-end', opacity: 0.85 }} />
                  })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '5px' }}>
                  {hist.map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: '#0f172a', borderRadius: '5px', fontSize: '11px' }}>
                      <span style={{ color: '#475569' }}>{e.date}</span>
                      <span style={{ color: e.pnl > 0 ? '#22c55e' : e.pnl < 0 ? '#ef4444' : '#475569', fontWeight: 600 }}>
                        {e.pnl !== 0 ? `${e.pnl >= 0 ? '+' : ''}$${e.pnl.toFixed(2)} ${e.pnl > 0 ? '✅' : '❌'}` : '— pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Context + Framework */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '0.12em', marginBottom: '12px' }}>WEEK CONTEXT</div>
              {cfg ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.8' }}>{cfg.context}</div>
              ) : (
                <div style={{ fontSize: '12px', color: '#334155' }}>No context configured for this week. Navigate to a known week or upload CSV data.</div>
              )}
              {weekConfig?.goldPrice && (
                <div style={{ marginTop: '10px', padding: '8px', background: '#0f172a', borderRadius: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#475569' }}>Gold this week: </span>
                  <span style={{ fontSize: '13px', color: '#d4a843', fontWeight: 700 }}>{weekConfig.goldPrice}</span>
                </div>
              )}
            </div>
            <div style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '0.12em', marginBottom: '12px' }}>DECISION FRAMEWORK</div>
              {DECISION_FRAMEWORK.map(r => (
                <div key={r.cond} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{r.cond}</span>
                  <span style={{ fontSize: '11px', color: r.color, fontWeight: 700 }}>{r.verdict}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

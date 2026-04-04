import React, { useState, useCallback } from 'react'
import { computeAnalytics } from '../../utils/csvParser.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_LABELS = { Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI' }

async function callClaude(messages, system) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

function VerdictBadge({ verdict }) {
  if (!verdict) return null
  const v = verdict.toUpperCase()
  const colors = {
    TRADE: { bg: 'var(--green-glow)', color: 'var(--green)', border: 'rgba(16,185,129,0.3)' },
    CAUTIOUS: { bg: 'var(--gold-glow)', color: 'var(--gold)', border: 'rgba(212,168,67,0.3)' },
    SKIP: { bg: 'var(--red-glow)', color: 'var(--red)', border: 'rgba(239,68,68,0.3)' },
  }
  const style = colors[v] || colors.CAUTIOUS
  return (
    <span style={{
      padding: '4px 14px', borderRadius: '100px',
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
    }}>{v}</span>
  )
}

function DayStats({ dayData }) {
  if (!dayData) return null
  const { trades, wins, losses, profit } = dayData
  const total = trades.length
  const wr = total > 0 ? Math.round((wins / total) * 100) : 0
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {[
        { label: 'Trades', val: total },
        { label: 'Win Rate', val: `${wr}%` },
        { label: 'Wins', val: wins, color: 'var(--green)' },
        { label: 'Losses', val: losses, color: 'var(--red)' },
        { label: 'P&L', val: `$${profit.toFixed(2)}`, color: profit >= 0 ? 'var(--green)' : 'var(--red)' },
      ].map(({ label, val, color }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-mute)', letterSpacing: '0.05em' }}>{label}</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: color || 'var(--text)' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

export default function IntelTab({ trades }) {
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState({})

  const analytics = trades ? computeAnalytics(trades) : null

  const today = new Date()
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]

  const analyse = useCallback(async (day, type) => {
    const key = `${day}-${type}`
    if (loading[key]) return
    setLoading(prev => ({ ...prev, [key]: true }))

    const dayData = analytics?.byDay?.[day]
    const trades_summary = dayData ? `${dayData.trades.length} trades, ${dayData.wins} wins, ${dayData.losses} losses, $${dayData.profit.toFixed(2)} P&L` : 'No data'

    const system = `You are MyFXIntel, an AI trading intelligence system for Gold EA traders. 
Your job is to give concise, actionable analysis. Always end with a verdict: TRADE, CAUTIOUS, or SKIP.
Format your response with clear sections. Be direct and specific. Max 250 words.`

    const prompt = type === 'forward'
      ? `Analyse ${day} for Gold EA trading. Historical data: ${trades_summary}. 
         Give a FORWARD ANALYSIS for the upcoming ${day} session. 
         Consider: typical ${day} market behaviour for Gold, session timing (London/NY), and the EA's historical performance on this day.
         End with verdict: TRADE | CAUTIOUS | SKIP`
      : `Do a POST-MORTEM of ${day} Gold EA trading. Historical data: ${trades_summary}.
         Analyse what typically went wrong or right on ${day}s based on this data.
         What patterns emerge? What should be adjusted?
         End with verdict for future ${day}s: TRADE | CAUTIOUS | SKIP`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system)
      setAnalyses(prev => ({ ...prev, [key]: text }))
    } catch (e) {
      setAnalyses(prev => ({ ...prev, [key]: 'Error connecting to AI. Check your API key.' }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [analytics, loading])

  const extractVerdict = (text) => {
    if (!text) return null
    const m = text.match(/\b(TRADE|CAUTIOUS|SKIP)\b/)
    return m ? m[1] : null
  }

  if (!trades || trades.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>Upload CSV to unlock Intel</div>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Upload your trading history to get AI-powered daily analysis</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Day selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {DAYS.map(day => {
          const isToday = day === todayName
          const dayData = analytics?.byDay?.[day]
          const wr = dayData && dayData.trades.length > 0 ? Math.round((dayData.wins / dayData.trades.length) * 100) : null
          return (
            <button key={day} onClick={() => setSelectedDay(day)} style={{
              padding: '10px 16px', borderRadius: 'var(--radius)',
              border: `1px solid ${selectedDay === day ? 'var(--gold)' : 'var(--border)'}`,
              background: selectedDay === day ? 'var(--gold-glow)' : 'var(--surface)',
              color: selectedDay === day ? 'var(--gold)' : 'var(--text-dim)',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', minWidth: '80px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }}>{DAY_LABELS[day]}</div>
              {isToday && <div style={{ fontSize: '9px', color: 'var(--gold)', marginTop: '2px' }}>TODAY</div>}
              {wr !== null && <div style={{ fontSize: '10px', color: wr >= 50 ? 'var(--green)' : 'var(--red)', marginTop: '2px' }}>{wr}% WR</div>}
            </button>
          )
        })}
      </div>

      {/* Selected day panel */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{selectedDay}</div>
            <DayStats dayData={analytics?.byDay?.[selectedDay]} />
          </div>
        </div>

        {/* Forward & Post-mortem */}
        {['forward', 'postmortem'].map(type => {
          const key = `${selectedDay}-${type}`
          const text = analyses[key]
          const verdict = extractVerdict(text)
          return (
            <div key={type} style={{ padding: '1.25rem 1.5rem', borderBottom: type === 'forward' ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                    {type === 'forward' ? '📅 FORWARD ANALYSIS' : '🔍 POST-MORTEM'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '2px' }}>
                    {type === 'forward' ? 'What to expect this session' : 'Why trades succeeded or failed'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {verdict && <VerdictBadge verdict={verdict} />}
                  <button onClick={() => analyse(selectedDay, type)} disabled={loading[key]} style={{
                    padding: '7px 16px', borderRadius: 'var(--radius)',
                    border: '1px solid var(--gold)', background: 'var(--gold-glow)',
                    color: 'var(--gold)', cursor: loading[key] ? 'wait' : 'pointer',
                    fontSize: '12px', fontFamily: 'var(--font-mono)',
                    opacity: loading[key] ? 0.6 : 1, transition: 'all 0.2s',
                  }}>
                    {loading[key] ? '⟳ Analysing...' : text ? '↻ Re-analyse' : '⚡ Analyse'}
                  </button>
                </div>
              </div>

              {text ? (
                <div style={{
                  background: 'var(--surface-b)', borderRadius: 'var(--radius)',
                  padding: '1rem 1.25rem', fontSize: '13px', lineHeight: '1.7',
                  color: 'var(--text)', whiteSpace: 'pre-wrap',
                  borderLeft: `3px solid ${verdict === 'TRADE' ? 'var(--green)' : verdict === 'SKIP' ? 'var(--red)' : 'var(--gold)'}`,
                }}>
                  {text}
                </div>
              ) : (
                <div style={{
                  background: 'var(--surface-b)', borderRadius: 'var(--radius)',
                  padding: '2rem', textAlign: 'center', color: 'var(--text-mute)', fontSize: '12px',
                }}>
                  Click Analyse to get AI-powered {type === 'forward' ? 'forward' : 'post-mortem'} analysis for {selectedDay}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

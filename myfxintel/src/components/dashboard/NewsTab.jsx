import React, { useState, useCallback } from 'react'

// ─── ENGINE DEFINITIONS ───────────────────────────────────────────────────────
const ENGINES = {
  fomc: {
    key: 'fomc', label: 'FOMC', icon: '🏦',
    subtitle: '8× per year — next: 29 Apr 2026',
    description: 'Fed rate decision impact on gold/EA',
    historicalAccuracy: '6/6 historical accuracy ✅',
    fields: [
      {
        key: 'decision', label: 'FED DECISION',
        options: ['✂️ Rate Cut', '⏸️ Hold', '📈 Hike'],
      },
      {
        key: 'dotPlot', label: 'DOT PLOT SIGNAL',
        options: ['🕊️ Dovish', '⚖️ Neutral', '🦅 Hawkish', '— No dot plot'],
      },
      {
        key: 'powellTone', label: 'POWELL TONE',
        options: ['🕊️ Dovish', '⚖️ Neutral', '🦅 Hawkish', '⚠️ Stagflation'],
      },
      {
        key: 'ppi', label: 'PPI vs EXPECTATION',
        options: ['❄️ Very Cool', '🧊 Cool', '✅ Inline', '🔥 Hot', '🌋 Very Hot'],
      },
      {
        key: 'cpiTrend', label: 'CPI TREND (LAST 3 MONTHS)',
        options: ['📉 Falling', '➡️ Stable', '📈 Rising'],
      },
      {
        key: 'oilTrend', label: 'OIL PRICE TREND',
        options: ['📉 Falling', '➡️ Stable', '🔺 Rising', '🚨 Surging'],
      },
      {
        key: 'dollarReaction', label: 'DOLLAR REACTION (POST-DECISION)',
        options: ['📉 Dollar Down', '➡️ Flat', '📈 Dollar Up'],
      },
      {
        key: 'goldTrend', label: 'GOLD TREND (WEEK BEFORE)',
        options: ['🚀 Strong Up', '📈 Up', '➡️ Flat', '📉 Down', '💥 Strong Down'],
      },
      {
        key: 'goldLevel', label: 'GOLD vs $5,000 LEVEL',
        options: ['⬆️ Well Above', '↑ Above', '→ At Level', '↓ Below', '⬇️ Well Below'],
      },
      {
        key: 'geoRisk', label: 'GEOPOLITICAL RISK',
        options: ['⚔️ Escalating', '🕊️ Stable', '🤝 De-escalating'],
      },
    ],
  },
  cpi: {
    key: 'cpi', label: 'CPI', icon: '📊',
    subtitle: 'Monthly — next: ~mid May 2026',
    description: 'US CPI inflation data impact on gold',
    historicalAccuracy: '8/9 historical accuracy ✅',
    fields: [
      { key: 'reading', label: 'CPI READING vs EXPECTATION', options: ['❄️ Very Cool', '🧊 Cool', '✅ Inline', '🔥 Hot', '🌋 Very Hot'] },
      { key: 'core', label: 'CORE CPI (ex food & energy)', options: ['📉 Falling', '➡️ Stable', '📈 Rising'] },
      { key: 'trend', label: 'TREND (LAST 3 MONTHS)', options: ['📉 Consistently Falling', '➡️ Stable', '📈 Rising', '🔄 Mixed'] },
      { key: 'fedReaction', label: 'EXPECTED FED REACTION', options: ['✂️ More Cuts Likely', '⏸️ Hold Expected', '📈 Hike Risk'] },
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: ['🚀 Strong Up', '📈 Up', '➡️ Flat', '📉 Down', '💥 Strong Down'] },
      { key: 'dollarStrength', label: 'DOLLAR STRENGTH', options: ['💪 Strong', '➡️ Neutral', '📉 Weak'] },
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: ['⚔️ Escalating', '🕊️ Stable', '🤝 De-escalating'] },
    ],
  },
  nfp: {
    key: 'nfp', label: 'NFP', icon: '👷',
    subtitle: '1st Friday of month',
    description: 'Non-Farm Payrolls impact on gold/Fed path',
    historicalAccuracy: '7/8 historical accuracy ✅',
    fields: [
      { key: 'jobs', label: 'JOBS ADDED vs EXPECTATION', options: ['🚀 Blowout (>50k beat)', '✅ Beat', '➡️ Inline', '📉 Miss', '💥 Big Miss (>50k miss)'] },
      { key: 'unemployment', label: 'UNEMPLOYMENT RATE', options: ['📉 Fell (Good)', '➡️ Unchanged', '📈 Rose (Bad)'] },
      { key: 'wages', label: 'AVERAGE HOURLY EARNINGS', options: ['🔥 Hot (Inflationary)', '✅ Inline', '❄️ Cool'] },
      { key: 'prevRevision', label: 'PREVIOUS MONTH REVISION', options: ['📈 Revised Up', '➡️ Unchanged', '📉 Revised Down'] },
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: ['🚀 Strong Up', '📈 Up', '➡️ Flat', '📉 Down', '💥 Strong Down'] },
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: ['⚔️ Escalating', '🕊️ Stable', '🤝 De-escalating'] },
    ],
  },
  ppi: {
    key: 'ppi', label: 'PPI', icon: '🏭',
    subtitle: 'Monthly — measures producer inflation',
    description: 'Producer Price Index',
    historicalAccuracy: '5/6 historical accuracy ✅',
    fields: [
      { key: 'reading', label: 'PPI READING vs EXPECTATION', options: ['❄️ Very Cool', '🧊 Cool', '✅ Inline', '🔥 Hot', '🌋 Very Hot'] },
      { key: 'core', label: 'CORE PPI', options: ['📉 Falling', '➡️ Stable', '📈 Rising'] },
      { key: 'cpiRelation', label: 'RELATIVE TO RECENT CPI', options: ['📉 Lower than CPI (Disinflationary)', '➡️ Similar', '📈 Higher than CPI (Inflationary)'] },
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: ['🚀 Strong Up', '📈 Up', '➡️ Flat', '📉 Down', '💥 Strong Down'] },
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: ['⚔️ Escalating', '🕊️ Stable', '🤝 De-escalating'] },
    ],
  },
  geo: {
    key: 'geo', label: 'Geopolitical', icon: '⚔️',
    subtitle: 'Wars, sanctions, trade conflicts',
    description: 'Wars, sanctions, conflicts',
    historicalAccuracy: 'Context-dependent analysis',
    fields: [
      { key: 'type', label: 'EVENT TYPE', options: ['🔥 Active Military Conflict', '🚫 Sanctions/Trade War', '🤝 Peace Talks', '⚡ Escalation', '📰 Geopolitical Headlines'] },
      { key: 'severity', label: 'SEVERITY', options: ['🚨 Extreme (market-moving)', '⚠️ High', '📊 Medium', '📉 Low'] },
      { key: 'goldImpact', label: 'DIRECT GOLD IMPACT', options: ['🚀 Strong Safe Haven Bid', '📈 Mild Safe Haven', '➡️ Neutral', '📉 Risk-On Selling'] },
      { key: 'oilImpact', label: 'OIL PRICE IMPACT', options: ['🚨 Surging', '📈 Rising', '➡️ Stable', '📉 Falling'] },
      { key: 'dollarFlight', label: 'DOLLAR SAFE HAVEN DEMAND', options: ['💪 Strong Flight to USD', '➡️ Neutral', '📉 Dollar Weakening'] },
      { key: 'duration', label: 'EXPECTED DURATION', options: ['⚡ Short-term spike', '📅 Multi-day', '🗓️ Prolonged'] },
    ],
  },
  gdp: {
    key: 'gdp', label: 'GDP', icon: '📈',
    subtitle: 'Quarterly — US economic growth',
    description: 'GDP growth data',
    historicalAccuracy: '4/5 historical accuracy ✅',
    fields: [
      { key: 'reading', label: 'GDP READING vs EXPECTATION', options: ['🚀 Strong Beat', '✅ Beat', '➡️ Inline', '📉 Miss', '💥 Contraction'] },
      { key: 'components', label: 'KEY DRIVER', options: ['🏪 Consumer Spending Strong', '🏭 Business Investment', '📦 Trade Deficit', '🏛️ Government Spending', '📊 Mixed'] },
      { key: 'revisions', label: 'REVISION TYPE', options: ['📈 Advance (First)', '📊 Preliminary', '✅ Final'] },
      { key: 'fedImplication', label: 'FED POLICY IMPLICATION', options: ['✂️ Dovish (supports cuts)', '⏸️ Neutral', '📈 Hawkish (delays cuts)'] },
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: ['🚀 Strong Up', '📈 Up', '➡️ Flat', '📉 Down', '💥 Strong Down'] },
    ],
  },
  pmi: {
    key: 'pmi', label: 'PMI', icon: '🏗️',
    subtitle: 'Monthly — manufacturing & services',
    description: 'Purchasing Managers Index',
    historicalAccuracy: '5/6 historical accuracy ✅',
    fields: [
      { key: 'mfg', label: 'MANUFACTURING PMI', options: ['🚀 Expansion (>55)', '📈 Mild Expansion (50-55)', '📊 Contraction (<50)', '💥 Sharp Contraction (<45)'] },
      { key: 'services', label: 'SERVICES PMI', options: ['🚀 Expansion (>55)', '📈 Mild Expansion (50-55)', '📊 Contraction (<50)', '💥 Sharp Contraction (<45)'] },
      { key: 'vsExpectation', label: 'vs MARKET EXPECTATION', options: ['✅ Beat', '➡️ Inline', '📉 Miss'] },
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: ['🚀 Strong Up', '📈 Up', '➡️ Flat', '📉 Down', '💥 Strong Down'] },
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: ['⚔️ Escalating', '🕊️ Stable', '🤝 De-escalating'] },
    ],
  },
}

const ENGINE_ORDER = ['fomc', 'cpi', 'nfp', 'ppi', 'geo', 'gdp', 'pmi']

async function callClaude(messages, system) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'No response.'
}

function verdictStyle(text) {
  if (!text) return { color: '#94a3b8', label: '' }
  const u = text.toUpperCase()
  if (u.includes('SKIP')) return { color: '#ef4444', label: 'SKIP' }
  if (u.includes('CAUTIOUS')) return { color: '#f59e0b', label: 'CAUTIOUS' }
  if (u.includes('TRADE') || u.includes('BULLISH')) return { color: '#10b981', label: 'TRADE' }
  if (u.includes('BEARISH')) return { color: '#ef4444', label: 'BEARISH' }
  return { color: '#94a3b8', label: 'ANALYSING' }
}

export default function NewsTab() {
  const [activeEngine, setActiveEngine] = useState('fomc')
  const [selections, setSelections] = useState({})  // { engineKey: { fieldKey: optionValue } }
  const [analysisDate, setAnalysisDate] = useState('')
  const [notes, setNotes] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [results, setResults] = useState({})  // { engineKey: text }
  const [loading, setLoading] = useState({})
  const [autoFilling, setAutoFilling] = useState(false)

  const engine = ENGINES[activeEngine]
  const engineSelections = selections[activeEngine] || {}
  const completedFields = Object.keys(engineSelections).filter(k => engineSelections[k]).length
  const totalFields = engine.fields.length
  const result = results[activeEngine]
  const isLoading = loading[activeEngine]
  const verdict = verdictStyle(result)

  const select = (fieldKey, option) => {
    setSelections(prev => ({
      ...prev,
      [activeEngine]: {
        ...(prev[activeEngine] || {}),
        [fieldKey]: prev[activeEngine]?.[fieldKey] === option ? null : option,
      }
    }))
  }

  const reset = () => {
    setSelections(prev => ({ ...prev, [activeEngine]: {} }))
    setResults(prev => ({ ...prev, [activeEngine]: null }))
    setAnalysisDate('')
    setNotes('')
    setEventDate('')
  }

  const autoFill = async () => {
    setAutoFilling(true)
    const system = `You are a financial data assistant. Return ONLY a JSON object with field keys and selected option values based on current market conditions. No explanation, no markdown, just raw JSON.`
    const prompt = `For the ${engine.label} news engine analysis of gold trading, suggest the most appropriate selections for each field based on current conditions as of April 2026.

Fields to fill:
${engine.fields.map(f => `- ${f.key}: options are [${f.options.join(', ')}]`).join('\n')}

Return JSON like: {"fieldKey": "selected option text", ...}
Only include fields where you have reasonable information. Use exact option text.`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system)
      const clean = text.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      const newSels = {}
      engine.fields.forEach(f => {
        if (data[f.key] && f.options.includes(data[f.key])) {
          newSels[f.key] = data[f.key]
        }
      })
      setSelections(prev => ({ ...prev, [activeEngine]: newSels }))
    } catch (e) {
      console.error('Auto-fill error:', e)
    }
    setAutoFilling(false)
  }

  const calculate = async () => {
    if (completedFields === 0) return
    setLoading(l => ({ ...l, [activeEngine]: true }))

    const sels = engineSelections
    const fieldSummary = engine.fields
      .filter(f => sels[f.key])
      .map(f => `- ${f.label}: ${sels[f.key]}`)
      .join('\n')

    const prompt = `You are analysing the ${engine.label} event impact on XAUUSD gold trading for a breakout EA.

Engine: ${engine.label} — ${engine.description}
${analysisDate ? `Analysis date: ${analysisDate}` : ''}
${eventDate ? `Event date: ${eventDate}` : ''}
${notes ? `Notes: ${notes}` : ''}

Selected conditions:
${fieldSummary}

Based on these conditions, provide:
1. **VERDICT: [TRADE / CAUTIOUS / SKIP / BULLISH / BEARISH]**
2. **Gold outlook** — 2-3 sentences on likely gold direction
3. **EA positioning** — should the EA run? Any timing adjustments?
4. **Key risk** — what could invalidate this analysis?
5. **Historical pattern** — what typically happens in this scenario?

Max 200 words. Direct and actionable.`

    const system = `You are a sharp gold (XAUUSD) market analyst specialising in macro event impact on breakout EA trading. Give direct, actionable verdicts.`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system)
      setResults(r => ({ ...r, [activeEngine]: text }))
    } catch {
      setResults(r => ({ ...r, [activeEngine]: '⚠️ Error fetching analysis.' }))
    }
    setLoading(l => ({ ...l, [activeEngine]: false }))
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR — Engine list ── */}
      <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', background: '#111c30' }}>
        <div style={{ padding: '14px 12px 8px', fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em' }}>NEWS ENGINES</div>
        {ENGINE_ORDER.map(key => {
          const eng = ENGINES[key]
          const isActive = activeEngine === key
          const hasResult = !!results[key]
          const v = verdictStyle(results[key])
          return (
            <button key={key} onClick={() => setActiveEngine(key)} style={{
              width: '100%', textAlign: 'left',
              background: isActive ? 'rgba(124,58,237,0.082)' : 'transparent',
              border: 'none',
              borderLeft: `3px solid ${isActive ? '#7c3aed' : 'transparent'}`,
              padding: '10px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', transition: '0.12s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                <span style={{ fontSize: '14px' }}>{eng.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 400, color: isActive ? '#e8edf5' : '#7a8ba8' }}>{eng.label}</span>
                {hasResult && <span style={{ fontSize: '7px', color: v.color, marginLeft: 'auto' }}>●</span>}
              </div>
              <div style={{ fontSize: '9px', color: '#3d4f6a', lineHeight: 1.4, paddingLeft: '21px' }}>{eng.description}</div>
            </button>
          )
        })}
      </div>

      {/* ── CENTER — Form panel ── */}
      <div style={{ width: '400px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '20px 18px' }}>

        {/* Engine header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(124,58,237,0.125)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{engine.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#e8edf5' }}>{engine.label} Analyser</div>
              <div style={{ fontSize: '9px', color: '#3d4f6a' }}>{engine.subtitle}</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#7a8ba8', lineHeight: 1.6, marginBottom: '12px' }}>{engine.description}</div>

          {/* Analysis date + notes */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '5px' }}>ANALYSIS DATE</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input type="date" value={analysisDate} onChange={e => setAnalysisDate(e.target.value)}
                style={{ flex: 1, height: '32px', padding: '0 10px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#e8edf5', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => setAnalysisDate(new Date().toISOString().slice(0,10))}
                style={{ height: '32px', padding: '0 10px', borderRadius: '7px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Today</button>
            </div>
          </div>

          {/* AI Auto-fill */}
          <button onClick={autoFill} disabled={autoFilling} className="action-btn" style={{
            width: '100%', padding: '9px', borderRadius: '8px', fontSize: '11px', fontFamily: 'inherit',
            fontWeight: 700, border: 'none', cursor: autoFilling ? 'not-allowed' : 'pointer',
            letterSpacing: '0.04em', marginBottom: '10px',
            background: autoFilling ? '#1e293b' : 'linear-gradient(135deg,#7c3aed,rgba(124,58,237,0.8))',
            color: autoFilling ? '#475569' : '#fff',
            boxShadow: autoFilling ? 'none' : 'rgba(124,58,237,0.19) 0 3px 12px',
          }}>
            {autoFilling ? '⏳ Fetching data...' : '🤖 AI: Auto-fill from latest ' + engine.label + ' data'}
          </button>

          {/* Progress bar */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '9px', color: '#3d4f6a' }}>FIELDS COMPLETED</span>
              <span style={{ fontSize: '9px', color: '#7c3aed' }}>{completedFields}/{totalFields}</span>
            </div>
            <div style={{ height: '2px', background: '#111c30', borderRadius: '1px' }}>
              <div style={{ height: '2px', background: '#7c3aed', borderRadius: '1px', width: `${(completedFields/totalFields)*100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Event date + notes row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#3d4f6a', marginBottom: '3px', letterSpacing: '0.08em' }}>EVENT DATE</div>
            <input placeholder="e.g. 29 Apr 2026" value={eventDate} onChange={e => setEventDate(e.target.value)}
              style={{ width: '100%', background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', color: '#e8edf5', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#3d4f6a', marginBottom: '3px', letterSpacing: '0.08em' }}>NOTES</div>
            <input placeholder="Any extra context" value={notes} onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', background: '#111c30', border: '1px solid rgba(255,255,255,0.06)', color: '#e8edf5', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '14px' }} />

        {/* Field selectors */}
        {engine.fields.map(field => (
          <div key={field.key} style={{ marginBottom: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontSize: '9px', color: '#7a8ba8', fontWeight: 600, letterSpacing: '0.06em' }}>{field.label}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {field.options.map(opt => {
                const isSelected = engineSelections[field.key] === opt
                return (
                  <button key={opt} onClick={() => select(field.key, opt)} style={{
                    padding: '4px 9px', borderRadius: '5px', fontSize: '9px',
                    fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                    transition: '0.1s',
                    background: isSelected ? '#7c3aed' : '#111c30',
                    color: isSelected ? '#fff' : '#7a8ba8',
                    outline: isSelected ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    fontWeight: isSelected ? 700 : 400,
                  }}>{opt}</button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button onClick={calculate} disabled={completedFields === 0 || isLoading} className="action-btn" style={{
            flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px',
            fontFamily: 'inherit', fontWeight: 700, border: 'none',
            cursor: completedFields === 0 || isLoading ? 'not-allowed' : 'pointer',
            background: completedFields === 0 ? '#111c30' : 'linear-gradient(135deg,#7c3aed,rgba(124,58,237,0.8))',
            color: completedFields === 0 ? '#3d4f6a' : '#fff',
            boxShadow: completedFields > 0 ? 'rgba(124,58,237,0.19) 0 3px 12px' : 'none',
          }}>
            {isLoading ? '⏳ Calculating...' : '🎯 Calculate Verdict'}
          </button>
          <button onClick={reset} className="action-btn" style={{
            padding: '10px 14px', borderRadius: '8px', fontSize: '11px', fontFamily: 'inherit',
            border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', cursor: 'pointer',
          }}>↺</button>
        </div>

        {/* Historical basis */}
        <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '6px', background: '#111c30', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.08em', marginBottom: '3px' }}>HISTORICAL BASIS</div>
          <div style={{ fontSize: '10px', color: '#7a8ba8' }}>{engine.historicalAccuracy}</div>
        </div>
      </div>

      {/* ── RIGHT — Verdict panel ── */}
      <div className="grid-lines" style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#7c3aed' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: '13px' }}>Calculating verdict...</div>
          </div>
        )}

        {!isLoading && !result && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3d4f6a', textAlign: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px' }}>{engine.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#7a8ba8' }}>{engine.label} · News Analyser</div>
            <div style={{ fontSize: '11px', lineHeight: 1.8, maxWidth: '280px' }}>
              Use the <span style={{ color: '#7c3aed' }}>🤖 AI Auto-fill</span> button to let the assistant fetch the latest {engine.label} data and suggest your selections, or fill in manually.<br /><br />
              Then hit <span style={{ color: '#7c3aed' }}>🎯 Calculate Verdict</span> to get your EA positioning.
            </div>
          </div>
        )}

        {!isLoading && result && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Verdict badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '3px', height: '28px', borderRadius: '2px', background: verdict.color }} />
              <div>
                <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em', marginBottom: '3px' }}>{engine.label} VERDICT</div>
                <div style={{ background: verdict.color + '20', border: `1px solid ${verdict.color}`, color: verdict.color, padding: '4px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', display: 'inline-block' }}>
                  {verdict.label}
                </div>
              </div>
            </div>

            {/* Analysis text */}
            <div style={{ background: '#0c1424', border: `1px solid ${verdict.color}55`, borderRadius: '12px', padding: '20px', fontSize: '13px', lineHeight: 1.9, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
              {result.split('\n').map((line, i) => {
                if (line.includes('**')) {
                  const parts = line.split('**')
                  return (
                    <div key={i} style={{ marginBottom: '3px' }}>
                      {parts.map((p, j) => j % 2 === 1
                        ? <strong key={j} style={{ color: '#f1f5f9' }}>{p}</strong>
                        : <span key={j}>{p}</span>)}
                    </div>
                  )
                }
                return <div key={i} style={{ marginBottom: line === '' ? '10px' : '1px' }}>{line}</div>
              })}
            </div>

            {/* Summary of selections used */}
            <div style={{ marginTop: '16px', background: '#111c30', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.12em', marginBottom: '10px' }}>INPUTS USED</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {engine.fields.filter(f => engineSelections[f.key]).map(f => (
                  <span key={f.key} style={{ background: '#7c3aed18', color: '#7c3aed', border: '1px solid #7c3aed35', borderRadius: '4px', padding: '2px 8px', fontSize: '10px' }}>
                    {engineSelections[f.key]}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={reset} style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', cursor: 'pointer' }}>
              ↺ Reset & Analyse Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

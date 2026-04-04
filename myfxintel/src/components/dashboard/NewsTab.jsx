import React, { useState, useCallback } from 'react'

// ─── SCORING SYSTEM ───────────────────────────────────────────────────────────
// Each option has a score. Positive = bullish for gold. Negative = bearish.
const ENGINES = {
  fomc: {
    key: 'fomc', label: 'FOMC', icon: '🏦',
    subtitle: '8× per year — next: 29 Apr 2026',
    description: 'Fed rate decision impact on gold/EA',
    historicalAccuracy: '6/6 historical accuracy ✅',
    fields: [
      { key: 'decision', label: 'FED DECISION', options: [
        { label: '✂️ Rate Cut', score: 3 },
        { label: '⏸️ Hold', score: 0 },
        { label: '📈 Hike', score: -3 },
      ]},
      { key: 'dotPlot', label: 'DOT PLOT SIGNAL', options: [
        { label: '🕊️ Dovish', score: 2 },
        { label: '⚖️ Neutral', score: 0 },
        { label: '🦅 Hawkish', score: -2 },
        { label: '— No dot plot', score: 0 },
      ]},
      { key: 'powellTone', label: 'POWELL TONE', options: [
        { label: '🕊️ Dovish', score: 2 },
        { label: '⚖️ Neutral', score: 0 },
        { label: '🦅 Hawkish', score: -2 },
        { label: '⚠️ Stagflation', score: 2 },
      ]},
      { key: 'ppi', label: 'PPI vs EXPECTATION', options: [
        { label: '❄️ Very Cool', score: 2 },
        { label: '🧊 Cool', score: 1 },
        { label: '✅ Inline', score: 0 },
        { label: '🔥 Hot', score: -1 },
        { label: '🌋 Very Hot', score: -2 },
      ]},
      { key: 'cpiTrend', label: 'CPI TREND (LAST 3 MONTHS)', options: [
        { label: '📉 Falling', score: 2 },
        { label: '➡️ Stable', score: 0 },
        { label: '📈 Rising', score: -2 },
      ]},
      { key: 'oilTrend', label: 'OIL PRICE TREND', options: [
        { label: '📉 Falling', score: -1 },
        { label: '➡️ Stable', score: 0 },
        { label: '🔺 Rising', score: 1 },
        { label: '🚨 Surging', score: -2 },
      ]},
      { key: 'dollarReaction', label: 'DOLLAR REACTION (POST-DECISION)', options: [
        { label: '📉 Dollar Down', score: 2 },
        { label: '➡️ Flat', score: 0 },
        { label: '📈 Dollar Up', score: -2 },
      ]},
      { key: 'goldTrend', label: 'GOLD TREND (WEEK BEFORE)', options: [
        { label: '🚀 Strong Up', score: 2 },
        { label: '📈 Up', score: 1 },
        { label: '➡️ Flat', score: 0 },
        { label: '📉 Down', score: -1 },
        { label: '💥 Strong Down', score: -2 },
      ]},
      { key: 'goldLevel', label: 'GOLD vs $5,000 LEVEL', options: [
        { label: '⬆️ Well Above', score: 2 },
        { label: '↑ Above', score: 1 },
        { label: '→ At Level', score: 0 },
        { label: '↓ Below', score: -1 },
        { label: '⬇️ Well Below', score: -2 },
      ]},
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: [
        { label: '⚔️ Escalating', score: 2 },
        { label: '🕊️ Stable', score: 0 },
        { label: '🤝 De-escalating', score: -1 },
      ]},
    ],
  },
  cpi: {
    key: 'cpi', label: 'CPI', icon: '📊',
    subtitle: 'Monthly — next: ~mid May 2026',
    description: 'US CPI inflation data impact on gold',
    historicalAccuracy: '8/9 historical accuracy ✅',
    fields: [
      { key: 'reading', label: 'CPI READING vs EXPECTATION', options: [
        { label: '❄️ Very Cool', score: 3 }, { label: '🧊 Cool', score: 2 }, { label: '✅ Inline', score: 0 }, { label: '🔥 Hot', score: -2 }, { label: '🌋 Very Hot', score: -3 },
      ]},
      { key: 'core', label: 'CORE CPI (ex food & energy)', options: [
        { label: '📉 Falling', score: 2 }, { label: '➡️ Stable', score: 0 }, { label: '📈 Rising', score: -2 },
      ]},
      { key: 'trend', label: 'TREND (LAST 3 MONTHS)', options: [
        { label: '📉 Consistently Falling', score: 2 }, { label: '➡️ Stable', score: 0 }, { label: '📈 Rising', score: -2 }, { label: '🔄 Mixed', score: -1 },
      ]},
      { key: 'fedReaction', label: 'EXPECTED FED REACTION', options: [
        { label: '✂️ More Cuts Likely', score: 2 }, { label: '⏸️ Hold Expected', score: 0 }, { label: '📈 Hike Risk', score: -2 },
      ]},
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: [
        { label: '🚀 Strong Up', score: 2 }, { label: '📈 Up', score: 1 }, { label: '➡️ Flat', score: 0 }, { label: '📉 Down', score: -1 }, { label: '💥 Strong Down', score: -2 },
      ]},
      { key: 'dollar', label: 'DOLLAR STRENGTH', options: [
        { label: '💪 Strong', score: -2 }, { label: '➡️ Neutral', score: 0 }, { label: '📉 Weak', score: 2 },
      ]},
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: [
        { label: '⚔️ Escalating', score: 2 }, { label: '🕊️ Stable', score: 0 }, { label: '🤝 De-escalating', score: -1 },
      ]},
    ],
  },
  nfp: {
    key: 'nfp', label: 'NFP', icon: '👷',
    subtitle: '1st Friday of month',
    description: 'Non-Farm Payrolls impact on gold/Fed path',
    historicalAccuracy: '7/8 historical accuracy ✅',
    fields: [
      { key: 'jobs', label: 'JOBS ADDED vs EXPECTATION', options: [
        { label: '🚀 Blowout (>50k beat)', score: -3 }, { label: '✅ Beat', score: -1 }, { label: '➡️ Inline', score: 0 }, { label: '📉 Miss', score: 1 }, { label: '💥 Big Miss (>50k miss)', score: 3 },
      ]},
      { key: 'unemployment', label: 'UNEMPLOYMENT RATE', options: [
        { label: '📉 Fell (Good)', score: -2 }, { label: '➡️ Unchanged', score: 0 }, { label: '📈 Rose (Bad)', score: 2 },
      ]},
      { key: 'wages', label: 'AVERAGE HOURLY EARNINGS', options: [
        { label: '🔥 Hot (Inflationary)', score: -1 }, { label: '✅ Inline', score: 0 }, { label: '❄️ Cool', score: 1 },
      ]},
      { key: 'revision', label: 'PREVIOUS MONTH REVISION', options: [
        { label: '📈 Revised Up', score: -1 }, { label: '➡️ Unchanged', score: 0 }, { label: '📉 Revised Down', score: 1 },
      ]},
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: [
        { label: '🚀 Strong Up', score: 2 }, { label: '📈 Up', score: 1 }, { label: '➡️ Flat', score: 0 }, { label: '📉 Down', score: -1 }, { label: '💥 Strong Down', score: -2 },
      ]},
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: [
        { label: '⚔️ Escalating', score: 2 }, { label: '🕊️ Stable', score: 0 }, { label: '🤝 De-escalating', score: -1 },
      ]},
    ],
  },
  ppi: {
    key: 'ppi', label: 'PPI', icon: '🏭',
    subtitle: 'Monthly — measures producer inflation',
    description: 'Producer Price Index',
    historicalAccuracy: '5/6 historical accuracy ✅',
    fields: [
      { key: 'reading', label: 'PPI READING vs EXPECTATION', options: [
        { label: '❄️ Very Cool', score: 2 }, { label: '🧊 Cool', score: 1 }, { label: '✅ Inline', score: 0 }, { label: '🔥 Hot', score: -1 }, { label: '🌋 Very Hot', score: -2 },
      ]},
      { key: 'core', label: 'CORE PPI', options: [
        { label: '📉 Falling', score: 2 }, { label: '➡️ Stable', score: 0 }, { label: '📈 Rising', score: -2 },
      ]},
      { key: 'cpiRelation', label: 'RELATIVE TO RECENT CPI', options: [
        { label: '📉 Lower than CPI (Disinflationary)', score: 2 }, { label: '➡️ Similar', score: 0 }, { label: '📈 Higher than CPI (Inflationary)', score: -2 },
      ]},
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: [
        { label: '🚀 Strong Up', score: 2 }, { label: '📈 Up', score: 1 }, { label: '➡️ Flat', score: 0 }, { label: '📉 Down', score: -1 }, { label: '💥 Strong Down', score: -2 },
      ]},
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: [
        { label: '⚔️ Escalating', score: 2 }, { label: '🕊️ Stable', score: 0 }, { label: '🤝 De-escalating', score: -1 },
      ]},
    ],
  },
  geo: {
    key: 'geo', label: 'Geopolitical', icon: '⚔️',
    subtitle: 'Wars, sanctions, trade conflicts',
    description: 'Wars, sanctions, conflicts',
    historicalAccuracy: 'Context-dependent analysis',
    fields: [
      { key: 'type', label: 'EVENT TYPE', options: [
        { label: '🔥 Active Military Conflict', score: 3 }, { label: '🚫 Sanctions/Trade War', score: 2 }, { label: '🤝 Peace Talks', score: -2 }, { label: '⚡ Escalation', score: 3 }, { label: '📰 Geopolitical Headlines', score: 1 },
      ]},
      { key: 'severity', label: 'SEVERITY', options: [
        { label: '🚨 Extreme (market-moving)', score: 3 }, { label: '⚠️ High', score: 2 }, { label: '📊 Medium', score: 1 }, { label: '📉 Low', score: 0 },
      ]},
      { key: 'goldImpact', label: 'DIRECT GOLD IMPACT', options: [
        { label: '🚀 Strong Safe Haven Bid', score: 3 }, { label: '📈 Mild Safe Haven', score: 1 }, { label: '➡️ Neutral', score: 0 }, { label: '📉 Risk-On Selling', score: -2 },
      ]},
      { key: 'oil', label: 'OIL PRICE IMPACT', options: [
        { label: '🚨 Surging', score: 2 }, { label: '📈 Rising', score: 1 }, { label: '➡️ Stable', score: 0 }, { label: '📉 Falling', score: -1 },
      ]},
      { key: 'dollar', label: 'DOLLAR SAFE HAVEN DEMAND', options: [
        { label: '💪 Strong Flight to USD', score: -1 }, { label: '➡️ Neutral', score: 0 }, { label: '📉 Dollar Weakening', score: 2 },
      ]},
      { key: 'duration', label: 'EXPECTED DURATION', options: [
        { label: '⚡ Short-term spike', score: 1 }, { label: '📅 Multi-day', score: 2 }, { label: '🗓️ Prolonged', score: 3 },
      ]},
    ],
  },
  gdp: {
    key: 'gdp', label: 'GDP', icon: '📈',
    subtitle: 'Quarterly — US economic growth',
    description: 'GDP growth data',
    historicalAccuracy: '4/5 historical accuracy ✅',
    fields: [
      { key: 'reading', label: 'GDP READING vs EXPECTATION', options: [
        { label: '🚀 Strong Beat', score: -2 }, { label: '✅ Beat', score: -1 }, { label: '➡️ Inline', score: 0 }, { label: '📉 Miss', score: 1 }, { label: '💥 Contraction', score: 3 },
      ]},
      { key: 'driver', label: 'KEY DRIVER', options: [
        { label: '🏪 Consumer Spending Strong', score: -1 }, { label: '🏭 Business Investment', score: -1 }, { label: '📦 Trade Deficit', score: 1 }, { label: '🏛️ Government Spending', score: 0 }, { label: '📊 Mixed', score: 0 },
      ]},
      { key: 'revision', label: 'REVISION TYPE', options: [
        { label: '📈 Advance (First)', score: 1 }, { label: '📊 Preliminary', score: 0 }, { label: '✅ Final', score: 0 },
      ]},
      { key: 'fedImplication', label: 'FED POLICY IMPLICATION', options: [
        { label: '✂️ Dovish (supports cuts)', score: 2 }, { label: '⏸️ Neutral', score: 0 }, { label: '📈 Hawkish (delays cuts)', score: -2 },
      ]},
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: [
        { label: '🚀 Strong Up', score: 2 }, { label: '📈 Up', score: 1 }, { label: '➡️ Flat', score: 0 }, { label: '📉 Down', score: -1 }, { label: '💥 Strong Down', score: -2 },
      ]},
    ],
  },
  pmi: {
    key: 'pmi', label: 'PMI', icon: '🏗️',
    subtitle: 'Monthly — manufacturing & services',
    description: 'Purchasing Managers Index',
    historicalAccuracy: '5/6 historical accuracy ✅',
    fields: [
      { key: 'mfg', label: 'MANUFACTURING PMI', options: [
        { label: '🚀 Expansion (>55)', score: -2 }, { label: '📈 Mild Expansion (50-55)', score: -1 }, { label: '📊 Contraction (<50)', score: 1 }, { label: '💥 Sharp Contraction (<45)', score: 3 },
      ]},
      { key: 'services', label: 'SERVICES PMI', options: [
        { label: '🚀 Expansion (>55)', score: -2 }, { label: '📈 Mild Expansion (50-55)', score: -1 }, { label: '📊 Contraction (<50)', score: 1 }, { label: '💥 Sharp Contraction (<45)', score: 3 },
      ]},
      { key: 'vsExpectation', label: 'vs MARKET EXPECTATION', options: [
        { label: '✅ Beat', score: -1 }, { label: '➡️ Inline', score: 0 }, { label: '📉 Miss', score: 2 },
      ]},
      { key: 'goldTrend', label: 'GOLD TREND PRE-RELEASE', options: [
        { label: '🚀 Strong Up', score: 2 }, { label: '📈 Up', score: 1 }, { label: '➡️ Flat', score: 0 }, { label: '📉 Down', score: -1 }, { label: '💥 Strong Down', score: -2 },
      ]},
      { key: 'geoRisk', label: 'GEOPOLITICAL RISK', options: [
        { label: '⚔️ Escalating', score: 2 }, { label: '🕊️ Stable', score: 0 }, { label: '🤝 De-escalating', score: -1 },
      ]},
    ],
  },
}

const ENGINE_ORDER = ['fomc', 'cpi', 'nfp', 'ppi', 'geo', 'gdp', 'pmi']

// ─── SCORE → VERDICT ─────────────────────────────────────────────────────────
function getVerdict(score) {
  if (score >= 6) return { label: '🟢 BULLISH', color: '#10b981', action: 'Run EA — strong gold tailwinds', outlook: 'Gold likely to push higher' }
  if (score >= 3) return { label: '🟡 CAUTIOUS BULLISH', color: '#22c55e', action: 'Run EA with reduced size', outlook: 'Mild bullish bias' }
  if (score >= 1) return { label: '⚪ NEUTRAL', color: '#f59e0b', action: 'Wait for confirmation', outlook: 'No strong bias' }
  if (score >= -2) return { label: '⚪ NEUTRAL', color: '#f59e0b', action: 'Wait for confirmation', outlook: 'No strong bias' }
  if (score >= -5) return { label: '🟡 CAUTIOUS', color: '#f59e0b', action: 'Reduce size or skip', outlook: 'Mild bearish pressure' }
  return { label: '🔴 SKIP', color: '#ef4444', action: 'Skip trading today', outlook: 'Strong headwinds for gold' }
}

function scoreColor(s) {
  if (s > 0) return '#10b981'
  if (s < 0) return '#ef4444'
  return '#3d4f6a'
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

export default function NewsTab() {
  const [activeEngine, setActiveEngine] = useState('fomc')
  const [selections, setSelections] = useState({})
  const [analysisDate, setAnalysisDate] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')
  const [aiSummary, setAiSummary] = useState({})
  const [aiAnalysis, setAiAnalysis] = useState({})
  const [autoFilling, setAutoFilling] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [verdicts, setVerdicts] = useState({})

  const engine = ENGINES[activeEngine]
  const engineSels = selections[activeEngine] || {}
  const completedFields = engine.fields.filter(f => engineSels[f.key] !== undefined).length
  const totalFields = engine.fields.length

  // Compute composite score
  const fieldScores = {}
  let compositeScore = 0
  engine.fields.forEach(f => {
    const sel = engineSels[f.key]
    if (sel !== undefined) {
      const opt = f.options[sel]
      fieldScores[f.key] = opt ? opt.score : 0
      compositeScore += fieldScores[f.key] || 0
    } else {
      fieldScores[f.key] = null
    }
  })

  const verdict = getVerdict(compositeScore)
  const savedVerdict = verdicts[activeEngine]

  const select = (fieldKey, optIdx) => {
    setSelections(prev => {
      const cur = prev[activeEngine] || {}
      return {
        ...prev,
        [activeEngine]: {
          ...cur,
          [fieldKey]: cur[fieldKey] === optIdx ? undefined : optIdx,
        }
      }
    })
    // Clear saved verdict when selections change
    setVerdicts(prev => ({ ...prev, [activeEngine]: null }))
  }

  const reset = () => {
    setSelections(prev => ({ ...prev, [activeEngine]: {} }))
    setVerdicts(prev => ({ ...prev, [activeEngine]: null }))
    setAiSummary(prev => ({ ...prev, [activeEngine]: null }))
    setAiAnalysis(prev => ({ ...prev, [activeEngine]: null }))
    setAnalysisDate('')
    setEventDate('')
    setNotes('')
  }

  const isForecastMode = analysisDate && new Date(analysisDate) > new Date()

  const autoFill = async () => {
    setAutoFilling(true)
    const date = analysisDate || new Date().toISOString().slice(0, 10)
    const system = `You are a financial market analyst. Your job is to research and summarise the current ${engine.label} situation and then return field selections as JSON. Always respond with a JSON object containing two keys: "summary" (a paragraph of market context) and "selections" (an object mapping field keys to option indices, 0-based).`
    const prompt = `Research the current ${engine.label} situation as of ${date} for gold (XAUUSD) trading analysis.

Fields to fill (0-based option indices):
${engine.fields.map(f => `- ${f.key}: [${f.options.map((o, i) => `${i}="${o.label}"`).join(', ')}]`).join('\n')}

Return JSON: {"summary": "2-3 sentences of market context", "selections": {"fieldKey": optionIndex, ...}}`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], system)
      const clean = text.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      if (data.summary) setAiSummary(prev => ({ ...prev, [activeEngine]: data.summary }))
      if (data.selections) {
        const newSels = {}
        engine.fields.forEach(f => {
          const idx = data.selections[f.key]
          if (typeof idx === 'number' && idx >= 0 && idx < f.options.length) {
            newSels[f.key] = idx
          }
        })
        setSelections(prev => ({ ...prev, [activeEngine]: newSels }))
      }
    } catch (e) {
      setAiSummary(prev => ({ ...prev, [activeEngine]: '⚠️ Could not fetch data. Please fill fields manually.' }))
    }
    setAutoFilling(false)
  }

  const calculateVerdict = async () => {
    if (completedFields < 2) return
    setCalculating(true)

    const fieldSummary = engine.fields
      .filter(f => engineSels[f.key] !== undefined)
      .map(f => `${f.label}: ${f.options[engineSels[f.key]]?.label} (${fieldScores[f.key] > 0 ? '+' : ''}${fieldScores[f.key]})`)
      .join('\n')

    const prompt = `${engine.label} analysis for XAUUSD EA trading — ${analysisDate || 'today'}.
Composite score: ${compositeScore > 0 ? '+' : ''}${compositeScore} → ${verdict.label}

Field scores:
${fieldSummary}

Give a 3-sentence EA trading verdict. Include: (1) overall gold direction, (2) whether to run the EA, (3) key risk. Max 80 words.`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }], `You are a gold EA trading analyst. Give sharp 80-word max verdicts.`)
      setAiAnalysis(prev => ({ ...prev, [activeEngine]: text }))
    } catch {
      setAiAnalysis(prev => ({ ...prev, [activeEngine]: '⚠️ AI analysis unavailable.' }))
    }

    setVerdicts(prev => ({ ...prev, [activeEngine]: { score: compositeScore, verdict, fieldScores } }))
    setCalculating(false)
  }

  // Sidebar verdict for each engine
  const getSidebarVerdict = (key) => {
    const v = verdicts[key]
    if (!v) return null
    return getVerdict(v.score)
  }

  const showResult = savedVerdict || (completedFields > 0)
  const maxScore = engine.fields.reduce((s, f) => s + Math.max(...f.options.map(o => o.score)), 0)
  const minScore = engine.fields.reduce((s, f) => s + Math.min(...f.options.map(o => o.score)), 0)
  const scoreRange = maxScore - minScore
  const scoreNormalized = scoreRange > 0 ? ((compositeScore - minScore) / scoreRange) * 100 : 50

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', background: '#111c30' }}>
        <div style={{ padding: '14px 12px 8px', fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em' }}>NEWS ENGINES</div>
        {ENGINE_ORDER.map(key => {
          const eng = ENGINES[key]
          const isActive = activeEngine === key
          const sv = getSidebarVerdict(key)
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
              </div>
              <div style={{ fontSize: '9px', color: '#3d4f6a', lineHeight: 1.4, paddingLeft: '21px' }}>{eng.description}</div>
              {sv && (
                <div style={{ marginTop: '5px', marginLeft: '21px', fontSize: '9px', fontWeight: 700, padding: '1px 7px', borderRadius: '4px', display: 'inline-block', color: sv.color, background: sv.color + '20' }}>
                  {sv.label}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── CENTER FORM ── */}
      <div style={{ width: '400px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '20px 18px' }}>

        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(124,58,237,0.125)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{engine.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#e8edf5' }}>{engine.label} Analyser</div>
              <div style={{ fontSize: '9px', color: '#3d4f6a' }}>{engine.subtitle}</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#7a8ba8', lineHeight: 1.6, marginBottom: '12px' }}>{engine.description}</div>

          {/* Date */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '5px' }}>ANALYSIS DATE</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input type="date" value={analysisDate} onChange={e => setAnalysisDate(e.target.value)}
                style={{ flex: 1, height: '32px', padding: '0 10px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#e8edf5', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => setAnalysisDate(new Date().toISOString().slice(0,10))}
                style={{ height: '32px', padding: '0 10px', borderRadius: '7px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Today</button>
            </div>
            {isForecastMode && (
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: 700, background: 'rgba(59,130,246,0.082)', border: '1px solid rgba(59,130,246,0.19)', color: '#3b82f6', letterSpacing: '0.08em' }}>
                🔮 FORECAST MODE — AI will research expected data
              </div>
            )}
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
            {autoFilling ? '⏳ Fetching data...' : `${isForecastMode ? '🔮' : '🤖'} AI: ${isForecastMode ? 'Forecast' : 'Auto-fill from latest'} ${engine.label}${analysisDate ? ` for ${analysisDate}` : ' data'}`}
          </button>

          {/* AI Summary */}
          {aiSummary[activeEngine] && (
            <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '10px', lineHeight: 1.7, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.145)', color: '#7a8ba8', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <strong style={{ color: '#7c3aed' }}>🤖 AI Assistant</strong>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 7px', borderRadius: '10px', background: isForecastMode ? 'rgba(59,130,246,0.125)' : 'rgba(16,185,129,0.125)', color: isForecastMode ? '#3b82f6' : '#10b981' }}>
                  {isForecastMode ? '🔮 FORECAST' : '✅ LIVE DATA'}
                </span>
              </div>
              {aiSummary[activeEngine]}
            </div>
          )}

          {/* Progress */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '9px', color: '#3d4f6a' }}>FIELDS COMPLETED</span>
              <span style={{ fontSize: '9px', color: completedFields === totalFields ? '#10b981' : '#7c3aed' }}>{completedFields}/{totalFields}</span>
            </div>
            <div style={{ height: '2px', background: '#111c30', borderRadius: '1px' }}>
              <div style={{ height: '2px', background: completedFields === totalFields ? '#10b981' : '#7c3aed', borderRadius: '1px', width: `${(completedFields/totalFields)*100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Event date + notes */}
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

        {/* Field selectors with live score display */}
        {engine.fields.map(field => {
          const selIdx = engineSels[field.key]
          const pts = fieldScores[field.key]
          const hasPts = pts !== null && pts !== undefined
          return (
            <div key={field.key} style={{ marginBottom: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '9px', color: '#7a8ba8', fontWeight: 600, letterSpacing: '0.06em' }}>{field.label}</span>
                {hasPts && (
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 7px', borderRadius: '4px', color: scoreColor(pts), background: scoreColor(pts) + '15' }}>
                    {pts > 0 ? '+' : ''}{pts} pts
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {field.options.map((opt, idx) => {
                  const isSelected = selIdx === idx
                  const optColor = isSelected ? (opt.score > 0 ? '#10b981' : opt.score < 0 ? '#ef4444' : '#7c3aed') : null
                  return (
                    <button key={idx} onClick={() => select(field.key, idx)} style={{
                      padding: '4px 9px', borderRadius: '5px', fontSize: '9px',
                      fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                      transition: '0.1s',
                      background: isSelected ? (optColor || '#7c3aed') : '#111c30',
                      color: isSelected ? '#fff' : '#7a8ba8',
                      outline: isSelected ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      fontWeight: isSelected ? 700 : 400,
                    }}>{opt.label}</button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button onClick={calculateVerdict} disabled={completedFields < 2 || calculating} className="action-btn" style={{
            flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px',
            fontFamily: 'inherit', fontWeight: 700, border: 'none',
            cursor: completedFields < 2 || calculating ? 'not-allowed' : 'pointer',
            background: completedFields < 2 ? '#111c30' : 'linear-gradient(135deg,#7c3aed,rgba(124,58,237,0.8))',
            color: completedFields < 2 ? '#3d4f6a' : '#fff',
            boxShadow: completedFields >= 2 ? 'rgba(124,58,237,0.19) 0 4px 14px' : 'none',
          }}>
            {calculating ? '⏳ Calculating...' : '🎯 Calculate Verdict'}
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

      {/* ── RIGHT — Results panel ── */}
      <div className="grid-lines" style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

        {/* Empty state */}
        {completedFields === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3d4f6a', textAlign: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px' }}>{engine.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#7a8ba8' }}>{engine.label} · News Analyser</div>
            <div style={{ fontSize: '11px', lineHeight: 1.8, maxWidth: '280px' }}>
              Use the <span style={{ color: '#7c3aed' }}>🤖 AI Auto-fill</span> button to let the assistant fetch the latest {engine.label} data and suggest your selections, or fill in manually.<br /><br />
              Then hit <span style={{ color: '#7c3aed' }}>🎯 Calculate Verdict</span> to get your EA positioning.
            </div>
          </div>
        )}

        {/* Live scoring panel — shows as soon as fields are filled */}
        {completedFields > 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>

            {/* Composite score */}
            <div style={{ background: verdict.color + '08', border: `2px solid ${verdict.color}35`, borderRadius: '12px', padding: '22px', marginBottom: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em', marginBottom: '10px' }}>COMPOSITE SCORE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: 800, color: verdict.color, lineHeight: 1 }}>
                {compositeScore > 0 ? '+' : ''}{compositeScore}
              </div>
              {/* Score bar */}
              <div style={{ height: '6px', background: '#111c30', borderRadius: '3px', margin: '12px auto', maxWidth: '260px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: `${Math.max(2, Math.min(98, scoreNormalized - 1.25))}%`, width: '2.5%', height: '100%', background: verdict.color, borderRadius: '3px', transition: '0.5s' }} />
                <div style={{ position: 'absolute', left: '50%', top: '-3px', width: '2px', height: '12px', background: '#3d4f6a' }} />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 22px', borderRadius: '25px', marginTop: '6px', background: verdict.color, color: '#fff', fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800 }}>
                {verdict.label}
              </div>
            </div>

            {/* EA Action + Next Day */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {[
                { label: 'EA ACTION', value: verdict.action },
                { label: 'NEXT DAY OUTLOOK', value: verdict.outlook },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '6px' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: '#e8edf5', lineHeight: 1.7, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Score breakdown grid */}
            <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '10px' }}>SCORE BREAKDOWN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '5px' }}>
                {engine.fields.map(f => {
                  const pts = fieldScores[f.key]
                  const hasVal = pts !== null && pts !== undefined
                  const c = hasVal ? scoreColor(pts) : '#3d4f6a'
                  return (
                    <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 9px', borderRadius: '5px', background: hasVal && pts !== 0 ? c + '08' : '#111c30', border: `1px solid ${hasVal && pts !== 0 ? c + '20' : 'rgba(255,255,255,0.06)'}` }}>
                      <span style={{ fontSize: '9px', color: '#7a8ba8' }}>{f.label.replace(' (LAST 3 MONTHS)', '').replace(' (WEEK BEFORE)', '').replace(' (POST-DECISION)', '').replace(' vs EXPECTATION', '').replace(' PRE-RELEASE', '')}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: hasVal ? c : '#3d4f6a' }}>{hasVal ? (pts > 0 ? '+' : '') + pts : '—'}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Analysis */}
            <div style={{ background: '#0c1424', border: '1px solid rgba(124,58,237,0.145)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '9px', color: '#7c3aed', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 700 }}>🤖 AI ANALYSIS</div>
              {!aiAnalysis[activeEngine] && (
                <div style={{ fontSize: '10px', color: '#3d4f6a' }}>
                  {completedFields < 2 ? 'Requires minimum 2 fields filled for AI analysis.' : 'Hit 🎯 Calculate Verdict to get AI analysis.'}
                </div>
              )}
              {calculating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#7c3aed', fontSize: '12px' }}>
                  <div style={{ width: '14px', height: '14px', border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Generating analysis...
                </div>
              )}
              {aiAnalysis[activeEngine] && !calculating && (
                <div style={{ fontSize: '12px', lineHeight: 1.8, color: '#cbd5e1' }}>
                  {aiAnalysis[activeEngine].split('\n').map((line, i) => {
                    if (line.includes('**')) {
                      const parts = line.split('**')
                      return <div key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#f1f5f9' }}>{p}</strong> : <span key={j}>{p}</span>)}</div>
                    }
                    return <div key={i} style={{ marginBottom: line === '' ? '8px' : '1px' }}>{line}</div>
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

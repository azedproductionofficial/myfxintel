import React, { useState } from 'react'

const ENGINES = [
  {
    key: 'fomc', label: 'FOMC', icon: '🏦', weight: 5,
    description: 'Federal Reserve rate decisions',
    conditions: [
      { value: 'rate_hike', label: 'Rate Hike (Hawkish)', bias: -2 },
      { value: 'rate_cut', label: 'Rate Cut (Dovish)', bias: 2 },
      { value: 'hold_hawkish', label: 'Hold + Hawkish Statement', bias: -1 },
      { value: 'hold_dovish', label: 'Hold + Dovish Statement', bias: 1 },
      { value: 'no_event', label: 'No FOMC Event', bias: 0 },
    ],
  },
  {
    key: 'cpi', label: 'CPI', icon: '📈', weight: 4,
    description: 'Consumer Price Index inflation data',
    conditions: [
      { value: 'hotter', label: 'Hotter Than Expected', bias: -1 },
      { value: 'cooler', label: 'Cooler Than Expected', bias: 2 },
      { value: 'in_line', label: 'In Line With Expectations', bias: 0 },
      { value: 'no_event', label: 'No CPI Release', bias: 0 },
    ],
  },
  {
    key: 'nfp', label: 'NFP', icon: '👷', weight: 4,
    description: 'Non-Farm Payrolls employment data',
    conditions: [
      { value: 'strong', label: 'Strong Jobs (>200k)', bias: -1 },
      { value: 'weak', label: 'Weak Jobs (<100k)', bias: 2 },
      { value: 'in_line', label: 'In Line / Mixed', bias: 0 },
      { value: 'no_event', label: 'No NFP This Week', bias: 0 },
    ],
  },
  {
    key: 'ppi', label: 'PPI', icon: '🏭', weight: 2,
    description: 'Producer Price Index data',
    conditions: [
      { value: 'hotter', label: 'Hotter Than Expected', bias: -1 },
      { value: 'cooler', label: 'Cooler Than Expected', bias: 1 },
      { value: 'in_line', label: 'In Line', bias: 0 },
      { value: 'no_event', label: 'No PPI Release', bias: 0 },
    ],
  },
  {
    key: 'gdp', label: 'GDP', icon: '💹', weight: 3,
    description: 'Gross Domestic Product data',
    conditions: [
      { value: 'strong', label: 'Strong Growth', bias: -1 },
      { value: 'contraction', label: 'Contraction / Recession', bias: 2 },
      { value: 'in_line', label: 'In Line', bias: 0 },
      { value: 'no_event', label: 'No GDP Release', bias: 0 },
    ],
  },
  {
    key: 'pmi', label: 'PMI', icon: '🏗️', weight: 2,
    description: 'Purchasing Managers Index',
    conditions: [
      { value: 'above_50', label: 'Expansion (>50)', bias: -1 },
      { value: 'below_50', label: 'Contraction (<50)', bias: 1 },
      { value: 'no_event', label: 'No PMI Release', bias: 0 },
    ],
  },
  {
    key: 'geo', label: 'GEO', icon: '🌍', weight: 3,
    description: 'Geopolitical risk events',
    conditions: [
      { value: 'war_oil_surge', label: 'Conflict + Oil Surge (Oil Paradox)', bias: -1 },
      { value: 'war_no_oil', label: 'Conflict / Tensions (No Oil Spike)', bias: 2 },
      { value: 'safe_haven', label: 'Safe Haven Demand Rising', bias: 2 },
      { value: 'deescalation', label: 'De-escalation / Peace Talks', bias: -1 },
      { value: 'calm', label: 'Geopolitically Calm', bias: 0 },
    ],
  },
]

function VerdictDisplay({ score, totalWeight }) {
  if (totalWeight === 0) return null
  const normalised = (score / (totalWeight * 2)) * 100
  const abs = Math.abs(normalised)
  let verdict, action, color, bg

  if (normalised > 20) {
    verdict = '🟢 BULLISH GOLD'
    action = 'TRADE — EA conditions favourable'
    color = 'var(--green)'; bg = 'var(--green-glow)'
  } else if (normalised < -20) {
    verdict = '🔴 BEARISH GOLD'
    action = 'SKIP — Headwinds for EA'
    color = 'var(--red)'; bg = 'var(--red-glow)'
  } else {
    verdict = '🟡 NEUTRAL'
    action = 'CAUTIOUS — Mixed signals, reduce size'
    color = 'var(--gold)'; bg = 'var(--gold-glow)'
  }

  return (
    <div style={{
      background: bg, border: `1px solid ${color}33`,
      borderRadius: 'var(--radius-lg)', padding: '1.5rem',
      marginTop: '1.5rem',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color, marginBottom: '8px' }}>{verdict}</div>
      <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '12px' }}>{action}</div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-mute)', marginBottom: '2px' }}>COMPOSITE SCORE</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color }}>{score > 0 ? '+' : ''}{score}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-mute)', marginBottom: '2px' }}>BIAS STRENGTH</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color }}>{abs.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  )
}

export default function NewsTab() {
  const [selections, setSelections] = useState({})

  const setSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }))
  }

  // Calculate composite score
  let totalScore = 0
  let totalWeight = 0
  ENGINES.forEach(eng => {
    const sel = selections[eng.key]
    if (sel) {
      const cond = eng.conditions.find(c => c.value === sel)
      if (cond && cond.bias !== 0) {
        totalScore += cond.bias * eng.weight
        totalWeight += eng.weight
      }
    }
  })

  const activeEngines = ENGINES.filter(e => selections[e.key] && selections[e.key] !== 'no_event')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>
        Select current conditions for each engine to get a weighted Gold bias score
      </div>

      {ENGINES.map(engine => {
        const selected = selections[engine.key]
        const cond = selected ? engine.conditions.find(c => c.value === selected) : null
        const isActive = selected && selected !== 'no_event'

        return (
          <div key={engine.key} style={{
            background: 'var(--surface)', border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{engine.icon}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>{engine.label}</span>
                  <span style={{
                    fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                    background: 'var(--surface-b)', color: 'var(--text-mute)',
                  }}>W×{engine.weight}</span>
                  {cond && cond.bias !== 0 && (
                    <span style={{
                      fontSize: '11px', padding: '1px 8px', borderRadius: '100px',
                      background: cond.bias > 0 ? 'var(--green-glow)' : 'var(--red-glow)',
                      color: cond.bias > 0 ? 'var(--green)' : 'var(--red)',
                      border: `1px solid ${cond.bias > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                      {cond.bias > 0 ? '▲' : '▼'} {Math.abs(cond.bias * engine.weight)} pts
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>{engine.description}</div>
              </div>

              <select
                value={selected || ''}
                onChange={e => setSelection(engine.key, e.target.value)}
                style={{
                  background: 'var(--surface-b)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', color: 'var(--text)',
                  padding: '7px 12px', fontSize: '12px',
                  fontFamily: 'var(--font-mono)', cursor: 'pointer',
                  minWidth: '220px',
                }}
              >
                <option value="">— Select condition —</option>
                {engine.conditions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        )
      })}

      {/* Result */}
      {activeEngines.length > 0 && (
        <VerdictDisplay score={totalScore} totalWeight={totalWeight} />
      )}

      {/* Reset */}
      {Object.keys(selections).length > 0 && (
        <button onClick={() => setSelections({})} style={{
          alignSelf: 'flex-start', padding: '7px 16px', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer',
        }}>↺ Reset All</button>
      )}
    </div>
  )
}

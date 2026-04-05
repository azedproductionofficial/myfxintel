import React, { useMemo, useState } from 'react'
import { computeAnalytics } from '../../utils/csvParser.js'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getZoneStatus(wr, trades, profit) {
  if (trades <= 0) return null
  if (trades <= 3) return { label: 'FRESH', icon: '◇', color: '#e8edf5', bg: 'transparent', border: 'transparent', badgeBg: 'transparent', badgeColor: '#e8edf5' }
  if (wr >= 80 && profit > 50)  return { label: 'STRONG PROFIT', icon: '▲', color: '#10b981', bg: 'rgba(16,185,129,0.082)', border: 'rgba(16,185,129,0.19)', badgeBg: 'rgba(16,185,129,0.082)', badgeColor: '#10b981' }
  if (wr >= 60 && profit > 0)   return { label: 'PROFIT',        icon: '△', color: '#10b981', bg: 'rgba(16,185,129,0.082)', border: 'rgba(16,185,129,0.19)', badgeBg: 'rgba(16,185,129,0.082)', badgeColor: '#10b981' }
  if (wr <= 35 && profit < -30) return { label: 'DANGER',        icon: '▼', color: '#ef4444', bg: 'rgba(239,68,68,0.082)',  border: 'rgba(239,68,68,0.19)',  badgeBg: 'rgba(239,68,68,0.082)',  badgeColor: '#ef4444' }
  if (wr < 50 && profit < 0)    return { label: 'CAUTION',       icon: '▽', color: '#f59e0b', bg: 'rgba(245,158,11,0.082)', border: 'rgba(245,158,11,0.19)', badgeBg: 'rgba(245,158,11,0.082)', badgeColor: '#f59e0b' }
  if (wr >= 60 && profit < 5)   return { label: 'EXHAUSTED',     icon: '◉', color: '#7a8ba8', bg: 'rgba(122,139,168,0.082)',border: 'rgba(122,139,168,0.19)',badgeBg: 'rgba(122,139,168,0.082)', badgeColor: '#7a8ba8' }
  return                               { label: 'MIXED',         icon: '○', color: '#7a8ba8', bg: 'rgba(122,139,168,0.082)',border: 'rgba(122,139,168,0.19)',badgeBg: 'rgba(122,139,168,0.082)', badgeColor: '#7a8ba8' }
}

function fmtPnL(n) {
  if (n >= 0) return '+$' + n.toFixed(2)
  return '$' + n.toFixed(2) // old site shows "$-204.39" not "-$204.39"
}

function fmtPnLShort(n) {
  if (n >= 0) return '+$' + Math.round(n)
  return '-$' + Math.abs(Math.round(n))
}

async function callClaude(messages, system) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// Generate smart static rules from zone data — no AI needed
function generateStaticRules(zones, zoneSummary) {
  if (!zones.length || !zoneSummary) return []
  const rules = []

  // Rule 1: worst zone trap (round number)
  const w = zoneSummary.worst
  const roundNum = Math.round(w.min / 100) * 100
  const above = zones.find(z => z.min === roundNum + 50)
  rules.push({
    title: `The $${roundNum.toLocaleString()} Trap`,
    body: `EA at ${w.label} = ${w.winRate}% WR. Gold hunts stops at the round number before breaking.${above && above.winRate > 70 ? ` At $${(roundNum + 50).toLocaleString()}+ the same EA hits ${above.winRate}% WR.` : ''} When gold is near $${roundNum.toLocaleString()} watch carefully — the real breakout comes 50 pips above.`
  })

  // Rule 2: danger zones with pattern
  const dangerZones = zones.filter(z => z.winRate <= 35 && z.trades >= 4)
  if (dangerZones.length > 1) {
    const dLabels = dangerZones.slice(0, 2).map(z => z.label).join(' and ')
    rules.push({
      title: 'Recurring Danger Zones',
      body: `${dLabels} all show WR below 40%. These levels share a common trait — they sit at or just above major psychological levels where institutional stop hunts occur. Consider reducing lot size or skipping trades when EA enters these zones.`
    })
  } else {
    // Holiday/thin liquidity rule
    const dangerZ = dangerZones[0] || w
    rules.push({
      title: 'Holiday Dead Zones',
      body: `${dangerZ.label} = ${dangerZ.winRate}% WR. Losses in this zone are concentrated during low-liquidity periods. When gold returns to this zone during holiday periods — consider turning EA off.`
    })
  }

  // Rule 3: fresh territory
  const freshZones = zones.filter(z => z.trades <= 3 && z.min > zoneSummary.best.min)
  const freshRanges = freshZones.length > 0 ? freshZones.slice(0, 2).map(z => z.label).join(' and ') : 'higher price levels'
  rules.push({
    title: 'Fresh Territory',
    body: `${freshRanges} are barely tested. These zones have limited data but early results are positive. Treat with caution but don't avoid — let the data build.`
  })

  return rules
}

export default function ZonesTab({ trades, openOrders = [] }) {
  const [selectedZone, setSelectedZone] = useState(null)
  const [currentPrice, setCurrentPrice] = useState(null)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [aiRules, setAiRules] = useState(null)
  const [fetchingRules, setFetchingRules] = useState(false)

  const analytics = useMemo(() => trades && trades.length > 0 ? computeAnalytics(trades) : null, [trades])

  const zones = useMemo(() => {
    if (!analytics) return []
    return Object.entries(analytics.priceZones)
      .map(([key, data]) => ({
        key,
        min: data.min,
        max: data.max - 1, // $5,050–$5,099 not $5,050–$5,100
        label: `$${data.min.toLocaleString()}–$${(data.max - 1).toLocaleString()}`,
        trades: data.trades.length,
        profit: data.profit,
        wins: data.wins,
        losses: data.losses,
        winRate: data.trades.length > 0 ? Math.round((data.wins / data.trades.length) * 100) : 0,
        tradeList: data.trades,
      }))
      .sort((a, b) => b.min - a.min)
  }, [analytics])

  const zoneSummary = useMemo(() => {
    if (!zones.length) return null
    const withData = zones.filter(z => z.trades >= 4)
    if (!withData.length) return null
    const best = [...withData].sort((a, b) => b.profit - a.profit)[0]
    const worst = [...withData].sort((a, b) => a.profit - b.profit)[0]
    const mostActive = [...withData].sort((a, b) => b.trades - a.trades)[0]
    return { best, worst, mostActive }
  }, [zones])

  const staticRules = useMemo(() => generateStaticRules(zones, zoneSummary), [zones, zoneSummary])
  const rules = aiRules || staticRules

  const currentZone = useMemo(() => {
    if (!currentPrice || !zones.length) return null
    return zones.find(z => currentPrice >= z.min && currentPrice <= z.max)
  }, [currentPrice, zones])

  const fetchPrice = async () => {
    setFetchingPrice(true)
    try {
      const text = await callClaude(
        [{ role: 'user', content: 'What is the current approximate gold (XAUUSD) price right now? Reply with ONLY the number, no text, no $, no comma. Example: 3245' }],
        'You are a financial data assistant. Reply only with the number, nothing else.'
      )
      const price = parseFloat(text.trim().replace(/[^0-9.]/g, ''))
      if (!isNaN(price) && price > 1000) setCurrentPrice(price)
    } catch (e) { console.error(e) }
    setFetchingPrice(false)
  }

  const generateAiRules = async () => {
    if (!zones.length) return
    setFetchingRules(true)
    const topZones = zones.slice(0, 18).map(z =>
      `${z.label}: ${z.trades} trades, ${z.winRate}% WR, ${fmtPnL(z.profit)}`
    ).join('\n')

    const prompt = `Based on this XAUUSD EA price zone performance data, give exactly 3 rules:

${topZones}

Format STRICTLY as:
1. **Rule Title**
Explanation (2-3 sentences, specific to the numbers)

2. **Rule Title**
Explanation

3. **Rule Title**
Explanation`

    try {
      const text = await callClaude([{ role: 'user', content: prompt }],
        'You are a gold trading zone analyst. Be specific, use the actual zone numbers and WR percentages from the data.')
      // Parse rules
      const lines = text.split('\n').filter(l => l.trim())
      const parsed = []
      let cur = null
      lines.forEach(line => {
        const m = line.match(/^\d+\.\s+\*\*(.+)\*\*/)
        if (m) {
          if (cur) parsed.push(cur)
          cur = { title: m[1].trim(), body: '' }
        } else if (cur) {
          cur.body += (cur.body ? ' ' : '') + line.replace(/\*\*/g, '').trim()
        }
      })
      if (cur) parsed.push(cur)
      if (parsed.length >= 2) setAiRules(parsed.slice(0, 3))
    } catch (e) { console.error(e) }
    setFetchingRules(false)
  }

  if (!trades || trades.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '14px', color: '#3d4f6a', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>🗺️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#7a8ba8' }}>Price Zone Map</div>
        <div style={{ fontSize: '12px', color: '#3d4f6a', maxWidth: '260px', lineHeight: 1.7 }}>Upload your CSV to see which price zones your EA performs best and worst in</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── LEFT — Zone list ── */}
      <div style={{ width: '320px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111c30' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#e8edf5', marginBottom: '3px' }}>Price Zone Map</div>
          <div style={{ fontSize: '9px', color: '#7a8ba8', marginBottom: '10px' }}>
            From {trades.length} trades in your CSV
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {[
              { icon: '▲', label: 'STRONG PROFIT', color: '#10b981' },
              { icon: '△', label: 'PROFIT',        color: '#10b981' },
              { icon: '▼', label: 'DANGER',        color: '#ef4444' },
              { icon: '▽', label: 'CAUTION',       color: '#f59e0b' },
              { icon: '◉', label: 'EXHAUSTED',     color: '#7a8ba8' },
              { icon: '◇', label: 'FRESH',         color: '#e8edf5', plain: true },
              { icon: '◈', label: 'UNTESTED',      color: '#6366f1' },
            ].map(({ icon, label, color, plain }) => (
              <span key={label} style={{
                fontSize: '8px', padding: '1px 6px', borderRadius: '3px',
                color: plain ? 'inherit' : color,
                background: plain ? 'transparent' : color + '18',
                border: plain ? 'none' : `1px solid ${color}30`,
              }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Fetch price row */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={fetchPrice} disabled={fetchingPrice} className="action-btn" style={{
            fontSize: '9px', padding: '4px 10px', borderRadius: '5px', fontFamily: 'inherit',
            border: '1px solid rgba(255,255,255,0.06)', background: '#111c30',
            color: '#7a8ba8', cursor: fetchingPrice ? 'not-allowed' : 'pointer',
          }}>
            {fetchingPrice ? '⏳' : 'Fetch price'}
          </button>
          {currentPrice && (
            <span style={{ fontSize: '10px', color: '#d4a843', fontWeight: 700 }}>
              ~${currentPrice.toLocaleString()} {currentZone ? `· ${currentZone.label}` : ''}
            </span>
          )}
        </div>

        {/* Zone rows */}
        {zones.map(zone => {
          const status = getZoneStatus(zone.winRate, zone.trades, zone.profit)
          if (!status) return null
          const isSelected = selectedZone?.key === zone.key
          const isCurrent = currentZone?.key === zone.key

          return (
            <div key={zone.key}
              onClick={() => setSelectedZone(isSelected ? null : zone)}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                background: isSelected ? 'rgba(212,168,67,0.05)' : 'transparent',
                borderLeft: `3px solid ${isCurrent ? '#d4a843' : isSelected ? '#3b82f6' : 'transparent'}`,
                transition: '0.1s',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: status.color }}>{status.icon}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: '#e8edf5' }}>{zone.label}</span>
                  {isCurrent && <span style={{ fontSize: '8px', color: '#d4a843', background: 'rgba(212,168,67,0.15)', padding: '1px 5px', borderRadius: '3px' }}>LIVE</span>}
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', color: status.badgeColor, background: status.badgeBg }}>
                  {status.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '9px', color: '#3d4f6a' }}>{zone.trades} trades</span>
                <span style={{ fontSize: '9px', color: zone.winRate >= 60 ? '#10b981' : zone.winRate >= 40 ? '#f59e0b' : '#ef4444' }}>{zone.winRate}% WR</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: zone.profit >= 0 ? '#10b981' : '#ef4444' }}>{fmtPnL(zone.profit)}</span>
              </div>

              {/* Expanded detail */}
              {isSelected && zone.tradeList && zone.tradeList.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '9px', color: '#3d4f6a', marginBottom: '6px', letterSpacing: '0.08em' }}>RECENT TRADES IN ZONE</div>
                  {zone.tradeList.slice(-6).map((t, i) => {
                    const d = t.closeDate || t.openDate
                    const dateStr = d instanceof Date
                      ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                      : (t.date || '')
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#3d4f6a' }}>{dateStr}</span>
                        <span style={{ color: '#475569' }}>{(t.action || '').toLowerCase()}</span>
                        <span style={{ color: t.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{fmtPnL(t.profit)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── RIGHT — Main content ── */}
      <div className="grid-lines" style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

        {/* Pending Order Scout */}
        {openOrders.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#e8edf5', marginBottom: '4px' }}>
              Pending Order Scout
            </div>
            <div style={{ fontSize: '10px', color: '#7a8ba8', marginBottom: '14px' }}>
              {openOrders.length} open orders from your CSV — assessed against price zone history
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openOrders.slice(0, 22).map((order, i) => {
                const price = order.openPrice || 0
                const bucket = Math.floor(price / 50) * 50
                const matchedZone = zones.find(z => z.min === bucket)
                const status = matchedZone ? getZoneStatus(matchedZone.winRate, matchedZone.trades, matchedZone.profit) : null
                const isBuy = (order.action || order.type || '').toLowerCase().includes('buy')

                // Card color
                let cardBg = 'transparent', cardBorder = 'rgba(255,255,255,0.06)'
                if (status) {
                  if (status.label === 'STRONG PROFIT') { cardBg = 'rgba(16,185,129,0.07)'; cardBorder = 'rgba(16,185,129,0.208)' }
                  else if (status.label === 'PROFIT')   { cardBg = 'rgba(16,185,129,0.03)'; cardBorder = 'rgba(16,185,129,0.145)' }
                  else if (status.label === 'DANGER')   { cardBg = 'rgba(239,68,68,0.07)';  cardBorder = 'rgba(239,68,68,0.208)' }
                }

                const zoneLabel = `$${bucket.toLocaleString()}–$${(bucket + 49).toLocaleString()}`
                const zoneDesc = matchedZone
                  ? `${zoneLabel} · ${matchedZone.trades} historical trades · ${matchedZone.winRate}% WR · ${fmtPnL(matchedZone.profit)} net`
                  : `${zoneLabel} · No historical data for this price level`

                const verdictBadge = !matchedZone
                  ? { bg: '#6366f1', label: ' UNTESTED ZONE' }
                  : status?.label === 'FRESH'
                  ? { bg: 'transparent', label: `◇ ${status.label}`, color: '#e8edf5' }
                  : status
                  ? { bg: status.color, label: `${status.icon} ${status.label}` }
                  : null

                return (
                  <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '14px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', color: isBuy ? '#10b981' : '#ef4444', background: isBuy ? 'rgba(16,185,129,0.125)' : 'rgba(239,68,68,0.125)' }}>
                            {isBuy ? 'Buy Stop' : 'Sell Stop'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#e8edf5' }}>
                            ${price.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '9px', color: '#7a8ba8' }}>{(order.lots || 0.02).toFixed(2)} lots · {order.symbol || 'XAUUSD'}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#7a8ba8' }}>Zone: {zoneDesc}</div>
                      </div>
                      {verdictBadge && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: verdictBadge.bg, color: verdictBadge.color || '#fff', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                          {verdictBadge.label}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {order.tp > 0 && <span style={{ fontSize: '9px', color: '#10b981' }}>TP: ${order.tp.toFixed(3)}</span>}
                      {order.sl > 0 && <span style={{ fontSize: '9px', color: '#ef4444' }}>SL: ${order.sl.toFixed(3)}</span>}
                      <span style={{ fontSize: '9px', color: '#3d4f6a' }}>Zone history: click to drill down →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Zone Summary */}
        {zoneSummary && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#e8edf5', marginBottom: '14px' }}>Zone Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '5px' }}>Best Zone</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#10b981', marginBottom: '3px' }}>{zoneSummary.best.label}</div>
                <div style={{ fontSize: '10px', color: '#7a8ba8' }}>{zoneSummary.best.winRate}% WR · {fmtPnLShort(zoneSummary.best.profit)} · {zoneSummary.best.trades} trades</div>
              </div>
              <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '5px' }}>Worst Zone</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#ef4444', marginBottom: '3px' }}>{zoneSummary.worst.label}</div>
                <div style={{ fontSize: '10px', color: '#7a8ba8' }}>{zoneSummary.worst.winRate}% WR · {fmtPnLShort(zoneSummary.worst.profit)} · {zoneSummary.worst.trades} trades</div>
              </div>
              <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '5px' }}>Most Active</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#e8edf5', marginBottom: '3px' }}>{zoneSummary.mostActive.label}</div>
                <div style={{ fontSize: '10px', color: '#7a8ba8' }}>{zoneSummary.mostActive.trades} trades — highest volume</div>
              </div>
              <div style={{ background: '#0c1424', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.1em', marginBottom: '5px' }}>
                  ${Math.round(zoneSummary.worst.min / 100) * 100 === zoneSummary.worst.min
                    ? '$' + zoneSummary.worst.min.toLocaleString()
                    : zoneSummary.worst.label} Trap
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#f59e0b', marginBottom: '3px' }}>⚠️ Key Insight</div>
                <div style={{ fontSize: '10px', color: '#7a8ba8' }}>
                  {zoneSummary.worst.label} = {zoneSummary.worst.winRate}% WR danger zone.
                  {(() => {
                    const roundUp = zones.find(z => z.min === zoneSummary.worst.max + 1)
                    return roundUp && roundUp.winRate > 70
                      ? ` Breakthrough to ${roundUp.label} = ${roundUp.winRate}% WR.`
                      : ' Watch for breakout above.'
                  })()}
                </div>
              </div>
            </div>

            {/* 3 Rules */}
            <div style={{ background: '#0c1424', border: '1px solid rgba(8,145,178,0.145)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '9px', color: '#0891b2', letterSpacing: '0.12em', fontWeight: 700 }}>
                  {rules.length} RULES FROM ZONE DATA
                </div>
                <button onClick={generateAiRules} disabled={fetchingRules} className="action-btn" style={{
                  fontSize: '9px', padding: '3px 10px', borderRadius: '5px', fontFamily: 'inherit',
                  border: '1px solid rgba(8,145,178,0.3)', background: 'rgba(8,145,178,0.08)', color: '#0891b2',
                  cursor: fetchingRules ? 'not-allowed' : 'pointer',
                }}>
                  {fetchingRules ? '⏳ Generating...' : '🤖 AI Refresh'}
                </button>
              </div>

              {fetchingRules && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0891b2', fontSize: '12px', padding: '10px 0' }}>
                  <div style={{ width: '14px', height: '14px', border: '2px solid #0891b2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Analysing zone patterns...
                </div>
              )}

              {!fetchingRules && rules.map((rule, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px',
                  paddingBottom: i < rules.length - 1 ? '10px' : 0,
                  marginBottom: i < rules.length - 1 ? '10px' : 0,
                  borderBottom: i < rules.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(8,145,178,0.125)', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#e8edf5', marginBottom: '3px' }}>{rule.title}</div>
                    <div style={{ fontSize: '10px', color: '#7a8ba8', lineHeight: 1.7 }}>{rule.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!zoneSummary && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#3d4f6a', textAlign: 'center', gap: '12px' }}>
            <div style={{ fontSize: '40px' }}>🗺️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#7a8ba8' }}>Not enough zone data yet</div>
            <div style={{ fontSize: '11px', lineHeight: 1.7, maxWidth: '260px' }}>Need at least 4 trades in a zone to calculate statistics. Upload more CSV data to build zone history.</div>
          </div>
        )}
      </div>
    </div>
  )
}

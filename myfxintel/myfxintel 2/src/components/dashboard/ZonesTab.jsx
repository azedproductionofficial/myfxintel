import React, { useMemo } from 'react'
import { computeAnalytics } from '../../utils/csvParser.js'

export default function ZonesTab({ trades }) {
  const analytics = trades ? computeAnalytics(trades) : null

  const zones = useMemo(() => {
    if (!analytics) return []
    return Object.entries(analytics.priceZones)
      .map(([key, data]) => ({
        key,
        min: data.min,
        max: data.max,
        trades: data.trades.length,
        profit: data.profit,
        wins: data.wins,
        losses: data.losses,
        winRate: data.trades.length > 0 ? (data.wins / data.trades.length) * 100 : 0,
      }))
      .filter(z => z.trades >= 2) // Only show zones with at least 2 trades
      .sort((a, b) => b.min - a.min) // Sort by price descending
  }, [analytics])

  if (!trades || trades.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>Upload CSV to see Price Zones</div>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>The zone map is built from your real trade data</p>
      </div>
    )
  }

  if (zones.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>Not enough zone data</div>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Need at least 2 trades per zone to show the map</p>
      </div>
    )
  }

  const maxTrades = Math.max(...zones.map(z => z.trades))
  const maxAbsProfit = Math.max(...zones.map(z => Math.abs(z.profit)))

  const getZoneColor = (zone) => {
    if (zone.winRate >= 65) return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: 'var(--green)', label: '✅ SAFE' }
    if (zone.winRate >= 50) return { bg: 'rgba(212,168,67,0.1)', border: 'rgba(212,168,67,0.3)', text: 'var(--gold)', label: '⚠️ NEUTRAL' }
    return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: 'var(--red)', label: '⛔ DANGER' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Legend */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-mute)' }}>ZONE RATING:</span>
        {[
          { label: '✅ SAFE', desc: 'WR ≥ 65%', color: 'var(--green)', bg: 'rgba(16,185,129,0.15)' },
          { label: '⚠️ NEUTRAL', desc: 'WR 50–65%', color: 'var(--gold)', bg: 'rgba(212,168,67,0.1)' },
          { label: '⛔ DANGER', desc: 'WR < 50%', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
        ].map(({ label, desc, color, bg }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: bg, border: `1px solid ${color}55` }} />
            <span style={{ fontSize: '12px', color }}>{label}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>{desc}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-mute)' }}>
          {zones.length} zones · {trades.length} trades
        </span>
      </div>

      {/* Zone list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {zones.map(zone => {
          const colors = getZoneColor(zone)
          const barWidth = (Math.abs(zone.profit) / maxAbsProfit) * 100
          const intensityWidth = (zone.trades / maxTrades) * 100

          return (
            <div key={zone.key} style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--radius)', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
              {/* Price range */}
              <div style={{ minWidth: '120px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: colors.text }}>
                  ${zone.min.toLocaleString()} – ${zone.max.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-mute)', marginTop: '2px' }}>{colors.label}</div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '20px', flex: 1, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-mute)', letterSpacing: '0.06em' }}>TRADES</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{zone.trades}</div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-mute)', letterSpacing: '0.06em' }}>WIN RATE</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: colors.text }}>{zone.winRate.toFixed(0)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-mute)', letterSpacing: '0.06em' }}>WINS / LOSSES</div>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: 'var(--green)' }}>{zone.wins}</span>
                    <span style={{ color: 'var(--text-mute)' }}> / </span>
                    <span style={{ color: 'var(--red)' }}>{zone.losses}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-mute)', letterSpacing: '0.06em' }}>P&L</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: zone.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {zone.profit >= 0 ? '+' : ''}${zone.profit.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Visual bar */}
              <div style={{ width: '120px' }}>
                <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${barWidth}%`,
                    background: zone.profit >= 0 ? 'var(--green)' : 'var(--red)',
                    borderRadius: '3px', transition: 'width 0.5s',
                  }} />
                </div>
                <div style={{ height: '4px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{
                    height: '100%', width: `${intensityWidth}%`,
                    background: 'var(--text-mute)', borderRadius: '3px',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-mute)' }}>P&L</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-mute)' }}>Activity</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        display: 'flex', gap: '2rem', flexWrap: 'wrap',
      }}>
        {[
          { label: 'SAFE ZONES', val: zones.filter(z => z.winRate >= 65).length, color: 'var(--green)' },
          { label: 'NEUTRAL ZONES', val: zones.filter(z => z.winRate >= 50 && z.winRate < 65).length, color: 'var(--gold)' },
          { label: 'DANGER ZONES', val: zones.filter(z => z.winRate < 50).length, color: 'var(--red)' },
        ].map(({ label, val, color }) => (
          <div key={label}>
            <div style={{ fontSize: '10px', color: 'var(--text-mute)', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { computeAnalytics } from '../../utils/csvParser.js'

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: color || 'var(--text)', fontFamily: 'var(--font-display)' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

const MONTH_NAMES = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }

export default function AnalyticsTab({ trades }) {
  const [expandedMonth, setExpandedMonth] = useState(null)

  const analytics = trades ? computeAnalytics(trades) : null

  if (!trades || trades.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>No data yet</div>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Upload your CSV to see full analytics</p>
      </div>
    )
  }

  const { totalTrades, winners, losers, winRate, totalProfit, profitFactor, bestTrade, worstTrade, byDay, byMonth, byWeek } = analytics

  // Day of week chart data
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const dayChartData = dayOrder.map(day => ({
    day: day.slice(0, 3),
    profit: parseFloat(byDay[day].profit.toFixed(2)),
    trades: byDay[day].trades.length,
    wr: byDay[day].trades.length > 0 ? Math.round((byDay[day].wins / byDay[day].trades.length) * 100) : 0,
  }))

  // Weekly equity curve
  const weekKeys = Object.keys(byWeek).sort()
  let running = 0
  const equityData = weekKeys.map(k => {
    running += byWeek[k].profit
    return { week: k.slice(5), equity: parseFloat(running.toFixed(2)) }
  })

  // Monthly sorted
  const monthKeys = Object.keys(byMonth).sort()

  // Day ranking
  const dayRanked = [...dayOrder].sort((a, b) => {
    const aWR = byDay[a].trades.length > 0 ? byDay[a].wins / byDay[a].trades.length : 0
    const bWR = byDay[b].trades.length > 0 ? byDay[b].wins / byDay[b].trades.length : 0
    return bWR - aWR
  })

  const tooltipStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '8px 12px',
    color: 'var(--text)', fontSize: '12px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <StatCard label="TOTAL TRADES" value={totalTrades} />
        <StatCard label="WIN RATE" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="TOTAL P&L" value={`$${totalProfit.toFixed(2)}`} color={totalProfit >= 0 ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="PROFIT FACTOR" value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)} color={profitFactor >= 1.5 ? 'var(--green)' : profitFactor >= 1 ? 'var(--gold)' : 'var(--red)'} />
        <StatCard label="WINNERS" value={winners} sub={`${losers} losses`} color="var(--green)" />
        <StatCard label="BEST TRADE" value={bestTrade ? `$${bestTrade.profit.toFixed(2)}` : '-'} color="var(--green)" />
        <StatCard label="WORST TRADE" value={worstTrade ? `$${worstTrade.profit.toFixed(2)}` : '-'} color="var(--red)" />
      </div>

      {/* Day of Week P&L Bar Chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '1rem', letterSpacing: '0.05em' }}>DAY OF WEEK PERFORMANCE</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dayChartData}>
            <XAxis dataKey="day" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-mute)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v) => [`$${v}`, 'P&L']} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {dayChartData.map((entry, i) => (
                <Cell key={i} fill={entry.profit >= 0 ? 'var(--green)' : 'var(--red)'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Equity Curve */}
      {equityData.length > 1 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '1rem', letterSpacing: '0.05em' }}>EQUITY CURVE (WEEKLY)</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={equityData}>
              <XAxis dataKey="week" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-mute)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, 'Equity']} />
              <Line type="monotone" dataKey="equity" stroke="var(--gold)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Day ranking table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
          DAY-OF-WEEK RANKING
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-b)' }}>
              {['Rank', 'Day', 'Trades', 'Win Rate', 'Wins', 'Losses', 'P&L'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text-mute)', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayRanked.map((day, i) => {
              const d = byDay[day]
              const wr = d.trades.length > 0 ? (d.wins / d.trades.length) * 100 : 0
              return (
                <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', color: i === 0 ? 'var(--gold)' : 'var(--text-mute)', fontSize: '12px' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500 }}>{day}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-dim)' }}>{d.trades.length}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: wr >= 50 ? 'var(--green)' : 'var(--red)' }}>{wr.toFixed(0)}%</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--green)' }}>{d.wins}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--red)' }}>{d.losses}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: d.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                    ${d.profit.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly P&L cards */}
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: '1rem' }}>MONTHLY ANALYSIS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...monthKeys].reverse().map(key => {
            const [year, month] = key.split('-')
            const m = byMonth[key]
            const wr = m.trades.length > 0 ? (m.wins / m.trades.length) * 100 : 0
            const grossP = m.trades.filter(t => t.profit > 0).reduce((s, t) => s + t.profit, 0)
            const grossL = Math.abs(m.trades.filter(t => t.profit < 0).reduce((s, t) => s + t.profit, 0))
            const pf = grossL > 0 ? (grossP / grossL).toFixed(2) : '∞'
            const isExpanded = expandedMonth === key

            return (
              <div key={key} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
              }}>
                <button onClick={() => setExpandedMonth(isExpanded ? null : key)} style={{
                  width: '100%', padding: '1rem 1.25rem', background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', flexWrap: 'wrap', gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                      {MONTH_NAMES[month]} {year}
                    </span>
                    <span style={{
                      fontSize: '13px', fontWeight: 600,
                      color: m.profit >= 0 ? 'var(--green)' : 'var(--red)',
                    }}>${m.profit.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>{m.trades.length} trades</span>
                    <span style={{ fontSize: '11px', color: wr >= 50 ? 'var(--green)' : 'var(--red)' }}>{wr.toFixed(0)}% WR</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>PF: {pf}</span>
                    <span style={{ color: 'var(--text-mute)', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginTop: '1rem' }}>
                      {[
                        { label: 'Gross Profit', val: `$${grossP.toFixed(2)}`, color: 'var(--green)' },
                        { label: 'Gross Loss', val: `-$${grossL.toFixed(2)}`, color: 'var(--red)' },
                        { label: 'Best Trade', val: `$${m.trades.reduce((b, t) => t.profit > b ? t.profit : b, 0).toFixed(2)}`, color: 'var(--green)' },
                        { label: 'Worst Trade', val: `$${m.trades.reduce((b, t) => t.profit < b ? t.profit : b, 0).toFixed(2)}`, color: 'var(--red)' },
                        { label: 'Profit Factor', val: pf },
                        { label: 'Wins / Losses', val: `${m.wins} / ${m.losses}` },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{
                          background: 'var(--surface-b)', borderRadius: 'var(--radius)',
                          padding: '8px 10px',
                        }}>
                          <div style={{ fontSize: '9px', color: 'var(--text-mute)', marginBottom: '4px', letterSpacing: '0.05em' }}>{label}</div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: color || 'var(--text)' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

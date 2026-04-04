import React, { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { parseCSV } from '../utils/csvParser.js'
import AffiliateBanner from '../components/layout/AffiliateBanner.jsx'
import IntelTab from '../components/dashboard/IntelTab.jsx'
import AnalyticsTab from '../components/dashboard/AnalyticsTab.jsx'
import NewsTab from '../components/dashboard/NewsTab.jsx'
import LiveScannerTab from '../components/dashboard/LiveScannerTab.jsx'
import ZonesTab from '../components/dashboard/ZonesTab.jsx'

// ─── BASE DATA STATS ──────────────────────────────────────────────────────────
const BASE_STATS = {
  allTimePnL: 807.11,
  bestDay: 'THU +$326',
  allTimeWR: 75,
  deposited: 150.53,
  roi: 536.2,
  instrument: 'XAUUSD',
}

const TABS = [
  { key: 'intel', label: '⚡ Intel' },
  { key: 'analytics', label: '📊 Analytics' },
  { key: 'news', label: '🗞️ News' },
  { key: 'scanner', label: '📡 Live' },
  { key: 'zones', label: '🗺️ Zones' },
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

export default function DashboardPage({ csvData, setCsvData }) {
  const [activeTab, setActiveTab] = useState('intel')
  const [uploading, setUploading] = useState(false)
  const [uploadInfo, setUploadInfo] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [showCSVBar, setShowCSVBar] = useState(false)
  const [showAskAI, setShowAskAI] = useState(false)
  const [weekStart, setWeekStart] = useState(getMondayOf(new Date()))
  const [weekPickerVal, setWeekPickerVal] = useState(toKey(getMondayOf(new Date())))
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const text = await file.text()
      const result = parseCSV(text)
      if (result.count === 0) {
        setUploadError('No valid trades found. Check your CSV format.')
      } else {
        setCsvData(result.trades)
        setUploadInfo({ count: result.count, format: result.format })
        setShowCSVBar(false)
      }
    } catch (e) {
      setUploadError('Failed to parse: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const navigateWeek = (dir) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dir * 7)
    setWeekStart(d)
    setWeekPickerVal(toKey(d))
  }

  const handlePickerChange = (val) => {
    setWeekPickerVal(val)
    setWeekStart(getMondayOf(new Date(val)))
  }

  // Compute stats from CSV or base
  const csvTrades = csvData || []
  const totalPnL = csvTrades.length > 0
    ? csvTrades.reduce((s, t) => s + t.profit, 0)
    : BASE_STATS.allTimePnL
  const allWins = csvTrades.length > 0
    ? csvTrades.filter(t => t.profit > 0).length
    : null
  const allWR = csvTrades.length > 0 && csvTrades.length > 0
    ? Math.round((allWins / csvTrades.length) * 100)
    : BASE_STATS.allTimeWR

  // This week P&L from CSV
  const thisWeekPnL = csvTrades.length > 0 ? (() => {
    const monStr = toKey(weekStart)
    const friDate = new Date(weekStart)
    friDate.setDate(friDate.getDate() + 4)
    const friStr = toKey(friDate)
    return csvTrades
      .filter(t => {
        const d = t.date || (t.closeDate ? t.closeDate.toISOString().slice(0,10) : '')
        return d >= monStr && d <= friStr
      })
      .reduce((s, t) => s + t.profit, 0)
  })() : 0

  const roi = csvTrades.length > 0
    ? ((totalPnL / BASE_STATS.deposited) * 100).toFixed(1)
    : BASE_STATS.roi.toFixed(1)

  const statBarItems = [
    { label: 'ALL-TIME P&L', val: (totalPnL >= 0 ? '+' : '') + '$' + Math.abs(totalPnL).toFixed(2), color: totalPnL >= 0 ? '#10b981' : '#ef4444', glow: true },
    { label: 'BEST DAY', val: BASE_STATS.bestDay, color: '#10b981' },
    { label: 'ALL-TIME WR', val: allWR + '%', color: '#f59e0b' },
    { label: 'THIS WEEK', val: (thisWeekPnL >= 0 ? '+' : '') + '$' + Math.abs(thisWeekPnL).toFixed(2), color: thisWeekPnL >= 0 ? '#10b981' : '#ef4444' },
    { label: 'DEPOSITED', val: '$' + BASE_STATS.deposited.toFixed(2), color: '#3b82f6' },
    { label: 'ROI', val: '+' + roi + '%', color: '#10b981' },
    { label: 'INSTRUMENT', val: BASE_STATS.instrument, color: '#7a8ba8' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', color: '#e8edf5', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .day-btn:hover { background: rgba(212,168,67,0.05) !important; }
        .action-btn { transition: all 0.15s ease; cursor: pointer; }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4) sepia(1) saturate(0.5); cursor: pointer; }
        .grid-lines {
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Affiliate Banner — above header */}
      <AffiliateBanner />

      {/* ── HEADER ── */}
      <header style={{ background: 'linear-gradient(#0d1929 0%, #0c1424 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)', flexWrap: 'wrap', gap: '8px' }}>
        {/* Left — Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#d4a843,#a07828)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#0d1929', boxShadow: 'rgba(212,168,67,0.12) 0 0 20px' }}>FX</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', letterSpacing: '0.04em' }}>FXINTEL</div>
            <div style={{ fontSize: '9px', color: '#7a8ba8', letterSpacing: '0.14em' }}>MULTI-INSTRUMENT · EA ANALYTICS</div>
          </div>
          <div style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: 600, background: 'linear-gradient(135deg,rgba(212,168,67,0.13),rgba(212,168,67,0.067))', border: '1px solid rgba(212,168,67,0.267)', color: '#d4a843', letterSpacing: '0.12em' }}>LIVE WEEK</div>
        </div>

        {/* Right — Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#111c30', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="action-btn" style={{
                padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontFamily: 'inherit',
                fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
                background: activeTab === tab.key ? 'linear-gradient(135deg,#d4a843,#a07828)' : 'transparent',
                color: activeTab === tab.key ? '#0d1929' : '#7a8ba8',
                boxShadow: activeTab === tab.key ? 'rgba(0,0,0,0.3) 0 2px 8px' : 'none',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Week navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => navigateWeek(-1)} className="action-btn" style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <input type="date" value={weekPickerVal} onChange={e => handlePickerChange(e.target.value)}
              style={{ height: '32px', padding: '0 10px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#e8edf5', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={() => navigateWeek(1)} className="action-btn" style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>

          {/* Action buttons */}
          <button onClick={() => window.__analyseAll && window.__analyseAll()} className="action-btn" style={{ height: '32px', padding: '0 14px', borderRadius: '7px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, border: 'none', letterSpacing: '0.06em', background: 'linear-gradient(135deg,#d4a843,#a07828)', color: '#0d1929', boxShadow: 'rgba(212,168,67,0.12) 0 2px 12px' }}>⚡ ANALYSE ALL</button>

          <button onClick={() => { setShowCSVBar(s => !s); fileRef.current?.click() }} className="action-btn" style={{ height: '32px', padding: '0 12px', borderRadius: '7px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8' }}>
            {uploading ? '⟳' : '📂'} {uploadInfo ? `✓ ${uploadInfo.count}` : 'CSV'}
          </button>

          <button onClick={() => setShowAskAI(s => !s)} className="action-btn" style={{ height: '32px', padding: '0 12px', borderRadius: '7px', fontSize: '11px', fontFamily: 'inherit', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', color: '#7a8ba8' }}>+ Ask AI</button>

          <button className="action-btn" title="Light mode coming soon" style={{ height: '32px', width: '32px', borderRadius: '7px', fontSize: '15px', border: '1px solid rgba(255,255,255,0.06)', background: '#111c30', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8ba8' }}>☀️</button>
        </div>
      </header>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept=".csv" onChange={e => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />

      {/* Upload error */}
      {uploadError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.3)', padding: '8px 28px', fontSize: '12px', color: '#ef4444', display: 'flex', justifyContent: 'space-between' }}>
          ⚠️ {uploadError}
          <button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* ── STATS BAR ── */}
      <div style={{ background: '#0c1424', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 28px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {statBarItems.map((s, i) => (
          <div key={s.label} style={{ padding: '0 24px', borderRight: i < statBarItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
            <div style={{ fontSize: '9px', color: '#3d4f6a', letterSpacing: '0.14em' }}>{s.label}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: s.color, fontFamily: 'var(--font-display)', textShadow: s.glow ? `${s.color}66 0 0 20px` : 'none' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT — sidebar + panel ── */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 148px)', overflow: 'hidden' }}>

        {/* Only show sidebar on Intel tab */}
        {activeTab === 'intel' && (
          <IntelTab
            trades={csvData}
            weekStart={weekStart}
            weekPickerVal={weekPickerVal}
            onNavigateWeek={navigateWeek}
            onPickerChange={handlePickerChange}
            layout="sidebar"
          />
        )}

        {/* Other tabs — full width */}
        {activeTab !== 'intel' && (
          <main className="grid-lines" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {activeTab === 'analytics' && <AnalyticsTab trades={csvData} />}
            {activeTab === 'news' && <NewsTab />}
            {activeTab === 'scanner' && <LiveScannerTab />}
            {activeTab === 'zones' && <ZonesTab trades={csvData} />}
          </main>
        )}
      </div>

      {/* Fixed Support button */}
      <a href="/support" style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', background: '#FFDD00', color: '#000', fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, padding: '10px 18px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,221,0,0.35)', whiteSpace: 'nowrap' }}>☕ Support Us</a>
    </div>
  )
}

import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { parseCSV } from '../utils/csvParser.js'
import AffiliateBanner from '../components/layout/AffiliateBanner.jsx'
import IntelTab from '../components/dashboard/IntelTab.jsx'
import AnalyticsTab from '../components/dashboard/AnalyticsTab.jsx'
import NewsTab from '../components/dashboard/NewsTab.jsx'
import LiveScannerTab from '../components/dashboard/LiveScannerTab.jsx'
import ZonesTab from '../components/dashboard/ZonesTab.jsx'

const TABS = [
  { key: 'intel', label: 'Intel', icon: '⚡' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'news', label: 'News', icon: '🗞️' },
  { key: 'scanner', label: 'Live Scanner', icon: '📡' },
  { key: 'zones', label: 'Zones', icon: '🗺️' },
]

export default function DashboardPage({ csvData, setCsvData }) {
  const [activeTab, setActiveTab] = useState('intel')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadInfo, setUploadInfo] = useState(null)
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
        setActiveTab('analytics') // Switch to analytics after upload
      }
    } catch (e) {
      setUploadError('Failed to parse CSV: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)', gap: '1rem',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ color: 'var(--gold)', fontSize: '16px' }}>⚡</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>
            MYFXINTEL
          </span>
        </Link>

        {/* Upload status */}
        {uploadInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: 'var(--text-mute)' }}>
              {uploadInfo.format.toUpperCase()} CSV
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: '100px',
              background: 'var(--green-glow)', color: 'var(--green)',
              border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px',
            }}>✓ {uploadInfo.count} trades loaded</span>
          </div>
        )}

        {/* Upload button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px', borderRadius: 'var(--radius)',
              background: uploading ? 'var(--surface-b)' : 'var(--gold)',
              color: uploading ? 'var(--text-dim)' : '#000',
              border: 'none', fontSize: '12px', fontWeight: 600,
              fontFamily: 'var(--font-mono)', cursor: uploading ? 'wait' : 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {uploading ? '⟳ Reading...' : '↑ Upload CSV'}
          </button>
          <Link to="/support" style={{
            padding: '7px 16px', borderRadius: 'var(--radius)',
            background: 'transparent', border: '1px solid var(--gold)',
            color: 'var(--gold)', fontSize: '12px', whiteSpace: 'nowrap',
          }}>Support Us</Link>
        </div>
      </header>

      {/* Upload error */}
      {uploadError && (
        <div style={{
          background: 'var(--red-glow)', border: '1px solid rgba(239,68,68,0.3)',
          padding: '10px 1.5rem', fontSize: '12px', color: 'var(--red)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          ⚠️ {uploadError}
          <button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Affiliate banner */}
      <div style={{ padding: '12px 1.5rem 0' }}>
        <AffiliateBanner />
      </div>

      {/* Drop zone hint (when no data) */}
      {!csvData && (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            margin: '1rem 1.5rem',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📁</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '6px' }}>
            Drop your CSV here or click to upload
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Supports Myfxbook CSV and MT4/MT5 (Blueberry) CSV formats
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--border)',
        marginTop: csvData ? '1rem' : 0,
        display: 'flex', gap: 0, overflowX: 'auto',
      }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '12px 20px', background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === tab.key ? 'var(--gold)' : 'transparent'}`,
            color: activeTab === tab.key ? 'var(--gold)' : 'var(--text-dim)',
            cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-mono)',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
        {activeTab === 'intel' && <IntelTab trades={csvData} />}
        {activeTab === 'analytics' && <AnalyticsTab trades={csvData} />}
        {activeTab === 'news' && <NewsTab />}
        {activeTab === 'scanner' && <LiveScannerTab />}
        {activeTab === 'zones' && <ZonesTab trades={csvData} />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '1rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--text-mute)',
      }}>
        <span>© 2026 MyFXIntel</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[['/', 'About'], ['/blog', 'Blog'], ['/contact', 'Contact'], ['/privacy', 'Privacy']].map(([to, label]) => (
            <Link key={label} to={to} style={{ color: 'var(--text-mute)' }}>{label}</Link>
          ))}
        </div>
      </footer>

      {/* Fixed Support button */}
      <Link to="/support" style={{
        position: 'fixed', bottom: '1.5rem', left: '1.5rem',
        padding: '8px 16px', borderRadius: 'var(--radius)',
        background: 'var(--gold)', color: '#000',
        fontSize: '12px', fontWeight: 600, zIndex: 99,
        boxShadow: '0 4px 20px rgba(212,168,67,0.3)',
        textDecoration: 'none',
      }}>💛 Support Us</Link>
    </div>
  )
}

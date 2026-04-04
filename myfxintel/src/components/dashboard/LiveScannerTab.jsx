import React, { useState, useEffect, useRef } from 'react'

async function callClaude(messages, system) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

const REFRESH_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '5 min', value: 5 * 60 * 1000 },
  { label: '15 min', value: 15 * 60 * 1000 },
  { label: '30 min', value: 30 * 60 * 1000 },
]

export default function LiveScannerTab() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [lastScan, setLastScan] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(0)
  const timerRef = useRef(null)

  const scan = async () => {
    setScanning(true)
    const system = `You are MyFXIntel Live Scanner — a real-time Gold trading intelligence system.
Provide a concise trading brief for Gold (XAUUSD) right now.
Format your response in these exact sections:
📍 CURRENT PRICE — state approximate current gold price range and recent movement
📰 BREAKING NEWS — 2-3 key news items affecting gold right now
🌍 GEOPOLITICAL — current geopolitical factors affecting gold
🎯 DIRECTIONAL BIAS — Bullish / Bearish / Neutral with brief reason
⏰ SESSION — which trading session is most suitable right now
✅ EA VERDICT — TRADE / CAUTIOUS / SKIP with one sentence reason
Keep it under 250 words. Be specific and actionable.`

    try {
      const now = new Date().toUTCString()
      const text = await callClaude([{
        role: 'user',
        content: `Give me a live Gold trading brief. Current UTC time: ${now}. Scan current market conditions, news, and geopolitics.`
      }], system)
      setResult(text)
      setLastScan(new Date())
    } catch (e) {
      setResult('Error: Could not connect to scanner. Check API key configuration.')
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoRefresh > 0) {
      timerRef.current = setInterval(scan, autoRefresh)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoRefresh])

  const extractSection = (text, emoji) => {
    if (!text) return null
    const lines = text.split('\n')
    const idx = lines.findIndex(l => l.includes(emoji))
    if (idx === -1) return null
    const content = []
    for (let i = idx; i < Math.min(idx + 4, lines.length); i++) {
      if (i > idx && lines[i].match(/^[📍📰🌍🎯⏰✅]/)) break
      content.push(lines[i])
    }
    return content.join('\n').trim()
  }

  const sections = result ? [
    { emoji: '📍', label: 'CURRENT PRICE' },
    { emoji: '📰', label: 'BREAKING NEWS' },
    { emoji: '🌍', label: 'GEOPOLITICAL' },
    { emoji: '🎯', label: 'DIRECTIONAL BIAS' },
    { emoji: '⏰', label: 'SESSION' },
    { emoji: '✅', label: 'EA VERDICT' },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controls */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            📡 Live Gold Scanner
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Real-time price · Breaking news · Geopolitical events
          </div>
          {lastScan && (
            <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '4px' }}>
              Last scan: {lastScan.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Auto-refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>Auto:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {REFRESH_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setAutoRefresh(opt.value)} style={{
                  padding: '4px 10px', borderRadius: 'var(--radius)',
                  border: `1px solid ${autoRefresh === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                  background: autoRefresh === opt.value ? 'var(--gold-glow)' : 'var(--surface-b)',
                  color: autoRefresh === opt.value ? 'var(--gold)' : 'var(--text-mute)',
                  fontSize: '11px', cursor: 'pointer',
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          <button onClick={scan} disabled={scanning} style={{
            padding: '10px 24px', borderRadius: 'var(--radius)',
            background: scanning ? 'var(--surface-b)' : 'var(--gold)',
            color: scanning ? 'var(--text-dim)' : '#000',
            border: 'none', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)',
            cursor: scanning ? 'wait' : 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {scanning ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Scanning...
              </>
            ) : '📡 Scan Now'}
          </button>
        </div>
      </div>

      {/* Results */}
      {scanning && !result && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 1.5s ease infinite' }}>📡</div>
          <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Scanning live gold price, news and geopolitics...</div>
        </div>
      )}

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {sections.map(({ emoji, label }) => {
            const content = extractSection(result, emoji)
            if (!content) return null
            const isVerdict = emoji === '✅'
            const isBias = emoji === '🎯'
            const text = content.replace(/^.*?—\s*/, '').replace(/^.*?:\s*/, '')

            return (
              <div key={label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                ...(isVerdict ? { borderColor: 'var(--gold)', background: 'var(--gold-glow)' } : {}),
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  {emoji} {label}
                </div>
                <div style={{
                  fontSize: '13px', lineHeight: '1.6', color: 'var(--text)',
                  ...(isVerdict ? { fontWeight: 600, color: 'var(--gold)' } : {}),
                }}>
                  {text || content}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!result && !scanning && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '4rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>📡</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '8px', color: 'var(--text-dim)' }}>
            Ready to scan
          </div>
          <p style={{ color: 'var(--text-mute)', fontSize: '13px' }}>
            Click Scan Now to get a real-time Gold trading brief
          </p>
        </div>
      )}
    </div>
  )
}

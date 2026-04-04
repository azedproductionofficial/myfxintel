import React from 'react'
import { Link } from 'react-router-dom'

export default function PitchPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,168,67,0.08) 0%, #070d1a 70%)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--gold)', fontSize: '32px' }}>⚡</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', letterSpacing: '0.08em' }}>
          MYFXINTEL
        </span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 64px)',
        fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
        maxWidth: '700px',
      }}>
        The Intelligence Layer<br />
        <span style={{ color: 'var(--gold)' }}>Your EA Deserves</span>
      </h1>

      <p style={{
        color: 'var(--text-dim)', fontSize: '16px', lineHeight: 1.7,
        maxWidth: '500px', marginBottom: '3rem',
      }}>
        AI-powered analytics for Gold EA traders. Know which days to trade, which price zones to avoid, and how global events impact your strategy.
      </p>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
        {['⚡ AI Daily Analysis', '📊 Deep Analytics', '🗞️ 7 News Engines', '📡 Live Scanner', '🗺️ Zone Map'].map(f => (
          <span key={f} style={{
            padding: '8px 18px', borderRadius: '100px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            fontSize: '13px', color: 'var(--text-dim)',
          }}>{f}</span>
        ))}
      </div>

      {/* QR Code area */}
      <div style={{
        background: 'var(--surface)', border: '1px solid rgba(212,168,67,0.3)',
        borderRadius: 'var(--radius-xl)', padding: '2.5rem',
        marginBottom: '2rem', maxWidth: '340px', width: '100%',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-mute)', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
          SCAN TO VISIT
        </div>

        {/* QR placeholder */}
        <div style={{
          width: '180px', height: '180px', margin: '0 auto 1.25rem',
          background: '#fff', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '12px',
        }}>
          <div style={{ width: '100%', height: '100%', background: 'var(--bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-mute)', textAlign: 'center', lineHeight: 1.6 }}>
              QR Code<br />myfxintel.com
            </span>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--gold)' }}>
          myfxintel.com
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-mute)', marginTop: '4px' }}>
          Free to use · No sign-up required
        </div>
      </div>

      <Link to="/dashboard" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '14px 36px', borderRadius: 'var(--radius)',
        background: 'var(--gold)', color: '#000',
        fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700,
        textDecoration: 'none', boxShadow: '0 8px 32px rgba(212,168,67,0.3)',
      }}>Enter Dashboard →</Link>

      <div style={{ marginTop: '2rem', fontSize: '11px', color: 'var(--text-mute)' }}>
        Lagos Forex Expo 2026 · MyFXIntel
      </div>
    </div>
  )
}

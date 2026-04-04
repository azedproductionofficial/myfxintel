import React, { useState } from 'react'
import Nav from '../components/layout/Nav.jsx'
import Footer from '../components/layout/Footer.jsx'

const WALLET = 'TFHQ6F1VJZjEATuPY5mXSc8W1PoKZSMTzf'

export default function SupportPage() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(WALLET).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💛</div>
        <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '12px' }}>SUPPORT MYFXINTEL</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, marginBottom: '16px' }}>
          Keep the Platform Free
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '440px', margin: '0 auto 3rem' }}>
          MyFXIntel is free for all EA traders. If it has helped your trading, consider supporting the platform. Every contribution keeps development going and the lights on.
        </p>

        {/* USDT Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid rgba(212,168,67,0.3)',
          borderRadius: 'var(--radius-xl)', padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px',
            background: 'var(--gold-glow)', border: '1px solid rgba(212,168,67,0.3)',
            marginBottom: '1.5rem',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#26a17b' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.06em' }}>USDT · TRC20 Network</span>
          </div>

          {/* QR code placeholder */}
          <div style={{
            width: '160px', height: '160px', margin: '0 auto 1.5rem',
            background: 'var(--surface-b)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>📱</div>
              <div style={{ fontSize: '10px', color: 'var(--text-mute)', lineHeight: 1.4 }}>QR for<br />TRC20 USDT</div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginBottom: '10px', letterSpacing: '0.04em' }}>
            WALLET ADDRESS
          </div>

          <div style={{
            background: 'var(--surface-b)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '12px 16px',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text)',
            wordBreak: 'break-all', marginBottom: '1rem', lineHeight: 1.6,
          }}>
            {WALLET}
          </div>

          <button onClick={copy} style={{
            width: '100%', padding: '12px', borderRadius: 'var(--radius)',
            background: copied ? 'var(--green-glow)' : 'var(--gold)',
            color: copied ? 'var(--green)' : '#000',
            border: copied ? '1px solid rgba(16,185,129,0.3)' : 'none',
            fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)',
            cursor: 'pointer', transition: 'all 0.3s',
          }}>
            {copied ? '✓ Copied to clipboard' : '📋 Copy Wallet Address'}
          </button>
        </div>

        <div style={{ color: 'var(--text-mute)', fontSize: '12px', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-dim)' }}>⚠️ Important:</strong> Only send USDT on the TRC20 network to this address.<br />
          Sending other tokens or using a different network will result in permanent loss of funds.
        </div>
      </main>
      <Footer />
    </div>
  )
}

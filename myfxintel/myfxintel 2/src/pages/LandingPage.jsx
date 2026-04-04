import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/layout/Nav.jsx'
import Footer from '../components/layout/Footer.jsx'

const FEATURES = [
  { icon: '⚡', title: 'Intel Tab — Daily AI Analysis', desc: 'Forward analysis and post-mortem for each trading day. AI gives TRADE / CAUTIOUS / SKIP verdict based on your EA\'s real historical performance.' },
  { icon: '📊', title: 'Analytics — Deep Performance', desc: 'Weekly breakdown, day-of-week ranking, monthly P&L cards, profit factor, win rate trends. Upload your statement and it all populates instantly.' },
  { icon: '🗞️', title: 'News Engines — 7 Event Scorers', desc: 'FOMC, CPI, NFP, PPI, GDP, PMI, and Geopolitical engines with weighted scoring. Get a bullish/bearish verdict for gold with specific EA action guidance.' },
  { icon: '📡', title: 'Live Scanner — Real-Time Intel', desc: 'One click searches live gold price, breaking news, and geopolitical events. Returns a trading brief with current price, directional bias, and session recommendation.' },
  { icon: '🗺️', title: 'Zones — Price Zone Map', desc: 'Know which price zones are historically profitable and which are danger zones. Built from real trade data — shows win rate and P&L for every $50 price range.' },
  { icon: '📅', title: 'Monthly Analysis', desc: 'Month-by-month P&L cards with profit factor, best/worst trades, and day-of-week breakdown per month.' },
]

const COMPARISON = [
  ['Trade history tracking', true, true],
  ['Win rate & P&L stats', true, true],
  ['AI forward analysis per day', true, false],
  ['News event scoring (FOMC, NFP, CPI...)', true, false],
  ['Live market intelligence scanner', true, false],
  ['Price zone danger map', true, false],
  ['Post-mortem AI analysis', true, false],
  ['Day-of-week EA performance ranking', true, 'partial'],
  ['MT4 / Myfxbook CSV direct upload', true, 'partial'],
  ['Built specifically for EA traders', true, false],
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '6rem 2rem 4rem',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 70%)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '100px',
            border: '1px solid rgba(212,168,67,0.3)', background: 'var(--gold-glow)',
            marginBottom: '2rem',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s ease infinite' }} />
            <span style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.08em' }}>Live · EA Analytics Platform</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
            color: 'var(--text)',
          }}>
            The Intelligence Layer<br />
            <span style={{ color: 'var(--gold)' }}>Your EA Deserves</span>
          </h1>

          <p style={{
            fontSize: '16px', color: 'var(--text-dim)', lineHeight: 1.7,
            maxWidth: '540px', margin: '0 auto 2.5rem',
          }}>
            Upload your MT4 or Myfxbook statement and get AI-powered analysis on every trade.
            Know which days to run your EA, which price zones to avoid, and how global events
            impact your strategy — before they happen.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{
              padding: '14px 32px', borderRadius: 'var(--radius)',
              background: 'var(--gold)', color: '#000',
              fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', transition: 'opacity 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>Enter Dashboard →</Link>
            <a href="#features" style={{
              padding: '14px 32px', borderRadius: 'var(--radius)',
              background: 'var(--surface)', color: 'var(--text)',
              border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
              fontSize: '14px', textDecoration: 'none',
            }}>See Features</a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
            {[
              { val: '7', label: 'Analysis Engines' },
              { val: 'AI', label: 'Powered Insights' },
              { val: 'Any', label: 'Broker · Any EA' },
              { val: 'Free', label: 'To Use Now' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--gold)' }}>{val}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-mute)', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '12px' }}>PLATFORM FEATURES</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700 }}>
            Everything Myfxbook Doesn't Tell You
          </h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0' }}>
            Built specifically for EA traders who want to understand the WHY behind their performance
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '1.75rem',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '5rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '12px' }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, marginBottom: '3rem' }}>
            Up and running in 3 steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { num: '1', title: 'Export your Statement', desc: 'From MT4 Terminal → Account History → Save as CSV. Or export from Myfxbook. Works with any broker.' },
              { num: '2', title: 'Upload to MyFXIntel', desc: 'Click Upload CSV in the dashboard. Auto-detects Myfxbook or MT4 format and instantly populates all tabs.' },
              { num: '3', title: 'Get AI Intelligence', desc: 'Use Intel for daily analysis, News engines for event scoring, Live Scanner for real-time data, and Monthly Analytics for patterns.' },
            ].map(({ num, title, desc }) => (
              <div key={num}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--gold-glow)', border: '1px solid rgba(212,168,67,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--gold)',
                }}>{num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section id="comparison" style={{ padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '12px' }}>COMPARISON</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700 }}>
            MyFXIntel vs Myfxbook
          </h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px', fontSize: '14px' }}>Both track your EA. Only one tells you what to do about it.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-mute)', fontWeight: 500 }}>Feature</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>MyFXIntel</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-mute)', fontWeight: 500 }}>Myfxbook</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([feature, mfxi, mfxb]) => (
                <tr key={feature} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', fontSize: '13px' }}>{feature}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--green)', fontSize: '16px' }}>✅</span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    {mfxb === true ? <span style={{ color: 'var(--green)', fontSize: '16px' }}>✅</span>
                      : mfxb === 'partial' ? <span style={{ fontSize: '12px', color: 'var(--gold)' }}>⚠️ Basic</span>
                      : <span style={{ color: 'var(--red)', fontSize: '16px' }}>❌</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 2rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,168,67,0.08) 0%, transparent 70%)',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: '12px' }}>
          Ready to understand your EA like never before?
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '14px' }}>
          Free to use. No sign-up required. Just upload your statement and go.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{
            padding: '14px 32px', borderRadius: 'var(--radius)',
            background: 'var(--gold)', color: '#000',
            fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600,
            textDecoration: 'none',
          }}>Enter Dashboard →</Link>
          <Link to="/contact" style={{
            padding: '14px 32px', borderRadius: 'var(--radius)',
            background: 'var(--surface)', color: 'var(--text)',
            border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
            fontSize: '14px', textDecoration: 'none',
          }}>Get in Touch</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

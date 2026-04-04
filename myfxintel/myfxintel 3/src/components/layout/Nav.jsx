import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav({ dark = true }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 2rem',
      height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(7,13,26,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ color: 'var(--gold)', fontSize: '18px' }}>⚡</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
          color: 'var(--text)', letterSpacing: '0.05em'
        }}>MYFXINTEL</span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-links">
        {[
          { to: '/#features', label: 'Features' },
          { to: '/blog', label: 'Blog' },
          { to: '/contact', label: 'Contact' },
        ].map(({ to, label }) => (
          <Link key={label} to={to} style={{
            color: 'var(--text-dim)', fontSize: '13px', letterSpacing: '0.03em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--text)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
          >{label}</Link>
        ))}
        <Link to="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 16px', borderRadius: 'var(--radius)',
          background: 'var(--gold)', color: '#000',
          fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500,
          letterSpacing: '0.03em', transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.target.style.opacity = '0.85'}
        onMouseLeave={e => e.target.style.opacity = '1'}
        >Enter Dashboard →</Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
      `}</style>
    </nav>
  )
}

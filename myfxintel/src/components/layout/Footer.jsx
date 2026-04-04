import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      background: 'var(--bg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--gold)' }}>⚡</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--text-dim)' }}>
          MYFXINTEL
        </span>
        <span style={{ color: 'var(--text-mute)', fontSize: '12px' }}>
          © 2026 MyFXIntel. All rights reserved.
        </span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { to: '/#features', label: 'About' },
          { to: '/#how', label: 'How It Works' },
          { to: '/contact', label: 'Contact Us' },
          { to: '/privacy', label: 'Privacy Policy' },
        ].map(({ to, label }) => (
          <Link key={label} to={to} style={{ color: 'var(--text-mute)', fontSize: '12px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-dim)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-mute)'}
          >{label}</Link>
        ))}
      </div>
    </footer>
  )
}

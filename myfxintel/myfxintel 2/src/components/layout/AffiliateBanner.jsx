import React, { useState, useEffect } from 'react'

const BROKERS = [
  {
    name: 'Exness',
    tagline: 'Trade Gold with ultra-low spreads',
    cta: 'Open Account →',
    url: 'https://one.exnessonelink.com/a/we5twblfhd?source=app&platform=mobile&pid=mobile_share',
    badge: 'Recommended',
    color: '#00b4d8',
  },
  {
    name: 'Headway',
    tagline: 'Fast execution · No requotes · EA-friendly',
    cta: 'Start Trading →',
    url: 'https://headway.partners/user/signup?hwp=a6b5a0',
    badge: 'EA Friendly',
    color: '#7c3aed',
  },
]

export default function AffiliateBanner() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % BROKERS.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const broker = BROKERS[active]

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${broker.color}`,
      borderRadius: 'var(--radius)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      transition: 'border-color 0.5s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '10px', color: 'var(--text-mute)', whiteSpace: 'nowrap' }}>SPONSORED</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: broker.color, whiteSpace: 'nowrap' }}>
            {broker.name}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {broker.tagline}
          </span>
        </div>
        <span style={{
          padding: '2px 8px', borderRadius: '100px', background: 'var(--surface-b)',
          border: '1px solid var(--border)', color: 'var(--gold)', fontSize: '10px', whiteSpace: 'nowrap'
        }}>{broker.badge}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href={broker.url} target="_blank" rel="noopener noreferrer" style={{
          padding: '5px 14px', borderRadius: 'var(--radius)',
          background: broker.color, color: '#fff',
          fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap', textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >{broker.cta}</a>

        <div style={{ display: 'flex', gap: '6px' }}>
          {BROKERS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: i === active ? '20px' : '6px', height: '6px',
              borderRadius: '3px', border: 'none', cursor: 'pointer',
              background: i === active ? broker.color : 'var(--text-mute)',
              transition: 'all 0.3s', padding: 0,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

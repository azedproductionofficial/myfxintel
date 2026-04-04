import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Nav from '../components/layout/Nav.jsx'
import Footer from '../components/layout/Footer.jsx'
import { ARTICLES } from './BlogIndex.jsx'

function renderMarkdown(text) {
  const lines = text.trim().split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '1.5rem', marginTop: '2rem', lineHeight: 1.2 }}>{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '1rem', marginTop: '2.5rem', color: 'var(--text)' }}>{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.75rem', color: 'var(--text-dim)' }}>{line.slice(4)}</h3>)
    } else if (line.startsWith('**') && line.endsWith('**') && line.includes('—')) {
      // Bold term with dash
      const [boldPart, ...rest] = line.split('**').filter(Boolean)
      elements.push(
        <p key={i} style={{ marginBottom: '0.75rem', lineHeight: 1.7, fontSize: '14px' }}>
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{boldPart}</strong>
          {rest.join('')}
        </p>
      )
    } else if (line.startsWith('- ')) {
      const listItems = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        listItems.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ marginBottom: '1rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {listItems.map((item, j) => (
            <li key={j} style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>') }}
            />
          ))}
        </ul>
      )
      continue
    } else if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={`code-${i}`} style={{
          background: 'var(--surface-b)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.25rem',
          overflowX: 'auto', marginBottom: '1.5rem', marginTop: '1rem',
          fontSize: '12px', lineHeight: 1.6, color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
        }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
    } else if (line.trim() === '') {
      // skip empty lines
    } else {
      // Regular paragraph — handle inline bold
      elements.push(
        <p key={i} style={{ marginBottom: '1rem', lineHeight: 1.75, fontSize: '14px', color: 'var(--text-dim)' }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>') }}
        />
      )
    }
    i++
  }
  return elements
}

export default function BlogPost() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) return <Navigate to="/blog" replace />

  const others = ARTICLES.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 2rem 4rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2rem', fontSize: '12px', color: 'var(--text-mute)' }}>
          <Link to="/blog" style={{ color: 'var(--text-mute)' }}>Blog</Link>
          <span>›</span>
          <span style={{ color: 'var(--text-dim)' }}>{article.category}</span>
        </div>

        {/* Category badge */}
        <span style={{
          padding: '4px 12px', borderRadius: '100px',
          background: `${article.categoryColor}18`, color: article.categoryColor,
          border: `1px solid ${article.categoryColor}33`,
          fontSize: '11px', fontWeight: 500, display: 'inline-block', marginBottom: '1.25rem',
        }}>{article.category}</span>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-mute)', marginBottom: '3rem' }}>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>

        {/* Content */}
        <article style={{ lineHeight: 1.75 }}>
          {renderMarkdown(article.content)}
        </article>

        {/* CTA Box */}
        <div style={{
          margin: '3rem 0', background: 'var(--gold-glow)',
          border: '1px solid rgba(212,168,67,0.25)', borderRadius: 'var(--radius-xl)',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⚡</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Analyse your EA with MyFXIntel
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Upload your MT4 or Myfxbook CSV and get AI-powered insights on every trade. Free, no sign-up required.
          </p>
          <Link to="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 24px', borderRadius: 'var(--radius)',
            background: 'var(--gold)', color: '#000',
            fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none',
          }}>Enter Dashboard →</Link>
        </div>

        {/* Related articles */}
        {others.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-mute)', letterSpacing: '0.08em', marginBottom: '1rem' }}>MORE ARTICLES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {others.map(a => (
                <Link key={a.slug} to={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
                        background: `${a.categoryColor}18`, color: a.categoryColor,
                        marginBottom: '6px', display: 'inline-block',
                      }}>{a.category}</span>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{a.title}</div>
                    </div>
                    <span style={{ color: 'var(--gold)', fontSize: '16px', flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

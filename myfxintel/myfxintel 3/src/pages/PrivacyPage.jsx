import React from 'react'
import Nav from '../components/layout/Nav.jsx'
import Footer from '../components/layout/Footer.jsx'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>{title}</h2>
    <div style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.75 }}>{children}</div>
  </div>
)

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '12px' }}>LEGAL</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, marginBottom: '8px' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-mute)', fontSize: '13px' }}>Last updated: April 2026</p>
        </div>

        <Section title="Overview">
          MyFXIntel ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data. We keep this simple because we genuinely believe in data minimalism.
        </Section>

        <Section title="What We Collect">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text)' }}>Trading data you upload:</strong> When you upload a CSV file, it is processed entirely in your browser. Your trading data is never transmitted to our servers, stored, or shared with any third party. It exists only in your browser session and is gone when you close the tab.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text)' }}>Contact form submissions:</strong> When you use the contact form, we collect your name, email address, and message. This is processed through Netlify Forms and stored securely.</p>
          <p><strong style={{ color: 'var(--text)' }}>AI queries:</strong> When you use the Intel tab or Live Scanner, your query is sent to Anthropic's Claude API via our secure serverless function. No personally identifiable information is included in these queries. Anthropic's privacy policy governs how they handle API data.</p>
        </Section>

        <Section title="What We Don't Collect">
          <p>We do not collect, store, or process:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Your trading history or performance data', 'Account numbers or broker credentials', 'Financial information or payment details (except voluntary USDT donations)', 'Location data', 'Device fingerprints or tracking cookies'].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Cookies and Analytics">
          MyFXIntel does not use tracking cookies, analytics platforms, or advertising networks. We do not run ads and we do not sell data. The site may use functional browser storage (localStorage) solely to preserve your session state such as the active dashboard tab.
        </Section>

        <Section title="Third-Party Services">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text)' }}>Netlify:</strong> Our hosting provider. Netlify may log standard web server access logs (IP addresses, request paths) for security and performance purposes. See Netlify's privacy policy for details.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: 'var(--text)' }}>Anthropic:</strong> AI queries from the Intel tab and Live Scanner are processed by Anthropic's Claude API. Anthropic does not use API inputs to train models by default. See Anthropic's privacy policy for details.</p>
          <p><strong style={{ color: 'var(--text)' }}>Affiliate links:</strong> Links to Exness and Headway are affiliate links. Clicking them may set a cookie on the broker's website that attributes any resulting account opening to us. This is standard affiliate tracking and is governed by each broker's privacy policy.</p>
        </Section>

        <Section title="Data Security">
          Since your trading data never leaves your browser, the security of your financial data is inherently strong. Contact form submissions are transmitted over HTTPS and stored securely by Netlify. We do not have access to payment information.
        </Section>

        <Section title="Your Rights">
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Request deletion of any contact form data we hold', 'Know what data we have about you (which is minimal by design)', 'Withdraw consent for any data processing'].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p style={{ marginTop: '12px' }}>To exercise any of these rights, contact us through the contact page.</p>
        </Section>

        <Section title="Changes to This Policy">
          We may update this privacy policy as the platform develops. Significant changes will be noted on this page with an updated date. Continued use of the platform after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="Contact">
          For privacy-related questions, use the contact form at myfxintel.com/contact.
        </Section>
      </main>
      <Footer />
    </div>
  )
}

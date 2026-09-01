import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingPage from './MarketingPage'
import { CtaBannerSection } from './pieces'
import { ICONS } from './icons'

const CONTACTS = [
  {
    icon: ICONS.bell,
    title: 'Support',
    desc: 'support@financialmarket.example — for existing customers and technical questions.',
  },
  {
    icon: ICONS.grid,
    title: 'Sales & Demos',
    desc: 'sales@financialmarket.example — book a walkthrough of the full platform.',
  },
  {
    icon: ICONS.folder,
    title: 'Press & Partnerships',
    desc: 'hello@financialmarket.example — media inquiries and collaborations.',
  },
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <MarketingPage active="contact">
      <section className="page-banner">
        <div className="wrap">
          <div className="crumbs reveal">
            <Link to="/">Home</Link> / Contact
          </div>
          <div className="eyebrow reveal">
            <span className="dot" /> GET IN TOUCH
          </div>
          <h1 className="headline reveal reveal-d1" style={{ maxWidth: 640 }}>
            Let&apos;s talk about your content.
          </h1>
          <p className="lead reveal reveal-d2" style={{ maxWidth: 520 }}>
            Questions about plans, a demo request, or feedback on a lesson — send it over and our team will
            reply within one business day.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>
          <div className="reveal">
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: 26,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Full name</label>
                <input
                  required
                  type="text"
                  placeholder="Alex Martinez"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Email</label>
                <input
                  required
                  type="email"
                  placeholder="you@company.com"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>What can we help with?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us a little about your team and what you're looking for..."
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                Send Message →
              </button>
              {sent && (
                <div style={{ fontSize: 13, color: 'var(--blue-dark)', textAlign: 'center' }}>
                  Thanks — we&apos;ll be in touch within one business day.
                </div>
              )}
            </form>
          </div>
          <div className="reveal reveal-d1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CONTACTS.map((c) => (
              <div className="lcard" key={c.title}>
                <div className="licon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B4A73" strokeWidth="1.8">
                    {c.icon}
                  </svg>
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBannerSection
        title="Prefer to explore first?"
        lead="Walk through the dashboard and every module before you talk to us."
        ctaLabel="Explore the Platform →"
        to="/product/dashboard"
      />
    </MarketingPage>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { trackEvent } from '../../lib/analytics'

export function PageBanner({ eyebrow, title, lead, stats, visual }) {
  return (
    <section className="page-banner">
      <div className={`wrap${visual ? ' hero-grid' : ''}`} style={{ alignItems: 'flex-start', paddingBottom: 40 }}>
        <div>
          <div className="eyebrow reveal">
            <span className="dot" /> {eyebrow}
          </div>
          <h1 className="headline reveal reveal-d1">{title}</h1>
          <p className="lead reveal reveal-d2">{lead}</p>
          <div className="hero-ctas reveal reveal-d3">
            <Link
              to="/pricing"
              className="btn btn-primary btn-arrow"
              onClick={() => trackEvent('cta_click', { cta_label: 'Start Free Trial', cta_location: 'product_banner' })}
            >
              Start Free Trial
              <ArrowRight className="btn-arrow-icon" size={17} strokeWidth={2.5} />
            </Link>
            <Link
              to="/contact"
              className="btn btn-ghost"
              onClick={() => trackEvent('cta_click', { cta_label: 'Book a Demo', cta_location: 'product_banner' })}
            >
              Book a Demo
            </Link>
          </div>
          {stats && (
            <div className="stats-row reveal reveal-d4">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="num">{s.value}</div>
                  <div className="lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {visual && (
          <div className="reveal reveal-d2" style={{ position: 'relative' }}>
            {visual}
          </div>
        )}
      </div>
    </section>
  )
}

export function FeatureCards({ kicker, title, lead, cards }) {
  return (
    <section>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="kicker">
            <span className="dot" /> {kicker}
          </span>
          <h2 className="sec-title">{title}</h2>
          {lead && <p>{lead}</p>}
        </div>
        <div className="cards-grid">
          {cards.map((c, i) => (
            <div className={`lcard reveal reveal-d${i + 1}`} key={c.title}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
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
  )
}

export function StepsSection({ kicker, title, lead, steps }) {
  return (
    <section>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="kicker">
            <span className="dot" /> {kicker}
          </span>
          <h2 className="sec-title">{title}</h2>
          {lead && <p>{lead}</p>}
        </div>
        <div className="steps-row">
          {steps.map((s, i) => (
            <div className={`step reveal reveal-d${i + 1}`} key={s.title}>
              <div className="sidx">{i + 1}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CtaBannerSection({ title, lead, ctaLabel = 'Start Free Trial', to = '/pricing' }) {
  return (
    <section>
      <div className="wrap">
        <div className="cta-banner reveal">
          <h2>{title}</h2>
          <p>{lead}</p>
          <Link
            to={to}
            className="btn btn-orange btn-arrow"
            onClick={() => trackEvent('cta_click', { cta_label: ctaLabel, cta_location: 'cta_banner' })}
          >
            {ctaLabel.replace(/\s*→\s*$/, '')}
            <ArrowRight className="btn-arrow-icon" size={17} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}

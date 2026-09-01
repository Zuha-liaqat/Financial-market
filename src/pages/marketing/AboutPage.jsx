import { Link } from 'react-router-dom'
import MarketingPage from './MarketingPage'
import { FeatureCards, CtaBannerSection } from './pieces'
import { ICONS } from './icons'

const STATS = [
  { value: '42K+', label: 'Students taught' },
  { value: '180+', label: 'Terms explained' },
  { value: '3', label: 'Platforms published daily across' },
  { value: '4.9/5', label: 'Learner rating' },
]

const TEAM = [
  { initials: 'AM', bg: 'var(--navy)', name: 'Alex Martinez', role: 'Admin & Editorial Lead' },
  { initials: 'AV', bg: 'var(--blue-dark)', name: 'Alex V.', role: 'Content Reviewer' },
  { initials: 'RI', bg: 'var(--orange-deep)', name: 'Investment Academy', role: 'Guest Contributors' },
]

export default function AboutPage() {
  return (
    <MarketingPage active="about">
      <section className="page-banner">
        <div className="wrap">
          <div className="crumbs reveal">
            <Link to="/">Home</Link> / About Us
          </div>
          <div className="eyebrow reveal">
            <span className="dot" /> OUR STORY
          </div>
          <h1 className="headline reveal reveal-d1" style={{ maxWidth: 760 }}>
            We think financial literacy should feel like a daily habit, not a chore.
          </h1>
          <p className="lead reveal reveal-d2" style={{ maxWidth: 620 }}>
            Financial Market started as a single LinkedIn post explaining compound interest. Three years and
            180+ terms later, it&apos;s a full content studio helping educators publish trustworthy investing
            lessons every single day.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cards-grid cols-4">
            {STATS.map((s, i) => (
              <div className={`lcard reveal reveal-d${i + 1}`} key={s.label}>
                <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--navy)' }}>
                  {s.value}
                </div>
                <h3 style={{ marginTop: 10 }}>{s.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureCards
        kicker="WHAT WE BELIEVE"
        title="The principles behind every lesson"
        cards={[
          {
            icon: ICONS.grid,
            title: 'Clarity over jargon',
            desc: "If a fifteen-year-old can't follow it, we rewrite it. Every term gets the plain-language treatment before it ever gets published.",
          },
          {
            icon: ICONS.shield,
            title: 'Accuracy over speed',
            desc: "Every post moves through our approval queue. We'd rather post a day late than post something wrong.",
          },
          {
            icon: ICONS.calendar,
            title: 'Consistency over virality',
            desc: 'One useful lesson a day, every day, beats one viral post a month. Compounding works on knowledge too.',
          },
        ]}
      />

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="kicker">
              <span className="dot" /> THE TEAM
            </span>
            <h2 className="sec-title">Small team, daily output</h2>
            <p>A tight editorial and product team keeps every lesson accurate, on-brand, and on time.</p>
          </div>
          <div className="cards-grid">
            {TEAM.map((t, i) => (
              <div className={`lcard reveal reveal-d${i + 1}`} key={t.name} style={{ textAlign: 'center' }}>
                <div
                  className="avatar mono"
                  style={{ width: 64, height: 64, fontSize: 18, margin: '0 auto 16px', background: t.bg }}
                >
                  {t.initials}
                </div>
                <h3>{t.name}</h3>
                <p>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBannerSection
        title="Want to build a studio like this?"
        lead="See how the platform behind Financial Market can run your brand's content too."
        ctaLabel="Explore the Platform →"
        to="/product/dashboard"
      />
    </MarketingPage>
  )
}

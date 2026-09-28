import MarketingPage from './MarketingPage'
import { FeatureCards, CtaBannerSection } from './pieces'
import { ICONS } from './icons'

const STATS = [
  { value: '8', label: 'Platforms to publish on' },
  { value: '6', label: 'Languages for AI drafts' },
  { value: '3', label: 'Team notification channels' },
  { value: '100%', label: 'Posts reviewed before going live' },
]

const TEAM = [
  { initials: 'AM', bg: 'var(--navy)', name: 'Alex Martinez', role: 'Founder & Product Lead' },
  { initials: 'AV', bg: 'var(--blue-dark)', name: 'Alex V.', role: 'Customer Success' },
  { initials: 'EN', bg: 'var(--orange-deep)', name: 'Engineering Team', role: 'AI & Integrations' },
]

export default function AboutPage() {
  return (
    <MarketingPage active="about">
      <section className="page-banner">
        <div className="wrap banner-center">
          <div className="eyebrow reveal">
            OUR STORY
          </div>
          <h1 className="headline reveal reveal-d1" style={{ maxWidth: 1000, fontSize: 'clamp(30px, 3.6vw, 46px)' }}>
            We think consistent publishing should feel effortless, not like a second job.
          </h1>
          <p className="lead reveal reveal-d2" style={{ maxWidth: 980 }}>
            Financial Market started as a simple fix for missed posts. Today it&apos;s a full content studio where
            AI drafts, your team approves, and every post publishes itself across LinkedIn, Instagram, Facebook,
            X and your blog, right on schedule.
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
        title="The principles behind every post"
        cards={[
          {
            icon: ICONS.grid,
            title: 'Simple over complicated',
            desc: 'If a feature needs a manual, we rethink it. Planning, drafting and scheduling should feel obvious from the first click.',
          },
          {
            icon: ICONS.shield,
            title: 'Accuracy over speed',
            desc: "Every post moves through our approval queue. We'd rather post a day late than post something wrong.",
          },
          {
            icon: ICONS.calendar,
            title: 'Consistency over virality',
            desc: 'One useful post a day, every day, beats one viral post a month. Consistency is what grows an audience.',
          },
        ]}
      />

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="kicker">
              THE TEAM
            </span>
            <h2 className="sec-title">Small team, daily output</h2>
            <p>A tight product and support team keeps the platform fast, reliable and easy to use.</p>
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
        lead="See how Financial Market can plan, draft and publish your brand's content too."
        ctaLabel="Explore the Platform"
        to="/product/dashboard"
      />
    </MarketingPage>
  )
}

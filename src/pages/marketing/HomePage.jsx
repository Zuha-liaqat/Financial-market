import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingPage from './MarketingPage'
import { MockCard } from './pieces'
import { MODULES, moduleIcon } from './navData'
import { ICONS } from './icons'

const STEPS = [
  {
    tag: 'Plan',
    title: 'See the whole month before you write a word',
    desc: 'Drop every topic into the Planner, group related lessons into campaigns, and spot gaps weeks in advance — no more scrambling for tomorrow’s post.',
    icon: ICONS.star,
    accent: 'var(--blue)',
  },
  {
    tag: 'Create & Review',
    title: 'Draft fast, publish with total confidence',
    desc: 'Write in Create Post or Create Blog with your brand kit applied automatically, then route every draft through the Approval Queue so nothing goes out unchecked.',
    icon: ICONS.shield,
    accent: 'var(--orange-deep)',
  },
  {
    tag: 'Publish',
    title: 'It lands exactly where it belongs',
    desc: 'Approved content drops straight onto the Calendar and goes live on LinkedIn, Instagram and X — with results flowing back to your Dashboard automatically.',
    icon: ICONS.send,
    accent: 'var(--navy)',
  },
]

const TESTIMONIAL_COLUMNS = [
  {
    duration: 34,
    quotes: [
      { text: '"I finally understand what dividend yield actually means for my own portfolio."', initials: 'RA', name: 'Raluca A.', role: 'Learner since 2024', bg: 'var(--blue-dark)' },
      { text: '"Five minutes on my lunch break taught me more than a semester of lectures."', initials: 'MD', name: 'Mihai D.', role: 'Portfolio Clinic', bg: 'var(--orange-deep)' },
      { text: '"The daily term posts are the only finance content I never skip."', initials: 'SI', name: 'Sorina I.', role: 'Learner since 2023', bg: 'var(--navy)' },
      { text: '"Our approval queue caught a factual error before it ever went live."', initials: 'AV', name: 'Alex V.', role: 'Content Reviewer', bg: 'var(--blue-dark)' },
    ],
  },
  {
    duration: 28,
    reverse: true,
    quotes: [
      { text: '"Planning a whole campaign on one board changed how our small team works."', initials: 'DP', name: 'Diana P.', role: 'Editorial Lead', bg: 'var(--orange-deep)' },
      { text: "\"Drafting for three platforms used to take an hour. Now it's minutes.\"", initials: 'AM', name: 'Andrei M.', role: 'Writer', bg: 'var(--navy)' },
      { text: '"The calendar view alone is worth it — I can see gaps before they happen."', initials: 'CT', name: 'Cristina T.', role: 'Planner', bg: 'var(--blue-dark)' },
      { text: '"Our engagement on LinkedIn nearly tripled once posting got consistent."', initials: 'VS', name: 'Vlad S.', role: 'Growth Lead', bg: 'var(--orange-deep)' },
    ],
  },
  {
    duration: 38,
    quotes: [
      { text: '"Notifications are tuned just right — I never feel overwhelmed."', initials: 'IR', name: 'Ioana R.', role: 'Reviewer', bg: 'var(--navy)' },
      { text: "\"Integrations meant we didn't have to change how our team already works.\"", initials: 'BC', name: 'Bogdan C.', role: 'Ops Lead', bg: 'var(--blue-dark)' },
      { text: '"Library search alone saved us from redoing graphics twice."', initials: 'EF', name: 'Elena F.', role: 'Designer', bg: 'var(--orange-deep)' },
      { text: '"It replaced three separate scheduling tools we were paying for."', initials: 'RN', name: 'Radu N.', role: 'Founder', bg: 'var(--navy)' },
    ],
  },
]

function Counter({ target, suffix = '', decimals = 0 }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done.current) {
            done.current = true
            const duration = 1200
            let start = null
            function step(ts) {
              if (!start) start = ts
              const p = Math.min((ts - start) / duration, 1)
              setValue(target * p)
              if (p < 1) requestAnimationFrame(step)
              else setValue(target)
            }
            requestAnimationFrame(step)
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return (
    <div ref={ref} className="num mono">
      {value.toFixed(decimals)}
      {suffix}
    </div>
  )
}

export default function HomePage() {
  return (
    <MarketingPage active="home">
      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow reveal">
              <span className="dot" /> TERM OF THE DAY — DIVIDEND YIELD
            </div>
            <h1 className="headline reveal reveal-d1">
              The content studio for financial educators who publish <em>daily</em>.
            </h1>
            <p className="lead reveal reveal-d2">
              Plan a lesson, draft it for every platform, route it through review, and watch it go out on
              schedule — LinkedIn, Instagram and X, from one dashboard.
            </p>
            <div className="hero-ctas reveal reveal-d3">
              <Link to="/pricing" className="btn btn-primary">
                Start Free Trial →
              </Link>
              <Link to="/about" className="btn btn-ghost">
                Our Story
              </Link>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 26 }} className="reveal reveal-d3">
              Free to start · No credit card required
            </div>
            <div className="stats-row reveal reveal-d4">
              <div className="stat">
                <Counter target={42} suffix="K+" />
                <div className="lbl">Students taught</div>
              </div>
              <div className="stat">
                <Counter target={180} suffix="+" />
                <div className="lbl">Terms explained</div>
              </div>
              <div className="stat">
                <Counter target={4.9} decimals={1} suffix="/5" />
                <div className="lbl">Learner rating</div>
              </div>
            </div>
          </div>

          <div className="reveal reveal-d2" style={{ position: 'relative' }}>
            <MockCard title="Dashboard — Overview">
              <img
                src="/product-screenshots/dashboard.png"
                alt="Dashboard — Overview"
                style={{ borderRadius: 10, border: '1px solid var(--line)', width: '100%' }}
              />
            </MockCard>
          </div>
        </div>
      </section>

      {/* Logo marquee */}
      <section style={{ paddingTop: 36, paddingBottom: 36 }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="mono reveal" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 20 }}>
            TRUSTED BY EDUCATORS PUBLISHING ON
          </div>
          <div className="logo-marquee-band reveal">
            <div className="logo-marquee-track">
              {[...Array(2)].flatMap((_, dup) => [
                <div className="logo-chip" key={`li-${dup}`}>
                  <span className="lc-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 2 1.98 2h.02C6.1 7.48 7 6.6 7 5.48 7 4.38 6.1 3.5 4.98 3.5zM3.5 8.75h3v11.75h-3zM9.5 8.75h2.9v1.6h.04c.4-.76 1.4-1.6 2.9-1.6 3.1 0 3.66 2 3.66 4.6v6.65h-3v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v6h-3z" />
                    </svg>
                  </span>
                  LinkedIn
                </div>,
                <div className="logo-chip" key={`ig-${dup}`}>
                  <span className="lc-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </span>
                  Instagram
                </div>,
                <div className="logo-chip" key={`x-${dup}`}>
                  <span className="lc-ico">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#111820">
                      <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.6l-5.2-6.8L5.4 22H2.3l8.1-9.3L1.4 2h6.9l4.7 6.2L18.9 2z" />
                    </svg>
                  </span>
                  X / Twitter
                </div>,
                <div className="logo-chip" key={`id-${dup}`}>
                  <span className="lc-ico">📰</span>
                  Investing Daily
                </div>,
                <div className="logo-chip" key={`bvb-${dup}`}>
                  <span className="lc-ico">📊</span>
                  BVB Markets
                </div>,
                <div className="logo-chip" key={`ia-${dup}`}>
                  <span className="lc-ico">🎓</span>
                  Investment Academy
                </div>,
              ])}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="kicker">
              <span className="dot" /> HOW IT WORKS
            </span>
            <h2 className="sec-title">From idea to published post, in three steps</h2>
            <p>Every lesson moves through the same reliable pipeline — no matter who&apos;s writing it.</p>
          </div>
          <div className="proc-row">
            {STEPS.map((s, i) => (
              <div className={`proc-card reveal reveal-d${i + 1}`} key={s.title} style={{ '--step-accent': s.accent }}>
                <div className="pbadge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                    {s.icon}
                  </svg>
                </div>
                <div className="ptag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="kicker">
              <span className="dot" /> THE PLATFORM
            </span>
            <h2 className="sec-title">Every module your content team needs</h2>
            <p>From the first draft to the published post — explore every part of the studio.</p>
          </div>
          <div className="cards-grid cols-4">
            {MODULES.map((m) => (
              <Link to={`/product/${m.slug}`} className="lcard reveal" key={m.slug}>
                <div className="licon" style={{ background: `color-mix(in srgb, ${m.color} 14%, white)` }}>
                  {moduleIcon(m.icon, m.color)}
                </div>
                <h3 style={{ fontSize: 16 }}>{m.title}</h3>
                <p>{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section>
        <div className="wrap">
          <div className="panel-dark">
            <div className="sec-head left reveal">
              <span className="kicker">
                <span className="dot" /> COMMUNITY
              </span>
              <h2 className="sec-title">Learn where you already are</h2>
              <p>The same daily lessons, tailored to how each platform is actually used.</p>
            </div>
            <div className="plat-grid">
              <div className="pcard reveal reveal-d1" style={{ '--pc-accent': '#3D86D8' }}>
                <div className="prow">
                  <div className="pico" style={{ background: '#3D86D8' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                      <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 2 1.98 2h.02C6.1 7.48 7 6.6 7 5.48 7 4.38 6.1 3.5 4.98 3.5zM3.5 8.75h3v11.75h-3zM9.5 8.75h2.9v1.6h.04c.4-.76 1.4-1.6 2.9-1.6 3.1 0 3.66 2 3.66 4.6v6.65h-3v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v6h-3z" />
                    </svg>
                  </div>
                  <h4>LinkedIn</h4>
                </div>
                <div className="pstats">
                  <div>
                    <div className="n">9.2k</div>
                    <div className="l">Followers</div>
                  </div>
                  <div>
                    <div className="n">312</div>
                    <div className="l">Avg. reactions</div>
                  </div>
                </div>
              </div>
              <div className="pcard reveal reveal-d2" style={{ '--pc-accent': '#E4405F' }}>
                <div className="prow">
                  <div className="pico" style={{ background: 'linear-gradient(135deg,#F5A623,#E4405F,#7B4FE0)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" />
                    </svg>
                  </div>
                  <h4>Instagram</h4>
                </div>
                <div className="pstats">
                  <div>
                    <div className="n">6.4k</div>
                    <div className="l">Followers</div>
                  </div>
                  <div>
                    <div className="n">18%</div>
                    <div className="l">Save rate</div>
                  </div>
                </div>
              </div>
              <div className="pcard reveal reveal-d3" style={{ '--pc-accent': '#F3F6FA' }}>
                <div className="prow">
                  <div className="pico" style={{ background: '#111820' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                      <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.6l-5.2-6.8L5.4 22H2.3l8.1-9.3L1.4 2h6.9l4.7 6.2L18.9 2zm-1.2 18h1.7L7.4 4H5.6l12.1 16z" />
                    </svg>
                  </div>
                  <h4>X / Twitter</h4>
                </div>
                <div className="pstats">
                  <div>
                    <div className="n">4.1k</div>
                    <div className="l">Followers</div>
                  </div>
                  <div>
                    <div className="n">28</div>
                    <div className="l">Avg. reposts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="kicker">
              <span className="dot" /> WALL OF LOVE
            </span>
            <h2 className="sec-title">Loved by learners and writers alike</h2>
            <p>A few of the notes we get from people using Financial Market every day.</p>
          </div>
          <div className="wall-wrap reveal">
            {TESTIMONIAL_COLUMNS.map((col, ci) => (
              <div className={`wall-col${col.reverse ? ' up' : ''}`} style={{ animationDuration: `${col.duration}s` }} key={ci}>
                {[...col.quotes, ...col.quotes].map((q, qi) => (
                  <div className="wcard" key={`${q.name}-${qi}`}>
                    {q.text}
                    <div className="wperson">
                      <div className="avatar" style={{ background: q.bg }}>
                        {q.initials}
                      </div>
                      <div>
                        <strong>{q.name}</strong>
                        <span>{q.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="wrap">
          <div className="cta-banner reveal">
            <h2>Your first lesson is on us.</h2>
            <p>Enter your email and get tomorrow&apos;s term of the day before anyone else does.</p>
            <form
              className="cta-input-row"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <input type="email" placeholder="you@company.com" />
              <Link to="/pricing" className="btn btn-orange">
                Get Started →
              </Link>
            </form>
          </div>
        </div>
      </section>
    </MarketingPage>
  )
}

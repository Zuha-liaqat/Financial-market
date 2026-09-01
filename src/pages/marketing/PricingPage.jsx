import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Feather, Rocket, Crown, Gem, Check } from 'lucide-react'
import MarketingPage from './MarketingPage'
import { CtaBannerSection } from './pieces'
import { subscriptionPlans } from '../../data/subscriptionPlans'

const PLAN_META = {
  Free: { to: '/login' },
  Pro: { to: '/login' },
  Plus: { to: '/login' },
  'Top Tier': { to: '/login' },
}

const planTheme = {
  Free: {
    icon: Feather,
    iconWrap: 'bg-neutral-100 text-neutral-500',
    glow: '',
    badge: null,
    button: 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50',
    card: 'border-neutral-200',
    checkBg: 'bg-neutral-100 text-neutral-500',
  },
  Pro: {
    icon: Rocket,
    iconWrap: 'bg-brand-100 text-brand-600',
    glow: 'hover:shadow-brand-500/10',
    badge: null,
    button: 'border border-brand-200 text-brand-600 hover:bg-brand-50',
    card: 'border-neutral-200',
    checkBg: 'bg-brand-100 text-brand-600',
  },
  Plus: {
    icon: Crown,
    iconWrap: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30',
    glow: 'hover:shadow-violet-500/20',
    badge: { label: '★ MOST POPULAR', className: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' },
    button: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:brightness-110',
    card: 'border-violet-300 ring-2 ring-violet-500/20 scale-[1.03] shadow-lg shadow-violet-500/10',
    checkBg: 'bg-violet-100 text-violet-600',
  },
  'Top Tier': {
    icon: Gem,
    iconWrap: 'bg-neutral-900 text-white',
    glow: 'hover:shadow-neutral-900/10',
    badge: { label: 'PREMIUM', className: 'bg-neutral-900 text-white' },
    button: 'border border-neutral-300 text-neutral-800 hover:bg-neutral-900 hover:text-white',
    card: 'border-neutral-200',
    checkBg: 'bg-neutral-100 text-neutral-700',
  },
}

const FAQS = [
  {
    q: 'Can I change plans later?',
    a: 'Yes — upgrade or downgrade anytime, and billing adjusts automatically from your next cycle.',
  },
  {
    q: 'Is there a free trial on paid plans?',
    a: 'Every paid plan starts with a 14-day free trial — no card required to begin.',
  },
  {
    q: 'What platforms are supported?',
    a: 'LinkedIn, Instagram and X today, with more integrations added regularly.',
  },
  {
    q: 'Do you offer education discounts?',
    a: "Yes — reach out on the Contact page and we'll set up a plan that fits.",
  },
  {
    q: 'What happens to my content if I cancel?',
    a: 'You can export your entire Library and post history at any time, even after cancelling.',
  },
]

export default function PricingPage() {
  const [openIdx, setOpenIdx] = useState(null)
  const [cycle, setCycle] = useState('monthly')
  const isYearly = cycle === 'yearly'

  return (
    <MarketingPage active="pricing">
      <section className="page-banner">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="dot" /> SUBSCRIPTIONS
          </div>
          <h1 className="headline reveal reveal-d1" style={{ maxWidth: 700, margin: '0 auto 16px' }}>
            Simple pricing, for every stage of your content studio.
          </h1>
          <p className="lead reveal reveal-d2" style={{ maxWidth: 560, margin: '0 auto' }}>
            Start free. Upgrade when your team — or your publishing schedule — grows.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 12 }}>
        <div className="wrap">
          <div className="reveal mt-7 flex justify-center" style={{ marginBottom: 40 }}>
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  !isYearly ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle('yearly')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  isYearly ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Yearly
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
            {subscriptionPlans.map((plan, i) => {
              const meta = PLAN_META[plan.name] || {}
              const theme = planTheme[plan.name]
              const Icon = theme.icon
              const yearlyMonthlyEquivalent = plan.yearlyPrice === 0 ? 0 : Math.round(plan.yearlyPrice / 12)
              const displayPrice = isYearly ? yearlyMonthlyEquivalent : plan.price

              return (
                <div
                  key={plan.id}
                  className={`reveal reveal-d${i + 1} group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.card} ${theme.glow}`}
                >
                  {theme.badge && (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold tracking-wide shadow-sm ${theme.badge.className}`}
                    >
                      {theme.badge.label}
                    </span>
                  )}

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110 group-hover:rotate-3 ${theme.iconWrap}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>

                  <p className="mt-4 text-lg font-bold text-black">{plan.name}</p>

                  <div className="mt-1">
                    <p className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight text-black">
                        {displayPrice === 0 ? '$0' : `$${displayPrice}`}
                      </span>
                      <span className="text-xs font-medium text-neutral-400">/month</span>
                    </p>
                    {isYearly && plan.price > 0 && (
                      <p className="mt-1 text-xs text-neutral-400">Billed ${plan.yearlyPrice} annually</p>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-neutral-500">{plan.description}</p>

                  <ul className="mt-5 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-700">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${theme.checkBg}`}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={meta.to || '/login'}
                    className={`mt-6 flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition active:scale-95 ${theme.button}`}
                  >
                    Get Started
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="kicker">
              <span className="dot" /> FAQ
            </span>
            <h2 className="sec-title">Questions, answered</h2>
          </div>
          <div className="faq-list reveal">
            {FAQS.map((f, i) => {
              const open = openIdx === i
              return (
                <div className={`faq-item${open ? ' open' : ''}`} key={f.q}>
                  <div className="faq-q" onClick={() => setOpenIdx(open ? null : i)}>
                    <span>{f.q}</span>
                    <span className="plus" />
                  </div>
                  <div className="faq-a" style={{ maxHeight: open ? 200 : 0 }}>
                    <p>{f.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <CtaBannerSection
        title="Start publishing with confidence."
        lead="No credit card required for the Free plan."
        ctaLabel="Get Started Free →"
        to="/login"
      />
    </MarketingPage>
  )
}

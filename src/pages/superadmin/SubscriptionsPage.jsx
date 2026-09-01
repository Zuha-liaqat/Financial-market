import { useState } from 'react'
import { Feather, Rocket, Crown, Gem, Check } from 'lucide-react'
import { subscriptionPlans } from '../../data/subscriptionPlans'

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

export default function SubscriptionsPage() {
  const [cycle, setCycle] = useState('monthly')
  const isYearly = cycle === 'yearly'

  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-500">
          Simple, transparent pricing that scales with your business. Cancel anytime.
        </p>
      </div>

      <div className="mt-7 flex justify-center">
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

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
        {subscriptionPlans.map((plan) => {
          const theme = planTheme[plan.name]
          const Icon = theme.icon
          const yearlyMonthlyEquivalent = plan.yearlyPrice === 0 ? 0 : Math.round(plan.yearlyPrice / 12)
          const displayPrice = isYearly ? yearlyMonthlyEquivalent : plan.price
          const popular = plan.name === 'Plus'

          return (
            <div
              key={plan.id}
              className={`group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.card} ${theme.glow}`}
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

              <button
                type="button"
                className={`mt-6 flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition active:scale-95 ${theme.button}`}
              >
                {popular ? 'Get Started' : 'Get Started'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

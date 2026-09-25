// Fallback shown on the public pricing page when the plans API can't be
// reached. The live values come from /api/subscriptions/plans.
export const defaultSubscriptionPlans = [
  {
    id: 'free',
    code: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'For solo creators just getting started.',
    features: [
      'Generate 5 posts per month',
      'Up to 1 business',
      'System notifications',
      'Post approval queue',
      'Calendars view',
      'Social media pages Integration',
      'Post Mobile/Web view',
    ],
  },
  {
    id: 'pro',
    code: 'pro',
    name: 'Pro',
    price: 49,
    yearlyPrice: 470,
    description: 'For growing teams managing a couple of brands.',
    features: [
      'Generate 100 posts per month',
      'Up to 2 businesses',
      'System notifications',
      'Whatsapp/Slack/Teams/Email notifications',
      'Weekly/Monthly Planner',
      'Post approval queue',
      'Calendars view',
      'Social media pages Integration',
      'Post Mobile/Web view',
    ],
  },
  {
    id: 'plus',
    code: 'plus',
    badge: '★ MOST POPULAR',
    name: 'Plus',
    price: 99,
    yearlyPrice: 950,
    description: 'For agencies managing multiple clients.',
    features: [
      'Generate 200 posts per month',
      'Up to 5 businesses',
      'System notifications',
      'Whatsapp/Slack/Teams/Email notifications',
      'Weekly/Monthly Planner',
      'Post approval queue',
      'Calendars view',
      'Social media pages Integration',
      'Post Mobile/Web view',
    ],
  },
  {
    id: 'top_tier',
    code: 'top_tier',
    badge: 'PREMIUM',
    name: 'Top Tier',
    price: 299,
    yearlyPrice: 2870,
    description: 'For large teams that need maximum scale.',
    features: [
      'Generate unlimited posts per month',
      'Up to the maximum number of businesses',
      'System notifications',
      'Whatsapp/Slack/Teams/Email notifications',
      'Weekly/Monthly Planner',
      'Post approval queue',
      'Calendars view',
      'Social media pages Integration',
      'Post Mobile/Web view',
    ],
  },
]

// Stripe fills in {CHECKOUT_SESSION_ID} on the success URL. The id from the
// checkout response is also kept as a fallback in case it isn't filled in.
export const STRIPE_SESSION_PLACEHOLDER = '{CHECKOUT_SESSION_ID}'
const PENDING_SESSION_KEY = 'pending_checkout_session_id'

export function rememberCheckoutSession(sessionId) {
  try {
    if (sessionId) sessionStorage.setItem(PENDING_SESSION_KEY, sessionId)
  } catch {
    // storage unavailable — the success URL still carries the id
  }
}

// Returns the session id to verify (URL value first, then the stored one) and clears the stored one.
export function takeCheckoutSession(fromUrl) {
  let stored = null
  try {
    stored = sessionStorage.getItem(PENDING_SESSION_KEY)
    sessionStorage.removeItem(PENDING_SESSION_KEY)
  } catch {
    // ignore
  }
  if (fromUrl && fromUrl !== STRIPE_SESSION_PLACEHOLDER) return fromUrl
  return stored
}

// Converts a plan from the subscriptions API into the shape the plan cards use.
export function normalizePlan(plan) {
  return {
    id: plan.id ?? plan.code,
    code: plan.code,
    name: plan.name,
    description: plan.tagline || '',
    badge: plan.badge || '',
    price: plan.monthly_price ?? 0,
    yearlyPrice: plan.yearly_price ?? 0,
    yearlyPricePerMonth: plan.yearly_price_per_month ?? 0,
    currency: plan.currency || 'usd',
    postsPerMonth: plan.posts_per_month ?? 0,
    businesses: plan.businesses ?? 0,
    features: plan.features || [],
    isCurrent: Boolean(plan.is_current),
    isActive: plan.is_active ?? true,
  }
}

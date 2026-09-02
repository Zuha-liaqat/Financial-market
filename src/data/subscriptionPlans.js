import { getCurrentUserEmail } from './auth'

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    billingCycle: 'month',
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
    name: 'Pro',
    price: 49,
    yearlyPrice: 470,
    billingCycle: 'month',
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
    name: 'Plus',
    price: 99,
    yearlyPrice: 950,
    billingCycle: 'month',
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
    id: 'top-tier',
    name: 'Top Tier',
    price: 299,
    yearlyPrice: 2870,
    billingCycle: 'month',
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

export function getPlanByName(name) {
  return subscriptionPlans.find((p) => p.name === name)
}

const ACTIVE_PLAN_KEY_PREFIX = 'active_subscription_plan_id'

function getActivePlanKey() {
  const email = getCurrentUserEmail()
  return email ? `${ACTIVE_PLAN_KEY_PREFIX}:${email}` : null
}

export function getActivePlanId() {
  const key = getActivePlanKey()
  return key ? localStorage.getItem(key) : null
}

export function setActivePlanId(id) {
  const key = getActivePlanKey()
  if (key) localStorage.setItem(key, id)
}

const FAILED_PLAN_STATUSES = new Set(['failed', 'cancelled', 'canceled', 'expired'])

// Reads the plan info returned by /api/v1/auth/me and resolves which local
// plan (if any) is actually active. Returns undefined when the backend has
// no plan record at all (caller should fall back to the locally cached
// choice, e.g. the Free plan, which never creates a backend checkout).
// The backend doesn't reliably flip status away from "pending" (no webhook
// confirmation wired up), so any plan record that isn't explicitly
// failed/cancelled/expired is treated as the active plan.
export function resolveActivePlanIdFromUser(user) {
  const plan = user?.plan
  if (!plan) return undefined
  if (FAILED_PLAN_STATUSES.has(String(plan.status).toLowerCase())) return null
  const label = plan.plan_name || plan.product_name || ''
  const matched = subscriptionPlans.find((p) => label.toLowerCase().startsWith(p.name.toLowerCase()))
  return matched?.id || null
}

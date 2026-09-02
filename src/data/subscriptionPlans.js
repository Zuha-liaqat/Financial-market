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

const ACTIVE_PLAN_KEY = 'active_subscription_plan_id'

export function getActivePlanId() {
  return localStorage.getItem(ACTIVE_PLAN_KEY)
}

export function setActivePlanId(id) {
  localStorage.setItem(ACTIVE_PLAN_KEY, id)
}

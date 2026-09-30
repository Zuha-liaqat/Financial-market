import { useEffect, useState } from 'react'
import { apiGetCurrentUser } from './api'
import { defaultSubscriptionPlans, FREE_STARTING_CREDITS } from '../data/subscriptionPlans'

// Monthly credits for each plan code. null means unlimited.
const PLAN_CREDITS = {
  free: FREE_STARTING_CREDITS,
  pro: 2000,
  plus: 4000,
  top_tier: null,
}

function planName(code) {
  return defaultSubscriptionPlans.find((p) => p.code === code)?.name || 'Free'
}

// The signed-in company's plan and credit balance for the create pages.
// The plan comes from the account; credits per plan are fixed here, and usage
// isn't tracked by the API yet, so the balance is shown as full.
export function useCredits() {
  const [planCode, setPlanCode] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiGetCurrentUser()
      .then((me) => !cancelled && setPlanCode(me?.plan?.plan_code || 'free'))
      .catch(() => !cancelled && setPlanCode('free'))
    return () => {
      cancelled = true
    }
  }, [])

  if (!planCode) return { status: 'loading' }

  const code = planCode in PLAN_CREDITS ? planCode : 'free'
  const total = PLAN_CREDITS[code]
  return { status: 'ready', planName: planName(code), total, remaining: total }
}

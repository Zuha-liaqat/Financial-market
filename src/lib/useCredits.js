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
// The plan and referral credits come from the account; credits per plan are fixed
// here, and usage isn't tracked by the API yet, so the balance is shown as full.
export function useCredits() {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiGetCurrentUser()
      .then(
        (me) =>
          !cancelled &&
          setAccount({
            planCode: me?.plan?.plan_code || 'free',
            referralCredits: Number(me?.referral_credits) || 0,
          }),
      )
      .catch(() => !cancelled && setAccount({ planCode: 'free', referralCredits: 0 }))
    return () => {
      cancelled = true
    }
  }, [])

  if (!account) return { status: 'loading' }

  const code = account.planCode in PLAN_CREDITS ? account.planCode : 'free'
  const planCredits = PLAN_CREDITS[code]
  // Referral credits are added on top of the plan's credits; an unlimited plan stays unlimited.
  const total = planCredits === null ? null : planCredits + account.referralCredits
  return {
    status: 'ready',
    planName: planName(code),
    planCredits,
    referralCredits: account.referralCredits,
    total,
    remaining: total,
  }
}

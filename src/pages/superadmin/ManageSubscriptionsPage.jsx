import { useEffect, useState } from 'react'
import { Feather, Rocket, Crown, Gem, Check, Pencil, Plus, Trash2, X, Loader2 } from 'lucide-react'
import { normalizePlan } from '../../data/subscriptionPlans'
import { apiAdminListPlans, apiAdminUpdatePlan } from '../../lib/api'
import { showGlobalToast } from '../../lib/toastBus'

// Keyed by plan name, same as the plan themes on the user-facing pages.
const planIcons = {
  Free: { icon: Feather, wrap: 'bg-neutral-100 text-neutral-500' },
  Pro: { icon: Rocket, wrap: 'bg-brand-100 text-brand-600' },
  Plus: { icon: Crown, wrap: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white' },
  'Top Tier': { icon: Gem, wrap: 'bg-neutral-900 text-white' },
}

function PlanCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-neutral-200" />
      <div className="mt-4 h-5 w-24 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-8 w-28 animate-pulse rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-16 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-neutral-200" />
    </div>
  )
}

// Top Tier has no post/business limits, so those numbers aren't shown or editable.
function hasUsageLimits(plan) {
  return plan.name !== 'Top Tier'
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-black outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20'

function EditPlanModal({ plan, onClose, onSaved }) {
  const [price, setPrice] = useState(String(plan.price))
  const [yearlyPrice, setYearlyPrice] = useState(String(plan.yearlyPrice))
  const [description, setDescription] = useState(plan.description)
  const [badge, setBadge] = useState(plan.badge)
  const [postsPerMonth, setPostsPerMonth] = useState(String(plan.postsPerMonth))
  const [businesses, setBusinesses] = useState(String(plan.businesses))
  const [isActive, setIsActive] = useState(plan.isActive)
  const [features, setFeatures] = useState(plan.features)
  const [newFeature, setNewFeature] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function addFeature() {
    const value = newFeature.trim()
    if (!value) return
    setFeatures((f) => [...f, value])
    setNewFeature('')
  }

  async function handleSave(e) {
    e.preventDefault()
    const monthly = Number(price)
    const yearly = Number(yearlyPrice)
    const posts = Number(postsPerMonth)
    const businessCount = Number(businesses)
    if (price === '' || !Number.isFinite(monthly) || monthly < 0) {
      setError('Monthly price must be 0 or more.')
      return
    }
    if (yearlyPrice === '' || !Number.isFinite(yearly) || yearly < 0) {
      setError('Yearly price must be 0 or more.')
      return
    }
    if (postsPerMonth === '' || !Number.isInteger(posts) || posts < 0) {
      setError('Posts per month must be a whole number, 0 or more.')
      return
    }
    if (businesses === '' || !Number.isInteger(businessCount) || businessCount < 0) {
      setError('Businesses must be a whole number, 0 or more.')
      return
    }
    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean)
    if (cleanFeatures.length === 0) {
      setError('Add at least one feature.')
      return
    }

    setError('')
    setSaving(true)
    try {
      const updated = await apiAdminUpdatePlan(plan.id, {
        monthly_price: monthly,
        yearly_price: yearly,
        description: description.trim(),
        features: cleanFeatures,
        badge: badge.trim(),
        posts_per_month: posts,
        businesses: businessCount,
        is_active: isActive,
      })
      onSaved(normalizePlan(updated))
    } catch (err) {
      setError(err.message || 'Failed to update plan')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSave}
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h3 className="text-base font-semibold text-black">Edit {plan.name} plan</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-600">Monthly price ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-600">Yearly price ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Badge (optional)</span>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. MOST POPULAR"
              className={inputClass}
            />
          </label>

          {hasUsageLimits(plan) && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Posts per month</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={postsPerMonth}
                  onChange={(e) => setPostsPerMonth(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Businesses</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={businesses}
                  onChange={(e) => setBusinesses(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Show this plan to companies
          </label>

          <div>
            <span className="mb-1 block text-xs font-medium text-neutral-600">Features</span>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    value={f}
                    onChange={(e) =>
                      setFeatures((list) => list.map((item, j) => (j === i ? e.target.value : item)))
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setFeatures((list) => list.filter((_, j) => j !== i))}
                    aria-label="Remove feature"
                    className="shrink-0 rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
                placeholder="Add a feature"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addFeature}
                aria-label="Add feature"
                className="shrink-0 rounded-md border border-neutral-200 p-2 text-neutral-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ManageSubscriptionsPage() {
  const [plans, setPlans] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiAdminListPlans()
      .then((data) => {
        if (cancelled) return
        setPlans((data || []).map(normalizePlan))
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Failed to load plans')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleSaved(updated) {
    setPlans((list) => list.map((p) => (p.id === updated.id ? updated : p)))
    setEditing(null)
    showGlobalToast(`${updated.name} plan updated`)
  }

  return (
    <div>
      {status === 'error' && <p className="mt-16 text-center text-sm font-medium text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {status === 'loading' && Array.from({ length: 4 }).map((_, i) => <PlanCardSkeleton key={i} />)}
        {plans.map((plan) => {
          const { icon: Icon, wrap } = planIcons[plan.name] || planIcons.Free
          return (
            <div key={plan.id} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${wrap}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                {plan.isActive === false && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500 ring-1 ring-neutral-200">
                    Hidden
                  </span>
                )}
              </div>

              <p className="mt-4 flex items-center gap-2 text-lg font-bold text-black">
                {plan.name}
                {plan.badge && (
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                    {plan.badge}
                  </span>
                )}
              </p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-black">${plan.price}</span>
                <span className="text-xs font-medium text-neutral-400">/month</span>
              </p>
              <p className="text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">${plan.yearlyPrice}</span> /year
              </p>
              <p className="mt-2 text-xs text-neutral-500">{plan.description}</p>
              {hasUsageLimits(plan) && (
                <p className="mt-2 text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-700">{plan.postsPerMonth}</span> posts/month ·{' '}
                  <span className="font-semibold text-neutral-700">{plan.businesses}</span> businesses
                </p>
              )}

              <ul className="mt-4 flex-1 space-y-2.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-neutral-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setEditing(plan)}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <Pencil className="h-4 w-4" />
                Edit plan
              </button>
            </div>
          )
        })}
      </div>

      {editing && <EditPlanModal plan={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  )
}

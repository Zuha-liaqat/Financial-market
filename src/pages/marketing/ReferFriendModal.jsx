import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Gift, X } from 'lucide-react'
import { apiSendReferral } from '../../lib/api'
import { trackEvent } from '../../lib/analytics'

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#1A4467] focus:ring-2 focus:ring-[#1A4467]/15'

export default function ReferFriendModal({ onClose, location, defaultReferrerEmail = '' }) {
  const [referrerEmail, setReferrerEmail] = useState(defaultReferrerEmail)
  const [friendEmail, setFriendEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const referrer = referrerEmail.trim().toLowerCase()
    const friend = friendEmail.trim().toLowerCase()
    if (referrer === friend) {
      setError("You can't refer your own email address.")
      return
    }
    setSubmitting(true)
    try {
      await apiSendReferral({ referrer_email: referrer, referee_email: friend })
      trackEvent('referral_sent', { cta_location: location })
      setSentTo(friend)
      setFriendEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send invite.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refer-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF4E5] text-[#F2790C]">
          <Gift className="h-5 w-5" />
        </span>
        <h3 id="refer-title" className="mt-4 text-lg font-bold text-[#16181D]">
          Refer a friend, get more credits
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Send your friend an invite. When they sign up, extra credits are added to your account.
        </p>

        {sentTo && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            Invite sent to <strong>{sentTo}</strong>. Want to invite someone else?
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Your email</span>
            <input
              type="email"
              required
              value={referrerEmail}
              onChange={(e) => setReferrerEmail(e.target.value)}
              placeholder="you@company.com"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Friend&apos;s email</span>
            <input
              type="email"
              required
              autoFocus
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@company.com"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              {sentTo ? 'Done' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#1A4467] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#12314C] disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

import { useState } from 'react'

export default function CreateCompanyModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      await onCreate({ name: name.trim(), email: email.trim(), password, isActive: true })
    } catch (err) {
      setError(err.message || 'Failed to create company.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-black">Create Company</h3>
        <p className="mt-1 text-sm text-neutral-500">Add a new company account.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              COMPANY NAME <span className="text-brand-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Media Group"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              EMAIL <span className="text-brand-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@acme.com"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              PASSWORD <span className="text-brand-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">STATUS</label>
            <label className="flex cursor-not-allowed items-center gap-2 text-sm text-neutral-500">
              <input
                type="checkbox"
                checked
                disabled
                readOnly
                className="h-4 w-4 rounded border-neutral-300 accent-brand-500"
              />
              Active
            </label>
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {submitting ? 'Creating…' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

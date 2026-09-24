import { useState } from 'react'

function EyeButton({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Hide client secret' : 'Show client secret'}
      className="shrink-0 text-neutral-400 hover:text-black"
    >
      {show ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      )}
    </button>
  )
}

export default function CredentialsModal({ platform, platformLabel, onClose, onSave }) {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const needsOrgId = platform === 'wordpress' || platform === 'ghost' || platform === 'wix'

  const orgField = platform === 'wordpress'
    ? {
        label: 'WORDPRESS SITE URL',
        placeholder: 'https://yoursite.com',
        hint: 'The site you publish to. Must have Application Passwords enabled (Users → Profile).',
      }
    : platform === 'wix'
      ? {
          label: 'WIX SITE ID',
          placeholder: 'e.g. 82f2b9e1-1a2b-3c4d-9e0f-1234567890ab',
          hint: 'Your Wix site’s SITE ID. Find it in Wix Dashboard under Settings → Site History (the text in parentheses next to the site URL), or in the browser URL once logged in to your Wix site.',
        }
      : {
          label: 'GHOST ADMIN API URL',
          placeholder: 'https://yoursite.ghost.io',
          hint: 'Your site’s Admin API URL, from Settings → Integrations → Custom Integration.',
        }

  const idField = platform === 'wordpress'
    ? { label: 'USERNAME', placeholder: 'your-username', hint: 'A WordPress user with posting rights.' }
    : platform === 'wix'
      ? { label: 'CLIENT ID (ANY)', placeholder: 'e.g. main-site', hint: 'Optional. Any identifier you like — Wix connects with the SITE ID + API Key below.' }
      : { label: 'CLIENT ID', placeholder: '86xxxxxxxxxxxx', hint: 'Paste the Client ID from your developer app.' }

  const secretField = platform === 'wordpress'
    ? { label: 'APPLICATION PASSWORD', placeholder: 'xxxx xxxx xxxx xxxx xxxx xxxx', hint: 'Generate it in WordPress: Users → Profile → Application Passwords.' }
    : platform === 'wix'
      ? { label: 'WIX API KEY', placeholder: 'paste-your-wix-api-key', hint: 'Your Wix site API key. Get it in Wix Dashboard under Settings → Site History → API Key, or via the Wix Dev Center.' }
      : { label: 'CLIENT SECRET', placeholder: '••••••••••••••', hint: 'Paste the Client Secret from your developer app.' }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Please fill in both fields.')
      return
    }

    if (needsOrgId && !organizationId.trim()) {
      setError(`Please fill in the site URL.`)
      return
    }

    setSubmitting(true)
    try {
      await onSave({
        platform,
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        organization_id: needsOrgId ? organizationId.trim() : '',
      })
    } catch (err) {
      setError(err.message || 'Failed to save credentials.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-black">Configure {platformLabel}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {needsOrgId ? `Enter your ${platformLabel} site details below to connect it.` : `Paste the Client ID and Client Secret from your ${platformLabel} developer app.`}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">PLATFORM</label>
            <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm capitalize text-neutral-500">
              {platform}
            </div>
          </div>

          {needsOrgId && (
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
                {orgField.label} <span className="text-brand-500">*</span>
              </label>
              <input
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder={orgField.placeholder}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-neutral-400">{orgField.hint}</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              {idField.label} <span className="text-brand-500">*</span>
            </label>
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder={idField.placeholder}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
            {idField.hint && <p className="mt-1 text-xs text-neutral-400">{idField.hint}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              {secretField.label} <span className="text-brand-500">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
              <input
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={secretField.placeholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              <EyeButton show={showSecret} onClick={() => setShowSecret((v) => !v)} />
            </div>
            {secretField.hint && <p className="mt-1 text-xs text-neutral-400">{secretField.hint}</p>}
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              data-track-label={`Integrations - Cancel Configure ${platformLabel}`}
              className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-track-label={`Integrations - Save ${platformLabel} Credentials`}
              className="flex items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {submitting ? 'Saving…' : 'Save & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

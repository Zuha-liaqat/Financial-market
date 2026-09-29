import { useState } from 'react'

// Random hex string the website uses to verify that incoming posts really come from us.
function generateSecret() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return 'whsec_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

const SAMPLE_PAYLOAD = `{
  "event": "blog.published",
  "title": "Your blog title",
  "slug": "your-blog-title",
  "content_html": "<p>Full blog content…</p>",
  "cover_image": "https://…/cover.jpg",
  "tags": ["marketing", "ai"],
  "published_at": "2026-09-29T10:00:00Z"
}`

export default function WebsiteConnectModal({ onClose, onSave }) {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [secret, setSecret] = useState(generateSecret)
  const [copied, setCopied] = useState(false)
  const [showPayload, setShowPayload] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy. Please select the secret and copy it manually.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    let url
    try {
      url = new URL(webhookUrl.trim())
    } catch {
      setError('Please enter a valid URL, e.g. https://yourwebsite.com/api/blog-webhook')
      return
    }
    if (url.protocol !== 'https:') {
      setError('The webhook URL must start with https://')
      return
    }

    setSubmitting(true)
    try {
      await onSave({ platform: 'website', client_id: url.toString(), client_secret: secret })
    } catch (err) {
      setError(err.message || 'Failed to connect website.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-black">Connect your website</h3>
        <p className="mt-1 text-sm text-neutral-500">
          When a blog targeted at &quot;Website&quot; is approved, we send it to this URL at its scheduled time. Your
          website saves it and makes it live.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              WEBHOOK URL <span className="text-brand-500">*</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yourwebsite.com/api/blog-webhook"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">SIGNING SECRET</label>
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
              <code className="min-w-0 flex-1 truncate text-xs text-neutral-700">{secret}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => setSecret(generateSecret())}
                className="shrink-0 text-xs font-semibold text-neutral-500 hover:text-black hover:underline"
              >
                Regenerate
              </button>
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Give this to your developer. Every request carries it, so your website can reject anything that
              isn&apos;t from us.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => setShowPayload((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-600"
            >
              What your website will receive
              <span className="text-neutral-400">{showPayload ? '−' : '+'}</span>
            </button>
            {showPayload && (
              <pre className="overflow-x-auto border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-700">
                {SAMPLE_PAYLOAD}
              </pre>
            )}
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              data-track-label="Integrations - Cancel Connect Website"
              className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-track-label="Integrations - Save Website Webhook"
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

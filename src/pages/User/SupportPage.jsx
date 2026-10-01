import { useEffect, useState } from 'react'
import { CheckCircle2, LifeBuoy, Mail, MessageSquare, Send } from 'lucide-react'
import { apiSubmitSupportRequest } from '../../lib/api'
import { useCurrentUser } from '../../lib/useCurrentUser'
import { ErrorToast } from '../../components/Toast'

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20'
const labelClass = 'mb-1 block text-xs font-semibold tracking-wide text-neutral-500 uppercase'

const HELP = [
  {
    icon: MessageSquare,
    title: 'Live chat',
    desc: 'For something quick, use the Support button at the bottom right of any page.',
  },
  {
    icon: Mail,
    title: 'Reply by email',
    desc: 'We answer on the address you put below, usually within one business day.',
  },
]

export default function SupportPage() {
  const { user, userName, companyName } = useCurrentUser()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Prefill from the signed-in account, but leave it editable so a reply can be
  // asked for on a different address. Once they start typing, stop overwriting.
  useEffect(() => {
    if (touched || !user) return
    setForm((current) => ({
      ...current,
      name: current.name || userName || companyName || '',
      email: current.email || user.email || '',
    }))
  }, [user, userName, companyName, touched])

  const update = (field) => (event) => {
    setTouched(true)
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    try {
      await apiSubmitSupportRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      })
      setSent(true)
      setForm((current) => ({ ...current, message: '' }))
    } catch (err) {
      setError(err.message || 'Failed to send your message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <LifeBuoy className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
          Support
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tell us what you need help with and our team will get back to you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {HELP.map((item) => (
            <div key={item.title} className="rounded-lg border border-neutral-200 bg-white p-4">
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                <item.icon className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
              </span>
              <h3 className="text-sm font-semibold text-neutral-800">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" strokeWidth={1.75} />
              </span>
              <h3 className="text-sm font-semibold text-neutral-800">Message sent</h3>
              <p className="mt-1 max-w-xs text-xs text-neutral-500">
                We have it. You&apos;ll get a reply on {form.email || 'your email'}.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 rounded-md px-4 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
                data-track-label="Support - Send Another"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelClass} htmlFor="support-name">
                  Full name <span className="text-brand-500">*</span>
                </label>
                <input
                  id="support-name"
                  required
                  maxLength={255}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Alex Martinez"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="support-email">
                  Email <span className="text-brand-500">*</span>
                </label>
                <input
                  id="support-email"
                  required
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="support-message">
                  What can we help with? <span className="text-brand-500">*</span>
                </label>
                <textarea
                  id="support-message"
                  required
                  rows={6}
                  maxLength={5000}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="Tell us what happened and what you expected instead..."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-right text-[10px] text-neutral-400">{form.message.length}/5000</p>
              </div>

              <button
                type="submit"
                disabled={sending || !form.name.trim() || !form.email.trim() || !form.message.trim()}
                className="flex items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                data-track-label="Support - Send Message Form"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>

      {error && <ErrorToast message={error} onClose={() => setError('')} />}
    </div>
  )
}

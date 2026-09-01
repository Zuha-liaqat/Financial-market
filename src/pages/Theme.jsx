import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { addNotification } from '../data/notifications'

const toneOptions = ['Professional', 'Casual', 'Enthusiastic', 'Informative', 'Humorous']

const visualStyles = [
  {
    key: 'minimalist',
    label: 'Minimalist',
    description: 'Clean layouts, generous whitespace, quiet color.',
    preview: (
      <div className="relative flex h-full w-full items-center justify-center bg-neutral-50">
        <div className="w-3/4 space-y-1.5 rounded-md bg-white p-3 shadow-sm ring-1 ring-neutral-200">
          <div className="h-1.5 w-2/3 rounded-full bg-neutral-800" />
          <div className="h-1 w-full rounded-full bg-neutral-200" />
          <div className="h-1 w-4/5 rounded-full bg-neutral-200" />
          <div className="mt-1.5 flex gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-400" />
            <span className="h-2 w-2 rounded-full bg-neutral-300" />
            <span className="h-2 w-2 rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'bold',
    label: 'Bold',
    description: 'Punchy gradients and confident, high-contrast type.',
    preview: (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-400 via-fuchsia-500 to-violet-600">
        <div className="absolute -right-4 -top-6 h-20 w-20 rotate-12 rounded-2xl bg-white/15" />
        <div className="absolute -bottom-6 -left-4 h-16 w-16 -rotate-12 rounded-full bg-white/15" />
        <p className="relative text-lg font-black italic tracking-tight text-white">BOLD</p>
      </div>
    ),
  },
  {
    key: 'futuristic',
    label: 'Futuristic',
    description: 'Dark, glowing, technical — built for robotics content.',
    preview: (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#020617] via-[#0c1526] to-brand-900">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(76,202,225,0.7) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent" />
        <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-brand-400/70" />
        <span className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-brand-400/70" />
        <span className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-brand-400/70" />
        <span className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-brand-400/70" />
        <div className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-brand-400/30 blur-md" />
          <span className="absolute inset-2 rounded-full border border-brand-300/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-300 shadow-[0_0_10px_3px_rgba(76,202,225,0.9)]" />
        </div>
      </div>
    ),
  },
]

function SectionCard({ icon, chip, title, children }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${chip}`}>
          {icon}
        </span>
        <h3 className="text-sm font-bold tracking-wide text-neutral-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20'

export default function ThemesPage() {
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [brandTone, setBrandTone] = useState('Professional')
  const [targetAudience, setTargetAudience] = useState('')
  const [visualStyle, setVisualStyle] = useState('minimalist')
  const [saving, setSaving] = useState(false)

  function handleSave(complete) {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      addNotification({
        type: 'creation',
        title: complete ? 'Brand & voice setup completed' : 'Draft saved',
        description: complete
          ? `${companyName || 'Your company'}'s brand profile is ready to guide future posts.`
          : 'Your brand and voice settings were saved as a draft.',
        platform: 'Multi-platform',
        author: 'Relay AI',
      })
    }, 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
     

      <SectionCard
        icon={
          <svg className="h-4 w-4 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="7.5" width="18" height="12" rx="2" strokeWidth={1.75} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8.5 7.5V6a2 2 0 012-2h3a2 2 0 012 2v1.5M3 12.75h18"
            />
          </svg>
        }
        chip="bg-brand-100"
        title="COMPANY PROFILE"
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="company-name" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Company Name
            </label>
            <input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. PIX Moving"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="company-description" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Company Description
            </label>
            <textarea
              id="company-description"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe your company's mission, products, and unique value proposition..."
              rows={3}
              className={`resize-none ${inputClass}`}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={
          <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.512l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73s-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
            />
          </svg>
        }
        chip="bg-amber-100"
        title="TONE & AUDIENCE"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Brand Tone</label>
            <Select value={brandTone} onValueChange={setBrandTone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="target-audience" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Target Audience
            </label>
            <input
              id="target-audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Urban planners, Tech enthusiasts"
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={
          <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597l-5.814 3.876a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
            />
          </svg>
        }
        chip="bg-violet-100"
        title="VISUAL STYLE"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {visualStyles.map((style) => {
            const active = visualStyle === style.key
            return (
              <button
                key={style.key}
                type="button"
                onClick={() => setVisualStyle(style.key)}
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-lg border-2 text-left transition ${
                  active ? 'border-brand-500 ring-2 ring-brand-100' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="relative h-24 w-full">
                  {style.preview}
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-sm font-semibold text-black">{style.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{style.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="cursor-pointer rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Complete Setup'}
        </button>
      </div>
    </div>
  )
}

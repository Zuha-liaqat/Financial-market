import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getQueueItemById, updateGeneratedPost } from '../data/posts'

const channelMeta = {
  Instagram: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
      <circle cx="12" cy="12" r="3.2" strokeWidth={2} />
      <circle cx="16.2" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  LinkedIn: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16.5 8.25a4.5 4.5 0 014.5 4.5V19h-3.75v-5.25a1.75 1.75 0 00-3.5 0V19H10V8.75h3.75v1.153A4.478 4.478 0 0116.5 8.25zM6.75 19H3V8.75h3.75V19zM4.875 6.75a1.875 1.875 0 110-3.75 1.875 1.875 0 010 3.75z"
      />
    </svg>
  ),
}

const fieldClass =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15'

export default function EditContentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const backTo = searchParams.get('view') === 'grid' ? '/approval-queue?view=grid' : '/approval-queue'

  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('loading')
  const [title, setTitle] = useState('')
  const [headline, setHeadline] = useState('')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState([])
  const [tone, setTone] = useState('')
  const [language, setLanguage] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [channels, setChannels] = useState([])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const found = getQueueItemById(id)
    if (!found) {
      setStatus('error')
      return
    }
    setItem(found)
    setTitle(found.title ?? '')
    setHeadline(found.headline ?? '')
    setCaption(found.caption ?? '')
    setHashtags(found.hashtags ?? [])
    setTone(found.tone ?? '')
    setLanguage(found.language ?? '')
    setDate(found.scheduleDate ?? '')
    setStartTime(found.scheduleTime ?? '')
    setEndTime(found.scheduleEndTime ?? '')
    setChannels(found.channels ?? [])
    setStatus('ready')
  }, [id])

  if (status === 'loading') {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-sm text-neutral-500">Loading post…</p>
      </div>
    )
  }

  if (status === 'error' || !item) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-sm text-neutral-500">Post not found.</p>
        <button
          onClick={() => navigate(backTo)}
          className="mt-3 text-sm font-medium text-black hover:underline"
        >
          Back to Approval Queue
        </button>
      </div>
    )
  }

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, '#')
    if (clean.length > 1 && !hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean])
    }
  }

  function toggleChannel(name) {
    setChannels((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    )
  }

  function handleSave() {
    setSaving(true)
    updateGeneratedPost(id, {
      title,
      headline,
      caption,
      hashtags,
      tone,
      language,
      scheduleDate: date || undefined,
      scheduleTime: startTime || undefined,
      scheduleEndTime: endTime || undefined,
      channels,
    })
    setSaving(false)
    navigate(backTo)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Approval Queue
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'SAVING…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">Edit Content</h2>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-neutral-500">
            DRAFT
          </span>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
            PRIMARY MEDIA
          </p>
          <div className={`relative mx-auto flex h-56 w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 ${item.images?.length ? 'bg-neutral-100' : item.thumbClass}`}>
            {item.images?.length ? (
              <img
                src={item.images[0].dataUri}
                alt={item.images[0].name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="select-none text-6xl font-bold text-white/70">
                {item.title?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              TITLE
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              HEADLINE
            </p>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
            CAPTION
          </p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={10}
            className={`resize-none ${fieldClass}`}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-neutral-400">
              HASHTAGS
            </p>
            <span className="text-xs text-neutral-400">{hashtags.length}/30 used</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
              >
                {tag}
                <button
                  onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                  aria-label={`Remove ${tag}`}
                  className="text-neutral-400 hover:text-black"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addTag(newTag)
                setNewTag('')
              }}
              className="flex items-center"
            >
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="w-20 rounded-full border border-dashed border-neutral-300 px-2 py-1 text-xs outline-none focus:border-black"
              />
              <button
                type="submit"
                aria-label="Add hashtag"
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              TONE
            </p>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              LANGUAGE
            </p>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              DATE
            </p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              START TIME
            </p>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              END TIME
            </p>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
            CHANNELS
          </p>
          <div className="space-y-2">
            {item.channels.map((name) => {
              const active = channels.includes(name)
              return (
                <label
                  key={name}
                  className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2.5 transition hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleChannel(name)}
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500"
                  />
                  <span className="flex items-center gap-2.5">
                    {channelMeta[name]}
                    <span className="text-sm font-medium text-neutral-700">{name}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

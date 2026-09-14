import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const toneOptions = ['Professional', 'Casual', 'Enthusiastic', 'Informative', 'Humorous']
const languageOptions = ['EN-US', 'EN-GB', 'ES', 'FR', 'DE', 'JA']

const tagColors = [
  'bg-brand-100 text-brand-800',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
]

const coreThemes = [
  'Product Innovation',
  'Sustainability',
  'Behind the Scenes',
  'Customer Success',
]

const platformData = {
  LinkedIn: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
  ),
  Instagram: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="pl-ig" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FEDA75" /><stop offset="25%" stopColor="#FA7E1E" /><stop offset="50%" stopColor="#D62976" /><stop offset="75%" stopColor="#962FBF" /><stop offset="100%" stopColor="#4F5BD5" /></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#pl-ig)" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" stroke="url(#pl-ig)" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="url(#pl-ig)" /></svg>
  ),
  Facebook: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  Twitter: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="black" aria-label="X">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

function GenerateView({ period, onBack, onGenerate }) {
  const fileInputRef = useRef(null)
  const toneRef = useRef(null)
  const langRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('Professional')
  const [language, setLanguage] = useState('EN-US')
  const [showToneDropdown, setShowToneDropdown] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [referenceUrl, setReferenceUrl] = useState('')
  const [urlDraft, setUrlDraft] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [frequency, setFrequency] = useState(period === 'monthly' ? 20 : 5)
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Instagram'])
  const [selectedThemes, setSelectedThemes] = useState(['Product Innovation', 'Behind the Scenes'])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [tags, setTags] = useState(['#PIXMoving', '#RoboBus'])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    function handle(e) {
      if (toneRef.current && !toneRef.current.contains(e.target)) setShowToneDropdown(false)
      if (langRef.current && !langRef.current.contains(e.target)) setShowLanguageDropdown(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const periodLabel = period === 'monthly' ? 'Month' : 'Week'
  const freqLabel = `${frequency} Posts / ${periodLabel}`

  function togglePlatform(p) {
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  function toggleTheme(t) {
    setSelectedThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, '#')
    if (clean.length > 1 && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean])
    }
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function addFiles(files) {
    const validFiles = files.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    if (validFiles.length === 0) return

    const newFiles = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file,
      preview: URL.createObjectURL(file),
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  function handleFileSelect(e) {
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function removeFile(id) {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} data-track-label="Planner - Back to Home" className="rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-black">Generate {period === 'monthly' ? 'Monthly' : 'Weekly'} Strategy</h1>
          <p className="text-sm text-neutral-500">AI-driven content planning based on your Brand & Voice Identity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
              </span>
              <h3 className="text-sm font-bold tracking-wide text-neutral-800">PROMPT CONSOLE</h3>
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the posts in detail. e.g., 'Write professional LinkedIn posts announcing our new autonomous coffee cart fleet in Tokyo...'"
                rows={11}
                className={`w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 pt-3 pb-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                  uploadedFiles.length > 0 ? 'sm:pb-28' : 'sm:pb-12'
                }`}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-3 sm:mt-0 sm:absolute sm:inset-x-3 sm:bottom-3 flex flex-col-reverse gap-2 rounded-lg transition ${
                  isDragOver ? 'bg-brand-50' : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {/* Add Image */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Add image"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white transition hover:bg-neutral-50"
                  >
                    <img src="/image2.png" alt="" className="h-5 w-5 object-contain" />
                  </button>
                  {/* Reference URL */}
                  <div
                    className={
                      referenceUrl
                        ? 'flex w-48 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600'
                        : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white transition hover:bg-neutral-50'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setUrlDraft(referenceUrl)
                        setShowUrlInput(true)
                      }}
                      aria-label="Reference URL"
                      className="flex shrink-0 cursor-pointer items-center justify-center"
                    >
                      <img src="/url3.jfif" alt="" className="h-5 w-5 object-contain" />
                    </button>
                    {referenceUrl && (
                      <input
                        readOnly
                        value={referenceUrl}
                        className="min-w-0 flex-1 border-none bg-transparent p-0 text-sm text-neutral-600 outline-none"
                      />
                    )}
                  </div>

                  <div ref={toneRef} className="relative ml-auto">
                    <button
                      type="button"
                      onClick={() => { setShowToneDropdown(!showToneDropdown); setShowLanguageDropdown(false) }}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                      Tone: {tone}
                      <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {showToneDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                        {toneOptions.map((o) => (
                          <button key={o} type="button" onClick={() => { setTone(o); setShowToneDropdown(false) }}
                            className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${tone === o ? 'bg-brand-50 font-medium text-brand-700' : 'text-neutral-600'}`}>{o}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div ref={langRef} className="relative">
                    <button
                      type="button"
                      onClick={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowToneDropdown(false) }}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                      {language}
                      <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {showLanguageDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                        {languageOptions.map((o) => (
                          <button key={o} type="button" onClick={() => { setLanguage(o); setShowLanguageDropdown(false) }}
                            className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${language === o ? 'bg-brand-50 font-medium text-brand-700' : 'text-neutral-600'}`}>{o}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4 bg-white px-1 pb-1 pt-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="relative h-16 w-16 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200">
                          <img src={file.preview} alt={file.name} className="h-full w-full object-cover" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.id)
                          }}
                          aria-label="Remove image"
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-sm ring-2 ring-white transition hover:bg-brand-600"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-right text-xs text-neutral-400">{prompt.length} / 2000 chars</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3">
              {tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tagColors[i % tagColors.length]}`}
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="opacity-60 transition hover:opacity-100"
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
                  placeholder="+ Tag"
                  className="w-20 rounded-full border border-dashed border-brand-300 bg-white px-3 py-1 text-xs outline-none focus:border-brand-500"
                />
              </form>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-bold tracking-wide text-neutral-800">POST FREQUENCY</label>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{freqLabel}</span>
            </div>
            <input
              type="range"
              min={1}
              max={period === 'monthly' ? 30 : 14}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="mt-1 flex justify-between text-xs text-neutral-400">
              <span>1</span>
              <span>{period === 'monthly' ? 30 : 14}</span>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <label className="mb-3 block text-xs font-bold tracking-wide text-neutral-800">PLATFORMS</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(platformData).map(([name, icon]) => {
                const active = selectedPlatforms.includes(name)
                return (
                  <label
                    key={name}
                    className={`flex flex-1 min-w-[140px] cursor-pointer select-none items-center gap-3 rounded-lg border p-2.5 transition ${
                      active ? 'border-brand-300 bg-brand-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => togglePlatform(name)}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500"
                    />
                    <span className="flex items-center gap-2.5">
                      {icon}
                      <span className="text-sm font-medium text-neutral-700">{name}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <label className="mb-3 block text-xs font-bold tracking-wide text-neutral-800">CORE THEMES</label>
            <div className="grid grid-cols-2 gap-2">
              {coreThemes.map((t) => {
                const active = selectedThemes.includes(t)
                return (
                  <label
                    key={t}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition ${active ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                  >
                    <input type="checkbox" checked={active} onChange={() => toggleTheme(t)}
                      className="h-4 w-4 rounded border-neutral-300 accent-brand-500" />
                    <span className="text-sm text-neutral-700">{t}</span>
                  </label>
                )
              })}
            </div>
          </div>


        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onGenerate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
          Generate &amp; Preview Posts
        </button>
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>

      {showUrlInput && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowUrlInput(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault()
              setReferenceUrl(urlDraft)
              setShowUrlInput(false)
            }}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide text-neutral-800">REFERENCE URL</h3>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                aria-label="Close"
                className="cursor-pointer rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="url"
              autoFocus
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://example.com/inspiration"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-2 text-xs text-neutral-400">Used by the AI for context or style.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default function PlannerPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('home')
  const [isMonthly, setIsMonthly] = useState(false)
  const [autoSchedule, setAutoSchedule] = useState(false)

  const period = isMonthly ? 'monthly' : 'weekly'
  const title = isMonthly ? 'Monthly Content Planner' : 'Weekly Content Planner'
  const subtitle = isMonthly
    ? 'Automate your social presence. Generate a cohesive month of content tailored to your brand identity with a single click.'
    : 'Automate your social presence. Generate a cohesive week of content tailored to your brand identity with a single click.'
  const emptyTitle = isMonthly ? 'Ready for next month?' : 'Ready for next week?'
  const emptyDesc = isMonthly
    ? 'Your queue for the upcoming month is empty. Generate a data-driven content strategy instantly.'
    : 'Your queue for the upcoming week is empty. Generate a data-driven content strategy instantly.'
  const buttonText = isMonthly ? 'Generate Monthly Strategy' : 'Generate Weekly Strategy'

  function handleGenerate() {
    navigate('/approval-queue')
  }

  if (view === 'generate') {
    return (
      <GenerateView
        period={period}
        onBack={() => setView('home')}
        onGenerate={handleGenerate}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 p-1 w-fit ring-1 ring-neutral-200">
            <button
              onClick={() => setIsMonthly(false)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                !isMonthly
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-transparent text-neutral-500 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setIsMonthly(true)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                isMonthly
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-transparent text-neutral-500 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Monthly
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">{title}</h1>
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 p-1 w-fit ring-1 ring-neutral-200">
            <button
              onClick={() => setAutoSchedule(false)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                !autoSchedule
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-transparent text-neutral-500 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Auto-Schedule
            </button>
            <button
              onClick={() => setAutoSchedule(true)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                autoSchedule
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-transparent text-neutral-500 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Manual Approval
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <svg className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-black">{emptyTitle}</h3>
          <p className="mt-2 max-w-md text-sm text-neutral-500">{emptyDesc}</p>
          <button
            onClick={() => setView('generate')}
            className="mt-5 flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

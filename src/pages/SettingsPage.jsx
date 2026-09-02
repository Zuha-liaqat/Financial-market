import { useRef, useState } from 'react'

function EyeButton({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Hide password' : 'Show password'}
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
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

function PasswordField({ id, label, value, onChange, show, onToggleShow, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
        <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
          />
        </svg>
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
        <EyeButton show={show} onClick={onToggleShow} />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const fileInputRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [name, setName] = useState('Alex Martinez')
  const [email, setEmail] = useState('alex@demo.com')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(reader.result)
    reader.readAsDataURL(file)
  }

  function handleProfileSubmit(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSaved(false)
    setTimeout(() => {
      setSavingProfile(false)
      setProfileSaved(true)
    }, 600)
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSaved(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setSavingPassword(true)
    setTimeout(() => {
      setSavingPassword(false)
      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 600)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile */}
      <form
        onSubmit={handleProfileSubmit}
        className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-sm font-semibold text-black">Profile</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Update your photo and personal details.
        </p>

        <div className="mt-5 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-semibold text-white ring-2 ring-white shadow-sm">
                {initials || 'A'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-sky-400 via-blue-500 to-violet-600 p-0.5 shadow-md ring-2 ring-white transition hover:shadow-lg hover:brightness-110"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="camera-icon-gradient" x1="1" y1="4" x2="23" y2="21" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <path
                  stroke="url(#camera-icon-gradient)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
                />
                <circle cx="12" cy="13" r="4" stroke="url(#camera-icon-gradient)" strokeWidth={2} />
              </svg>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50"
            >
              Change Photo
            </button>
            <p className="mt-1.5 text-[11px] text-neutral-400">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              FULL NAME
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setProfileSaved(false)
              }}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setProfileSaved(false)
              }}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md disabled:opacity-60"
          >
            {savingProfile && (
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {savingProfile ? 'SAVING…' : 'SAVE CHANGES'}
          </button>
          {profileSaved && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Profile updated
            </span>
          )}
        </div>
      </form>

      {/* Update Password */}
      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-sm font-semibold text-black">Update Password</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Choose a strong password you don't use elsewhere.
        </p>

        <div className="mt-5 space-y-4">
          <PasswordField
            id="currentPassword"
            label="CURRENT PASSWORD"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            show={showCurrent}
            onToggleShow={() => setShowCurrent((v) => !v)}
            autoComplete="current-password"
          />
          <PasswordField
            id="newPassword"
            label="NEW PASSWORD"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmNewPassword"
            label="CONFIRM NEW PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            autoComplete="new-password"
          />
        </div>

        {passwordError && (
          <p className="mt-3 text-xs font-medium text-red-600">{passwordError}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md disabled:opacity-60"
          >
            {savingPassword && (
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {savingPassword ? 'UPDATING…' : 'UPDATE PASSWORD'}
          </button>
          {passwordSaved && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Password updated
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

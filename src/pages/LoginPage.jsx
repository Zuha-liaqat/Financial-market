import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { setCurrentUserEmail, setSuperAdminStatus } from '../data/auth'
import { apiGetCurrentUser, apiLogin } from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { ErrorToast, SuccessToast } from '../components/Toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Please enter both your email and password.')
      return
    }

    setSubmitting(true)
    try {
      await apiLogin(form.email.trim(), form.password)
      const me = await apiGetCurrentUser()
      setSuperAdminStatus(Boolean(me?.is_superuser))
      setCurrentUserEmail(me?.email || form.email)
      trackEvent('login', { method: 'password' })
      setSuccess('Logged in successfully!')
      await new Promise((resolve) => setTimeout(resolve, 900))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left: background hero */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="/login-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(-54deg,#2977a7_0%,#0e1d35_100%)] opacity-70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/50" />
        {/* <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white">Financial Market</h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Manage, review, and publish your investing &amp; education
            content across every channel — from one place.
          </p>
        </div> */}
      </div>

      {/* Right: login form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="h-11 w-full object-contain" />
          </div>

          {error && <ErrorToast message={error} onClose={() => setError('')} />}
          {success && <SuccessToast message={success} onClose={() => setSuccess('')} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500"
              >
                EMAIL
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10">
                <svg
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  placeholder="alex@demo.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-wide text-neutral-500"
                >
                  PASSWORD
                </label>
                <a href="#" className="text-xs text-neutral-500 hover:text-black">
                  FORGOT PASSWORD?
                </a>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10">
                <svg
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
                  />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="shrink-0 text-neutral-400 hover:text-black"
                >
                  {showPassword ? (
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
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 accent-black"
              />
              Remember this device
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md disabled:opacity-60"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {submitting ? 'SIGNING IN…' : 'SIGN IN'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from '../data/auth'

const API_BASE_URL = 'https://strip-integration.vercel.app'
const TOKEN_KEY = 'api_access_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function extractErrorMessage(body, fallback) {
  if (!body) return fallback
  if (Array.isArray(body.detail)) {
    return body.detail.map((d) => d.msg).filter(Boolean).join(', ') || fallback
  }
  if (typeof body.detail === 'string') return body.detail
  return fallback
}

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Login failed'))
  }
  const token = body?.access_token || body?.token
  if (!token) {
    throw new Error('Login response did not include an access token')
  }
  setToken(token)
  return token
}

async function ensureAuthToken() {
  const existing = getToken()
  if (existing) return existing
  return apiLogin(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)
}

async function authorizedRequest(path, options = {}, { retry = true } = {}) {
  const token = await ensureAuthToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (res.status === 401 && retry) {
    clearToken()
    return authorizedRequest(path, options, { retry: false })
  }

  return res
}

export async function apiListUsers({ skip = 0, limit = 100 } = {}) {
  const res = await authorizedRequest(`/api/v1/users/?skip=${skip}&limit=${limit}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load users'))
  }
  return body
}

export async function apiCreateUser({ email, full_name, role = 'user', is_active = true, password }) {
  const res = await authorizedRequest('/api/v1/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name, role, is_active, password }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to create user'))
  }
  return body
}

export async function apiGetCurrentUser() {
  const res = await authorizedRequest('/api/v1/auth/me')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load current user'))
  }
  return body
}

export async function apiCreateCheckoutSession({ amount, currency = 'usd', product_name, success_url, cancel_url }) {
  const res = await authorizedRequest('/api/v1/payments/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, product_name, success_url, cancel_url }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to start checkout'))
  }
  const url = body?.url || body?.checkout_url || body?.session_url || body?.payment_url
  if (!url) {
    throw new Error('Checkout session did not return a URL')
  }
  return url
}

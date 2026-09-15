import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from '../data/auth'

const API_BASE_URL = 'https://financial-marketing.vercel.app'
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
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

export async function apiSignup({ full_name, email, password, confirm_password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password, confirm_password }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Signup failed'))
  }
  const token = body?.access_token
  if (!token) {
    throw new Error('Signup response did not include an access token')
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
  const res = await authorizedRequest(`/api/company/?skip=${skip}&limit=${limit}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load users'))
  }
  return body
}

export async function apiCreateUser({ email, full_name, role = 'company', is_active = true, password }) {
  const res = await authorizedRequest('/api/company/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name: full_name, role, is_active, password }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to create user'))
  }
  return body
}

export async function apiDeleteUser(userId) {
  const res = await authorizedRequest(`/api/company/${userId}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(extractErrorMessage(body, 'Failed to delete user'))
  }
}

export async function apiGetCurrentUser() {
  const res = await authorizedRequest('/api/auth/me')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load current user'))
  }
  return body
}

export async function apiListPlatformCredentials(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/credentials/${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load connected platforms'))
  }
  return body
}

export async function apiSaveCredentials({ platform, client_id, client_secret, company_id }) {
  const res = await authorizedRequest('/api/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id,
      client_secret,
      platform,
      ...(company_id ? { company_id } : {}),
    }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to save credentials'))
  }
  return body
}

export async function apiCreateCheckoutSession({ amount, currency = 'usd', product_name, success_url, cancel_url }) {
  const res = await authorizedRequest('/api/payments/create-checkout-session', {
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

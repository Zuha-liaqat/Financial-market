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

export async function apiGeneratePost({
  prompt,
  platforms,
  tone,
  language,
  hashtags,
  date,
  start_time,
  images,
  company_id,
}) {
  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('platforms', platforms)
  if (tone) formData.append('tone', tone)
  if (language) formData.append('language', language)
  if (hashtags) formData.append('hashtags', hashtags)
  if (date) formData.append('date', date)
  if (start_time) formData.append('start_time', start_time)
  if (company_id) formData.append('company_id', company_id)
  ;(images || []).forEach((file) => formData.append('images', file))

  const res = await authorizedRequest('/api/posts/generate', {
    method: 'POST',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to generate post'))
  }
  return body
}

export async function apiListPosts({ is_approved, is_posted, platform, company_id } = {}) {
  const params = new URLSearchParams()
  if (is_approved !== undefined) params.set('is_approved', is_approved)
  if (is_posted !== undefined) params.set('is_posted', is_posted)
  if (platform) params.set('platform', platform)
  if (company_id) params.set('company_id', company_id)
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await authorizedRequest(`/api/posts${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load posts'))
  }
  return body
}

export async function apiGetCalendarPosts({ is_posted, company_id } = {}) {
  const params = new URLSearchParams()
  if (is_posted !== undefined) params.set('is_posted', is_posted)
  if (company_id) params.set('company_id', company_id)
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await authorizedRequest(`/api/posts/calendar${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load calendar posts'))
  }
  return body
}

export async function apiGetPost(postId, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/posts/${postId}${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load post'))
  }
  return body
}

export async function apiUpdatePost(postId, updates, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/posts/${postId}${query}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update post'))
  }
  return body
}

export async function apiDeletePost(postId, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/posts/${postId}${query}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to delete post'))
  }
  return body
}

export async function apiApprovePosts({ post_ids, is_approved }, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/posts/approve${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_ids, is_approved }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update approval status'))
  }
  return body
}

export async function apiPublishPost(postId, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/posts/${postId}/publish${query}`, { method: 'POST' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to publish post'))
  }
  return body
}

export async function apiUploadLibraryAsset({ name, type, media_type, media }) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('type', type)
  formData.append('media_type', media_type)
  formData.append('media', media)

  const res = await authorizedRequest('/api/library', { method: 'POST', body: formData })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to upload asset'))
  }
  return body
}

export async function apiListLibraryAssets({ media_type, type } = {}) {
  const params = new URLSearchParams()
  if (media_type) params.set('media_type', media_type)
  if (type) params.set('type', type)
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await authorizedRequest(`/api/library${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load library assets'))
  }
  return body
}

export async function apiGetLibraryAsset(libraryId) {
  const res = await authorizedRequest(`/api/library/${libraryId}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load asset'))
  }
  return body
}

export async function apiUpdateLibraryAsset(libraryId, { name, type, media_type, media } = {}) {
  const formData = new FormData()
  if (name !== undefined) formData.append('name', name)
  if (type !== undefined) formData.append('type', type)
  if (media_type !== undefined) formData.append('media_type', media_type)
  if (media !== undefined) formData.append('media', media)

  const res = await authorizedRequest(`/api/library/${libraryId}`, { method: 'PUT', body: formData })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update asset'))
  }
  return body
}

export async function apiDeleteLibraryAsset(libraryId) {
  const res = await authorizedRequest(`/api/library/${libraryId}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to delete asset'))
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

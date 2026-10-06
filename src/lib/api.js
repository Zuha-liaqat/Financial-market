const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
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

// fieldLabels is optional. When given, each 422 message is prefixed with the field it is
// about, so the user knows which input to fix; without it the messages stay as they were.
function extractErrorMessage(body, fallback, fieldLabels) {
  if (!body) return fallback
  if (Array.isArray(body.detail)) {
    if (fieldLabels) {
      return body.detail.map((d) => describeFieldError(d, fieldLabels)).filter(Boolean).join('; ') || fallback
    }
    return body.detail.map((d) => d.msg).filter(Boolean).join(', ') || fallback
  }
  if (typeof body.detail === 'string') return body.detail
  return fallback
}

function describeFieldError(item, fieldLabels) {
  const msg = typeof item?.msg === 'string' ? item.msg.replace(/^Value error, /, '') : ''
  if (!msg) return ''
  // loc looks like ['body', 'company_name'] or ['body', 'brand_colors', 0].
  const field = [...(Array.isArray(item.loc) ? item.loc : [])]
    .reverse()
    .find((part) => typeof part === 'string' && !['body', 'query', 'path'].includes(part))
  if (!field) return msg
  const label = Object.prototype.hasOwnProperty.call(fieldLabels, field)
    ? fieldLabels[field]
    : field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
  return `${label}: ${msg}`
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

export async function apiSignup({ full_name, email, password, confirm_password, website, referrer_id }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name,
      email,
      password,
      confirm_password,
      // Optional: the API reads the site into the knowledge base after signup.
      ...(website ? { website } : {}),
      ...(referrer_id ? { referrer_id } : {}),
    }),
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

// This used to sign in as the super admin whenever there was no token, using
// credentials that shipped in the bundle - so anyone who opened the site, or
// simply read the JavaScript, held a super admin session. A request made
// without a login now fails instead.
async function ensureAuthToken() {
  const token = getToken()
  if (!token) {
    throw new Error('You are signed out. Please sign in again.')
  }
  return token
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

export async function apiSaveCredentials({ platform, client_id, client_secret, organization_id, company_id }) {
  const res = await authorizedRequest('/api/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id,
      client_secret,
      platform,
      ...(organization_id ? { organization_id } : {}),
      ...(company_id ? { company_id } : {}),
    }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to save credentials'))
  }
  return body
}

// Starts a one-click OAuth connection (Instagram, LinkedIn) and returns the provider's authorization URL.
export async function apiConnectPlatform(platform, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/credentials/${platform}/connect${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to start the connection'))
  }
  return body
}

export async function apiConnectBlogger(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/credentials/blogger/connect${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to start Blogger connection'))
  }
  return body
}

export async function apiDisconnectPlatform(platform, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/credentials/disconnect/${platform}${query}`, {
    method: 'DELETE',
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to disconnect'))
  }
  return body
}

export async function apiConnectWix(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/credentials/wix/connect${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to start Wix connection'))
  }
  return body
}

// Fired after a channel is connected or disconnected so other parts of the page (the sidebar) can refresh.
export const CONNECTIONS_CHANGED_EVENT = 'platform-connections-changed'

export async function apiListNotificationChannels(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/notifications/channels${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load notification channels'))
  }
  return body?.channels || []
}

export async function apiSaveNotificationChannel(provider, payload, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/notifications/channels/${provider}${query}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to save channel settings'))
  }
  return body
}

export async function apiDisconnectNotificationChannel(provider, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/notifications/channels/${provider}${query}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to disconnect channel'))
  }
  return body
}

// Starts Slack's OAuth flow for notifications and returns the URL to send the user to.
export async function apiConnectSlackNotifications(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/notifications/oauth/slack/connect${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to start the Slack connection'))
  }
  return body
}

export async function apiTestNotificationChannel(provider, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/notifications/channels/${provider}/test${query}`, { method: 'POST' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to test channel connection'))
  }
  return body
}

// Opens a live transcription session. Returns { token, model, setup }: a short-lived Gemini
// token and the setup message to send once the browser connects to Gemini Live.
export async function apiStartSpeechSession() {
  const res = await authorizedRequest('/api/speech/transcribe', { method: 'POST' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, "Couldn't start voice input"))
  }
  if (!body?.token) {
    throw new Error('Voice input could not start: no session token was returned.')
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
  documents,
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
  ;(documents || []).forEach((file) => formData.append('documents', file))

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

export async function apiGetApprovalQueue({ content_type, flagged_only, flag_threshold, company_id } = {}) {
  const params = new URLSearchParams()
  if (content_type) params.set('content_type', content_type)
  if (flagged_only !== undefined) params.set('flagged_only', flagged_only)
  if (flag_threshold !== undefined) params.set('flag_threshold', flag_threshold)
  if (company_id) params.set('company_id', company_id)
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await authorizedRequest(`/api/approval-queue${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load approval queue'))
  }
  return body
}

export async function apiApprovalQueueDecision({ post_ids, blog_ids, is_approved }, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/approval-queue/decision${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_ids, blog_ids, is_approved }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update approval status'))
  }
  return body
}

export async function apiGetCalendar({ start_date, end_date, content_type, platform, status, company_id } = {}) {
  const params = new URLSearchParams()
  if (start_date) params.set('start_date', start_date)
  if (end_date) params.set('end_date', end_date)
  if (content_type) params.set('content_type', content_type)
  if (platform) params.set('platform', platform)
  if (status) params.set('status', status)
  if (company_id) params.set('company_id', company_id)
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await authorizedRequest(`/api/calendar${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load calendar'))
  }
  return body
}

// Moves a calendar item to a new day/time (drag and drop on the calendar).
export async function apiRescheduleCalendarItem(contentType, itemId, { date, start_time }, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(
    `/api/calendar/${encodeURIComponent(contentType)}/${encodeURIComponent(itemId)}/schedule${query}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, start_time }),
    },
  )
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to move the post'))
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

export async function apiGenerateBlog({
  prompt,
  platforms,
  tone,
  language,
  hashtags,
  reference_url,
  date,
  start_time,
  image,
  documents,
  company_id,
}) {
  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('platforms', platforms)
  if (tone) formData.append('tone', tone)
  if (language) formData.append('language', language)
  if (hashtags) formData.append('hashtags', hashtags)
  if (reference_url) formData.append('reference_url', reference_url)
  if (date) formData.append('date', date)
  if (start_time) formData.append('start_time', start_time)
  if (company_id) formData.append('company_id', company_id)
  if (image) formData.append('image', image)
  ;(documents || []).forEach((file) => formData.append('documents', file))

  const res = await authorizedRequest('/api/blogs/generate', {
    method: 'POST',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to generate blog'))
  }
  return body
}

export async function apiGetBlog(blogId, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/blogs/${blogId}${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load blog'))
  }
  return body
}

export async function apiUpdateBlog(blogId, updates, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/blogs/${blogId}${query}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update blog'))
  }
  return body
}

export async function apiDeleteBlog(blogId, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/blogs/${blogId}${query}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to delete blog'))
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

export async function apiGetSubscriptionPlans() {
  const res = await authorizedRequest('/api/subscriptions/plans')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load plans'))
  }
  return body
}

// For the public pricing page: sends the token only if the visitor already
// has one, instead of logging in on their behalf.
export async function apiGetPublicSubscriptionPlans() {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
    headers: {
      accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load plans'))
  }
  return body
}

export async function apiGetCurrentSubscription() {
  const res = await authorizedRequest('/api/subscriptions/current')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load current plan'))
  }
  return body
}

export async function apiAdminListPlans() {
  const res = await authorizedRequest('/api/subscriptions/admin/plans')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load plans'))
  }
  return body
}

export async function apiAdminUpdatePlan(planId, updates) {
  const res = await authorizedRequest(`/api/subscriptions/admin/plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update plan'))
  }
  return body
}

export async function apiStartSubscriptionCheckout({ plan_code, billing_period = 'monthly', success_url, cancel_url }) {
  const res = await authorizedRequest('/api/subscriptions/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_code, billing_period, success_url, cancel_url }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to start checkout'))
  }
  return body
}

// Confirms a finished Stripe checkout straight away so the plan is active
// without waiting for Stripe's webhook.
export async function apiVerifyPaymentSession(sessionId) {
  const res = await authorizedRequest(`/api/payments/verify-session/${encodeURIComponent(sessionId)}`, {
    method: 'POST',
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to verify payment'))
  }
  return body
}

export async function apiGetPlanner({ period = 'week', start_date, company_id } = {}) {
  const params = new URLSearchParams()
  params.set('period', period)
  if (start_date) params.set('start_date', start_date)
  if (company_id) params.set('company_id', company_id)

  const res = await authorizedRequest(`/api/planner?${params.toString()}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load planner'))
  }
  return body
}

// Sent as multipart form data so a brief can be attached as planner_pdf.
export async function apiGeneratePlan(
  {
    period,
    start_date,
    platforms,
    count,
    post_time,
    mode,
    topic,
    company_description,
    brand_tone,
    target_audience,
    language,
    planner_pdf,
  },
  companyId,
) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const formData = new FormData()
  const fields = {
    period,
    start_date,
    platforms,
    count,
    post_time,
    mode,
    topic,
    company_description,
    brand_tone,
    target_audience,
    language,
  }
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value)
  })
  if (planner_pdf) formData.append('planner_pdf', planner_pdf)

  const res = await authorizedRequest(`/api/planner/generate${query}`, {
    method: 'POST',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to generate plan'))
  }
  return body
}

export async function apiGetThemeOptions() {
  const res = await authorizedRequest('/api/themes/options')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load theme options'))
  }
  return body
}

export async function apiGetBrandProfile(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/themes${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load brand profile'))
  }
  return body
}

// The brand profile fields as the Themes page labels them, for naming the field in a 422.
const BRAND_FIELD_LABELS = {
  company_name: 'Company Name',
  company_description: 'Company Description',
  company_website: 'Website',
  contact_email: 'Contact Email',
  contact_mobile: 'Mobile Number',
  brand_tone: 'Brand Tone',
  target_audience: 'Target Audience',
  visual_style: 'Theme option',
  brand_colors: 'Brand Colors',
  custom_color: 'Brand Colors',
  custom_text_style: 'Text Style',
  custom_font: 'Font',
  status: 'Status',
  files: 'Theme file',
}

// PATCH /api/themes takes multipart form data: only the fields sent are changed, and reference
// files (PDFs and images) go under the repeated "files" field. undefined/null fields are left out;
// an empty string clears that field.
export async function apiSaveBrandProfile(fields, { files = [] } = {}, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value)
  })
  files.forEach((file) => formData.append('files', file))
  const res = await authorizedRequest(`/api/themes${query}`, {
    method: 'PATCH',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to save brand profile', BRAND_FIELD_LABELS))
  }
  return body
}

export async function apiUploadBrandLogo(file, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const formData = new FormData()
  formData.append('logo', file)
  const res = await authorizedRequest(`/api/themes/logo${query}`, {
    method: 'POST',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to upload logo'))
  }
  return body
}

export async function apiGetProfile() {
  const res = await authorizedRequest('/api/settings/profile')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load profile'))
  }
  return body
}

export async function apiUpdateProfile({ first_name, last_name }) {
  const res = await authorizedRequest('/api/settings/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name, last_name }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update profile'))
  }
  return body
}

export async function apiUploadProfilePhoto(photo) {
  const formData = new FormData()
  formData.append('photo', photo)

  const res = await authorizedRequest('/api/settings/profile/photo', {
    method: 'POST',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to upload profile photo'))
  }
  return body
}

export async function apiChangePassword({ old_password, new_password, confirm_password }) {
  const res = await authorizedRequest('/api/settings/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ old_password, new_password, confirm_password }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to change password'))
  }
  return body
}

export async function apiGetDashboard(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/dashboard${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load dashboard'))
  }
  return body
}

// Public: a visitor invites a friend from the marketing site, so no login is required.
export async function apiSendReferral({ referrer_email, referee_email }) {
  const res = await fetch(`${API_BASE_URL}/api/referrals/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ referrer_email, referee_email }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to send invite'))
  }
  return body
}

export async function apiAdminListReferrals() {
  const res = await authorizedRequest('/api/referrals/admin')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load referrals'))
  }
  return body
}

export async function apiGetCompanyReferralLink() {
  const res = await authorizedRequest('/api/company/referral-link')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load referral link'))
  }
  return body
}

export async function apiGetCompanyReferrals() {
  const res = await authorizedRequest('/api/company/referrals')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load your invites'))
  }
  return body
}

export async function apiSendCompanyReferral(email) {
  const res = await authorizedRequest('/api/company/referrals/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to send invite'))
  }
  return body
}

export async function apiGetSuperAdminDashboard({ recent_limit = 5 } = {}) {
  const res = await authorizedRequest(`/api/dashboard/super-admin?recent_limit=${recent_limit}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load dashboard'))
  }
  return body
}

// --- Support chat -----------------------------------------------------------
// The WebSocket client lives outside this module but needs the same base URL and
// token, and a browser can't put an Authorization header on a WebSocket, so both
// are exposed here rather than duplicating the localStorage key elsewhere.
export function getApiBaseUrl() {
  return API_BASE_URL
}

export function getApiToken() {
  return getToken()
}

export async function apiGetSupportThread(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/support/messages${query}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load the support chat'))
  }
  return body
}

export async function apiSendSupportMessage({ body: text }, companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/support/messages${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: text }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to send the message'))
  }
  return body
}

export async function apiMarkSupportRead(companyId) {
  const query = companyId ? `?company_id=${companyId}` : ''
  const res = await authorizedRequest(`/api/support/messages/read${query}`, { method: 'POST' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to mark the chat as read'))
  }
  return body
}

export async function apiGetSupportUnreadCount() {
  const res = await authorizedRequest('/api/support/unread-count')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load the unread count'))
  }
  return body?.unread_count || 0
}

export async function apiAdminListSupportConversations() {
  const res = await authorizedRequest('/api/support/conversations')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load support conversations'))
  }
  return body
}

// --- Support form ------------------------------------------------------------
export async function apiSubmitSupportRequest({ name, email, message }) {
  const res = await authorizedRequest('/api/support-requests/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to send your message'))
  }
  return body
}

export async function apiAdminListSupportRequests() {
  const res = await authorizedRequest('/api/support-requests/')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load support requests'))
  }
  return body
}

export async function apiAdminDeleteSupportRequest(requestId) {
  const res = await authorizedRequest(`/api/support-requests/${requestId}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to delete the request'))
  }
  return body
}

export async function apiAdminDeleteSupportRequests(ids) {
  const res = await authorizedRequest('/api/support-requests/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to delete the requests'))
  }
  return body
}

export async function apiAdminSetSupportRequestStatus(requestId, status) {
  const res = await authorizedRequest(`/api/support-requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update the status'))
  }
  return body
}

export async function apiAdminSetSupportRequestsStatus(ids, status) {
  const res = await authorizedRequest('/api/support-requests/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to update the statuses'))
  }
  return body
}

export async function apiAdminGetSupportRequest(requestId) {
  const res = await authorizedRequest(`/api/support-requests/${requestId}`)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load the request'))
  }
  return body
}

export async function apiAdminGetOpenSupportCount() {
  const res = await authorizedRequest('/api/support-requests/open-count')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load the open request count'))
  }
  return body?.open || 0
}

// Uploads reference files on their own, without touching the other brand fields.
// fields: optional profile fields saved in the same request, e.g. { visual_style: 'upload' }.
export function apiUploadBrandReferenceFiles(files, companyId, fields = {}) {
  return apiSaveBrandProfile(fields, { files }, companyId)
}

// Takes one uploaded theme file off the brand profile; the response is the updated profile.
export async function apiDeleteBrandReferenceFile(url, companyId) {
  const params = new URLSearchParams({ url })
  if (companyId) params.set('company_id', companyId)
  const res = await authorizedRequest(`/api/themes/files?${params}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(extractErrorMessage(body, 'Failed to remove the theme file'))
    // Lets the page tell a file that is already gone (404) from other failures.
    error.status = res.status
    throw error
  }
  return body
}

// Knowledge base (Inaam's /api/knowledge-base): files the AI reads about the company.
export async function apiListKnowledgeBase() {
  const res = await authorizedRequest('/api/knowledge-base')
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, 'Failed to load the knowledge base'))
  }
  return Array.isArray(body) ? body : []
}

// One file per request: the API reads its text for the AI and stores the file itself.
export async function apiUploadKnowledgeBaseFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await authorizedRequest('/api/knowledge-base/upload', {
    method: 'POST',
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(body, `Failed to upload ${file.name}`))
  }
  return body
}

export async function apiDeleteKnowledgeBaseItem(id) {
  const res = await authorizedRequest(`/api/knowledge-base/${id}`, { method: 'DELETE' })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(extractErrorMessage(body, 'Failed to delete the file'))
    error.status = res.status
    throw error
  }
  return body
}

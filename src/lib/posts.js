const PLATFORM_DISPLAY = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'Twitter',
  website: 'Website',
  medium: 'Medium',
  wordpress: 'WordPress',
  blogger: 'Blogger',
  substack: 'Substack',
  ghost: 'Ghost',
  wix: 'Wix',
}

export function platformDisplay(platform) {
  if (!platform) return platform
  return PLATFORM_DISPLAY[platform.toLowerCase()] || platform
}

export function splitHashtags(value) {
  if (!value) return []
  return value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
}

export function formatPostTimestamp(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function mapApprovalQueueItem(item) {
  const platform = platformDisplay(item.platform)
  const images = item.image_url ? [{ name: item.title || item.id, dataUri: item.image_url }] : []

  return {
    id: item.id,
    contentType: item.content_type,
    title: item.title || 'Untitled',
    platform,
    thumbClass: 'bg-gradient-to-br from-neutral-400 to-neutral-600',
    thumbLabel: platform?.slice(0, 4).toUpperCase() || '',
    score: item.ai_safety_score ?? 0,
    status: item.is_flagged ? 'FLAGGED' : 'STAGING',
    timestamp: formatPostTimestamp(item.created_at),
    caption: item.preview || '',
    hashtags: [],
    images,
    channels: platform ? [platform] : [],
    language: item.language || '',
    scheduleDate: item.date || '',
    scheduleTime: item.start_time || '',
    isApproved: false,
    isPosted: false,
  }
}

export function mapCalendarItem(item) {
  const platform = platformDisplay(item.platform)
  const images = item.image_url ? [{ name: item.title || item.id, dataUri: item.image_url }] : []

  return {
    id: item.id,
    contentType: item.content_type,
    title: item.title || 'Untitled',
    platform,
    thumbClass: 'bg-gradient-to-br from-neutral-400 to-neutral-600',
    score: item.ai_safety_score ?? 0,
    caption: item.preview || '',
    hashtags: [],
    images,
    language: item.language || '',
    scheduleDate: item.date || '',
    scheduleTime: item.start_time || '',
    isPosted: Boolean(item.is_posted),
    postedAt: item.posted_at || null,
    postError: item.post_error || null,
  }
}

export function mapPlannerItem(item) {
  const platform = platformDisplay(item.platform)
  const images = item.image_url ? [{ name: item.title || item.id, dataUri: item.image_url }] : []
  const status = item.is_posted ? 'PUBLISHED' : item.is_approved ? 'SCHEDULED' : 'AWAITING_APPROVAL'

  return {
    id: item.id,
    contentType: item.content_type,
    title: item.title || item.headline || 'Untitled',
    headline: item.headline || '',
    platform,
    thumbClass: 'bg-gradient-to-br from-neutral-400 to-neutral-600',
    thumbLabel: platform?.slice(0, 4).toUpperCase() || '',
    score: item.ai_safety_score ?? 0,
    status,
    caption: item.caption || '',
    hashtags: splitHashtags(item.hashtags),
    images,
    language: item.language || '',
    scheduleDate: item.date || '',
    scheduleTime: item.start_time || '',
    isApproved: Boolean(item.is_approved),
    isPosted: Boolean(item.is_posted),
    createdAt: item.created_at || null,
  }
}

export function formatRelativeTime(iso, { uppercase = false } = {}) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const diffMin = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))
  let label
  if (diffMin < 1) label = 'just now'
  else if (diffMin < 60) label = `${diffMin}m ago`
  else if (diffMin < 1440) label = `${Math.round(diffMin / 60)}h ago`
  else label = `${Math.round(diffMin / 1440)}d ago`

  return uppercase ? label.toUpperCase() : label
}

export function formatScheduledLabel(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

export function mapApiPost(post) {
  const platform = platformDisplay(post.platform)
  const images = post.image_url ? [{ name: post.title || post.id, dataUri: post.image_url }] : []
  const status = post.post_error ? 'FLAGGED' : post.is_approved ? 'PRODUCTION' : 'STAGING'

  return {
    id: post.id,
    title: post.title || post.headline || (post.caption ? post.caption.slice(0, 60) : 'Untitled post'),
    headline: post.headline || '',
    platform,
    thumbClass: 'bg-gradient-to-br from-neutral-400 to-neutral-600',
    thumbLabel: platform?.slice(0, 4).toUpperCase() || '',
    score: post.ai_safety_score ?? 0,
    status,
    timestamp: formatPostTimestamp(post.created_at),
    caption: post.caption || '',
    hashtags: splitHashtags(post.hashtags),
    images,
    channels: platform ? [platform] : [],
    language: post.language || '',
    tone: post.tone || '',
    scheduleDate: post.date || '',
    scheduleTime: post.start_time || '',
    isApproved: Boolean(post.is_approved),
    isPosted: Boolean(post.is_posted),
    postError: post.post_error || null,
  }
}

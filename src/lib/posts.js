const PLATFORM_DISPLAY = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'Twitter',
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

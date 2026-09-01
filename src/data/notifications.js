const STORAGE_KEY = 'app_notifications'
const SEED_VERSION = 3

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === SEED_VERSION) return parsed.list
    }
  } catch {
    // fall through to reseed from the defaults
  }
  return null
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, list }))
}

const defaultNotifications = [
  {
    id: 'n1',
    type: 'approval',
    title: 'Post approved for BVB Weekly Market Recap',
    description: 'Your LinkedIn post "Investment Academy: New Episode" has been approved and scheduled for Oct 24, 09:00 AM.',
    time: '2 hours ago',
    read: false,
    platform: 'LinkedIn',
    author: 'Alex Martinez',
  },
  {
    id: 'n2',
    type: 'schedule',
    title: 'Termenul Zilei: Dividend Yield scheduled',
    description: 'Your Instagram reel "Termenul Zilei: Dividend Yield" has been scheduled for today at 02:15 PM.',
    time: '3 hours ago',
    read: false,
    platform: 'Instagram',
    author: 'Relay AI',
  },
  {
    id: 'n3',
    type: 'creation',
    title: 'New post generated',
    description: 'Relay AI has drafted 3 new posts from the Investment Academy folder. Review them in the Approval Queue.',
    time: '5 hours ago',
    read: false,
    platform: 'Twitter',
    author: 'Relay AI',
  },
  {
    id: 'n4',
    type: 'approval',
    title: 'Batch approval completed',
    description: '12 posts have been approved and queued for publishing across LinkedIn and Instagram.',
    time: 'Yesterday',
    read: true,
    platform: 'Multi-platform',
    author: 'Alex Martinez',
  },
  {
    id: 'n5',
    type: 'schedule',
    title: 'BVB Weekly Market Recap rescheduled',
    description: 'The "BVB Weekly Market Recap" post has been moved from Oct 22 to Oct 24 due to campaign timing.',
    time: 'Yesterday',
    read: true,
    platform: 'Twitter',
    author: 'System',
  },
  {
    id: 'n6',
    type: 'creation',
    title: 'Content brief uploaded',
    description: 'Termenul Zilei brief has been added to the library. AI will generate posts based on this material.',
    time: '2 days ago',
    read: true,
    platform: 'Library',
    author: 'Alex V.',
  },
  {
    id: 'n7',
    type: 'approval',
    title: 'Post flagged for review',
    description: 'Crypto Market Update draft has been flagged for review. A compliance pass is needed before publishing.',
    time: '3 days ago',
    read: true,
    platform: 'Instagram',
    author: 'System',
  },
  {
    id: 'n8',
    type: 'schedule',
    title: 'Upcoming: Market Outlook Teaser',
    description: 'Your LinkedIn post "Market Outlook Teaser" is scheduled for Oct 24. Engagement forecast: 8.1k reach.',
    time: '3 days ago',
    read: true,
    platform: 'LinkedIn',
    author: 'System',
  },
]

export function getNotifications() {
  return load() ?? defaultNotifications
}

export function addNotification({ type, title, description, platform, author }) {
  const list = getNotifications()
  const n = {
    id: `n-${Date.now()}`,
    type,
    title,
    description,
    time: 'Just now',
    read: false,
    platform,
    author: author || 'You',
  }
  const next = [n, ...list]
  save(next)
  return next
}

export function markNotificationRead(id) {
  const list = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n))
  save(list)
  return list
}

export function markAllNotificationsRead() {
  const list = getNotifications().map((n) => ({ ...n, read: true }))
  save(list)
  return list
}

export function getUnreadCount() {
  return getNotifications().filter((n) => !n.read).length
}

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getUnreadCount } from '../data/notifications'
import { apiGetCurrentUser } from '../lib/api'

function getInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

const pageTitles = [
  { match: '/dashboard', label: 'Dashboard' },
  { match: '/create-post', label: 'Create Post' },
  { match: '/create-blog', label: 'Create Blog' },
  { match: '/themes', label: 'Themes/Brands' },
  { match: '/library', label: 'Library' },
  { match: '/approval-queue', label: 'Approval Queue' },
  { match: '/calendar', label: 'Calendar' },
  { match: '/planner', label: 'Planner' },
  { match: '/integrations', label: 'Integrations' },
  { match: '/notifications', label: 'Notifications' },
  { match: '/super-admin/companies', label: 'Companies' },
  { match: '/super-admin/subscriptions', label: 'Subscriptions' },
  { match: '/settings', label: 'Settings' },
]

function formatRole(role) {
  if (!role) return 'User'
  return role
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getPageTitle(pathname) {
  if (pathname.startsWith('/approval-queue/') && pathname.endsWith('/edit')) {
    return 'Edit Content'
  }
  const found = pageTitles.find(
    (p) => pathname === p.match || pathname.startsWith(`${p.match}/`),
  )
  return found?.label ?? 'Dashboard'
}

export default function Topbar({ onMenuClick = () => {} }) {
  const location = useLocation()
  const [unread, setUnread] = useState(() => getUnreadCount())
  const [user, setUser] = useState(null)

  useEffect(() => {
    function check() {
      setUnread(getUnreadCount())
    }
    check()
    const id = setInterval(check, 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    apiGetCurrentUser()
      .then(setUser)
      .catch(() => {})
  }, [])

  const displayName = user?.full_name || 'Guest'
  const displayRole = user ? (user.is_superuser ? 'Super Admin' : formatRole(user.role)) : ''

  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-3 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="shrink-0 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black lg:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>
      <div className="flex w-full min-w-0 max-w-md items-center">
        <h1 className="truncate text-xl font-bold text-black">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <Link
          to="/notifications"
          className="relative rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          aria-label="Notifications"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7a6 6 0 00-6-6h-.75a6 6 0 00-6 6v.75a8.967 8.967 0 01-2.311 6.022 23.848 23.848 0 005.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread}
            </span>
          )}
        </Link>
        {/* <button
          className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          aria-label="Help"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.86.416-1.45 1.235-1.45 2.161v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </button> */}
        <div className="ml-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white ring-2 ring-white shadow-sm">
            {getInitials(displayName)}
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-medium text-black">{displayName}</p>
            <p className="text-xs text-neutral-400">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

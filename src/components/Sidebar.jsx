import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronUp,
  CreditCard,
  FileText,
  Images,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Palette,
  Plug,
  Plus,
  Settings,
  Sparkles,
  SquarePen,
  X,
} from 'lucide-react'
import Logo from './Logo'
import { isSuperAdmin, logout as clearSuperAdmin } from '../data/auth'
import { getUnreadCount } from '../data/notifications'
import { apiGetCurrentUser, apiListPlatformCredentials } from '../lib/api'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#3a5f87' },
  { to: '/super-admin/companies', label: 'Companies', icon: Building2, color: '#0284c7', superAdminOnly: true },
  { to: '/super-admin/plans', label: 'Subscriptions', icon: CreditCard, color: '#7c3aed', superAdminOnly: true },
  { to: '/library', label: 'Library', icon: Images, color: '#d97706', hideForSuperAdmin: true },
  { to: '/approval-queue', label: 'Approval Queue', icon: ListChecks, color: '#16a34a', hideForSuperAdmin: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, color: '#e11d48', hideForSuperAdmin: true },
  { to: '/planner', label: 'Planner', icon: Sparkles, color: '#7c3aed', hideForSuperAdmin: true },
]

const createItems = [
  { to: '/create-post', label: 'Create Post', desc: 'For LinkedIn, Instagram, Facebook and X', icon: SquarePen, color: '#0284c7' },
  { to: '/create-blog', label: 'Create Blog', desc: 'For WordPress, Medium, Blogger and Wix', icon: FileText, color: '#7c3aed' },
]

const accountItems = [
  { to: '/themes', label: 'Themes/Brands', icon: Palette, color: '#ea580c', hideForSuperAdmin: true },
  { to: '/notifications', label: 'Notifications', icon: Bell, color: '#2563eb', hideForSuperAdmin: true, badge: true },
  { to: '/super-admin/subscriptions', label: 'Plans and Billing', icon: CreditCard, color: '#0d9488', hideForSuperAdmin: true },
  { to: '/documentation', label: 'Documentation', icon: BookOpen, color: '#64748b', hideForSuperAdmin: true },
  { to: '/settings', label: 'Settings', icon: Settings, color: '#475569' },
]

const channels = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="#fff" />
      </svg>
    ),
    bg: 'bg-linear-to-br from-amber-400 via-pink-500 to-violet-600',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#fff">
        <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" />
      </svg>
    ),
    bg: 'bg-[#1877F2]',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#fff">
        <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 2 1.98 2h.02C6.1 7.48 7 6.6 7 5.48 7 4.38 6.1 3.5 4.98 3.5zM3.5 8.75h3v11.75h-3zM9.5 8.75h2.9v1.6h.04c.4-.76 1.4-1.6 2.9-1.6 3.1 0 3.66 2 3.66 4.6v6.65h-3v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v6h-3z" />
      </svg>
    ),
    bg: 'bg-[#0A66C2]',
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="#fff">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.6l-5.2-6.8L5.4 22H2.3l8.1-9.3L1.4 2h6.9l4.7 6.2L18.9 2z" />
      </svg>
    ),
    bg: 'bg-black',
  },
]

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

function formatRole(role) {
  if (!role) return 'User'
  return role
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Closes a popover when the user clicks outside it or presses Escape.
function useDismiss(ref, open, onDismiss) {
  useEffect(() => {
    if (!open) return undefined
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onDismiss()
    }
    function handleEscape(e) {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [ref, open, onDismiss])
}

// Small rounded tile holding a tinted icon, used for every sidebar row.
function IconTile({ icon: IconComponent, color, active, size = 'h-8 w-8' }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-lg transition ${
        active ? 'bg-white shadow-sm ring-1 ring-black/5' : ''
      }`}
      style={active ? { color } : { backgroundColor: `${color}14`, color }}
    >
      <IconComponent className="h-4 w-4" strokeWidth={2} />
    </span>
  )
}

function SidebarLink({ item, onClick }) {
  return (
    <NavLink to={item.to} onClick={onClick}>
      {({ isActive }) => (
        <span
          className={`relative flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition ${
            isActive
              ? 'bg-brand-50 font-semibold text-brand-800'
              : 'font-medium text-neutral-600 hover:bg-neutral-50 hover:text-black'
          }`}
        >
          {isActive && <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600" />}
          <IconTile icon={item.icon} color={item.color} active={isActive} />
          {item.label}
        </span>
      )}
    </NavLink>
  )
}

function SectionLabel({ children, action }) {
  return (
    <div className="mb-1.5 flex items-center justify-between px-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{children}</p>
      {action}
    </div>
  )
}

export default function Sidebar({ open = false, onClose = () => { } }) {
  const navigate = useNavigate()
  const [superAdmin] = useState(() => isSuperAdmin())
  const [user, setUser] = useState(null)
  const [connected, setConnected] = useState({})
  const [unread, setUnread] = useState(() => getUnreadCount())
  const [newOpen, setNewOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const newRef = useRef(null)
  const menuRef = useRef(null)

  useDismiss(newRef, newOpen, () => setNewOpen(false))
  useDismiss(menuRef, menuOpen, () => setMenuOpen(false))

  const visibleNavItems = navItems.filter(
    (item) => (!item.superAdminOnly || superAdmin) && (!item.hideForSuperAdmin || !superAdmin),
  )
  const visibleAccountItems = accountItems.filter((item) => !item.hideForSuperAdmin || !superAdmin)
  const connectedChannels = channels.filter((c) => connected[c.key])
  const unconnectedChannels = channels.filter((c) => !connected[c.key])

  useEffect(() => {
    apiGetCurrentUser()
      .then(setUser)
      .catch(() => {})
    if (!superAdmin) {
      apiListPlatformCredentials()
        .then((list) => setConnected(Object.fromEntries((list || []).map((p) => [p.platform, p.is_connected]))))
        .catch(() => {})
    }
  }, [superAdmin])

  useEffect(() => {
    const id = setInterval(() => setUnread(getUnreadCount()), 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handleProfileUpdated(e) {
      setUser((prev) => (prev ? { ...prev, ...e.detail } : prev))
    }
    window.addEventListener('user-profile-updated', handleProfileUpdated)
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdated)
  }, [])

  const displayName = user?.name || 'Guest'
  const displayRole = user ? (user.is_superuser ? 'Super Admin' : formatRole(user.role)) : ''
  const avatarUrl = user?.avatar_url || null

  function closeAll() {
    setNewOpen(false)
    setMenuOpen(false)
    onClose()
  }

  function handleLogout() {
    clearSuperAdmin()
    navigate('/', { replace: true })
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 -translate-x-full flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : ''
          }`}
      >
        <div className="relative px-5">
          <Logo className="h-8 my-6 w-full object-contain" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-2 top-2 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!superAdmin && (
          <div ref={newRef} className="relative px-3 pb-4">
            <button
              type="button"
              onClick={() => setNewOpen((v) => !v)}
              aria-expanded={newOpen}
              aria-haspopup="menu"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 transition hover:bg-brand-100"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              New
            </button>
            {newOpen && (
              <div
                role="menu"
                className="absolute left-3 right-3 top-full z-50 -mt-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
              >
                {createItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    onClick={closeAll}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-neutral-50"
                  >
                    <IconTile icon={item.icon} color={item.color} />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-sm font-semibold text-neutral-800">{item.label}</span>
                      <span className="block text-[11px] text-neutral-400">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          <SectionLabel>Workspace</SectionLabel>
          <div className="space-y-0.5">
            {visibleNavItems.map((item) => (
              <SidebarLink key={item.to} item={item} onClick={onClose} />
            ))}
          </div>

          {!superAdmin && (
            <div className="mt-5">
              <SectionLabel
                action={
                  <Link
                    to="/integrations"
                    onClick={onClose}
                    aria-label="Manage integrations"
                    title="Manage integrations"
                    className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Link>
                }
              >
                Channels
              </SectionLabel>

              <div className="space-y-0.5">
                {connectedChannels.map((c) => (
                  <Link
                    key={c.key}
                    to="/integrations"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>{c.icon}</span>
                    <span className="flex-1">{c.label}</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
                  </Link>
                ))}
                <SidebarLink item={{ to: '/integrations', label: 'Integrations', icon: Plug, color: '#0891b2' }} onClick={onClose} />
              </div>

              {unconnectedChannels.length > 0 && (
                <div className="mt-3 rounded-xl border border-dashed border-neutral-200 px-3 py-2.5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">Connect more channels</p>
                  <div className="flex items-center gap-1.5">
                    {unconnectedChannels.map((c) => (
                      <Link
                        key={c.key}
                        to="/integrations"
                        onClick={onClose}
                        title={`Connect ${c.label}`}
                        aria-label={`Connect ${c.label}`}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition hover:-translate-y-0.5 ${c.bg}`}
                      >
                        {c.icon}
                      </Link>
                    ))}
                    <Link
                      to="/integrations"
                      onClick={onClose}
                      title="All integrations"
                      aria-label="All integrations"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:text-black"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        <div ref={menuRef} className="relative border-t border-neutral-200 p-3">
          {menuOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-3 right-3 z-50 mb-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
            >
              {user?.email && (
                <p className="truncate border-b border-neutral-100 px-2 pb-2 pt-1 text-xs text-neutral-500">
                  {user.email}
                </p>
              )}
              <div className="py-1">
                {visibleAccountItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    onClick={closeAll}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <IconTile icon={item.icon} color={item.color} size="h-7 w-7" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && unread > 0 && (
                      <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>
                    )}
                  </Link>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <IconTile icon={LogOut} color="#dc2626" size="h-7 w-7" />
                  Log out
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left ring-1 transition ${
              menuOpen ? 'bg-brand-50 ring-brand-200' : 'bg-neutral-50 ring-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
                {getInitials(displayName)}
              </span>
            )}
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold text-black">{displayName}</span>
              <span className="block truncate text-xs text-neutral-400">{displayRole}</span>
            </span>
            <ChevronUp
              className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${menuOpen ? '' : 'rotate-180'}`}
            />
          </button>
        </div>
      </aside>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  CalendarDays,
  CircleHelp,
  CreditCard,
  FileText,
  Gift,
  Images,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Palette,
  Plug,
  Plus,
  LifeBuoy,
  Settings,
  NotebookPen,
  SquarePen,
  X,
} from 'lucide-react'
import Logo from './Logo'
import { isSuperAdmin, logout as clearSuperAdmin } from '../data/auth'
import { apiListPlatformCredentials, CONNECTIONS_CHANGED_EVENT } from '../lib/api'
import { socialChannels } from './channelIcons'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#3a5f87' },
  { to: '/library', label: 'Library', icon: Images, color: '#d97706', hideForSuperAdmin: true },
  { to: '/approval-queue', label: 'Approval Queue', icon: ListChecks, color: '#16a34a', hideForSuperAdmin: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, color: '#e11d48', hideForSuperAdmin: true },
  { to: '/planner', label: 'Planner', icon: NotebookPen, color: '#7c3aed', hideForSuperAdmin: true },
]

const createItems = [
  { to: '/create-post', label: 'Create Post', desc: 'For LinkedIn, Instagram, Facebook and X', icon: SquarePen, color: '#0284c7' },
  { to: '/create-blog', label: 'Create Blog', desc: 'For WordPress, Medium, Blogger and Wix', icon: FileText, color: '#7c3aed' },
]

// Super admin's second section, shown where company users see Channels.
const managementItems = [
  { to: '/super-admin/companies', label: 'Companies', icon: Building2, color: '#0284c7' },
  { to: '/super-admin/plans', label: 'Subscriptions', icon: CreditCard, color: '#7c3aed' },
  { to: '/super-admin/referrals', label: 'Referrals', icon: Gift, color: '#ea580c' },
  { to: '/super-admin/support-requests', label: 'Support Requests', icon: LifeBuoy, color: '#0891b2' },
]

const accountItems = [
  { to: '/themes', label: 'Themes/Brands', icon: Palette, color: '#ea580c', hideForSuperAdmin: true },
  { to: '/notifications', label: 'Notifications', icon: Bell, color: '#2563eb', hideForSuperAdmin: true },
  { to: '/super-admin/subscriptions', label: 'Plans and Billing', icon: CreditCard, color: '#0d9488', hideForSuperAdmin: true },
]

const referItem = {
  to: '/refer-and-earn',
  label: 'Refer & Earn',
  icon: Gift,
  color: '#ea580c',
  hint: {
    title: 'Earn 100 credits',
    text: 'Invite a friend with your referral link. When they sign up, 100 credits are added to your account.',
  },
}
// Sits directly above Settings. The Super Admin does not see it - they are the
// ones these requests go to.
const supportItem = { to: '/support', label: 'Support', icon: LifeBuoy, color: '#0891b2' }
const settingsItem = { to: '/settings', label: 'Settings', icon: Settings, color: '#475569' }

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

// Question-mark icon that shows a short explanation above it on hover.
function HintBubble({ hint }) {
  return (
    <span className="group/hint relative flex">
      <CircleHelp
        className="h-4 w-4 text-neutral-400 transition group-hover/hint:text-brand-600"
        aria-label={`${hint.title}. ${hint.text}`}
      />
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full right-0 z-50 mb-2 w-52 translate-y-1 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-3 text-left opacity-0 shadow-xl shadow-orange-900/10 transition duration-150 group-hover/hint:visible group-hover/hint:translate-y-0 group-hover/hint:opacity-100"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-orange-600 ring-1 ring-orange-200">
            <Gift className="h-3.5 w-3.5" />
          </span>
          {hint.title}
        </span>
        <span className="mt-1.5 block text-xs leading-relaxed font-normal text-neutral-600">{hint.text}</span>
        <span className="absolute -bottom-[5px] right-1 h-2.5 w-2.5 rotate-45 border-r border-b border-orange-200 bg-orange-50" />
      </span>
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
          <span className="flex-1">{item.label}</span>
          {item.hint && <HintBubble hint={item.hint} />}
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
  const [connected, setConnected] = useState({})
  const [newOpen, setNewOpen] = useState(false)
  const newRef = useRef(null)

  useDismiss(newRef, newOpen, () => setNewOpen(false))

  const visibleNavItems = navItems.filter(
    (item) => !item.hideForSuperAdmin || !superAdmin,
  )
  const visibleAccountItems = accountItems.filter((item) => !item.hideForSuperAdmin || !superAdmin)
  const connectedChannels = socialChannels.filter((c) => connected[c.key])

  useEffect(() => {
    if (superAdmin) return undefined
    function loadConnected() {
      apiListPlatformCredentials()
        .then((list) => setConnected(Object.fromEntries((list || []).map((p) => [p.platform, p.is_connected]))))
        .catch(() => {})
    }
    loadConnected()
    window.addEventListener(CONNECTIONS_CHANGED_EVENT, loadConnected)
    return () => window.removeEventListener(CONNECTIONS_CHANGED_EVENT, loadConnected)
  }, [superAdmin])

  function closeAll() {
    setNewOpen(false)
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white">
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
            {[...visibleNavItems, ...visibleAccountItems].map((item) => (
              <SidebarLink key={item.to} item={item} onClick={onClose} />
            ))}
          </div>

          {superAdmin && (
            <div className="mt-5">
              <SectionLabel>Management</SectionLabel>
              <div className="space-y-0.5">
                {managementItems.map((item) => (
                  <SidebarLink key={item.to} item={item} onClick={onClose} />
                ))}
              </div>
            </div>
          )}

          {!superAdmin && (
            <div className="mt-5">
              <SectionLabel>Channels</SectionLabel>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-1.5">
                <NavLink to="/integrations" onClick={onClose}>
                  {({ isActive }) => (
                    <span
                      className={`flex items-center gap-3 rounded-lg px-1.5 py-1.5 text-sm transition ${
                        isActive
                          ? 'bg-white font-semibold text-brand-800 shadow-sm ring-1 ring-black/5'
                          : 'font-medium text-neutral-700 hover:bg-white hover:text-black'
                      }`}
                    >
                      <IconTile icon={Plug} color="#0891b2" active={isActive} />
                      <span className="flex-1">Integrations</span>
                    </span>
                  )}
                </NavLink>

                {connectedChannels.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {connectedChannels.map((c) => (
                      <Link
                        key={c.key}
                        to="/integrations"
                        onClick={onClose}
                        className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 text-[13px] font-medium text-neutral-600 transition hover:bg-white hover:text-black"
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${c.bg}`}>{c.icon}</span>
                        <span className="flex-1">{c.label}</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-1.5 border-t border-neutral-200 px-1.5 pt-2 pb-1">
                  <Link
                    to="/integrations"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg text-[12px] font-medium text-neutral-500 transition hover:text-brand-600"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-white">
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    Add channel
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="space-y-0.5 border-t border-neutral-200 p-3">
          {!superAdmin && <SidebarLink item={referItem} onClick={onClose} />}
          {!superAdmin && <SidebarLink item={supportItem} onClick={onClose} />}
          <SidebarLink item={settingsItem} onClick={onClose} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <IconTile icon={LogOut} color="#dc2626" />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}

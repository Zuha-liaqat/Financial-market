export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

const PAGE_TITLES = [
  { pattern: /^\/$/, title: 'Home' },
  { pattern: /^\/login$/, title: 'Login' },
  { pattern: /^\/signup$/, title: 'Signup' },
  { pattern: /^\/about$/, title: 'About' },
  { pattern: /^\/contact$/, title: 'Contact' },
  { pattern: /^\/pricing$/, title: 'Pricing' },
  { pattern: /^\/product\/[^/]+$/, title: 'Product' },
  { pattern: /^\/dashboard$/, title: 'Dashboard' },
  { pattern: /^\/create-post$/, title: 'Create Post' },
  { pattern: /^\/create-blog$/, title: 'Create Blog' },
  { pattern: /^\/themes$/, title: 'Themes & Brands' },
  { pattern: /^\/library$/, title: 'Library' },
  { pattern: /^\/approval-queue\/[^/]+\/edit$/, title: 'Edit Content' },
  { pattern: /^\/approval-queue$/, title: 'Approval Queue' },
  { pattern: /^\/calendar$/, title: 'Calendar' },
  { pattern: /^\/planner$/, title: 'Planner' },
  { pattern: /^\/notifications$/, title: 'Notifications' },
  { pattern: /^\/integrations$/, title: 'Integrations' },
  { pattern: /^\/super-admin\/companies$/, title: 'Super Admin - Companies' },
  { pattern: /^\/super-admin\/subscriptions$/, title: 'Subscriptions' },
  { pattern: /^\/settings$/, title: 'Settings' },
]

const SITE_NAME = 'Financial Market'

export function getPageTitle(pathname) {
  const match = PAGE_TITLES.find((entry) => entry.pattern.test(pathname))
  return match ? `${match.title} | ${SITE_NAME}` : SITE_NAME
}

export function trackPageView(pathname, search = '') {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const title = getPageTitle(pathname)
  document.title = title
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: `${pathname}${search}`,
  })
}

function getButtonLabel(el) {
  return (
    el.getAttribute('data-track-label') ||
    el.getAttribute('aria-label') ||
    el.innerText?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
    el.getAttribute('title') ||
    el.id ||
    'unnamed'
  )
}

export function initButtonTracking() {
  if (typeof document === 'undefined') return () => {}

  const handleClick = (event) => {
    const target = event.target.closest('button, [role="button"], a')
    if (!target || target.disabled) return

    const isButton = target.tagName === 'BUTTON' || target.getAttribute('role') === 'button'
    const isLink = target.tagName === 'A'
    if (!isButton && !isLink) return

    trackEvent(isButton ? 'button_click' : 'link_click', {
      button_label: getButtonLabel(target),
      page_path: window.location.pathname,
      ...(isLink ? { link_url: target.getAttribute('href') || '' } : {}),
    })
  }

  document.addEventListener('click', handleClick, true)
  return () => document.removeEventListener('click', handleClick, true)
}

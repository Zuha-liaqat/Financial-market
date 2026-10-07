import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import SupportWidget from '../components/SupportWidget'
import { SuccessToast } from '../components/Toast'
import { subscribeGlobalToast } from '../lib/toastBus'
import { AUTH_EXPIRED_EVENT, apiSignOut, hasValidSession } from '../lib/api'
import { logout } from '../data/auth'

// A login lasts a day. When it has run out (a tab left open overnight, or any request answered
// with 401), go to the sign-in page and come back here afterwards, instead of every page quietly
// failing to load. Checked on arrival, whenever the tab is looked at again, and on a 401.
function useSessionGuard() {
  const navigate = useNavigate()
  const location = useLocation()
  const here = useRef('')
  here.current = `${location.pathname}${location.search}${location.hash}`

  useEffect(() => {
    let sent = false
    function backToSignIn() {
      if (sent) return
      sent = true
      apiSignOut()
      logout()
      navigate(`/login?expired=1&next=${encodeURIComponent(here.current)}`, { replace: true })
    }
    function check() {
      if (!hasValidSession()) backToSignIn()
    }

    check()
    window.addEventListener(AUTH_EXPIRED_EVENT, backToSignIn)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, backToSignIn)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [navigate])
}

function GlobalToast() {
  const [message, setMessage] = useState(null)

  useEffect(() => subscribeGlobalToast(setMessage), [])

  if (!message) return null
  return <SuccessToast message={message} onClose={() => setMessage(null)} />
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useSessionGuard()

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:px-6 lg:py-4">
          <Outlet />
        </main>
      </div>
      <GlobalToast />
      <SupportWidget />
    </div>
  )
}

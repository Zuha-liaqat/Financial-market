import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { SuccessToast } from '../components/Toast'
import { subscribeGlobalToast } from '../lib/toastBus'

function GlobalToast() {
  const [message, setMessage] = useState(null)

  useEffect(() => subscribeGlobalToast(setMessage), [])

  if (!message) return null
  return <SuccessToast message={message} onClose={() => setMessage(null)} />
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    </div>
  )
}

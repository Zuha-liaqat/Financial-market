import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { trackPageView, initButtonTracking } from './lib/analytics'
import HomePage from './pages/marketing/HomePage'
import AboutPage from './pages/marketing/AboutPage'
import ContactPage from './pages/marketing/ContactPage'
import PricingPage from './pages/marketing/PricingPage'
import ProductPage from './pages/marketing/ProductPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CreatePostPage from './pages/CreatePostPage'
import CreateBlogPage from './pages/CreateBlogPage'
import ThemesPage from './pages/Theme'
import LibraryPage from './pages/LibraryPage'
import ApprovalQueuePage from './pages/ApprovalQueuePage'
import EditContentPage from './pages/EditContentPage'
import CalendarPage from './pages/CalendarPage'
import PlannerPage from './pages/PlannerPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import CompaniesPage from './pages/superadmin/CompaniesPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import DashboardLayout from './layouts/DashboardLayout'
import RequireSuperAdmin from './components/RequireSuperAdmin'
import RequireNotSuperAdmin from './components/RequireNotSuperAdmin'

function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname, location.search)
  }, [location.pathname, location.search])

  return null
}

function App() {
  useEffect(() => {
    return initButtonTracking()
  }, [])

  return (
    <BrowserRouter>
      <PageTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/create-blog" element={<CreateBlogPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/approval-queue" element={<ApprovalQueuePage />} />
          <Route path="/approval-queue/:id/edit" element={<EditContentPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route
            path="/super-admin/companies"
            element={
              <RequireSuperAdmin>
                <CompaniesPage />
              </RequireSuperAdmin>
            }
          />
          <Route
            path="/super-admin/subscriptions"
            element={
              <RequireNotSuperAdmin>
                <SubscriptionsPage />
              </RequireNotSuperAdmin>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

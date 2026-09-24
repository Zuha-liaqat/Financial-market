import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { trackPageView, initButtonTracking } from './lib/analytics'
import HomePage from './pages/marketing/HomePage'
import AboutPage from './pages/marketing/AboutPage'
import ContactPage from './pages/marketing/ContactPage'
import PricingPage from './pages/marketing/PricingPage'
import ProductPage from './pages/marketing/ProductPage'
import LoginPage from './pages/User/LoginPage'
import SignupPage from './pages/User/SignupPage'
import DashboardPage from './pages/User/DashboardPage'
import CreatePostPage from './pages/User/CreatePostPage'
import CreateBlogPage from './pages/User/CreateBlogPage'
import ThemesPage from './pages/User/Theme'
import LibraryPage from './pages/User/LibraryPage'
import ApprovalQueuePage from './pages/User/ApprovalQueuePage'
import EditContentPage from './pages/User/EditContentPage'
import EditBlogPage from './pages/User/EditBlogPage'
import CalendarPage from './pages/User/CalendarPage'
import PlannerPage from './pages/User/PlannerPage'
import NotificationsPage from './pages/User/NotificationsPage'
import SettingsPage from './pages/User/SettingsPage'
import IntegrationsPage from './pages/User/IntegrationsPage'
import DocumentationPage from './pages/User/DocumentationPage'
import CompaniesPage from './pages/superadmin/CompaniesPage'
import SubscriptionsPage from './pages/User/SubscriptionsPage'
import ManageSubscriptionsPage from './pages/superadmin/ManageSubscriptionsPage'
import AdminDashboardPage from './pages/superadmin/AdminDashboardPage'
import DashboardLayout from './layouts/DashboardLayout'
import RequireSuperAdmin from './components/RequireSuperAdmin'
import RequireNotSuperAdmin from './components/RequireNotSuperAdmin'
import { isSuperAdmin } from './data/auth'

function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname, location.search)
  }, [location.pathname, location.search])

  return null
}

// Checked on each visit so logging in as a different role picks the right dashboard.
function DashboardRoute() {
  return isSuperAdmin() ? <AdminDashboardPage /> : <DashboardPage />
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
            element={<DashboardRoute />}
          />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/create-blog" element={<CreateBlogPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/approval-queue" element={<ApprovalQueuePage />} />
          <Route path="/approval-queue/:id/edit" element={<EditContentPage />} />
          <Route path="/approval-queue/:id/edit-blog" element={<EditBlogPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route
            path="/super-admin/companies"
            element={
              <RequireSuperAdmin>
                <CompaniesPage />
              </RequireSuperAdmin>
            }
          />
          <Route
            path="/super-admin/plans"
            element={
              <RequireSuperAdmin>
                <ManageSubscriptionsPage />
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

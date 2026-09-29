import { useEffect, useState } from 'react'
import { apiGetBrandProfile, apiGetCurrentUser, apiGetProfile } from './api'
import { isSuperAdmin } from '../data/auth'

function formatRole(role) {
  if (!role) return 'User'
  return role
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function personName(profile) {
  if (!profile) return ''
  return (
    profile.full_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
  )
}

// Loads the signed-in account for the header and sidebar.
// userName: the person's name from Settings, used in the header.
// companyName: the brand's company name from Themes/Brands, used in the sidebar.
// Each falls back to the account name, then to the part of the email before "@".
export function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [brandName, setBrandName] = useState('')

  useEffect(() => {
    let cancelled = false
    apiGetCurrentUser()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        if (!me?.is_superuser) {
          apiGetBrandProfile()
            .then((brand) => !cancelled && setBrandName(brand?.company_name?.trim() || ''))
            .catch(() => {})
        }
      })
      .catch(() => {})
    apiGetProfile()
      .then((profile) => !cancelled && setProfileName(personName(profile)))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleProfileUpdated(e) {
      const detail = e.detail || {}
      setUser((prev) => (prev ? { ...prev, ...detail } : prev))
      if (typeof detail.company_name === 'string') setBrandName(detail.company_name.trim())
      if (typeof detail.full_name === 'string') setProfileName(detail.full_name.trim())
    }
    window.addEventListener('user-profile-updated', handleProfileUpdated)
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdated)
  }, [])

  const fallbackName = user?.name?.trim() || user?.email?.split('@')[0] || (user ? 'User' : '')
  const userName = profileName || fallbackName
  const companyName = brandName || fallbackName
  const displayRole = user ? (user.is_superuser ? 'Super Admin' : formatRole(user.role)) : ''
  // Before /me loads, fall back to the flag saved at login so the avatar shows "SA" right away.
  const superAdmin = user ? Boolean(user.is_superuser) : isSuperAdmin()
  const avatarUrl = user?.avatar_url?.trim() || null

  return { user, userName, companyName, displayRole, avatarUrl, superAdmin }
}

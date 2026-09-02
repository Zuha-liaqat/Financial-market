const STORAGE_KEY = 'is_super_admin'
const CURRENT_USER_EMAIL_KEY = 'current_user_email'

export const SUPER_ADMIN_EMAIL = 'superadmin@financial.com'
export const SUPER_ADMIN_PASSWORD = 'SuperAdmin@123'

export function login(email, password) {
  const matches =
    email.trim().toLowerCase() === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD
  localStorage.setItem(STORAGE_KEY, matches ? 'true' : 'false')
  return matches
}

export function isSuperAdmin() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setSuperAdminStatus(isAdmin) {
  localStorage.setItem(STORAGE_KEY, isAdmin ? 'true' : 'false')
}

export function getCurrentUserEmail() {
  return localStorage.getItem(CURRENT_USER_EMAIL_KEY)
}

export function setCurrentUserEmail(email) {
  if (email) {
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email.trim().toLowerCase())
  } else {
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY)
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(CURRENT_USER_EMAIL_KEY)
}

const STORAGE_KEY = 'is_super_admin'
const CURRENT_USER_EMAIL_KEY = 'current_user_email'

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

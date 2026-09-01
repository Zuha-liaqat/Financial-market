import { Navigate } from 'react-router-dom'
import { isSuperAdmin } from '../data/auth'

export default function RequireSuperAdmin({ children }) {
  return isSuperAdmin() ? children : <Navigate to="/dashboard" replace />
}

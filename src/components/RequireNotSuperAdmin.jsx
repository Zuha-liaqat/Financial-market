import { Navigate } from 'react-router-dom'
import { isSuperAdmin } from '../data/auth'

export default function RequireNotSuperAdmin({ children }) {
  return isSuperAdmin() ? <Navigate to="/dashboard" replace /> : children
}

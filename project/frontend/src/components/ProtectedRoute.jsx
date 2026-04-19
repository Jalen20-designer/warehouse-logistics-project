import { Navigate } from 'react-router-dom'
export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user')

  if (!user) {
    // Not logged in → send to login page
    return <Navigate to="/login" replace />
  }

  // Logged in → show the page
  return children
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { isCodeAccess, isCodeExpired, clearCodeAccess } from '../../utils/codeAccess'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore()
  const navigate = useNavigate()
  const hasCodeAccess = isCodeAccess()

  useEffect(() => {
    // If code access token expired, clear and redirect
    if (hasCodeAccess && isCodeExpired()) {
      clearCodeAccess()
      navigate('/go', { replace: true })
      return
    }
  }, [hasCodeAccess, navigate])

  useEffect(() => {
    if (isAuthenticated && !user && !hasCodeAccess) {
      fetchUser()
    }
  }, [isAuthenticated, user, fetchUser, hasCodeAccess])

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !hasCodeAccess) {
      navigate('/auth', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, hasCodeAccess])

  if (isLoading && !hasCodeAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-200">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated && !hasCodeAccess) return null

  return <>{children}</>
}

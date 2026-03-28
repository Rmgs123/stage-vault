import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser()
    }
  }, [isAuthenticated, user, fetchUser])

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/auth', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-200">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}

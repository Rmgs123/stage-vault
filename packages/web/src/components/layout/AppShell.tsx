import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ProtectedRoute } from './ProtectedRoute'

export function AppShell() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-brand-200">
        <Header />
        <Outlet />
      </div>
    </ProtectedRoute>
  )
}

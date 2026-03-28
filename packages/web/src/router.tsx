import type { RouteObject } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import AuthPage from './pages/AuthPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ProfilePage from './pages/ProfilePage'

const DashboardPlaceholder = () => (
  <main className="max-w-[1280px] mx-auto px-8 py-8">
    <h1 className="text-[28px] font-bold text-text-primary font-serif mb-2">Мои мероприятия</h1>
    <p className="text-[14px] text-text-muted">Здесь будут ваши проекты</p>
  </main>
)

export const routes: RouteObject[] = [
  { path: '/auth', element: <AuthPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPlaceholder /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
]

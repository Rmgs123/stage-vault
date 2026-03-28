import type { RouteObject } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import AuthPage from './pages/AuthPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import EventPage, { SettingsTab } from './pages/EventPage'
import FilesTab from './components/files/FilesTab'
import TimelineTab from './components/timeline/TimelineTab'
import TeamTab from './components/team/TeamTab'

export const routes: RouteObject[] = [
  { path: '/auth', element: <AuthPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      {
        path: '/events/:id',
        element: <EventPage />,
        children: [
          { index: true, element: <FilesTab /> },
          { path: 'timeline', element: <TimelineTab /> },
          { path: 'team', element: <TeamTab /> },
          { path: 'settings', element: <SettingsTab /> },
        ],
      },
    ],
  },
]

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Vault, Bell, ChevronDown, User, Moon, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const initial = (user.nickname || user.email)[0].toUpperCase()
  const displayName = user.nickname || user.email.split('@')[0]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-300">
      <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <Vault className="w-[18px] h-[18px] text-white" />
          </div>
          <span
            className="text-[20px] font-bold tracking-tight text-text-secondary"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            StageVault
          </span>
        </button>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications bell (placeholder) */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-100 transition-colors duration-150">
            <Bell className="w-5 h-5 text-text-muted" />
          </button>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-brand-100 transition-colors duration-150"
            >
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-[13px] font-bold">
                {initial}
              </div>
              <span className="text-[14px] font-medium text-text-secondary">{displayName}</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-[220px] bg-white rounded-2xl shadow-dropdown border border-brand-300 overflow-hidden py-2">
                <div className="px-4 py-3 border-b border-brand-300">
                  <p className="text-[14px] font-semibold text-text-primary">{displayName}</p>
                  <p className="text-[12px] text-text-light">
                    {user.nickname ? `@${user.nickname}` : user.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/profile')
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-text-secondary hover:bg-brand-50 transition-colors duration-150"
                  >
                    <User className="w-4 h-4 text-text-muted" />
                    Профиль
                  </button>
                  <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-text-secondary hover:bg-brand-50 transition-colors duration-150">
                    <Moon className="w-4 h-4 text-text-muted" />
                    Тёмная тема
                  </button>
                </div>
                <div className="border-t border-brand-300 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      logout()
                      navigate('/auth')
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-red-500 hover:bg-red-50/50 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

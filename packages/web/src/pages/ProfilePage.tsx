import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  Check,
  Sun,
  Moon,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateNickname, updatePassword, updateTheme, logout } = useAuthStore()

  // Nickname editing
  const [nicknameEditing, setNicknameEditing] = useState(false)
  const [nicknameDraft, setNicknameDraft] = useState(user?.nickname || '')
  const [nicknameSaved, setNicknameSaved] = useState(false)
  const [nicknameLoading, setNicknameLoading] = useState(false)
  const [nicknameError, setNicknameError] = useState('')

  // Password editing
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  if (!user) return null

  const initial = (user.nickname || user.email)[0].toUpperCase()
  const memberSince = new Date(user.createdAt).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const handleSaveNickname = async () => {
    setNicknameError('')
    if (!nicknameDraft || nicknameDraft.length < 3) {
      setNicknameError('Минимум 3 символа')
      return
    }
    setNicknameLoading(true)
    try {
      await updateNickname(nicknameDraft)
      setNicknameEditing(false)
      setNicknameSaved(true)
      setTimeout(() => setNicknameSaved(false), 2500)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setNicknameError(apiErr.message || 'Ошибка сохранения')
    } finally {
      setNicknameLoading(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 8) {
      setPasswordError('Минимум 8 символов')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают')
      return
    }
    setPasswordLoading(true)
    try {
      await updatePassword(currentPassword, newPassword)
      setShowPasswordSection(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setPasswordError(apiErr.message || 'Неверный текущий пароль')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleToggleTheme = async () => {
    const newTheme = user.theme === 'light' ? 'dark' : 'light'
    await updateTheme(newTheme)
  }

  return (
    <main className="max-w-[720px] mx-auto px-8 py-8">
      {/* Back Link */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-[13px] font-medium text-brand-600 hover:text-brand-800 transition-colors duration-150 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
        Назад к проектам
      </button>

      <h1
        className="text-[28px] font-bold text-text-primary mb-8"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Профиль
      </h1>

      {/* Avatar & Name */}
      <div className="bg-surface rounded-2xl border border-brand-300 p-8 mb-5">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-[36px] font-bold font-serif">
            {initial}
          </div>
          <div>
            <h2
              className="text-[22px] font-bold text-text-primary mb-1"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {user.nickname || user.email}
            </h2>
            <p className="text-[14px] text-text-muted">Участник с {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-surface rounded-2xl border border-brand-300 overflow-hidden mb-5">
        <div className="px-8 py-5 border-b border-brand-300/50">
          <h3 className="text-[16px] font-semibold text-text-primary">Данные аккаунта</h3>
        </div>

        {/* Email */}
        <div className="px-8 py-5 border-b border-brand-300/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mt-0.5">
                <Mail className="w-[18px] h-[18px] text-brand-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-muted mb-1">Электронная почта</p>
                <p className="text-[15px] text-text-primary">{user.email}</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-text-placeholder bg-brand-50 px-2.5 py-1 rounded-lg mt-1">
              только чтение
            </span>
          </div>
        </div>

        {/* Nickname */}
        <div className="px-8 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mt-0.5">
                <AtSign className="w-[18px] h-[18px] text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-text-muted mb-1">Никнейм</p>
                {!nicknameEditing ? (
                  <div className="flex items-center gap-3">
                    <p className="text-[15px] text-text-primary">@{user.nickname || '—'}</p>
                    {nicknameSaved && (
                      <span className="flex items-center gap-1 text-[12px] text-accent-green-dark font-medium">
                        <Check className="w-3.5 h-3.5" />
                        Сохранено
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="relative flex-1 max-w-[280px]">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-text-placeholder">
                          @
                        </span>
                        <input
                          type="text"
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-brand-50 border border-brand-300 rounded-xl text-[14px] text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                        />
                      </div>
                      <button
                        onClick={handleSaveNickname}
                        disabled={nicknameLoading}
                        className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5"
                      >
                        {nicknameLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Сохранить
                      </button>
                      <button
                        onClick={() => {
                          setNicknameEditing(false)
                          setNicknameDraft(user.nickname || '')
                          setNicknameError('')
                        }}
                        className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-600 text-[13px] font-semibold rounded-xl transition-all duration-200"
                      >
                        Отмена
                      </button>
                    </div>
                    {nicknameError && (
                      <p className="text-[13px] text-red-500 mt-2">{nicknameError}</p>
                    )}
                  </div>
                )}
                <p className="text-[12px] text-text-placeholder mt-1.5">
                  Виден участникам ваших проектов
                </p>
              </div>
            </div>
            {!nicknameEditing && (
              <button
                onClick={() => {
                  setNicknameEditing(true)
                  setNicknameDraft(user.nickname || '')
                  setNicknameSaved(false)
                }}
                className="text-[13px] font-medium text-brand-600 hover:text-brand-800 transition-colors duration-150 mt-1"
              >
                Изменить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface rounded-2xl border border-brand-300 overflow-hidden mb-5">
        <div className="px-8 py-5 border-b border-brand-300/50">
          <h3 className="text-[16px] font-semibold text-text-primary">Безопасность</h3>
        </div>

        <div className="px-8 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mt-0.5">
                <Lock className="w-[18px] h-[18px] text-brand-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-medium text-text-muted mb-0.5">Пароль</p>
                  {passwordSaved && (
                    <span className="flex items-center gap-1 text-[12px] text-accent-green-dark font-medium -mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                      Пароль обновлён
                    </span>
                  )}
                </div>
                <p className="text-[15px] text-text-primary">{'•'.repeat(10)}</p>

                {showPasswordSection && (
                  <form
                    onSubmit={handleSavePassword}
                    className="mt-5 flex flex-col gap-4 max-w-[360px]"
                  >
                    {passwordError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-900">
                        Текущий пароль
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Введите текущий пароль"
                          className="w-full px-4 py-2.5 pr-11 bg-brand-50 border border-brand-300 rounded-xl text-[14px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-brand-600 transition-colors duration-150"
                        >
                          {showCurrentPw ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-900">
                        Новый пароль
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Минимум 8 символов"
                          className="w-full px-4 py-2.5 pr-11 bg-brand-50 border border-brand-300 rounded-xl text-[14px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-brand-600 transition-colors duration-150"
                        >
                          {showNewPw ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-900">
                        Подтвердите пароль
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Повторите новый пароль"
                          className="w-full px-4 py-2.5 pr-11 bg-brand-50 border border-brand-300 rounded-xl text-[14px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-brand-600 transition-colors duration-150"
                        >
                          {showConfirmPw ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5"
                      >
                        {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Сохранить пароль
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false)
                          setPasswordError('')
                          setCurrentPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                        }}
                        className="px-5 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-600 text-[13px] font-semibold rounded-xl transition-all duration-200"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setShowPasswordSection(!showPasswordSection)
                setPasswordError('')
                setPasswordSaved(false)
              }}
              className="text-[13px] font-medium text-brand-600 hover:text-brand-800 transition-colors duration-150 mt-1"
            >
              Изменить
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-surface rounded-2xl border border-brand-300 overflow-hidden mb-5">
        <div className="px-8 py-5 border-b border-brand-300/50">
          <h3 className="text-[16px] font-semibold text-text-primary">Настройки</h3>
        </div>

        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                {user.theme === 'light' ? (
                  <Sun className="w-[18px] h-[18px] text-brand-600" />
                ) : (
                  <Moon className="w-[18px] h-[18px] text-brand-600" />
                )}
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-muted">Тема оформления</p>
                <p className="text-[15px] text-text-primary">
                  {user.theme === 'light' ? 'Светлая' : 'Тёмная'}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={handleToggleTheme}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                user.theme === 'dark' ? 'bg-brand-600' : 'bg-brand-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  user.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface rounded-2xl border border-red-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-red-100">
          <h3 className="text-[16px] font-semibold text-red-500">Опасная зона</h3>
        </div>
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-[18px] h-[18px] text-red-400" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-text-primary">Удалить аккаунт</p>
                <p className="text-[12px] text-text-muted">
                  Все ваши проекты и данные будут удалены навсегда
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-300 text-red-500 text-[13px] font-semibold rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

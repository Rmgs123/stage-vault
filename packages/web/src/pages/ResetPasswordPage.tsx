import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Vault, KeyRound, CircleCheck, Loader2 } from 'lucide-react'
import { api } from '../api/client'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов')
      return
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr.message || 'Ошибка сброса пароля')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-brand-200 flex items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-[420px] px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Vault className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-[28px] font-bold tracking-tight text-text-secondary"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            StageVault
          </span>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-card p-8">
          {!done ? (
            <div>
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-5">
                <KeyRound className="w-6 h-6 text-brand-600" />
              </div>

              <h2
                className="text-[22px] font-bold text-text-primary mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Новый пароль
              </h2>
              <p className="text-[14px] text-text-muted leading-relaxed mb-7">
                Введите новый пароль для вашего аккаунта.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-900">Новый пароль</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 8 символов"
                      className="w-full px-4 py-3 pr-12 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-brand-600 transition-colors duration-150"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
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
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full px-4 py-3 pr-12 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-brand-600 transition-colors duration-150"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Сохранить пароль
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-accent-green/15 rounded-full flex items-center justify-center mx-auto mb-5">
                <CircleCheck className="w-8 h-8 text-accent-green" />
              </div>
              <h2
                className="text-[22px] font-bold text-text-primary mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Пароль обновлён
              </h2>
              <p className="text-[14px] text-text-muted mb-7">
                Теперь вы можете войти с новым паролем.
              </p>
              <Link
                to="/auth"
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover inline-block text-center"
              >
                Войти
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

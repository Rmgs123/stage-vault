import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CircleCheck, Vault, Loader2 } from 'lucide-react'
import { api } from '../api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Введите email')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr.message || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
    } catch {
      // ignore
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

        {/* Card */}
        <div className="w-full bg-surface rounded-2xl shadow-card p-8">
          {/* Back button */}
          <Link
            to="/auth"
            className="flex items-center gap-2 text-[13px] font-medium text-brand-600 hover:text-brand-800 transition-colors duration-150 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
            Назад ко входу
          </Link>

          {!sent ? (
            <div>
              {/* Icon */}
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-brand-600" />
              </div>

              <h2
                className="text-[22px] font-bold text-text-primary mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Восстановление пароля
              </h2>
              <p className="text-[14px] text-text-muted leading-relaxed mb-7">
                Введите адрес электронной почты, привязанный к вашему аккаунту. Мы отправим ссылку
                для сброса пароля.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-900">
                    Электронная почта
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Отправить ссылку
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              {/* Success */}
              <div className="w-16 h-16 bg-accent-green/15 rounded-full flex items-center justify-center mx-auto mb-5">
                <CircleCheck className="w-8 h-8 text-accent-green" />
              </div>

              <h2
                className="text-[22px] font-bold text-text-primary mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Письмо отправлено
              </h2>
              <p className="text-[14px] text-text-muted leading-relaxed mb-2">
                Мы отправили ссылку для сброса пароля на
              </p>
              <p className="text-[14px] font-semibold text-text-secondary mb-7">{email}</p>
              <p className="text-[13px] text-text-light mb-7">
                Не получили письмо? Проверьте папку «Спам» или попробуйте снова.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Отправить повторно
                </button>
                <Link
                  to="/auth"
                  className="w-full py-3.5 bg-brand-100 hover:bg-brand-200 text-brand-600 text-[15px] font-semibold rounded-xl transition-all duration-200 text-center block"
                >
                  Вернуться ко входу
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

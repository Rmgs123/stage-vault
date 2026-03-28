import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Vault, CircleCheck, CircleX, Loader2 } from 'lucide-react'
import { api } from '../api/client'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Недействительная ссылка подтверждения.')
      return
    }

    api
      .post<{ message: string }>('/auth/verify-email', { token })
      .then((res) => {
        setStatus('success')
        setMessage(res.message)
      })
      .catch((err: { message?: string }) => {
        setStatus('error')
        setMessage(err.message || 'Ошибка подтверждения email.')
      })
  }, [token])

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

        <div className="w-full bg-white rounded-2xl shadow-card p-8 text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
              <p className="text-[15px] text-text-muted">Подтверждаем email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="w-16 h-16 bg-accent-green/15 rounded-full flex items-center justify-center mx-auto mb-5">
                <CircleCheck className="w-8 h-8 text-accent-green" />
              </div>
              <h2
                className="text-[22px] font-bold text-text-primary mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Email подтверждён
              </h2>
              <p className="text-[14px] text-text-muted mb-7">{message}</p>
              <Link
                to="/auth"
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover inline-block text-center"
              >
                Войти
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CircleX className="w-8 h-8 text-red-400" />
              </div>
              <h2
                className="text-[22px] font-bold text-text-primary mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Ошибка подтверждения
              </h2>
              <p className="text-[14px] text-text-muted mb-7">{message}</p>
              <Link
                to="/auth"
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover inline-block text-center"
              >
                Вернуться ко входу
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

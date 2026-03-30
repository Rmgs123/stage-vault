import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Vault, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают')
        return
      }
      if (password.length < 8) {
        setError('Пароль должен быть не менее 8 символов')
        return
      }
      setLoading(true)
      try {
        const msg = await register({ email, password, nickname: nickname || undefined })
        setSuccess(msg)
        setActiveTab('login')
        setPassword('')
        setConfirmPassword('')
      } catch (err: unknown) {
        const apiErr = err as { message?: string }
        setError(apiErr.message || 'Ошибка регистрации')
      } finally {
        setLoading(false)
      }
    } else {
      if (!email || !password) {
        setError('Заполните все поля')
        return
      }
      setLoading(true)
      try {
        await login(email, password)
        navigate('/', { replace: true })
      } catch (err: unknown) {
        const apiErr = err as { message?: string }
        setError(apiErr.message || 'Неверный email или пароль')
      } finally {
        setLoading(false)
      }
    }
  }

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    setError('')
    setSuccess('')
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
          {/* Tab Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-brand-300 mb-8">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-3 text-[15px] font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-3 text-[15px] font-semibold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-accent-green/10 border border-accent-green/30 rounded-xl text-[13px] text-accent-green-dark">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {activeTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-900">Никнейм</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="stage_master"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-brand-900">Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-brand-900">Пароль</label>
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-900">Подтвердите пароль</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    className="w-full px-4 py-3 pr-12 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-brand-600 transition-colors duration-150"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'login' && (
              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-[13px] text-brand-600 hover:text-brand-800 font-medium transition-colors duration-150"
                >
                  Забыли пароль?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 mt-1 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {activeTab === 'register' ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-brand-300" />
            <span className="text-[12px] text-text-light uppercase tracking-wider font-medium">
              или
            </span>
            <div className="flex-1 h-px bg-brand-300" />
          </div>

          {/* Guest Access */}
          <div className="text-center">
            <p className="text-[13px] text-text-muted mb-2">Есть код доступа?</p>
            <Link
              to="/go"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand-600 hover:text-brand-800 transition-colors duration-150 group"
            >
              Войти по коду
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[12px] text-text-light mt-6 text-center">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  )
}

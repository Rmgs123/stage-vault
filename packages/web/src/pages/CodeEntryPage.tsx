import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Vault } from 'lucide-react'

const API_BASE = '/api'

interface VerifyResponse {
  data: {
    token: string
    eventId: string
    eventTitle: string
    expiresAt: string
  }
  message: string
}

export default function CodeEntryPage() {
  const navigate = useNavigate()
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = useCallback(
    (index: number, value: string) => {
      const char = value.slice(-1).toUpperCase()
      if (char && !/^[A-Z0-9]$/.test(char)) return

      const newDigits = [...codeDigits]
      newDigits[index] = char
      setCodeDigits(newDigits)
      setError(null)

      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [codeDigits],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [codeDigits],
  )

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6)

    const newDigits = ['', '', '', '', '', '']
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ''
    }
    setCodeDigits(newDigits)
    setError(null)

    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = codeDigits.join('')
    if (code.length < 6) {
      setError('Введите все 6 символов кода')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/access/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Ошибка проверки кода')
        setIsLoading(false)
        return
      }

      const response = data as VerifyResponse
      localStorage.setItem('codeToken', response.data.token)
      localStorage.setItem('codeEventId', response.data.eventId)
      localStorage.setItem('codeEventTitle', response.data.eventTitle)
      localStorage.setItem('codeExpiresAt', response.data.expiresAt)

      navigate(`/events/${response.data.eventId}`)
    } catch {
      setError('Ошибка сети. Попробуйте позже.')
    } finally {
      setIsLoading(false)
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
        <div className="w-full bg-white rounded-2xl shadow-card p-8">
          {/* Back link */}
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-[13px] font-medium text-brand-600 hover:text-brand-800 transition-colors duration-150 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
            Назад ко входу
          </button>

          {/* Icon */}
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-5">
            <KeyRound className="w-6 h-6 text-brand-600" />
          </div>

          <h2
            className="text-[22px] font-bold text-text-primary mb-2"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Вход по коду доступа
          </h2>
          <p className="text-[14px] text-text-muted leading-relaxed mb-1">
            Введите 6-значный код, полученный от организатора мероприятия.
          </p>
          <p className="text-[12px] text-brand-400 mb-7">stage-vault.ru/go</p>

          <form onSubmit={handleSubmit}>
            {/* Code inputs */}
            <div className="flex gap-3 mb-2 justify-center">
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-[52px] h-[60px] text-center text-[22px] font-bold tracking-widest rounded-xl border-2 outline-none transition-all duration-200 uppercase ${
                    error
                      ? 'bg-red-50/50 border-red-300 text-red-600'
                      : digit
                        ? 'bg-brand-50 border-brand-600 text-text-primary'
                        : 'bg-brand-50 border-brand-300 text-text-primary focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10'
                  }`}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-[13px] text-red-500 text-center mb-4 mt-1">{error}</p>
            )}
            {!error && <div className="mb-5" />}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Проверяем...' : 'Войти'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-brand-300" />
            <span className="text-[12px] text-brand-500 uppercase tracking-wider font-medium">
              или
            </span>
            <div className="flex-1 h-px bg-brand-300" />
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-[13px] text-text-muted mb-2">Есть аккаунт?</p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand-600 hover:text-brand-800 transition-colors duration-150 group"
            >
              Войти через аккаунт
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

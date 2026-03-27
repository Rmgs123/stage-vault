import { type ReactNode, useState, useEffect } from 'react'
import { Vault, Monitor, Smartphone, ExternalLink } from 'lucide-react'

const BREAKPOINT = 1024

interface MobileGuardProps {
  children: ReactNode
}

export function MobileGuard({ children }: MobileGuardProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile) return <>{children}</>

  return (
    <div className="min-h-screen w-full bg-brand-200 flex items-center justify-center px-6">
      <div className="flex flex-col items-center w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Vault className="w-5 h-5 text-white" />
          </div>
          <span className="text-[28px] font-bold tracking-tight text-text-secondary font-serif">
            StageVault
          </span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-brand-500 opacity-40 line-through" />
          </div>
          <span className="text-text-light text-lg">&rarr;</span>
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center">
            <Monitor className="w-6 h-6 text-brand-600" />
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-card p-6 text-center mb-6">
          <h2 className="text-[20px] font-bold text-text-primary font-serif mb-3">
            Мобильная версия пока недоступна
          </h2>
          <p className="text-[14px] text-text-muted leading-relaxed">
            StageVault пока не поддерживает мобильные устройства. Пожалуйста, откройте приложение на
            компьютере для полноценной работы.
          </p>
        </div>

        {/* Link */}
        <a
          href="https://stage-vault.ru"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-brand-300 rounded-xl text-[14px] font-semibold text-brand-600 hover:bg-brand-50 transition-all duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          Открыть stage-vault.ru
        </a>

        {/* Footer */}
        <p className="text-[12px] text-text-light mt-6">
          Рекомендуемое разрешение: 1024px и выше
        </p>
      </div>
    </div>
  )
}

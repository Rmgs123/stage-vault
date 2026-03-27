import { useState, useEffect } from 'react'
import { Vault, Monitor, Smartphone, ExternalLink, ArrowRight } from 'lucide-react'

function App() {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#F3E4C9] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] bg-[#A98B76]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] bg-[#A98B76]/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[340px] text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-[#A98B76] rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(169,139,118,0.3)]">
            <Vault className="w-6 h-6 text-white" />
          </div>
          <span className="text-[26px] font-bold tracking-tight text-[#5C4A3A]" style={{ fontFamily: "'Georgia', serif" }}>
            StageVault
          </span>
        </div>

        {/* Illustration: phone crossed out, monitor check */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-2xl border-2 border-[#E8DDD3] flex items-center justify-center shadow-sm">
              <Smartphone className="w-9 h-9 text-[#D8CBBB]" />
            </div>
            {/* Cross */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[90px] h-[3px] bg-[#E74C3C]/70 rounded-full rotate-45" />
            </div>
          </div>

          <ArrowRight className="w-6 h-6 text-[#C4B5A6]" />

          <div className={`w-20 h-20 bg-white rounded-2xl border-2 border-[#A98B76]/30 flex items-center justify-center shadow-sm transition-all duration-1000 ${pulse ? 'shadow-[0_0_20px_rgba(169,139,118,0.2)]' : ''}`}>
            <Monitor className="w-9 h-9 text-[#A98B76]" />
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-6 shadow-[0_4px_20px_rgba(169,139,118,0.08)] mb-6">
          <h1 className="text-[20px] font-bold text-[#3D3127] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            Мобильная версия пока недоступна
          </h1>
          <p className="text-[14px] text-[#7A6A5C] leading-relaxed">
            StageVault пока не поддерживает мобильные устройства. Пожалуйста, откройте приложение на компьютере для полноценной работы.
          </p>
        </div>

        {/* Link */}
        <a
          href="https://stage-vault.ru"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#A98B76] hover:bg-[#96796A] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_12px_rgba(169,139,118,0.35)]"
        >
          <ExternalLink className="w-4 h-4" />
          Открыть stage-vault.ru
        </a>

        {/* Footer note */}
        <p className="text-[12px] text-[#B8A898] mt-8">
          Рекомендуемое разрешение: 1024px и выше
        </p>
      </div>
    </div>
  )
}

export default App

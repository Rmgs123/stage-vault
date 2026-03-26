import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Vault } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('register')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleTabLogin = () => {
    setActiveTab('login')
  }

  const handleTabRegister = () => {
    setActiveTab('register')
  }

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev)
  }

  const handleNicknameChange = (e) => {
    setNickname(e.target.value)
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen w-full bg-[#F3E4C9] flex items-center justify-center" style={{}}>
      <div className="flex flex-col items-center w-full max-w-[420px] px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#A98B76] rounded-xl flex items-center justify-center">
            <Vault className="w-5 h-5 text-white" />
          </div>
          <span className="text-[28px] font-bold tracking-tight text-[#5C4A3A]" style={{ fontFamily: "'Georgia', serif" }}>
            StageVault
          </span>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(169,139,118,0.12)] p-8">
          {/* Tab Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[#E8DDD3] mb-8">
            <button
              onClick={handleTabLogin}
              className={`flex-1 py-3 text-[15px] font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-[#A98B76] text-white'
                  : 'bg-[#FAF3EA] text-[#A98B76] hover:bg-[#F3E4C9]'
              }`}
            >
              Вход
            </button>
            <button
              onClick={handleTabRegister}
              className={`flex-1 py-3 text-[15px] font-semibold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-[#A98B76] text-white'
                  : 'bg-[#FAF3EA] text-[#A98B76] hover:bg-[#F3E4C9]'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {activeTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#7A6A5C]">Никнейм</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  placeholder="stage_master"
                  className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[15px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#7A6A5C]">Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[15px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#7A6A5C]">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Минимум 8 символов"
                  className="w-full px-4 py-3 pr-12 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[15px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8A898] hover:text-[#A98B76] transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#7A6A5C]">Подтвердите пароль</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Повторите пароль"
                    className="w-full px-4 py-3 pr-12 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[15px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={handleToggleConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8A898] hover:text-[#A98B76] transition-colors duration-150"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button" className="text-[13px] text-[#A98B76] hover:text-[#8B7261] font-medium transition-colors duration-150">
                  Забыли пароль?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#A98B76] hover:bg-[#96796A] text-white text-[15px] font-semibold rounded-xl transition-all duration-200 mt-1 shadow-[0_2px_8px_rgba(169,139,118,0.3)] hover:shadow-[0_4px_12px_rgba(169,139,118,0.4)]"
            >
              {activeTab === 'register' ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8DDD3]" />
            <span className="text-[12px] text-[#B8A898] uppercase tracking-wider font-medium">или</span>
            <div className="flex-1 h-px bg-[#E8DDD3]" />
          </div>

          {/* Guest Access */}
          <div className="text-center">
            <p className="text-[13px] text-[#9A8A7C] mb-2">Есть код доступа?</p>
            <button className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#A98B76] hover:text-[#8B7261] transition-colors duration-150 group">
              Войти по коду
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[12px] text-[#B8A898] mt-6 text-center">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  )
}

export default App

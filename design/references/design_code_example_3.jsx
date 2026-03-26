import { useState } from 'react'
import { Vault, Bell, ChevronDown, ArrowLeft, User, Moon, Sun, LogOut, Mail, AtSign, Lock, Eye, EyeOff, Camera, Check, Shield } from 'lucide-react'

function App() {
  const [nickname, setNickname] = useState('alexmorozov')
  const [nicknameEditing, setNicknameEditing] = useState(false)
  const [nicknameDraft, setNicknameDraft] = useState('alexmorozov')
  const [theme, setTheme] = useState('light')
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [nicknameSaved, setNicknameSaved] = useState(false)

  const handleNicknameDraftChange = (e) => { setNicknameDraft(e.target.value) }
  const handleStartEditNickname = () => { setNicknameEditing(true); setNicknameDraft(nickname); setNicknameSaved(false) }
  const handleCancelEditNickname = () => { setNicknameEditing(false); setNicknameDraft(nickname) }
  const handleSaveNickname = () => {
    setNickname(nicknameDraft)
    setNicknameEditing(false)
    setNicknameSaved(true)
    setTimeout(() => setNicknameSaved(false), 2500)
  }

  const handleToggleTheme = () => { setTheme(prev => prev === 'light' ? 'dark' : 'light') }

  const handleTogglePasswordSection = () => {
    setShowPasswordSection(prev => !prev)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaved(false)
  }

  const handleCurrentPasswordChange = (e) => { setCurrentPassword(e.target.value) }
  const handleNewPasswordChange = (e) => { setNewPassword(e.target.value) }
  const handleConfirmPasswordChange = (e) => { setConfirmPassword(e.target.value) }
  const handleToggleCurrentPw = () => { setShowCurrentPw(prev => !prev) }
  const handleToggleNewPw = () => { setShowNewPw(prev => !prev) }
  const handleToggleConfirmPw = () => { setShowConfirmPw(prev => !prev) }

  const handleSavePassword = (e) => {
    e.preventDefault()
    setPasswordSaved(true)
    setShowPasswordSection(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordSaved(false), 2500)
  }

  return (
    <div className="min-h-screen w-full bg-[#F3E4C9]">
      {/* TOP NAV BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8DDD3]">
        <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#A98B76] rounded-lg flex items-center justify-center">
              <Vault className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-[#5C4A3A]" style={{ fontFamily: "'Georgia', serif" }}>
              StageVault
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150">
              <Bell className="w-5 h-5 text-[#9A8A7C]" />
              <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl bg-[#FAF3EA]">
              <div className="w-8 h-8 bg-[#A98B76] rounded-lg flex items-center justify-center text-white text-[13px] font-bold">А</div>
              <span className="text-[14px] font-medium text-[#5C4A3A]">Алексей</span>
              <ChevronDown className="w-4 h-4 text-[#9A8A7C]" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[720px] mx-auto px-8 py-8">
        {/* Back Link */}
        <button className="flex items-center gap-2 text-[13px] font-medium text-[#A98B76] hover:text-[#8B7261] transition-colors duration-150 mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
          Назад к проектам
        </button>

        {/* Page Title */}
        <h1 className="text-[28px] font-bold text-[#3D3127] mb-8" style={{ fontFamily: "'Georgia', serif" }}>
          Профиль
        </h1>

        {/* Avatar & Name Card */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] p-8 mb-5">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-[#A98B76] rounded-2xl flex items-center justify-center text-white text-[36px] font-bold" style={{ fontFamily: "'Georgia', serif" }}>
                А
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#3D3127] mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                Алексей Морозов
              </h2>
              <p className="text-[14px] text-[#9A8A7C]">Участник с марта 2024</p>
            </div>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden mb-5">
          <div className="px-8 py-5 border-b border-[#F0EAE2]">
            <h3 className="text-[16px] font-semibold text-[#3D3127]">Данные аккаунта</h3>
          </div>

          {/* Email - read only */}
          <div className="px-8 py-5 border-b border-[#F0EAE2]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FAF3EA] rounded-xl flex items-center justify-center mt-0.5">
                  <Mail className="w-[18px] h-[18px] text-[#A98B76]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#9A8A7C] mb-1">Электронная почта</p>
                  <p className="text-[15px] text-[#3D3127]">alexey.morozov@gmail.com</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#C4B5A6] bg-[#FAF6F1] px-2.5 py-1 rounded-lg mt-1">только чтение</span>
            </div>
          </div>

          {/* Nickname - editable */}
          <div className="px-8 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-[#FAF3EA] rounded-xl flex items-center justify-center mt-0.5">
                  <AtSign className="w-[18px] h-[18px] text-[#A98B76]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#9A8A7C] mb-1">Никнейм</p>
                  {!nicknameEditing ? (
                    <div className="flex items-center gap-3">
                      <p className="text-[15px] text-[#3D3127]">@{nickname}</p>
                      {nicknameSaved && (
                        <span className="flex items-center gap-1 text-[12px] text-[#BABF94] font-medium">
                          <Check className="w-3.5 h-3.5" />
                          Сохранено
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="relative flex-1 max-w-[280px]">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#C4B5A6]">@</span>
                        <input
                          type="text"
                          value={nicknameDraft}
                          onChange={handleNicknameDraftChange}
                          className="w-full pl-8 pr-4 py-2.5 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                        />
                      </div>
                      <button onClick={handleSaveNickname} className="px-4 py-2.5 bg-[#A98B76] hover:bg-[#96796A] text-white text-[13px] font-semibold rounded-xl transition-all duration-200">
                        Сохранить
                      </button>
                      <button onClick={handleCancelEditNickname} className="px-4 py-2.5 bg-[#FAF3EA] hover:bg-[#F3E4C9] text-[#A98B76] text-[13px] font-semibold rounded-xl transition-all duration-200">
                        Отмена
                      </button>
                    </div>
                  )}
                  <p className="text-[12px] text-[#C4B5A6] mt-1.5">Виден участникам ваших проектов</p>
                </div>
              </div>
              {!nicknameEditing && (
                <button onClick={handleStartEditNickname} className="text-[13px] font-medium text-[#A98B76] hover:text-[#8B7261] transition-colors duration-150 mt-1">
                  Изменить
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden mb-5">
          <div className="px-8 py-5 border-b border-[#F0EAE2]">
            <h3 className="text-[16px] font-semibold text-[#3D3127]">Безопасность</h3>
          </div>

          <div className="px-8 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-[#FAF3EA] rounded-xl flex items-center justify-center mt-0.5">
                  <Lock className="w-[18px] h-[18px] text-[#A98B76]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[13px] font-medium text-[#9A8A7C] mb-0.5">Пароль</p>
                    {passwordSaved && (
                      <span className="flex items-center gap-1 text-[12px] text-[#BABF94] font-medium -mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                        Пароль обновлён
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] text-[#3D3127]">••••••••••</p>
                  <p className="text-[12px] text-[#C4B5A6] mt-1.5">Последнее изменение: 2 месяца назад</p>

                  {showPasswordSection && (
                    <form onSubmit={handleSavePassword} className="mt-5 flex flex-col gap-4 max-w-[360px]">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#7A6A5C]">Текущий пароль</label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={handleCurrentPasswordChange}
                            placeholder="Введите текущий пароль"
                            className="w-full px-4 py-2.5 pr-11 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                          />
                          <button type="button" onClick={handleToggleCurrentPw} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8A898] hover:text-[#A98B76] transition-colors duration-150">
                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#7A6A5C]">Новый пароль</label>
                        <div className="relative">
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            placeholder="Минимум 8 символов"
                            className="w-full px-4 py-2.5 pr-11 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                          />
                          <button type="button" onClick={handleToggleNewPw} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8A898] hover:text-[#A98B76] transition-colors duration-150">
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#7A6A5C]">Подтвердите пароль</label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            placeholder="Повторите новый пароль"
                            className="w-full px-4 py-2.5 pr-11 bg-[#FAF6F1] border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                          />
                          <button type="button" onClick={handleToggleConfirmPw} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8A898] hover:text-[#A98B76] transition-colors duration-150">
                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <button type="submit" className="px-5 py-2.5 bg-[#A98B76] hover:bg-[#96796A] text-white text-[13px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(169,139,118,0.3)]">
                          Сохранить пароль
                        </button>
                        <button type="button" onClick={handleTogglePasswordSection} className="px-5 py-2.5 bg-[#FAF3EA] hover:bg-[#F3E4C9] text-[#A98B76] text-[13px] font-semibold rounded-xl transition-all duration-200">
                          Отмена
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              {!showPasswordSection && (
                <button onClick={handleTogglePasswordSection} className="text-[13px] font-medium text-[#A98B76] hover:text-[#8B7261] transition-colors duration-150 mt-1">
                  Изменить
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden mb-5">
          <div className="px-8 py-5 border-b border-[#F0EAE2]">
            <h3 className="text-[16px] font-semibold text-[#3D3127]">Настройки</h3>
          </div>

          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#FAF3EA] rounded-xl flex items-center justify-center">
                  {theme === 'light' ? <Sun className="w-[18px] h-[18px] text-[#A98B76]" /> : <Moon className="w-[18px] h-[18px] text-[#A98B76]" />}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#9A8A7C] mb-0.5">Тема оформления</p>
                  <p className="text-[15px] text-[#3D3127]">{theme === 'light' ? 'Светлая' : 'Тёмная'}</p>
                </div>
              </div>
              <button
                onClick={handleToggleTheme}
                className="relative w-[52px] h-[28px] rounded-full transition-colors duration-300"
                style={{ backgroundColor: theme === 'dark' ? '#A98B76' : '#E8DDD3' }}
              >
                <div
                  className="absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-all duration-300"
                  style={{ left: theme === 'dark' ? '27px' : '3px' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden mb-8">
          <div className="px-8 py-5 border-b border-red-50">
            <h3 className="text-[16px] font-semibold text-red-600">Опасная зона</h3>
          </div>

          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-[18px] h-[18px] text-red-400" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[#3D3127]">Удалить аккаунт</p>
                  <p className="text-[12px] text-[#C4B5A6]">Все ваши проекты и данные будут удалены навсегда</p>
                </div>
              </div>
              <button className="px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[13px] font-semibold rounded-xl transition-all duration-200">
                Удалить
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

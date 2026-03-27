import { useState, useRef, useEffect } from 'react'
import { Vault, Bell, ChevronDown, ChevronLeft, User, Moon, LogOut, Plus, Clock, FolderOpen, Users, Settings, Search, Shield, Eye, Pencil, Crown, Trash2, Copy, RefreshCw, X, Check, Calendar, Image, ChevronRight, AlertTriangle, Key, Link2, Timer, Upload, MoreHorizontal, Sparkles, Send, Bot, Mail, UserPlus, UserMinus, ChevronUp } from 'lucide-react'

const TABS = [
  { id: 'files', label: 'Файлы', icon: FolderOpen },
  { id: 'timeline', label: 'Сценарий', icon: Clock },
  { id: 'team', label: 'Команда', icon: Users },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const TEAM_MEMBERS = [
  { id: 1, name: 'Алексей Морозов', nickname: '@alexmorozov', email: 'alex@mail.ru', role: 'owner', avatar: 'А', color: 'bg-[#A98B76]', joinedAt: '10 мая 2025' },
  { id: 2, name: 'Елена Соколова', nickname: '@esokolova', email: 'elena@gmail.com', role: 'editor', avatar: 'Е', color: 'bg-[#2D6A4F]', joinedAt: '11 мая 2025' },
  { id: 3, name: 'Олег Петров', nickname: '@olegpetrov', email: 'oleg@yandex.ru', role: 'editor', avatar: 'О', color: 'bg-[#7C3AED]', joinedAt: '12 мая 2025' },
  { id: 4, name: 'Анна Козлова', nickname: '@annakoz', email: 'anna@mail.ru', role: 'viewer', avatar: 'А', color: 'bg-[#E67E22]', joinedAt: '13 мая 2025' },
  { id: 5, name: 'Дмитрий Волков', nickname: '@dvolkov', email: 'dmitry@inbox.ru', role: 'viewer', avatar: 'Д', color: 'bg-[#2980B9]', joinedAt: '14 мая 2025' },
]

const ROLE_MAP = {
  owner: { label: 'Владелец', icon: Crown, bg: 'bg-[#A98B76]/10', text: 'text-[#A98B76]', border: 'border-[#A98B76]/20' },
  editor: { label: 'Редактор', icon: Pencil, bg: 'bg-[#7A8A50]/10', text: 'text-[#7A8A50]', border: 'border-[#7A8A50]/20' },
  viewer: { label: 'Зритель', icon: Eye, bg: 'bg-[#2980B9]/10', text: 'text-[#2980B9]', border: 'border-[#2980B9]/20' },
}

const SEARCH_RESULTS = [
  { id: 10, name: 'Мария Иванова', nickname: '@mivanova', email: 'maria@gmail.com', avatar: 'М', color: 'bg-[#E74C3C]' },
  { id: 11, name: 'Сергей Кузнецов', nickname: '@skuznetsov', email: 'sergey@yandex.ru', avatar: 'С', color: 'bg-[#3498DB]' },
]

function App() {
  const [activeTab, setActiveTab] = useState('team')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const [roleMenuOpen, setRoleMenuOpen] = useState(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [projectTitle, setProjectTitle] = useState('Корпоратив «Новый Год 2025»')
  const [projectDesc, setProjectDesc] = useState('Ежегодный корпоративный квиз для команды из 100+ человек. Формат: 3 раунда, музыкальная пауза, награждение.')
  const [projectDate, setProjectDate] = useState('2025-12-28')
  const [projectTime, setProjectTime] = useState('19:00')
  const [projectStatus, setProjectStatus] = useState('ready')
  const [accessCode, setAccessCode] = useState('XK7M2P')
  const [codeTTL, setCodeTTL] = useState('24')
  const [codeActive, setCodeActive] = useState(true)
  const [showGenerateCode, setShowGenerateCode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const profileRef = useRef(null)
  const inboxRef = useRef(null)
  const roleMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false)
      if (inboxRef.current && !inboxRef.current.contains(e.target)) setShowInbox(false)
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) setRoleMenuOpen(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleProfile = () => { setShowProfileMenu(prev => !prev) }
  const handleToggleInbox = () => { setShowInbox(prev => !prev) }
  const handleToggleInvite = () => { setShowInviteModal(prev => !prev); setInviteSearch(''); setShowSearchResults(false) }
  const handleInviteSearchChange = (e) => { setInviteSearch(e.target.value); setShowSearchResults(e.target.value.length > 1) }
  const handleToggleRoleMenu = (id) => { setRoleMenuOpen(prev => prev === id ? null : id) }
  const handleTitleChange = (e) => { setProjectTitle(e.target.value) }
  const handleDescChange = (e) => { setProjectDesc(e.target.value) }
  const handleDateChange = (e) => { setProjectDate(e.target.value) }
  const handleTimeChange = (e) => { setProjectTime(e.target.value) }
  const handleStatusChange = (e) => { setProjectStatus(e.target.value) }
  const handleTTLChange = (e) => { setCodeTTL(e.target.value) }
  const handleToggleDeleteConfirm = () => { setShowDeleteConfirm(prev => !prev) }

  const handleChangeRole = (memberId, newRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    setRoleMenuOpen(null)
  }

  const handleCopyCode = () => {
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleRevokeCode = () => { setCodeActive(false) }
  const handleGenerateCode = () => { setCodeActive(true); setAccessCode('T9R4WL'); setShowGenerateCode(false) }

  const handleTabFiles = () => { setActiveTab('files') }
  const handleTabTimeline = () => { setActiveTab('timeline') }
  const handleTabTeam = () => { setActiveTab('team') }
  const handleTabSettings = () => { setActiveTab('settings') }
  const tabHandlers = { files: handleTabFiles, timeline: handleTabTimeline, team: handleTabTeam, settings: handleTabSettings }

  return (
    <div className="min-h-screen w-full bg-[#F3E4C9] flex flex-col">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8DDD3]">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#A98B76] rounded-lg flex items-center justify-center">
              <Vault className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-[#5C4A3A]" style={{ fontFamily: "'Georgia', serif" }}>StageVault</span>
          </div>
          <div className="flex items-center gap-2">
            <div ref={inboxRef} className="relative">
              <button onClick={handleToggleInbox} className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150">
                <Bell className="w-5 h-5 text-[#9A8A7C]" />
                <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
              </button>
              {showInbox && (
                <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(169,139,118,0.18)] border border-[#E8DDD3] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E8DDD3]"><h3 className="text-[15px] font-semibold text-[#3D3127]">Уведомления</h3></div>
                  <div className="px-5 py-3.5 hover:bg-[#FAF6F1] transition-colors duration-150 border-l-[3px] border-[#A98B76] cursor-pointer">
                    <p className="text-[13px] text-[#3D3127]"><span className="font-semibold">Олег Петров</span> пригласил вас в проект</p>
                    <p className="text-[11px] text-[#B8A898] mt-1">2 часа назад</p>
                  </div>
                </div>
              )}
            </div>
            <div ref={profileRef} className="relative">
              <button onClick={handleToggleProfile} className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150">
                <div className="w-8 h-8 bg-[#A98B76] rounded-lg flex items-center justify-center text-white text-[13px] font-bold">А</div>
                <span className="text-[14px] font-medium text-[#5C4A3A]">Алексей</span>
                <ChevronDown className="w-4 h-4 text-[#9A8A7C]" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-[220px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(169,139,118,0.18)] border border-[#E8DDD3] overflow-hidden py-2">
                  <div className="px-4 py-3 border-b border-[#E8DDD3]">
                    <p className="text-[14px] font-semibold text-[#3D3127]">Алексей Морозов</p>
                    <p className="text-[12px] text-[#B8A898]">@alexmorozov</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#5C4A3A] hover:bg-[#FAF6F1] transition-colors duration-150"><User className="w-4 h-4 text-[#9A8A7C]" />Профиль</button>
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#5C4A3A] hover:bg-[#FAF6F1] transition-colors duration-150"><Moon className="w-4 h-4 text-[#9A8A7C]" />Тёмная тема</button>
                  </div>
                  <div className="border-t border-[#E8DDD3] pt-1">
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-red-500 hover:bg-red-50/50 transition-colors duration-150"><LogOut className="w-4 h-4" />Выйти</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PROJECT HEADER */}
      <div className="bg-white border-b border-[#E8DDD3]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150">
                <ChevronLeft className="w-5 h-5 text-[#9A8A7C]" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-[#3D3127]" style={{ fontFamily: "'Georgia', serif" }}>Корпоратив «Новый Год 2025»</h1>
                <p className="text-[13px] text-[#9A8A7C] mt-0.5">28 декабря 2025 · 34 файла · {members.length} участников</p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#BABF94]/20 text-[#7A8A50]">готов</span>
          </div>
          <div className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={tabHandlers[tab.id]} className={`flex items-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-t-xl transition-all duration-200 ${isActive ? 'bg-[#F3E4C9] text-[#3D3127] border-t-2 border-x border-t-[#A98B76] border-x-[#E8DDD3]' : 'text-[#9A8A7C] hover:text-[#5C4A3A] hover:bg-[#FAF6F1]'}`}>
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-8 py-6 overflow-y-auto">
        {activeTab === 'team' && (
          <div>
            {/* Team Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[20px] font-bold text-[#3D3127]" style={{ fontFamily: "'Georgia', serif" }}>Команда</h2>
                <p className="text-[13px] text-[#9A8A7C] mt-0.5">{members.length} участников</p>
              </div>
              <button onClick={handleToggleInvite} className="flex items-center gap-2 px-5 py-3 bg-[#A98B76] hover:bg-[#96796A] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(169,139,118,0.3)]">
                <UserPlus className="w-4 h-4" />Пригласить
              </button>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-[#E8DDD3] bg-[#FAF6F1]/50">
                <div className="col-span-5 text-[12px] font-semibold text-[#9A8A7C] uppercase tracking-wider">Участник</div>
                <div className="col-span-3 text-[12px] font-semibold text-[#9A8A7C] uppercase tracking-wider">Роль</div>
                <div className="col-span-2 text-[12px] font-semibold text-[#9A8A7C] uppercase tracking-wider">Добавлен</div>
                <div className="col-span-2 text-[12px] font-semibold text-[#9A8A7C] uppercase tracking-wider text-right">Действия</div>
              </div>

              {/* Members */}
              {members.map((member) => {
                const role = ROLE_MAP[member.role]
                const RoleIcon = role.icon
                return (
                  <div key={member.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#F0EAE2] last:border-0 hover:bg-[#FAF6F1]/30 transition-colors duration-150 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={`w-10 h-10 ${member.color} rounded-xl flex items-center justify-center text-white text-[14px] font-bold`}>{member.avatar}</div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#3D3127]">{member.name}</p>
                        <p className="text-[12px] text-[#B8A898]">{member.nickname} · {member.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3 relative" ref={roleMenuOpen === member.id ? roleMenuRef : null}>
                      <button
                        onClick={() => member.role !== 'owner' && handleToggleRoleMenu(member.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${role.bg} ${role.border} ${member.role === 'owner' ? 'cursor-default' : 'cursor-pointer hover:opacity-80'} transition-opacity`}
                      >
                        <RoleIcon className={`w-3.5 h-3.5 ${role.text}`} />
                        <span className={`text-[12px] font-semibold ${role.text}`}>{role.label}</span>
                        {member.role !== 'owner' && <ChevronDown className={`w-3 h-3 ${role.text}`} />}
                      </button>
                      {roleMenuOpen === member.id && (
                        <div className="absolute top-10 left-0 w-[180px] bg-white rounded-xl shadow-[0_8px_24px_rgba(169,139,118,0.15)] border border-[#E8DDD3] overflow-hidden py-1 z-20">
                          <button onClick={() => handleChangeRole(member.id, 'editor')} className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center gap-2 transition-colors duration-150 ${member.role === 'editor' ? 'bg-[#FAF3EA] font-semibold text-[#7A8A50]' : 'text-[#5C4A3A] hover:bg-[#FAF6F1]'}`}>
                            <Pencil className="w-3.5 h-3.5" />Редактор
                          </button>
                          <button onClick={() => handleChangeRole(member.id, 'viewer')} className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center gap-2 transition-colors duration-150 ${member.role === 'viewer' ? 'bg-[#FAF3EA] font-semibold text-[#2980B9]' : 'text-[#5C4A3A] hover:bg-[#FAF6F1]'}`}>
                            <Eye className="w-3.5 h-3.5" />Зритель
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="text-[13px] text-[#9A8A7C]">{member.joinedAt}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      {member.role !== 'owner' && (
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors duration-150">
                          <UserMinus className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Role Legend */}
            <div className="mt-4 flex items-center gap-6">
              {Object.entries(ROLE_MAP).map(([key, role]) => {
                const RIcon = role.icon
                return (
                  <div key={key} className="flex items-center gap-1.5 text-[12px] text-[#9A8A7C]">
                    <RIcon className={`w-3.5 h-3.5 ${role.text}`} />
                    <span><span className="font-medium">{role.label}</span> — {key === 'owner' ? 'полный доступ' : key === 'editor' ? 'файлы и сценарий' : 'только просмотр'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-[800px]">
            <h2 className="text-[20px] font-bold text-[#3D3127] mb-6" style={{ fontFamily: "'Georgia', serif" }}>Настройки проекта</h2>

            {/* General Info */}
            <div className="bg-white rounded-2xl border border-[#E8DDD3] p-6 mb-6">
              <h3 className="text-[15px] font-bold text-[#3D3127] mb-5">Основная информация</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Название мероприятия</label>
                  <input type="text" value={projectTitle} onChange={handleTitleChange} className="w-full px-4 py-3 bg-white border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Описание</label>
                  <textarea value={projectDesc} onChange={handleDescChange} rows={3} className="w-full px-4 py-3 bg-white border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Дата проведения</label>
                    <input type="date" value={projectDate} onChange={handleDateChange} className="w-full px-4 py-3 bg-white border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Время начала</label>
                    <input type="time" value={projectTime} onChange={handleTimeChange} className="w-full px-4 py-3 bg-white border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Статус проекта</label>
                  <select value={projectStatus} onChange={handleStatusChange} className="w-full px-4 py-3 bg-white border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200 appearance-none cursor-pointer">
                    <option value="draft">Черновик</option>
                    <option value="ready">Готов</option>
                    <option value="done">Завершён</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Обложка</label>
                  <div className="border-2 border-dashed border-[#D8CBBB] rounded-xl p-6 text-center hover:border-[#A98B76] transition-colors duration-200 cursor-pointer">
                    <Image className="w-8 h-8 text-[#C4B5A6] mx-auto mb-2" />
                    <p className="text-[13px] text-[#9A8A7C]">Нажмите или перетащите изображение</p>
                    <p className="text-[11px] text-[#C4B5A6] mt-1">JPG, PNG до 10 MB</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-6 py-3 bg-[#A98B76] hover:bg-[#96796A] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(169,139,118,0.3)]">Сохранить изменения</button>
              </div>
            </div>

            {/* Access Code */}
            <div className="bg-white rounded-2xl border border-[#E8DDD3] p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-[#A98B76]/10 rounded-xl flex items-center justify-center">
                  <Key className="w-[18px] h-[18px] text-[#A98B76]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#3D3127]">Код доступа для площадки</h3>
                  <p className="text-[12px] text-[#9A8A7C]">Позволяет войти в проект без авторизации на любом устройстве</p>
                </div>
              </div>

              {codeActive ? (
                <div>
                  <div className="bg-[#FAF6F1] rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] text-[#9A8A7C] font-medium">Текущий код</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#7A8A50] rounded-full" />
                        <span className="text-[12px] font-semibold text-[#7A8A50]">Активен</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {accessCode.split('').map((char, i) => (
                          <div key={i} className="w-11 h-14 bg-white rounded-xl border border-[#E8DDD3] flex items-center justify-center text-[22px] font-bold text-[#3D3127] shadow-sm">
                            {char}
                          </div>
                        ))}
                      </div>
                      <button onClick={handleCopyCode} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${codeCopied ? 'bg-[#7A8A50]/10 text-[#7A8A50]' : 'bg-[#A98B76]/10 text-[#A98B76] hover:bg-[#A98B76]/15'}`}>
                        {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {codeCopied ? 'Скопировано' : 'Копировать'}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#9A8A7C]">
                        <Timer className="w-3.5 h-3.5" />
                        Истекает через {codeTTL}ч
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#9A8A7C]">
                        <Link2 className="w-3.5 h-3.5" />
                        stage-vault.ru/go
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleRevokeCode} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-[13px] font-semibold rounded-xl transition-colors duration-150">
                      <X className="w-4 h-4" />Отозвать код
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF3EA] hover:bg-[#F0E6D5] text-[#A98B76] text-[13px] font-semibold rounded-xl transition-colors duration-150">
                      <RefreshCw className="w-4 h-4" />Сгенерировать новый
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-[#FAF6F1] rounded-xl p-5 mb-4 text-center">
                    <Key className="w-10 h-10 text-[#D8CBBB] mx-auto mb-2" />
                    <p className="text-[14px] text-[#5C4A3A] font-medium">Нет активного кода</p>
                    <p className="text-[12px] text-[#B8A898] mt-1">Сгенерируйте код, чтобы открыть доступ по ссылке stage-vault.ru/go</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-[#5C4A3A] mb-1">Срок действия (часы)</label>
                      <select value={codeTTL} onChange={handleTTLChange} className="px-3 py-2.5 bg-white border border-[#E8DDD3] rounded-xl text-[13px] text-[#3D3127] outline-none focus:border-[#A98B76] transition-all duration-200">
                        <option value="6">6 часов</option>
                        <option value="12">12 часов</option>
                        <option value="24">24 часа</option>
                        <option value="48">48 часов</option>
                        <option value="72">72 часа</option>
                      </select>
                    </div>
                    <button onClick={handleGenerateCode} className="flex items-center gap-2 px-5 py-2.5 bg-[#A98B76] hover:bg-[#96796A] text-white text-[13px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(169,139,118,0.3)] mt-5">
                      <Key className="w-4 h-4" />Сгенерировать код
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-[18px] h-[18px] text-red-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-red-600">Опасная зона</h3>
                  <p className="text-[12px] text-red-400">Необратимые действия</p>
                </div>
              </div>
              <div className="bg-red-50/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[#3D3127]">Удалить проект</p>
                  <p className="text-[12px] text-[#9A8A7C]">Все файлы, сценарий и данные команды будут удалены навсегда</p>
                </div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-red-500 font-medium">Вы уверены?</span>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors duration-150">Удалить</button>
                    <button onClick={handleToggleDeleteConfirm} className="px-4 py-2 bg-white border border-[#E8DDD3] text-[13px] text-[#5C4A3A] font-medium rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150">Отмена</button>
                  </div>
                ) : (
                  <button onClick={handleToggleDeleteConfirm} className="px-4 py-2.5 bg-white border border-red-200 text-red-500 text-[13px] font-semibold rounded-xl hover:bg-red-50 transition-colors duration-150">Удалить проект</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleToggleInvite} />
          <div className="relative bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] border border-[#E8DDD3] w-[480px] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E8DDD3] flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#3D3127]">Пригласить участника</h3>
              <button onClick={handleToggleInvite} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF3EA] transition-colors duration-150">
                <X className="w-4 h-4 text-[#9A8A7C]" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-[13px] font-medium text-[#5C4A3A] mb-2">Поиск по никнейму или email</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4B5A6]" />
                <input
                  type="text"
                  value={inviteSearch}
                  onChange={handleInviteSearchChange}
                  placeholder="@nickname или email..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8DDD3] rounded-xl text-[14px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
                />
              </div>

              {showSearchResults && (
                <div className="mt-3 border border-[#E8DDD3] rounded-xl overflow-hidden">
                  {SEARCH_RESULTS.map(user => (
                    <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#FAF6F1] transition-colors duration-150 cursor-pointer border-b border-[#F0EAE2] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${user.color} rounded-xl flex items-center justify-center text-white text-[13px] font-bold`}>{user.avatar}</div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#3D3127]">{user.name}</p>
                          <p className="text-[11px] text-[#B8A898]">{user.nickname} · {user.email}</p>
                        </div>
                      </div>
                      <button className="px-3.5 py-1.5 bg-[#A98B76] hover:bg-[#96796A] text-white text-[12px] font-semibold rounded-lg transition-colors duration-150">Пригласить</button>
                    </div>
                  ))}
                </div>
              )}

              {!showSearchResults && inviteSearch.length === 0 && (
                <div className="mt-4 text-center py-6">
                  <Search className="w-10 h-10 text-[#D8CBBB] mx-auto mb-2" />
                  <p className="text-[13px] text-[#9A8A7C]">Введите никнейм или email для поиска</p>
                  <p className="text-[11px] text-[#C4B5A6] mt-1">Приглашённый получит уведомление в приложении</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

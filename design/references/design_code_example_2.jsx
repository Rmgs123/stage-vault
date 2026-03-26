import { useState, useRef, useEffect } from 'react'
import { Vault, Bell, ChevronDown, Plus, Calendar, Users, MoreHorizontal, Search, LogOut, User, Moon, SlidersHorizontal, ArrowUpDown, FolderOpen } from 'lucide-react'

const EVENTS = [
  { id: 1, title: 'Корпоратив «Новый Год 2025»', date: '28 декабря 2025', status: 'ready', cover: 'https://images.unsplash.com/photo-1732809180359-e28ecccd7560?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxuZXclMjB5ZWFyJTIwY29ycG9yYXRlJTIwcGFydHklMjBjZWxlYnJhdGlvbnxlbnwwfHx8fDE3NzQ1MzEzOTZ8MA&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Owner', members: 12, files: 34 },
  { id: 2, title: 'IT-Конференция TechWave', date: '15 марта 2025', status: 'draft', cover: 'https://images.unsplash.com/photo-1560439514-07abbb294a86?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHN0YWdlJTIwc3BlYWtlcnN8ZW58MHx8fHwxNzc0NTMxMzk1fDA&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Owner', members: 5, files: 8 },
  { id: 3, title: 'Выпускной вечер 2025', date: '22 июня 2025', status: 'done', cover: 'https://images.unsplash.com/photo-1757143137392-0b1e1a27a7de?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnklMjBldmVuaW5nJTIwY2VsZWJyYXRpb258ZW58MHx8fHwxNzc0NTMxMzk1fDA&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Owner', members: 8, files: 21 },
  { id: 4, title: 'Презентация продукта Skyline', date: '10 апреля 2025', status: 'ready', cover: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwbGF1bmNoJTIwcHJlc2VudGF0aW9uJTIwbW9kZXJufGVufDB8fHx8MTc3NDUzMTM5NXww&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Owner', members: 4, files: 15 },
  { id: 5, title: 'Свадьба Алексея и Марии', date: '18 августа 2025', status: 'draft', cover: 'https://images.unsplash.com/photo-1767986012547-3fc29b18339f?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMHJlY2VwdGlvbiUyMGZsb3dlcnN8ZW58MHx8fHwxNzc0NTMxMzk1fDA&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Editor', members: 3, files: 6 },
  { id: 6, title: 'Фестиваль уличной музыки', date: '5 июля 2025', status: 'draft', cover: 'https://images.unsplash.com/photo-1768327509856-e37983da0706?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwc3RyZWV0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMHN1bW1lcnxlbnwwfHx8fDE3NzQ1MzEzOTV8MA&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Viewer', members: 15, files: 42 },
  { id: 7, title: 'Благотворительный гала-ужин', date: '3 ноября 2025', status: 'ready', cover: 'https://images.unsplash.com/photo-1768508947362-bca7a379e62a?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwZ2FsYSUyMGRpbm5lciUyMGVsZWdhbnQlMjBldmVuaW5nfGVufDB8fHx8MTc3NDUzMTM5NXww&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Editor', members: 7, files: 19 },
  { id: 8, title: 'День рождения компании — 10 лет', date: '12 сентября 2025', status: 'done', cover: 'https://images.unsplash.com/photo-1733515371242-2c7f8255fde6?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwYW5uaXZlcnNhcnklMjBiaXJ0aGRheSUyMGNlbGVicmF0aW9ufGVufDB8fHx8MTc3NDUzMTM5Nnww&ixlib=rb-4.1.0&w=400&h=220&fit=crop', role: 'Owner', members: 20, files: 56 },
]

const STATUS_MAP = {
  draft: { label: 'черновик', bg: 'bg-[#E8DDD3]', text: 'text-[#9A8A7C]' },
  ready: { label: 'готов', bg: 'bg-[#BABF94]/20', text: 'text-[#7A8A50]' },
  done: { label: 'завершён', bg: 'bg-[#A98B76]/15', text: 'text-[#A98B76]' },
}

function App() {
  const [activeFilter, setActiveFilter] = useState('mine')
  const [sortBy, setSortBy] = useState('date')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const sortRef = useRef(null)
  const profileRef = useRef(null)
  const inboxRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false)
      if (inboxRef.current && !inboxRef.current.contains(e.target)) setShowInbox(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFilterMine = () => { setActiveFilter('mine') }
  const handleFilterParticipating = () => { setActiveFilter('participating') }
  const handleToggleSort = () => { setShowSortMenu(prev => !prev) }
  const handleSortDate = () => { setSortBy('date'); setShowSortMenu(false) }
  const handleSortName = () => { setSortBy('name'); setShowSortMenu(false) }
  const handleToggleProfile = () => { setShowProfileMenu(prev => !prev) }
  const handleToggleInbox = () => { setShowInbox(prev => !prev) }
  const handleSearchChange = (e) => { setSearchQuery(e.target.value) }

  const filteredEvents = EVENTS.filter(ev => {
    const matchesFilter = activeFilter === 'mine' ? ev.role === 'Owner' : ev.role !== 'Owner'
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title, 'ru')
    return 0
  })

  return (
    <div className="min-h-screen w-full bg-[#F3E4C9]">
      {/* TOP NAV BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8DDD3]">
        <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#A98B76] rounded-lg flex items-center justify-center">
              <Vault className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-[#5C4A3A]" style={{ fontFamily: "'Georgia', serif" }}>
              StageVault
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Inbox */}
            <div ref={inboxRef} className="relative">
              <button
                onClick={handleToggleInbox}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150"
              >
                <Bell className="w-5 h-5 text-[#9A8A7C]" />
                <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {showInbox && (
                <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(169,139,118,0.18)] border border-[#E8DDD3] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E8DDD3] flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-[#3D3127]">Уведомления</h3>
                    <span className="text-[12px] text-[#A98B76] font-medium cursor-pointer hover:text-[#8B7261] transition-colors duration-150">Прочитать все</span>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    <div className="px-5 py-3.5 hover:bg-[#FAF6F1] transition-colors duration-150 border-l-[3px] border-[#A98B76] cursor-pointer">
                      <p className="text-[13px] text-[#3D3127]"><span className="font-semibold">Олег Петров</span> пригласил вас в проект</p>
                      <p className="text-[13px] font-medium text-[#A98B76]">Фестиваль уличной музыки</p>
                      <p className="text-[11px] text-[#B8A898] mt-1">2 часа назад</p>
                    </div>
                    <div className="px-5 py-3.5 hover:bg-[#FAF6F1] transition-colors duration-150 border-l-[3px] border-[#BABF94] cursor-pointer">
                      <p className="text-[13px] text-[#3D3127]">Ваша роль изменена на <span className="font-semibold">Редактор</span></p>
                      <p className="text-[13px] font-medium text-[#A98B76]">Благотворительный гала-ужин</p>
                      <p className="text-[11px] text-[#B8A898] mt-1">вчера</p>
                    </div>
                    <div className="px-5 py-3.5 hover:bg-[#FAF6F1] transition-colors duration-150 border-l-[3px] border-transparent cursor-pointer opacity-60">
                      <p className="text-[13px] text-[#3D3127]"><span className="font-semibold">Анна Козлова</span> пригласила вас в проект</p>
                      <p className="text-[13px] font-medium text-[#A98B76]">Свадьба Алексея и Марии</p>
                      <p className="text-[11px] text-[#B8A898] mt-1">3 дня назад</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={handleToggleProfile}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150"
              >
                <div className="w-8 h-8 bg-[#A98B76] rounded-lg flex items-center justify-center text-white text-[13px] font-bold">
                  А
                </div>
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
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#5C4A3A] hover:bg-[#FAF6F1] transition-colors duration-150">
                      <User className="w-4 h-4 text-[#9A8A7C]" />
                      Профиль
                    </button>
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#5C4A3A] hover:bg-[#FAF6F1] transition-colors duration-150">
                      <Moon className="w-4 h-4 text-[#9A8A7C]" />
                      Тёмная тема
                    </button>
                  </div>
                  <div className="border-t border-[#E8DDD3] pt-1">
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-red-500 hover:bg-red-50/50 transition-colors duration-150">
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1280px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#3D3127] mb-1" style={{ fontFamily: "'Georgia', serif" }}>
              Мои мероприятия
            </h1>
            <p className="text-[14px] text-[#9A8A7C]">
              {sortedEvents.length} {sortedEvents.length === 1 ? 'проект' : 'проектов'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#A98B76] hover:bg-[#96796A] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(169,139,118,0.3)] hover:shadow-[0_4px_12px_rgba(169,139,118,0.4)]">
            <Plus className="w-4 h-4" />
            Создать проект
          </button>
        </div>

        {/* Toolbar: Filters + Search + Sort */}
        <div className="flex items-center gap-4 mb-6">
          {/* Filter Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-[#E8DDD3]">
            <button
              onClick={handleFilterMine}
              className={`px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                activeFilter === 'mine'
                  ? 'bg-[#A98B76] text-white'
                  : 'bg-white text-[#A98B76] hover:bg-[#FAF3EA]'
              }`}
            >
              Мои
            </button>
            <button
              onClick={handleFilterParticipating}
              className={`px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                activeFilter === 'participating'
                  ? 'bg-[#A98B76] text-white'
                  : 'bg-white text-[#A98B76] hover:bg-[#FAF3EA]'
              }`}
            >
              Участвую
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4B5A6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск проектов..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DDD3] rounded-xl text-[13px] text-[#3D3127] placeholder-[#C4B5A6] outline-none focus:border-[#A98B76] focus:ring-2 focus:ring-[#A98B76]/10 transition-all duration-200"
            />
          </div>

          <div className="flex-1" />

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={handleToggleSort}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DDD3] rounded-xl text-[13px] text-[#7A6A5C] hover:border-[#A98B76] transition-all duration-200"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#9A8A7C]" />
              {sortBy === 'date' ? 'По дате' : 'По названию'}
              <ChevronDown className="w-3.5 h-3.5 text-[#9A8A7C]" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-11 w-[180px] bg-white rounded-xl shadow-[0_8px_24px_rgba(169,139,118,0.15)] border border-[#E8DDD3] overflow-hidden py-1">
                <button
                  onClick={handleSortDate}
                  className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${sortBy === 'date' ? 'bg-[#FAF3EA] text-[#A98B76] font-semibold' : 'text-[#5C4A3A] hover:bg-[#FAF6F1]'}`}
                >
                  По дате
                </button>
                <button
                  onClick={handleSortName}
                  className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${sortBy === 'name' ? 'bg-[#FAF3EA] text-[#A98B76] font-semibold' : 'text-[#5C4A3A] hover:bg-[#FAF6F1]'}`}
                >
                  По названию
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Event Cards Grid */}
        {sortedEvents.length > 0 ? (
          <div className="grid grid-cols-3 gap-5">
            {sortedEvents.map((event) => {
              const status = STATUS_MAP[event.status]
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden cursor-pointer hover:shadow-[0_8px_24px_rgba(169,139,118,0.12)] hover:border-[#BFA28C] transition-all duration-200 group"
                >
                  {/* Cover */}
                  <div className="relative h-[160px] bg-[#FAF3EA] overflow-hidden">
                    <img
                      src={event.cover}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${status.bg} ${status.text} backdrop-blur-sm`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-[15px] font-semibold text-[#3D3127] mb-1.5 line-clamp-1 group-hover:text-[#A98B76] transition-colors duration-200">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#9A8A7C] mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-[#F0EAE2]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#B8A898]">
                          <Users className="w-3.5 h-3.5" />
                          {event.members}
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#B8A898]">
                          <FolderOpen className="w-3.5 h-3.5" />
                          {event.files}
                        </div>
                      </div>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FAF3EA] transition-colors duration-150 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4 text-[#9A8A7C]" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-[#FAF3EA] rounded-3xl flex items-center justify-center mb-5">
              <FolderOpen className="w-9 h-9 text-[#C4B5A6]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#5C4A3A] mb-2" style={{ fontFamily: "'Georgia', serif" }}>
              {activeFilter === 'mine' ? 'У вас пока нет проектов' : 'Вы ещё не участвуете в проектах'}
            </h3>
            <p className="text-[14px] text-[#B8A898] mb-6 text-center max-w-[320px]">
              {activeFilter === 'mine'
                ? 'Создайте свой первый проект, чтобы начать работу'
                : 'Когда вас пригласят в проект, он появится здесь'
              }
            </p>
            {activeFilter === 'mine' && (
              <button className="flex items-center gap-2 px-5 py-3 bg-[#A98B76] hover:bg-[#96796A] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(169,139,118,0.3)]">
                <Plus className="w-4 h-4" />
                Создать проект
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

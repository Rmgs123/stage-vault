import { useState, useRef, useEffect } from 'react'
import { Vault, Bell, ChevronDown, ChevronLeft, ChevronRight, User, Moon, LogOut, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Trash2, Download, MoreHorizontal, Music, Image, FileText, Film, File, Presentation, Search, GripVertical, Plus, Sparkles, Send, X, Maximize2, Eye, Pencil, Clock, FolderOpen, Users, Bot, Paperclip, ChevronUp } from 'lucide-react'

const TABS = [
  { id: 'files', label: 'Файлы', icon: FolderOpen },
  { id: 'timeline', label: 'Сценарий', icon: Clock },
  { id: 'team', label: 'Команда', icon: Users },
]

const MUSIC_FILES = [
  { id: 1, name: 'Вступительная музыка.mp3', size: '4.2 MB', duration: '3:24', added: '12 мая 2025' },
  { id: 2, name: 'Фоновый джаз — раунд 1.mp3', size: '6.8 MB', duration: '5:12', added: '12 мая 2025' },
  { id: 3, name: 'Энергичный трек — финал.wav', size: '12.1 MB', duration: '4:05', added: '13 мая 2025' },
  { id: 4, name: 'Аплодисменты — эффект.ogg', size: '0.8 MB', duration: '0:08', added: '13 мая 2025' },
  { id: 5, name: 'Фанфары — победитель.mp3', size: '1.2 MB', duration: '0:15', added: '14 мая 2025' },
]

const PRESENTATION_FILES = [
  { id: 1, name: 'Вопросы — Раунд 1.pptx', size: '8.4 MB', slides: 24, added: '12 мая 2025' },
  { id: 2, name: 'Вопросы — Раунд 2.pdf', size: '3.1 MB', slides: 18, added: '13 мая 2025' },
  { id: 3, name: 'Финальная презентация.pptx', size: '15.2 MB', slides: 42, added: '14 мая 2025' },
]

const IMAGE_FILES = [
  { id: 1, name: 'Логотип мероприятия.png', size: '0.5 MB', dimensions: '1920×1080', added: '10 мая 2025' },
  { id: 2, name: 'Фон для проектора.jpg', size: '2.1 MB', dimensions: '3840×2160', added: '10 мая 2025' },
  { id: 3, name: 'QR-код регистрации.svg', size: '0.1 MB', dimensions: 'Vector', added: '11 мая 2025' },
]

const DOC_FILES = [
  { id: 1, name: 'Сценарий мероприятия.md', size: '0.3 MB', added: '11 мая 2025' },
  { id: 2, name: 'Список участников.txt', size: '0.1 MB', added: '12 мая 2025' },
]

const OTHER_FILES = [
  { id: 1, name: 'Шрифт Montserrat.zip', size: '2.8 MB', added: '10 мая 2025' },
]

function App() {
  const [activeTab, setActiveTab] = useState('files')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(35)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const [showInbox, setShowInbox] = useState(false)

  const profileRef = useRef(null)
  const inboxRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false)
      if (inboxRef.current && !inboxRef.current.contains(e.target)) setShowInbox(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTogglePlay = () => { setIsPlaying(prev => !prev) }
  const handlePrevTrack = () => { setCurrentTrack(prev => Math.max(0, prev - 1)) }
  const handleNextTrack = () => { setCurrentTrack(prev => Math.min(MUSIC_FILES.length - 1, prev + 1)) }
  const handleToggleMute = () => { setIsMuted(prev => !prev) }
  const handleToggleProfile = () => { setShowProfileMenu(prev => !prev) }
  const handleToggleInbox = () => { setShowInbox(prev => !prev) }
  const handleToggleAI = () => { setShowAI(prev => !prev) }
  const handleToggleLive = () => { setIsLiveMode(prev => !prev) }
  const handleAiMessageChange = (e) => { setAiMessage(e.target.value) }
  const handleVolumeChange = (e) => { setVolume(Number(e.target.value)) }
  const handleProgressChange = (e) => { setProgress(Number(e.target.value)) }

  const handleDragEnter = (zone) => { setDragOver(zone) }
  const handleDragLeave = () => { setDragOver(null) }
  const handleDrop = () => { setDragOver(null) }

  const handleTabFiles = () => { setActiveTab('files') }
  const handleTabTimeline = () => { setActiveTab('timeline') }
  const handleTabTeam = () => { setActiveTab('team') }
  const tabHandlers = { files: handleTabFiles, timeline: handleTabTimeline, team: handleTabTeam }

  const currentSong = MUSIC_FILES[currentTrack]

  return (
    <div className="min-h-screen w-full bg-[#F3E4C9] flex flex-col">
      {/* TOP NAV BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8DDD3]">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#A98B76] rounded-lg flex items-center justify-center">
              <Vault className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-[#5C4A3A]" style={{ fontFamily: "'Georgia', serif" }}>
              StageVault
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Mode Toggle */}
            <button
              onClick={handleToggleLive}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                isLiveMode
                  ? 'bg-[#E74C3C] text-white shadow-[0_2px_12px_rgba(231,76,60,0.3)]'
                  : 'bg-white border border-[#E8DDD3] text-[#9A8A7C] hover:border-[#A98B76]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-white animate-pulse' : 'bg-[#C4B5A6]'}`} />
              {isLiveMode ? 'На площадке' : 'Режим площадки'}
            </button>

            <div ref={inboxRef} className="relative">
              <button onClick={handleToggleInbox} className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#FAF3EA] transition-colors duration-150">
                <Bell className="w-5 h-5 text-[#9A8A7C]" />
                <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
              </button>
              {showInbox && (
                <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(169,139,118,0.18)] border border-[#E8DDD3] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E8DDD3] flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-[#3D3127]">Уведомления</h3>
                    <span className="text-[12px] text-[#A98B76] font-medium cursor-pointer hover:text-[#8B7261] transition-colors duration-150">Прочитать все</span>
                  </div>
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
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#5C4A3A] hover:bg-[#FAF6F1] transition-colors duration-150">
                      <User className="w-4 h-4 text-[#9A8A7C]" />Профиль
                    </button>
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#5C4A3A] hover:bg-[#FAF6F1] transition-colors duration-150">
                      <Moon className="w-4 h-4 text-[#9A8A7C]" />Тёмная тема
                    </button>
                  </div>
                  <div className="border-t border-[#E8DDD3] pt-1">
                    <button className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-red-500 hover:bg-red-50/50 transition-colors duration-150">
                      <LogOut className="w-4 h-4" />Выйти
                    </button>
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
                <h1 className="text-[22px] font-bold text-[#3D3127]" style={{ fontFamily: "'Georgia', serif" }}>
                  Корпоратив «Новый Год 2025»
                </h1>
                <p className="text-[13px] text-[#9A8A7C] mt-0.5">28 декабря 2025 · 34 файла · 12 участников</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#BABF94]/20 text-[#7A8A50]">готов</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={tabHandlers[tab.id]}
                  className={`flex items-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-t-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#F3E4C9] text-[#3D3127] border-t-2 border-x border-t-[#A98B76] border-x-[#E8DDD3]'
                      : 'text-[#9A8A7C] hover:text-[#5C4A3A] hover:bg-[#FAF6F1]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex">
        <div className="flex-1 max-w-[1400px] mx-auto px-8 py-6 overflow-y-auto">
          {/* Upload Area — only in edit mode */}
          {!isLiveMode && (
            <div
              onDragEnter={() => handleDragEnter('main')}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`mb-6 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                dragOver === 'main' ? 'border-[#A98B76] bg-[#A98B76]/5' : 'border-[#D8CBBB] bg-white/40'
              }`}
            >
              <Upload className="w-8 h-8 text-[#B8A898] mx-auto mb-2" />
              <p className="text-[14px] font-medium text-[#5C4A3A]">Перетащите файлы или нажмите для загрузки</p>
              <p className="text-[12px] text-[#B8A898] mt-1">До 500 MB на файл · Использовано 48.3 MB из 5 GB</p>
            </div>
          )}

          {/* MUSIC SECTION */}
          <div className="mb-6">
            <div className="bg-[#1B4332]/[0.06] rounded-2xl border border-[#1B4332]/10 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2D6A4F] rounded-xl flex items-center justify-center">
                    <Music className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#1B4332]">Музыка</h2>
                    <p className="text-[12px] text-[#52796F]">{MUSIC_FILES.length} файлов · 25.1 MB</p>
                  </div>
                </div>
                {!isLiveMode && (
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/15 text-[#2D6A4F] text-[12px] font-semibold rounded-xl transition-colors duration-150">
                    <Plus className="w-3.5 h-3.5" />Добавить
                  </button>
                )}
              </div>

              {/* Audio Player */}
              <div className="mx-5 mb-4 bg-[#1B4332] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevTrack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150">
                      <SkipBack className="w-4 h-4 text-white/70" />
                    </button>
                    <button onClick={handleTogglePlay} className="w-10 h-10 bg-[#40916C] hover:bg-[#52B788] rounded-full flex items-center justify-center transition-colors duration-150">
                      {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                    </button>
                    <button onClick={handleNextTrack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150">
                      <SkipForward className="w-4 h-4 text-white/70" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-white truncate max-w-[240px]">{currentSong.name}</span>
                      <span className="text-[11px] text-white/50">1:12 / {currentSong.duration}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#52B788]"
                    />
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={handleToggleMute} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150">
                      {isMuted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/60" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#52B788]"
                    />
                  </div>
                </div>
              </div>

              {/* Track List */}
              <div className="px-5 pb-4">
                {MUSIC_FILES.map((file, idx) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 ${
                      idx === currentTrack ? 'bg-[#2D6A4F]/10' : 'hover:bg-[#2D6A4F]/5'
                    } cursor-pointer group`}
                  >
                    {!isLiveMode && <GripVertical className="w-3.5 h-3.5 text-[#52796F]/30 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    <div className="w-7 h-7 flex items-center justify-center">
                      {idx === currentTrack && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-3.5">
                          <div className="w-[3px] bg-[#2D6A4F] rounded-full animate-pulse" style={{ height: '60%' }} />
                          <div className="w-[3px] bg-[#2D6A4F] rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
                          <div className="w-[3px] bg-[#2D6A4F] rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }} />
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#52796F]/60 font-medium">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] truncate ${idx === currentTrack ? 'text-[#1B4332] font-semibold' : 'text-[#2D6A4F]'}`}>{file.name}</p>
                    </div>
                    <span className="text-[12px] text-[#52796F]/60 tabular-nums">{file.duration}</span>
                    <span className="text-[11px] text-[#52796F]/40">{file.size}</span>
                    {!isLiveMode && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#2D6A4F]/10"><Download className="w-3 h-3 text-[#52796F]" /></button>
                        <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRESENTATIONS SECTION */}
          <div className="mb-6">
            <div className="bg-[#7C3AED]/[0.04] rounded-2xl border border-[#7C3AED]/10 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#7C3AED] rounded-xl flex items-center justify-center">
                    <Presentation className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#4C1D95]">Презентации</h2>
                    <p className="text-[12px] text-[#7C3AED]/60">{PRESENTATION_FILES.length} файла · 26.7 MB</p>
                  </div>
                </div>
                {!isLiveMode && (
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 text-[#7C3AED] text-[12px] font-semibold rounded-xl transition-colors duration-150">
                    <Plus className="w-3.5 h-3.5" />Добавить
                  </button>
                )}
              </div>
              <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                {PRESENTATION_FILES.map((file) => (
                  <div key={file.id} className="bg-white rounded-xl border border-[#7C3AED]/10 p-4 hover:shadow-[0_4px_16px_rgba(124,58,237,0.08)] transition-all duration-200 group cursor-pointer">
                    <div className="w-full h-24 bg-[#7C3AED]/5 rounded-lg mb-3 flex items-center justify-center relative">
                      <Presentation className="w-8 h-8 text-[#7C3AED]/30" />
                      <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                        <Maximize2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                      </button>
                    </div>
                    <p className="text-[13px] font-medium text-[#3D3127] truncate mb-1">{file.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9A8A7C]">{file.slides} слайдов · {file.size}</span>
                      {!isLiveMode && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#7C3AED]/10"><Download className="w-3 h-3 text-[#7C3AED]/60" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* IMAGES SECTION */}
          <div className="mb-6">
            <div className="bg-[#E67E22]/[0.04] rounded-2xl border border-[#E67E22]/10 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#E67E22] rounded-xl flex items-center justify-center">
                    <Image className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#A0522D]">Изображения</h2>
                    <p className="text-[12px] text-[#E67E22]/60">{IMAGE_FILES.length} файла · 2.7 MB</p>
                  </div>
                </div>
                {!isLiveMode && (
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E67E22]/10 hover:bg-[#E67E22]/15 text-[#E67E22] text-[12px] font-semibold rounded-xl transition-colors duration-150">
                    <Plus className="w-3.5 h-3.5" />Добавить
                  </button>
                )}
              </div>
              <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                {IMAGE_FILES.map((file) => (
                  <div key={file.id} className="bg-white rounded-xl border border-[#E67E22]/10 p-4 hover:shadow-[0_4px_16px_rgba(230,126,34,0.08)] transition-all duration-200 group cursor-pointer">
                    <div className="w-full h-24 bg-[#E67E22]/5 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <Image className="w-8 h-8 text-[#E67E22]/30" />
                      <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                        <Eye className="w-3.5 h-3.5 text-[#E67E22]" />
                      </button>
                    </div>
                    <p className="text-[13px] font-medium text-[#3D3127] truncate mb-1">{file.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9A8A7C]">{file.dimensions} · {file.size}</span>
                      {!isLiveMode && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#E67E22]/10"><Download className="w-3 h-3 text-[#E67E22]/60" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DOCUMENTS SECTION */}
          <div className="mb-6">
            <div className="bg-[#2980B9]/[0.04] rounded-2xl border border-[#2980B9]/10 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2980B9] rounded-xl flex items-center justify-center">
                    <FileText className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#1A5276]">Документы</h2>
                    <p className="text-[12px] text-[#2980B9]/60">{DOC_FILES.length} файла · 0.4 MB</p>
                  </div>
                </div>
                {!isLiveMode && (
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2980B9]/10 hover:bg-[#2980B9]/15 text-[#2980B9] text-[12px] font-semibold rounded-xl transition-colors duration-150">
                    <Plus className="w-3.5 h-3.5" />Добавить
                  </button>
                )}
              </div>
              <div className="px-5 pb-4 space-y-2">
                {DOC_FILES.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#2980B9]/10 hover:shadow-sm transition-all duration-200 group cursor-pointer">
                    <FileText className="w-5 h-5 text-[#2980B9]/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#3D3127] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#9A8A7C]">{file.size} · {file.added}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2980B9]/10 opacity-0 group-hover:opacity-100 transition-all"><Eye className="w-3.5 h-3.5 text-[#2980B9]/60" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2980B9]/10 opacity-0 group-hover:opacity-100 transition-all"><Download className="w-3.5 h-3.5 text-[#2980B9]/60" /></button>
                      {!isLiveMode && (
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OTHER FILES SECTION */}
          <div className="mb-6">
            <div className="bg-[#9A8A7C]/[0.06] rounded-2xl border border-[#9A8A7C]/15 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#9A8A7C] rounded-xl flex items-center justify-center">
                    <File className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-[#5C4A3A]">Прочее</h2>
                    <p className="text-[12px] text-[#9A8A7C]">{OTHER_FILES.length} файл · 2.8 MB</p>
                  </div>
                </div>
                {!isLiveMode && (
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#9A8A7C]/10 hover:bg-[#9A8A7C]/15 text-[#9A8A7C] text-[12px] font-semibold rounded-xl transition-colors duration-150">
                    <Plus className="w-3.5 h-3.5" />Добавить
                  </button>
                )}
              </div>
              <div className="px-5 pb-4 space-y-2">
                {OTHER_FILES.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#9A8A7C]/10 hover:shadow-sm transition-all duration-200 group cursor-pointer">
                    <File className="w-5 h-5 text-[#9A8A7C]/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#3D3127] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#9A8A7C]">{file.size} · {file.added}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#9A8A7C]/10 opacity-0 group-hover:opacity-100 transition-all"><Download className="w-3.5 h-3.5 text-[#9A8A7C]" /></button>
                      {!isLiveMode && (
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI CHAT PANEL */}
        {!isLiveMode && showAI && (
          <div className="w-[360px] border-l border-[#E8DDD3] bg-white flex flex-col">
            <div className="px-5 py-4 border-b border-[#E8DDD3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#3D3127]">ИИ-ассистент</h3>
                  <p className="text-[11px] text-[#B8A898]">Анализ контента проекта</p>
                </div>
              </div>
              <button onClick={handleToggleAI} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FAF3EA] transition-colors duration-150">
                <X className="w-4 h-4 text-[#9A8A7C]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-[#FAF6F1] rounded-2xl rounded-tl-md px-4 py-3 max-w-[260px]">
                  <p className="text-[13px] text-[#3D3127] leading-relaxed">Привет! Я ваш ИИ-ассистент. Я вижу все файлы и сценарий проекта. Задайте вопрос — например, «Сколько слайдов в презентациях?» или «Есть ли дубликаты?»</p>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end">
                <div className="bg-[#A98B76] rounded-2xl rounded-tr-md px-4 py-3 max-w-[260px]">
                  <p className="text-[13px] text-white leading-relaxed">Проверь, достаточно ли музыки на 2 часа мероприятия</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-[#FAF6F1] rounded-2xl rounded-tl-md px-4 py-3 max-w-[260px]">
                  <p className="text-[13px] text-[#3D3127] leading-relaxed">У вас 5 аудиофайлов общей длительностью ~13 минут. Для 2-часового мероприятия рекомендую добавить ещё 1.5–2 часа фоновой музыки.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E8DDD3]">
              <div className="flex items-center gap-2 bg-[#FAF6F1] rounded-xl px-4 py-3">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={handleAiMessageChange}
                  placeholder="Задайте вопрос..."
                  className="flex-1 bg-transparent text-[13px] text-[#3D3127] placeholder-[#C4B5A6] outline-none"
                />
                <button className="w-8 h-8 bg-[#A98B76] hover:bg-[#96796A] rounded-lg flex items-center justify-center transition-colors duration-150">
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI FAB — only in edit mode */}
      {!isLiveMode && !showAI && (
        <button
          onClick={handleToggleAI}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(169,139,118,0.35)] hover:shadow-[0_8px_30px_rgba(169,139,118,0.45)] transition-all duration-200 hover:scale-105 z-40"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  )
}

export default App

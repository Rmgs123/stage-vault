import { useState, useRef, useEffect } from 'react'
import { Vault, Bell, ChevronDown, ChevronLeft, User, Moon, LogOut, Play, Pause, RotateCcw, Plus, Sparkles, Send, X, GripVertical, Clock, FolderOpen, Users, Bot, Check, Trash2, Pencil, Music, Presentation, Image, FileText, Paperclip, ChevronUp, Timer, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const TABS = [
  { id: 'files', label: 'Файлы', icon: FolderOpen },
  { id: 'timeline', label: 'Сценарий', icon: Clock },
  { id: 'team', label: 'Команда', icon: Users },
]

const TIMELINE_BLOCKS = [
  {
    id: 1, title: 'Встреча гостей', description: 'Фоновая музыка, регистрация, рассадка участников. Проверить проектор и звук.',
    duration: 15, completed: true, timerRunning: false, timerLeft: 0,
    attachments: [
      { id: 'a1', name: 'Фоновый джаз — раунд 1.mp3', type: 'music' },
    ]
  },
  {
    id: 2, title: 'Вступительное слово', description: 'Приветствие ведущего, объяснение формата и правил. Представить команду организаторов.',
    duration: 5, completed: true, timerRunning: false, timerLeft: 0,
    attachments: [
      { id: 'a2', name: 'Вступительная музыка.mp3', type: 'music' },
    ]
  },
  {
    id: 3, title: 'Раунд 1 — Общие знания', description: 'Классический формат: 10 вопросов по 30 секунд. Ведущий зачитывает вопросы, команды записывают ответы.',
    duration: 20, completed: false, timerRunning: true, timerLeft: 847,
    attachments: [
      { id: 'a3', name: 'Вопросы — Раунд 1.pptx', type: 'presentation' },
      { id: 'a4', name: 'Фоновый джаз — раунд 1.mp3', type: 'music' },
    ]
  },
  {
    id: 4, title: 'Музыкальная пауза', description: 'Сбор бланков ответов, подсчёт результатов первого раунда. Лёгкая музыка.',
    duration: 10, completed: false, timerRunning: false, timerLeft: 600,
    attachments: [
      { id: 'a5', name: 'Энергичный трек — финал.wav', type: 'music' },
    ]
  },
  {
    id: 5, title: 'Раунд 2 — Аудио-вопросы', description: 'Угадай мелодию: фрагменты песен и звуков. 8 вопросов.',
    duration: 15, completed: false, timerRunning: false, timerLeft: 900,
    attachments: [
      { id: 'a6', name: 'Вопросы — Раунд 2.pdf', type: 'presentation' },
    ]
  },
  {
    id: 6, title: 'Подведение итогов', description: 'Объявление результатов, награждение победителей. Общее фото.',
    duration: 10, completed: false, timerRunning: false, timerLeft: 600,
    attachments: [
      { id: 'a7', name: 'Фанфары — победитель.mp3', type: 'music' },
      { id: 'a8', name: 'Финальная презентация.pptx', type: 'presentation' },
    ]
  },
  {
    id: 7, title: 'Свободное общение', description: 'Фоновая музыка, напитки, общение участников. Нетворкинг.',
    duration: 30, completed: false, timerRunning: false, timerLeft: 1800,
    attachments: [
      { id: 'a9', name: 'Фоновый джаз — раунд 1.mp3', type: 'music' },
    ]
  },
]

const ATTACHMENT_ICON = {
  music: Music,
  presentation: Presentation,
  image: Image,
  document: FileText,
}
const ATTACHMENT_COLOR = {
  music: { bg: 'bg-[#2D6A4F]/10', text: 'text-[#2D6A4F]', icon: 'text-[#2D6A4F]' },
  presentation: { bg: 'bg-[#7C3AED]/10', text: 'text-[#7C3AED]', icon: 'text-[#7C3AED]' },
  image: { bg: 'bg-[#E67E22]/10', text: 'text-[#E67E22]', icon: 'text-[#E67E22]' },
  document: { bg: 'bg-[#2980B9]/10', text: 'text-[#2980B9]', icon: 'text-[#2980B9]' },
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function App() {
  const [activeTab, setActiveTab] = useState('timeline')
  const [blocks, setBlocks] = useState(TIMELINE_BLOCKS)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [showAddBlock, setShowAddBlock] = useState(false)
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

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prev => prev.map(b => {
        if (b.timerRunning && b.timerLeft > 0) {
          return { ...b, timerLeft: b.timerLeft - 1 }
        }
        if (b.timerRunning && b.timerLeft <= 0) {
          return { ...b, timerRunning: false }
        }
        return b
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const completedCount = blocks.filter(b => b.completed).length
  const totalDuration = blocks.reduce((sum, b) => sum + b.duration, 0)
  const completedDuration = blocks.filter(b => b.completed).reduce((sum, b) => sum + b.duration, 0)
  const progressPercent = Math.round((completedCount / blocks.length) * 100)

  const handleToggleProfile = () => { setShowProfileMenu(prev => !prev) }
  const handleToggleInbox = () => { setShowInbox(prev => !prev) }
  const handleToggleAI = () => { setShowAI(prev => !prev) }
  const handleToggleLive = () => { setIsLiveMode(prev => !prev) }
  const handleAiMessageChange = (e) => { setAiMessage(e.target.value) }

  const handleToggleComplete = (id) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b))
  }
  const handleToggleTimer = (id) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, timerRunning: !b.timerRunning } : b))
  }
  const handleResetTimer = (id) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, timerRunning: false, timerLeft: b.duration * 60 } : b))
  }
  const handleToggleAddBlock = () => { setShowAddBlock(prev => !prev) }

  const handleTabFiles = () => { setActiveTab('files') }
  const handleTabTimeline = () => { setActiveTab('timeline') }
  const handleTabTeam = () => { setActiveTab('team') }
  const tabHandlers = { files: handleTabFiles, timeline: handleTabTimeline, team: handleTabTeam }

  const activeBlock = blocks.find(b => b.timerRunning)

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
                  <div className="px-5 py-4 border-b border-[#E8DDD3]">
                    <h3 className="text-[15px] font-semibold text-[#3D3127]">Уведомления</h3>
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
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-[16px] font-bold text-[#3D3127]">Ход мероприятия</h2>
                {activeBlock && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E74C3C]/10 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-[#E74C3C] rounded-full animate-pulse" />
                    <span className="text-[12px] font-semibold text-[#E74C3C]">Идёт: {activeBlock.title}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#9A8A7C]">
                  <span className="font-semibold text-[#3D3127]">{completedCount}</span> из {blocks.length} блоков
                </span>
                <span className="text-[13px] text-[#9A8A7C]">
                  <span className="font-semibold text-[#3D3127]">{completedDuration}</span> из {totalDuration} мин
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-[#E8DDD3] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A98B76] to-[#7A8A50] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-[#B8A898]">{progressPercent}% выполнено</span>
              <span className="text-[11px] text-[#B8A898]">~{totalDuration - completedDuration} мин осталось</span>
            </div>
          </div>

          {/* Timeline Blocks */}
          <div className="space-y-3">
            {blocks.map((block, idx) => {
              const isCurrent = block.timerRunning
              const isComplete = block.completed
              const timerPercent = block.duration > 0 ? Math.round(((block.duration * 60 - block.timerLeft) / (block.duration * 60)) * 100) : 0

              return (
                <div
                  key={block.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                    isCurrent
                      ? 'border-[#A98B76] shadow-[0_4px_20px_rgba(169,139,118,0.15)] ring-1 ring-[#A98B76]/20'
                      : isComplete
                        ? 'border-[#E8DDD3] opacity-60'
                        : 'border-[#E8DDD3] hover:border-[#D8CBBB]'
                  }`}
                >
                  {/* Timer progress bar for active block */}
                  {isCurrent && (
                    <div className="w-full h-1 bg-[#E8DDD3]">
                      <div className="h-full bg-[#A98B76] transition-all duration-1000" style={{ width: `${timerPercent}%` }} />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Drag handle + Checkbox */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {!isLiveMode && (
                          <GripVertical className="w-4 h-4 text-[#D8CBBB] cursor-grab" />
                        )}
                        <button
                          onClick={() => handleToggleComplete(block.id)}
                          className="transition-colors duration-150"
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-[#7A8A50]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#D8CBBB] hover:text-[#A98B76]" />
                          )}
                        </button>
                      </div>

                      {/* Block number */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 ${
                        isCurrent ? 'bg-[#A98B76] text-white' : isComplete ? 'bg-[#E8DDD3] text-[#B8A898]' : 'bg-[#FAF3EA] text-[#A98B76]'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`text-[15px] font-semibold mb-1 ${isComplete ? 'text-[#B8A898] line-through' : 'text-[#3D3127]'}`}>
                              {block.title}
                            </h3>
                            <p className={`text-[13px] leading-relaxed mb-3 ${isComplete ? 'text-[#C4B5A6]' : 'text-[#7A6A5C]'}`}>
                              {block.description}
                            </p>

                            {/* Attachments */}
                            {block.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {block.attachments.map(att => {
                                  const Icon = ATTACHMENT_ICON[att.type] || FileText
                                  const colors = ATTACHMENT_COLOR[att.type] || ATTACHMENT_COLOR.document
                                  return (
                                    <div key={att.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 ${colors.bg} rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}>
                                      <Icon className={`w-3 h-3 ${colors.icon}`} />
                                      <span className={`text-[11px] font-medium ${colors.text} truncate max-w-[160px]`}>{att.name}</span>
                                    </div>
                                  )
                                })}
                                {!isLiveMode && (
                                  <button className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-[#D8CBBB] rounded-lg text-[11px] text-[#B8A898] hover:border-[#A98B76] hover:text-[#A98B76] transition-colors duration-150">
                                    <Paperclip className="w-3 h-3" />
                                    Файл
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Timer & Actions */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Duration badge */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF3EA] rounded-lg">
                              <Timer className="w-3.5 h-3.5 text-[#A98B76]" />
                              <span className="text-[12px] font-semibold text-[#A98B76]">{block.duration} мин</span>
                            </div>

                            {/* Timer display */}
                            {(isCurrent || block.timerLeft !== block.duration * 60) && (
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                isCurrent ? 'bg-[#A98B76] text-white' : 'bg-[#E8DDD3] text-[#9A8A7C]'
                              }`}>
                                <span className="text-[14px] font-bold tabular-nums">{formatTime(block.timerLeft)}</span>
                              </div>
                            )}

                            {/* Timer controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleTimer(block.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                                  isCurrent ? 'bg-[#A98B76]/10 hover:bg-[#A98B76]/20' : 'hover:bg-[#FAF3EA]'
                                }`}
                              >
                                {isCurrent ? (
                                  <Pause className="w-3.5 h-3.5 text-[#A98B76]" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 text-[#9A8A7C] ml-0.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleResetTimer(block.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FAF3EA] transition-colors duration-150"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-[#9A8A7C]" />
                              </button>
                            </div>

                            {/* Edit/Delete — edit mode only */}
                            {!isLiveMode && (
                              <div className="flex items-center gap-1 border-l border-[#E8DDD3] pl-3 ml-1">
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FAF3EA] transition-colors duration-150">
                                  <Pencil className="w-3.5 h-3.5 text-[#9A8A7C]" />
                                </button>
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors duration-150">
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add Block Button — edit mode */}
            {!isLiveMode && (
              <button
                onClick={handleToggleAddBlock}
                className="w-full py-4 border-2 border-dashed border-[#D8CBBB] rounded-2xl text-[14px] font-medium text-[#A98B76] hover:border-[#A98B76] hover:bg-[#A98B76]/5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить блок
              </button>
            )}
          </div>
        </div>

        {/* AI CHAT PANEL */}
        {!isLiveMode && showAI && (
          <div className="w-[360px] border-l border-[#E8DDD3] bg-white flex flex-col shrink-0">
            <div className="px-5 py-4 border-b border-[#E8DDD3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#3D3127]">ИИ-ассистент</h3>
                  <p className="text-[11px] text-[#B8A898]">Анализ сценария</p>
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
                  <p className="text-[13px] text-[#3D3127] leading-relaxed">Я вижу ваш сценарий из 7 блоков на 105 минут. Могу проверить тайминги, найти проблемы или предложить улучшения.</p>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end">
                <div className="bg-[#A98B76] rounded-2xl rounded-tr-md px-4 py-3 max-w-[260px]">
                  <p className="text-[13px] text-white leading-relaxed">Проверь, все ли блоки имеют прикреплённые файлы</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-[#FAF6F1] rounded-2xl rounded-tl-md px-4 py-3 max-w-[260px]">
                  <p className="text-[13px] text-[#3D3127] leading-relaxed">Все 7 блоков имеют хотя бы один файл. Но обратите внимание: «Встреча гостей» использует тот же трек, что и «Свободное общение». Рекомендую добавить разнообразие.</p>
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 bg-[#E67E22]/10 rounded-lg">
                    <AlertCircle className="w-3 h-3 text-[#E67E22]" />
                    <span className="text-[11px] font-medium text-[#E67E22]">Дублирующийся трек в блоках 1 и 7</span>
                  </div>
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

      {/* AI FAB */}
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

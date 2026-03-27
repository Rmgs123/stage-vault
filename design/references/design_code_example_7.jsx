import { useState, useRef, useEffect } from 'react'
import { Vault, Bell, ChevronDown, ChevronLeft, ChevronRight, User, Moon, LogOut, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Clock, Check, Circle, CheckCircle2, Timer, Music, Presentation, Image, FileText, File, FolderOpen, Sparkles, Send, Bot, X, PanelRightOpen, PanelRightClose, RotateCcw, Download, AlertCircle, Mic, Headphones, Eye } from 'lucide-react'

const TIMELINE_BLOCKS = [
  { id: 1, title: 'Встреча гостей', duration: 15, completed: true, timerLeft: 0, description: 'Фоновая музыка, регистрация' },
  { id: 2, title: 'Вступительное слово', duration: 5, completed: true, timerLeft: 0, description: 'Приветствие ведущего' },
  { id: 3, title: 'Раунд 1 — Общие знания', duration: 20, completed: false, timerLeft: 847, active: true, description: '10 вопросов по 30 секунд' },
  { id: 4, title: 'Музыкальная пауза', duration: 10, completed: false, timerLeft: 600, description: 'Подсчёт результатов' },
  { id: 5, title: 'Раунд 2 — Аудио', duration: 15, completed: false, timerLeft: 900, description: 'Угадай мелодию' },
  { id: 6, title: 'Подведение итогов', duration: 10, completed: false, timerLeft: 600, description: 'Награждение' },
  { id: 7, title: 'Свободное общение', duration: 30, completed: false, timerLeft: 1800, description: 'Нетворкинг' },
]

const MUSIC_FILES = [
  { id: 1, name: 'Вступительная музыка.mp3', duration: '3:24' },
  { id: 2, name: 'Фоновый джаз — раунд 1.mp3', duration: '5:12' },
  { id: 3, name: 'Энергичный трек — финал.wav', duration: '4:05' },
  { id: 4, name: 'Аплодисменты — эффект.ogg', duration: '0:08' },
  { id: 5, name: 'Фанфары — победитель.mp3', duration: '0:15' },
]

const PROJECT_FILES = {
  music: [
    { name: 'Вступительная музыка.mp3', size: '4.2 MB' },
    { name: 'Фоновый джаз.mp3', size: '6.8 MB' },
    { name: 'Энергичный трек.wav', size: '12.1 MB' },
  ],
  presentations: [
    { name: 'Раунд 1.pptx', size: '8.4 MB' },
    { name: 'Раунд 2.pdf', size: '3.1 MB' },
    { name: 'Финальная.pptx', size: '15.2 MB' },
  ],
  images: [
    { name: 'Логотип.png', size: '0.5 MB' },
    { name: 'Фон проектора.jpg', size: '2.1 MB' },
  ],
  documents: [
    { name: 'Сценарий.md', size: '0.3 MB' },
    { name: 'Участники.txt', size: '0.1 MB' },
  ],
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function App() {
  const [blocks, setBlocks] = useState(TIMELINE_BLOCKS)
  const [currentSlide, setCurrentSlide] = useState(4)
  const [totalSlides] = useState(24)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTrack, setCurrentTrack] = useState(1)
  const [progress, setProgress] = useState(42)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [rightPanel, setRightPanel] = useState('files')
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const completedCount = blocks.filter(b => b.completed).length
  const progressPercent = Math.round((completedCount / blocks.length) * 100)
  const activeBlock = blocks.find(b => b.active)
  const currentSong = MUSIC_FILES[currentTrack]

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prev => prev.map(b => {
        if (b.active && b.timerLeft > 0) return { ...b, timerLeft: b.timerLeft - 1 }
        return b
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleComplete = (id) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b))
  }
  const handleSetActive = (id) => {
    setBlocks(prev => prev.map(b => ({ ...b, active: b.id === id })))
  }
  const handleResetTimer = (id) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, timerLeft: b.duration * 60 } : b))
  }
  const handlePrevSlide = () => { setCurrentSlide(prev => Math.max(1, prev - 1)) }
  const handleNextSlide = () => { setCurrentSlide(prev => Math.min(totalSlides, prev + 1)) }
  const handleTogglePlay = () => { setIsPlaying(prev => !prev) }
  const handlePrevTrack = () => { setCurrentTrack(prev => Math.max(0, prev - 1)) }
  const handleNextTrack = () => { setCurrentTrack(prev => Math.min(MUSIC_FILES.length - 1, prev + 1)) }
  const handleToggleMute = () => { setIsMuted(prev => !prev) }
  const handleVolumeChange = (e) => { setVolume(Number(e.target.value)) }
  const handleProgressChange = (e) => { setProgress(Number(e.target.value)) }
  const handleToggleRightPanel = () => { setShowRightPanel(prev => !prev) }
  const handleShowFiles = () => { setRightPanel('files'); setShowRightPanel(true) }
  const handleShowAI = () => { setRightPanel('ai'); setShowRightPanel(true) }
  const handleAiMessageChange = (e) => { setAiMessage(e.target.value) }
  const handleToggleFullscreen = () => { setIsFullscreen(prev => !prev) }

  return (
    <div className="h-screen w-full bg-[#1A1611] flex flex-col overflow-hidden">
      {/* PRESENTER TOP BAR */}
      <header className="h-12 bg-[#231E18] border-b border-[#3A3228] flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#A98B76] rounded-md flex items-center justify-center">
            <Vault className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-bold text-[#E8DDD3]" style={{ fontFamily: "'Georgia', serif" }}>StageVault</span>
          <div className="w-px h-5 bg-[#3A3228] mx-1" />
          <span className="text-[13px] text-[#9A8A7C] font-medium">Корпоратив «Новый Год 2025»</span>
          <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-[#E74C3C]/15 rounded-md">
            <div className="w-1.5 h-1.5 bg-[#E74C3C] rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-[#E74C3C] uppercase tracking-wider">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#2D2620] rounded-lg">
            <Clock className="w-3.5 h-3.5 text-[#9A8A7C]" />
            <span className="text-[13px] text-[#E8DDD3] font-medium tabular-nums">{progressPercent}%</span>
            <div className="w-24 h-1.5 bg-[#3A3228] rounded-full overflow-hidden">
              <div className="h-full bg-[#A98B76] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[11px] text-[#7A6A5C]">{completedCount}/{blocks.length}</span>
          </div>
          <button onClick={handleShowFiles} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${rightPanel === 'files' && showRightPanel ? 'bg-[#A98B76]/20 text-[#A98B76]' : 'hover:bg-[#2D2620] text-[#7A6A5C]'}`}>
            <FolderOpen className="w-4 h-4" />
          </button>
          <button onClick={handleShowAI} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${rightPanel === 'ai' && showRightPanel ? 'bg-[#A98B76]/20 text-[#A98B76]' : 'hover:bg-[#2D2620] text-[#7A6A5C]'}`}>
            <Sparkles className="w-4 h-4" />
          </button>
          {showRightPanel && (
            <button onClick={handleToggleRightPanel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2D2620] text-[#7A6A5C] transition-colors duration-150">
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
          <div className="w-px h-5 bg-[#3A3228] mx-1" />
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#2D2620] transition-colors duration-150">
            <div className="w-6 h-6 bg-[#A98B76] rounded-md flex items-center justify-center text-white text-[11px] font-bold">А</div>
            <span className="text-[13px] text-[#E8DDD3]">Алексей</span>
          </button>
        </div>
      </header>

      {/* MAIN PRESENTER LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — TIMELINE */}
        <div className="w-[320px] bg-[#231E18] border-r border-[#3A3228] flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-[#3A3228] flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-[#E8DDD3]">Сценарий</h2>
            <span className="text-[11px] text-[#7A6A5C]">{completedCount} из {blocks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {blocks.map((block, idx) => {
              const isCurrent = block.active
              const isDone = block.completed
              return (
                <div
                  key={block.id}
                  onClick={() => handleSetActive(block.id)}
                  className={`mx-2 mb-1 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? 'bg-[#A98B76]/15 border border-[#A98B76]/30'
                      : isDone
                        ? 'opacity-50 hover:opacity-70'
                        : 'hover:bg-[#2D2620]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleComplete(block.id) }}
                      className="mt-0.5 shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#7A8A50]" />
                      ) : (
                        <Circle className={`w-4.5 h-4.5 ${isCurrent ? 'text-[#A98B76]' : 'text-[#3A3228]'}`} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isCurrent ? 'bg-[#A98B76] text-white' : 'bg-[#2D2620] text-[#7A6A5C]'}`}>{idx + 1}</span>
                        <h3 className={`text-[13px] font-semibold truncate ${isDone ? 'text-[#7A6A5C] line-through' : isCurrent ? 'text-[#E8DDD3]' : 'text-[#C4B5A6]'}`}>{block.title}</h3>
                      </div>
                      <p className={`text-[11px] truncate ${isDone ? 'text-[#5A4F44]' : 'text-[#7A6A5C]'}`}>{block.description}</p>
                      {isCurrent && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#A98B76]/20 rounded-lg">
                            <Timer className="w-3 h-3 text-[#A98B76]" />
                            <span className="text-[13px] font-bold text-[#A98B76] tabular-nums">{formatTime(block.timerLeft)}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleResetTimer(block.id) }}
                            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[#A98B76]/10 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-[#7A6A5C]" />
                          </button>
                          <div className="flex-1 h-1 bg-[#3A3228] rounded-full overflow-hidden">
                            <div className="h-full bg-[#A98B76] rounded-full transition-all duration-1000" style={{ width: `${Math.round(((block.duration * 60 - block.timerLeft) / (block.duration * 60)) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      {!isCurrent && (
                        <div className="flex items-center gap-1 mt-1">
                          <Timer className="w-3 h-3 text-[#5A4F44]" />
                          <span className="text-[11px] text-[#5A4F44]">{block.duration} мин</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CENTER — CONTENT VIEWER */}
        <div className="flex-1 flex flex-col bg-[#1A1611]">
          {/* Slide Area */}
          <div className="flex-1 flex items-center justify-center relative p-6">
            {/* Slide */}
            <div className="w-full max-w-[900px] aspect-video bg-[#231E18] rounded-2xl border border-[#3A3228] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
              {/* Fake slide content */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D2620] to-[#1A1611]" />
              <div className="relative z-10 text-center px-16">
                <div className="w-16 h-16 bg-[#A98B76]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Presentation className="w-8 h-8 text-[#A98B76]" />
                </div>
                <h2 className="text-[28px] font-bold text-[#E8DDD3] mb-3" style={{ fontFamily: "'Georgia', serif" }}>Вопрос №4</h2>
                <p className="text-[18px] text-[#9A8A7C] leading-relaxed">В каком году был основан первый университет в России?</p>
                <div className="mt-8 grid grid-cols-2 gap-3 max-w-[500px] mx-auto">
                  <div className="px-5 py-3.5 bg-[#A98B76]/10 border border-[#A98B76]/20 rounded-xl text-[15px] text-[#E8DDD3] font-medium">А) 1724</div>
                  <div className="px-5 py-3.5 bg-[#A98B76]/10 border border-[#A98B76]/20 rounded-xl text-[15px] text-[#E8DDD3] font-medium">Б) 1755</div>
                  <div className="px-5 py-3.5 bg-[#A98B76]/10 border border-[#A98B76]/20 rounded-xl text-[15px] text-[#E8DDD3] font-medium">В) 1687</div>
                  <div className="px-5 py-3.5 bg-[#A98B76]/10 border border-[#A98B76]/20 rounded-xl text-[15px] text-[#E8DDD3] font-medium">Г) 1803</div>
                </div>
              </div>

              {/* Fullscreen button */}
              <button
                onClick={handleToggleFullscreen}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors duration-150 z-20"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
              </button>

              {/* Slide indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg z-20">
                <span className="text-[12px] text-white/80 font-medium tabular-nums">{currentSlide} / {totalSlides}</span>
              </div>
            </div>

            {/* Slide Navigation */}
            <button onClick={handlePrevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#231E18] hover:bg-[#2D2620] border border-[#3A3228] rounded-xl flex items-center justify-center transition-colors duration-150">
              <ChevronLeft className="w-6 h-6 text-[#9A8A7C]" />
            </button>
            <button onClick={handleNextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#231E18] hover:bg-[#2D2620] border border-[#3A3228] rounded-xl flex items-center justify-center transition-colors duration-150">
              <ChevronRight className="w-6 h-6 text-[#9A8A7C]" />
            </button>
          </div>

          {/* Active Block Info Bar */}
          {activeBlock && (
            <div className="mx-6 mb-3 px-4 py-2.5 bg-[#231E18] border border-[#3A3228] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#A98B76] uppercase tracking-wider">Сейчас</span>
                <span className="text-[14px] font-semibold text-[#E8DDD3]">{activeBlock.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#9A8A7C]">Слайд {currentSlide} из {totalSlides}</span>
                <span className="text-[13px] font-bold text-[#A98B76] tabular-nums">{formatTime(activeBlock.timerLeft)}</span>
              </div>
            </div>
          )}

          {/* BOTTOM — AUDIO PLAYER */}
          <div className="h-[72px] bg-[#231E18] border-t border-[#3A3228] flex items-center px-5 gap-4 shrink-0">
            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <button onClick={handlePrevTrack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#2D2620] transition-colors duration-150">
                <SkipBack className="w-4 h-4 text-[#9A8A7C]" />
              </button>
              <button onClick={handleTogglePlay} className="w-11 h-11 bg-[#A98B76] hover:bg-[#96796A] rounded-full flex items-center justify-center transition-colors duration-150">
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
              <button onClick={handleNextTrack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#2D2620] transition-colors duration-150">
                <SkipForward className="w-4 h-4 text-[#9A8A7C]" />
              </button>
            </div>

            {/* Track Info & Progress */}
            <div className="flex-1 mx-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-[#A98B76]" />
                  <span className="text-[13px] font-medium text-[#E8DDD3] truncate max-w-[260px]">{currentSong.name}</span>
                </div>
                <span className="text-[11px] text-[#7A6A5C] tabular-nums">2:11 / {currentSong.duration}</span>
              </div>
              <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange} className="w-full h-1 bg-[#3A3228] rounded-full appearance-none cursor-pointer accent-[#A98B76]" />
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={handleToggleMute} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2D2620] transition-colors duration-150">
                {isMuted ? <VolumeX className="w-4 h-4 text-[#7A6A5C]" /> : <Volume2 className="w-4 h-4 text-[#9A8A7C]" />}
              </button>
              <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 bg-[#3A3228] rounded-full appearance-none cursor-pointer accent-[#A98B76]" />
            </div>

            {/* Playlist indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D2620] rounded-lg ml-2">
              <Music className="w-3.5 h-3.5 text-[#7A6A5C]" />
              <span className="text-[11px] text-[#7A6A5C] font-medium">{currentTrack + 1}/{MUSIC_FILES.length}</span>
            </div>
          </div>
        </div>

        {/* RIGHT — COLLAPSIBLE PANEL */}
        {showRightPanel && (
          <div className="w-[320px] bg-[#231E18] border-l border-[#3A3228] flex flex-col shrink-0">
            {/* Panel Tabs */}
            <div className="flex border-b border-[#3A3228]">
              <button onClick={handleShowFiles} className={`flex-1 py-3 text-[12px] font-semibold text-center transition-colors duration-150 ${rightPanel === 'files' ? 'text-[#A98B76] border-b-2 border-[#A98B76]' : 'text-[#7A6A5C] hover:text-[#9A8A7C]'}`}>
                <FolderOpen className="w-4 h-4 mx-auto mb-0.5" />Файлы
              </button>
              <button onClick={handleShowAI} className={`flex-1 py-3 text-[12px] font-semibold text-center transition-colors duration-150 ${rightPanel === 'ai' ? 'text-[#A98B76] border-b-2 border-[#A98B76]' : 'text-[#7A6A5C] hover:text-[#9A8A7C]'}`}>
                <Sparkles className="w-4 h-4 mx-auto mb-0.5" />ИИ
              </button>
            </div>

            {rightPanel === 'files' && (
              <div className="flex-1 overflow-y-auto py-3">
                {/* Music */}
                <div className="px-3 mb-4">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Music className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span className="text-[12px] font-bold text-[#9A8A7C] uppercase tracking-wider">Музыка</span>
                    <span className="text-[10px] text-[#5A4F44]">{PROJECT_FILES.music.length}</span>
                  </div>
                  {PROJECT_FILES.music.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#2D2620] transition-colors cursor-pointer group">
                      <div className="w-7 h-7 bg-[#2D6A4F]/15 rounded-md flex items-center justify-center">
                        <Music className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#C4B5A6] truncate">{f.name}</p>
                        <p className="text-[10px] text-[#5A4F44]">{f.size}</p>
                      </div>
                      <button className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#2D6A4F]/15 transition-all">
                        <Play className="w-3 h-3 text-[#2D6A4F] ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Presentations */}
                <div className="px-3 mb-4">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Presentation className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span className="text-[12px] font-bold text-[#9A8A7C] uppercase tracking-wider">Презентации</span>
                    <span className="text-[10px] text-[#5A4F44]">{PROJECT_FILES.presentations.length}</span>
                  </div>
                  {PROJECT_FILES.presentations.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#2D2620] transition-colors cursor-pointer group">
                      <div className="w-7 h-7 bg-[#7C3AED]/15 rounded-md flex items-center justify-center">
                        <Presentation className="w-3.5 h-3.5 text-[#7C3AED]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#C4B5A6] truncate">{f.name}</p>
                        <p className="text-[10px] text-[#5A4F44]">{f.size}</p>
                      </div>
                      <button className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#7C3AED]/15 transition-all">
                        <Eye className="w-3 h-3 text-[#7C3AED]" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Images */}
                <div className="px-3 mb-4">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Image className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span className="text-[12px] font-bold text-[#9A8A7C] uppercase tracking-wider">Изображения</span>
                    <span className="text-[10px] text-[#5A4F44]">{PROJECT_FILES.images.length}</span>
                  </div>
                  {PROJECT_FILES.images.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#2D2620] transition-colors cursor-pointer group">
                      <div className="w-7 h-7 bg-[#E67E22]/15 rounded-md flex items-center justify-center">
                        <Image className="w-3.5 h-3.5 text-[#E67E22]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#C4B5A6] truncate">{f.name}</p>
                        <p className="text-[10px] text-[#5A4F44]">{f.size}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div className="px-3">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-[#2980B9]" />
                    <span className="text-[12px] font-bold text-[#9A8A7C] uppercase tracking-wider">Документы</span>
                    <span className="text-[10px] text-[#5A4F44]">{PROJECT_FILES.documents.length}</span>
                  </div>
                  {PROJECT_FILES.documents.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#2D2620] transition-colors cursor-pointer group">
                      <div className="w-7 h-7 bg-[#2980B9]/15 rounded-md flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#2980B9]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#C4B5A6] truncate">{f.name}</p>
                        <p className="text-[10px] text-[#5A4F44]">{f.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightPanel === 'ai' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-md flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-[#2D2620] rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[230px]">
                      <p className="text-[12px] text-[#C4B5A6] leading-relaxed">Привет! Я вижу ваш проект. Спросите что-нибудь о файлах или сценарии.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-[#A98B76] rounded-xl rounded-tr-sm px-3 py-2.5 max-w-[230px]">
                      <p className="text-[12px] text-white leading-relaxed">Сколько вопросов в раунде 1?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-md flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-[#2D2620] rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[230px]">
                      <p className="text-[12px] text-[#C4B5A6] leading-relaxed">В презентации «Раунд 1.pptx» 24 слайда. Из них 10 — это слайды с вопросами, остальные — титульный, правила и ответы.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-[#3A3228]">
                  <div className="flex items-center gap-2 bg-[#2D2620] rounded-xl px-3 py-2.5">
                    <input type="text" value={aiMessage} onChange={handleAiMessageChange} placeholder="Вопрос..." className="flex-1 bg-transparent text-[12px] text-[#E8DDD3] placeholder-[#5A4F44] outline-none" />
                    <button className="w-7 h-7 bg-[#A98B76] hover:bg-[#96796A] rounded-lg flex items-center justify-center transition-colors duration-150">
                      <Send className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Vault, Clock, FolderOpen, Sparkles, PanelRightClose, Loader2 } from 'lucide-react'
import { useEventStore } from '../store/eventStore'
import { useTimelineStore } from '../store/timelineStore'
import { useFileStore } from '../store/fileStore'
import { useAuthStore } from '../store/authStore'
import { isCodeAccess } from '../utils/codeAccess'
import PresenterTimeline from '../components/presenter/PresenterTimeline'
import PresenterContent from '../components/presenter/PresenterContent'
import PresenterAudioPlayer from '../components/presenter/PresenterAudioPlayer'
import PresenterFilesPanel from '../components/presenter/PresenterFilesPanel'

export default function PresenterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentEvent, fetchEvent } = useEventStore()
  const { blocks, fetchBlocks, updateBlock } = useTimelineStore()
  const { files, fetchFiles, getFileUrl } = useFileStore()
  const { user } = useAuthStore()
  const codeMode = isCodeAccess()

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [rightPanel, setRightPanel] = useState<'files' | 'ai'>('files')
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Audio state lifted up for keyboard shortcut control
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioToggleRef = useRef<(() => void) | null>(null)

  // Slide navigation refs for keyboard shortcuts
  const slidePrevRef = useRef<(() => void) | null>(null)
  const slideNextRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setIsLoading(true)
      await Promise.all([fetchEvent(id), fetchBlocks(id), fetchFiles(id)])
      setIsLoading(false)
    }
    load()
  }, [id, fetchEvent, fetchBlocks, fetchFiles])

  // Set first incomplete block as active on load
  useEffect(() => {
    if (blocks.length > 0 && !activeBlockId) {
      const firstIncomplete = blocks.find((b) => !b.completed)
      setActiveBlockId(firstIncomplete?.id || blocks[0].id)
    }
  }, [blocks, activeBlockId])

  const handleToggleComplete = useCallback(
    async (blockId: string) => {
      if (!id) return
      const block = blocks.find((b) => b.id === blockId)
      if (block) {
        await updateBlock(id, blockId, { completed: !block.completed })
      }
    },
    [id, blocks, updateBlock],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          slidePrevRef.current?.()
          break
        case 'ArrowRight':
          e.preventDefault()
          slideNextRef.current?.()
          break
        case ' ':
          e.preventDefault()
          audioToggleRef.current?.()
          break
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const completedCount = blocks.filter((b) => b.completed).length
  const progressPercent = blocks.length > 0 ? Math.round((completedCount / blocks.length) * 100) : 0
  const activeBlock = blocks.find((b) => b.id === activeBlockId) || null

  const musicFiles = files.filter((f) => f.category === 'music')

  const displayName = user ? (user.nickname || user.email.split('@')[0]) : 'Гость'
  const initial = displayName[0]?.toUpperCase() || 'Г'

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#1A1611] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#A98B76] animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-[#1A1611] flex flex-col overflow-hidden">
      {/* TOP BAR */}
      <header className="h-12 bg-[#231E18] border-b border-[#3A3228] flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(codeMode ? `/events/${id}` : `/events/${id}`)}
            className="w-7 h-7 bg-[#A98B76] rounded-md flex items-center justify-center hover:bg-[#96796A] transition-colors"
          >
            <Vault className="w-3.5 h-3.5 text-white" />
          </button>
          <span
            className="text-[15px] font-bold text-[#E8DDD3]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            StageVault
          </span>
          <div className="w-px h-5 bg-[#3A3228] mx-1" />
          <span className="text-[13px] text-[#9A8A7C] font-medium truncate max-w-[300px]">
            {currentEvent?.title || ''}
          </span>
          <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-[#E74C3C]/15 rounded-md">
            <div className="w-1.5 h-1.5 bg-[#E74C3C] rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-[#E74C3C] uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#2D2620] rounded-lg">
            <Clock className="w-3.5 h-3.5 text-[#9A8A7C]" />
            <span className="text-[13px] text-[#E8DDD3] font-medium tabular-nums">
              {progressPercent}%
            </span>
            <div className="w-24 h-1.5 bg-[#3A3228] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A98B76] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#7A6A5C]">
              {completedCount}/{blocks.length}
            </span>
          </div>

          {/* Files button */}
          <button
            onClick={() => {
              setRightPanel('files')
              setShowRightPanel(true)
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
              rightPanel === 'files' && showRightPanel
                ? 'bg-[#A98B76]/20 text-[#A98B76]'
                : 'hover:bg-[#2D2620] text-[#7A6A5C]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* AI button (placeholder for Phase 8) */}
          <button
            onClick={() => {
              setRightPanel('ai')
              setShowRightPanel(true)
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
              rightPanel === 'ai' && showRightPanel
                ? 'bg-[#A98B76]/20 text-[#A98B76]'
                : 'hover:bg-[#2D2620] text-[#7A6A5C]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Collapse button */}
          {showRightPanel && (
            <button
              onClick={() => setShowRightPanel(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2D2620] text-[#7A6A5C] transition-colors duration-150"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-5 bg-[#3A3228] mx-1" />

          {/* User */}
          <button
            onClick={() => navigate(codeMode ? `/events/${id}` : '/profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#2D2620] transition-colors duration-150"
          >
            <div className="w-6 h-6 bg-[#A98B76] rounded-md flex items-center justify-center text-white text-[11px] font-bold">
              {initial}
            </div>
            <span className="text-[13px] text-[#E8DDD3]">{displayName}</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — TIMELINE */}
        <PresenterTimeline
          blocks={blocks}
          activeBlockId={activeBlockId}
          onSetActive={setActiveBlockId}
          onToggleComplete={handleToggleComplete}
        />

        {/* CENTER — CONTENT + PLAYER */}
        <div className="flex-1 flex flex-col min-w-0">
          <PresenterContent
            activeBlock={activeBlock}
            eventId={id || ''}
            getFileUrl={getFileUrl}
            slidePrevRef={slidePrevRef}
            slideNextRef={slideNextRef}
          />

          {/* BOTTOM AUDIO PLAYER */}
          <PresenterAudioPlayer
            tracks={musicFiles}
            eventId={id || ''}
            getFileUrl={getFileUrl}
            isPlayingExternal={isAudioPlaying}
            onPlayingChange={setIsAudioPlaying}
            toggleRef={audioToggleRef}
          />
        </div>

        {/* RIGHT — COLLAPSIBLE PANEL */}
        {showRightPanel && (
          <PresenterFilesPanel
            files={files}
            rightPanel={rightPanel}
            onShowFiles={() => setRightPanel('files')}
            onShowAI={() => setRightPanel('ai')}
            eventId={id || ''}
            getFileUrl={getFileUrl}
          />
        )}
      </div>
    </div>
  )
}

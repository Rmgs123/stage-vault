import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Plus,
  GripVertical,
  Play,
  Pause,
  RotateCcw,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Timer,
  Music,
  Presentation,
  Image as ImageIcon,
  FileText,
  Paperclip,
  X,
  Loader2,
  Clock,
  Film,
  File as FileIcon,
} from 'lucide-react'
import { useTimelineStore, type TimelineBlock, type BlockAttachment } from '../../store/timelineStore'
import { useFileStore, type FileRecord } from '../../store/fileStore'
import { useEventStore } from '../../store/eventStore'

// --- Attachment icon & color mapping ---
const CATEGORY_ICON: Record<string, typeof Music> = {
  music: Music,
  presentation: Presentation,
  image: ImageIcon,
  video: Film,
  document: FileText,
  other: FileIcon,
}
const CATEGORY_COLOR: Record<string, { bg: string; text: string; icon: string }> = {
  music: { bg: 'bg-[#2D6A4F]/10', text: 'text-[#2D6A4F]', icon: 'text-[#2D6A4F]' },
  presentation: { bg: 'bg-[#7C3AED]/10', text: 'text-[#7C3AED]', icon: 'text-[#7C3AED]' },
  image: { bg: 'bg-[#E67E22]/10', text: 'text-[#E67E22]', icon: 'text-[#E67E22]' },
  video: { bg: 'bg-[#E74C3C]/10', text: 'text-[#E74C3C]', icon: 'text-[#E74C3C]' },
  document: { bg: 'bg-[#2980B9]/10', text: 'text-[#2980B9]', icon: 'text-[#2980B9]' },
  other: { bg: 'bg-brand-300/30', text: 'text-text-muted', icon: 'text-text-muted' },
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// ========== ProgressBar ==========
function ProgressBar({
  blocks,
  activeBlock,
}: {
  blocks: TimelineBlock[]
  activeBlock: TimelineBlock | undefined
}) {
  const completedCount = blocks.filter((b) => b.completed).length
  const totalDuration = blocks.reduce((sum, b) => sum + (b.durationMin ?? 0), 0)
  const completedDuration = blocks
    .filter((b) => b.completed)
    .reduce((sum, b) => sum + (b.durationMin ?? 0), 0)
  const progressPercent = blocks.length > 0 ? Math.round((completedCount / blocks.length) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border border-brand-300 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-bold text-text-primary">Ход мероприятия</h2>
          {activeBlock && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E74C3C]/10 rounded-lg">
              <div className="w-1.5 h-1.5 bg-[#E74C3C] rounded-full animate-pulse" />
              <span className="text-[12px] font-semibold text-[#E74C3C]">
                Идёт: {activeBlock.title}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-text-muted">
            <span className="font-semibold text-text-primary">{completedCount}</span> из{' '}
            {blocks.length} блоков
          </span>
          <span className="text-[13px] text-text-muted">
            <span className="font-semibold text-text-primary">{completedDuration}</span> из{' '}
            {totalDuration} мин
          </span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-brand-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-accent-green-dark rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-text-light">{progressPercent}% выполнено</span>
        <span className="text-[11px] text-text-light">
          ~{totalDuration - completedDuration} мин осталось
        </span>
      </div>
    </div>
  )
}

// ========== BlockCard ==========
function BlockCard({
  block,
  index,
  canEdit,
  timerState,
  onToggleComplete,
  onToggleTimer,
  onResetTimer,
  onEdit,
  onDelete,
  onAttachFile,
  onDetachFile,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  block: TimelineBlock
  index: number
  canEdit: boolean
  timerState: { running: boolean; secondsLeft: number }
  onToggleComplete: () => void
  onToggleTimer: () => void
  onResetTimer: () => void
  onEdit: () => void
  onDelete: () => void
  onAttachFile: () => void
  onDetachFile: (attachmentId: string) => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  onDrop: (e: React.DragEvent) => void
}) {
  const isCurrent = timerState.running
  const isComplete = block.completed
  const totalSeconds = (block.durationMin ?? 0) * 60
  const timerPercent =
    totalSeconds > 0
      ? Math.round(((totalSeconds - timerState.secondsLeft) / totalSeconds) * 100)
      : 0

  return (
    <div
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
        isCurrent
          ? 'border-brand-600 shadow-[0_4px_20px_rgba(169,139,118,0.15)] ring-1 ring-brand-600/20'
          : isComplete
            ? 'border-brand-300 opacity-60'
            : 'border-brand-300 hover:border-brand-400'
      }`}
    >
      {isCurrent && (
        <div className="w-full h-1 bg-brand-300">
          <div
            className="h-full bg-brand-600 transition-all duration-1000"
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Drag handle + Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            {canEdit && (
              <GripVertical className="w-4 h-4 text-brand-400 cursor-grab active:cursor-grabbing" />
            )}
            <button onClick={onToggleComplete} className="transition-colors duration-150">
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-accent-green-dark" />
              ) : (
                <Circle className="w-5 h-5 text-brand-400 hover:text-brand-600" />
              )}
            </button>
          </div>

          {/* Block number */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 ${
              isCurrent
                ? 'bg-brand-600 text-white'
                : isComplete
                  ? 'bg-brand-300 text-text-light'
                  : 'bg-brand-100 text-brand-600'
            }`}
          >
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className={`text-[15px] font-semibold mb-1 ${
                    isComplete ? 'text-text-light line-through' : 'text-text-primary'
                  }`}
                >
                  {block.title}
                </h3>
                {block.description && (
                  <p
                    className={`text-[13px] leading-relaxed mb-3 ${
                      isComplete ? 'text-brand-400' : 'text-text-muted'
                    }`}
                  >
                    {block.description}
                  </p>
                )}

                {/* Attachments */}
                {(block.attachments.length > 0 || canEdit) && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {block.attachments.map((att) => {
                      const Icon = CATEGORY_ICON[att.category] || FileText
                      const colors = CATEGORY_COLOR[att.category] || CATEGORY_COLOR.other
                      return (
                        <div
                          key={att.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 ${colors.bg} rounded-lg group`}
                        >
                          <Icon className={`w-3 h-3 ${colors.icon}`} />
                          <span
                            className={`text-[11px] font-medium ${colors.text} truncate max-w-[160px]`}
                          >
                            {att.name}
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => onDetachFile(att.id)}
                              className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-red-400 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                    {canEdit && (
                      <button
                        onClick={onAttachFile}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-brand-400 rounded-lg text-[11px] text-text-light hover:border-brand-600 hover:text-brand-600 transition-colors duration-150"
                      >
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
                {block.durationMin != null && block.durationMin > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-100 rounded-lg">
                    <Timer className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-[12px] font-semibold text-brand-600">
                      {block.durationMin} мин
                    </span>
                  </div>
                )}

                {/* Timer display */}
                {block.durationMin != null &&
                  block.durationMin > 0 &&
                  (isCurrent || timerState.secondsLeft !== totalSeconds) && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        isCurrent ? 'bg-brand-600 text-white' : 'bg-brand-300 text-text-muted'
                      }`}
                    >
                      <span className="text-[14px] font-bold tabular-nums">
                        {formatTime(timerState.secondsLeft)}
                      </span>
                    </div>
                  )}

                {/* Timer controls */}
                {block.durationMin != null && block.durationMin > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onToggleTimer}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                        isCurrent ? 'bg-brand-600/10 hover:bg-brand-600/20' : 'hover:bg-brand-100'
                      }`}
                    >
                      {isCurrent ? (
                        <Pause className="w-3.5 h-3.5 text-brand-600" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-text-muted ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={onResetTimer}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-100 transition-colors duration-150"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  </div>
                )}

                {/* Edit/Delete */}
                {canEdit && (
                  <div className="flex items-center gap-1 border-l border-brand-300 pl-3 ml-1">
                    <button
                      onClick={onEdit}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-100 transition-colors duration-150"
                    >
                      <Pencil className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                    <button
                      onClick={onDelete}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors duration-150"
                    >
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
}

// ========== BlockFormModal ==========
function BlockFormModal({
  block,
  onSave,
  onClose,
}: {
  block: TimelineBlock | null
  onSave: (data: { title: string; description?: string; durationMin?: number }) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(block?.title ?? '')
  const [description, setDescription] = useState(block?.description ?? '')
  const [durationMin, setDurationMin] = useState(block?.durationMin?.toString() ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Название блока обязательно')
      return
    }
    const dur = durationMin ? parseInt(durationMin, 10) : undefined
    if (durationMin && (isNaN(dur!) || dur! < 0)) {
      setError('Некорректная длительность')
      return
    }
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      durationMin: dur,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-dropdown w-full max-w-[480px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-300">
          <h3 className="text-[16px] font-bold text-text-primary font-serif">
            {block ? 'Редактировать блок' : 'Новый блок сценария'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-100 transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 rounded-lg text-[13px] text-red-600">{error}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-900">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Вступительное слово"
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-brand-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-900">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подсказки ведущему, тезисы..."
              rows={3}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-brand-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-900">
              Длительность (минуты)
            </label>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="0"
              min={0}
              max={1440}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-brand-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-brand-100 hover:bg-brand-200 text-brand-600 text-[14px] font-semibold rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-[14px] font-semibold rounded-xl transition-colors shadow-button hover:shadow-button-hover"
            >
              {block ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ========== FilePickerModal ==========
function FilePickerModal({
  files,
  existingFileIds,
  onSelect,
  onClose,
}: {
  files: FileRecord[]
  existingFileIds: Set<string>
  onSelect: (fileId: string) => void
  onClose: () => void
}) {
  const available = files.filter((f) => !existingFileIds.has(f.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-dropdown w-full max-w-[480px] mx-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-300">
          <h3 className="text-[16px] font-bold text-text-primary font-serif">
            Прикрепить файл
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-100 transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {available.length === 0 ? (
            <p className="text-[14px] text-text-muted text-center py-8">
              Нет доступных файлов для прикрепления
            </p>
          ) : (
            <div className="space-y-2">
              {available.map((file) => {
                const Icon = CATEGORY_ICON[file.category] || FileText
                const colors = CATEGORY_COLOR[file.category] || CATEGORY_COLOR.other
                return (
                  <button
                    key={file.id}
                    onClick={() => onSelect(file.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-50 transition-colors text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-text-light capitalize">{file.category}</p>
                    </div>
                    <Paperclip className="w-4 h-4 text-brand-400" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ========== Main TimelineTab ==========
export default function TimelineTab() {
  const { id: eventId } = useParams<{ id: string }>()
  const { blocks, isLoading, fetchBlocks, createBlock, updateBlock, deleteBlock, reorderBlocks, attachFile, detachFile } =
    useTimelineStore()
  const { files, fetchFiles } = useFileStore()
  const { currentEvent } = useEventStore()

  const [showBlockForm, setShowBlockForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TimelineBlock | null>(null)
  const [attachingBlockId, setAttachingBlockId] = useState<string | null>(null)
  const [timers, setTimers] = useState<Record<string, { running: boolean; secondsLeft: number }>>({})
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragItemId = useRef<string | null>(null)

  const role = currentEvent?.role as string | undefined
  const canEdit = role === 'owner' || role === 'editor' || role === 'member'

  // Fetch data
  useEffect(() => {
    if (eventId) {
      fetchBlocks(eventId)
      fetchFiles(eventId)
    }
  }, [eventId, fetchBlocks, fetchFiles])

  // Initialize timers when blocks change
  useEffect(() => {
    setTimers((prev) => {
      const next: Record<string, { running: boolean; secondsLeft: number }> = {}
      for (const block of blocks) {
        if (prev[block.id]) {
          next[block.id] = prev[block.id]
        } else {
          next[block.id] = {
            running: false,
            secondsLeft: (block.durationMin ?? 0) * 60,
          }
        }
      }
      return next
    })
  }, [blocks])

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        let changed = false
        const next = { ...prev }
        for (const id of Object.keys(next)) {
          if (next[id].running && next[id].secondsLeft > 0) {
            next[id] = { ...next[id], secondsLeft: next[id].secondsLeft - 1 }
            changed = true
          } else if (next[id].running && next[id].secondsLeft <= 0) {
            next[id] = { ...next[id], running: false }
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const getTimerState = (blockId: string) =>
    timers[blockId] ?? { running: false, secondsLeft: 0 }

  const handleToggleComplete = useCallback(
    async (blockId: string, completed: boolean) => {
      if (!eventId) return
      await updateBlock(eventId, blockId, { completed: !completed })
    },
    [eventId, updateBlock],
  )

  const handleToggleTimer = useCallback((blockId: string) => {
    setTimers((prev) => {
      const current = prev[blockId]
      if (!current) return prev

      // Stop all other running timers
      const next: Record<string, { running: boolean; secondsLeft: number }> = {}
      for (const [id, state] of Object.entries(prev)) {
        if (id === blockId) {
          next[id] = { ...state, running: !state.running }
        } else {
          next[id] = { ...state, running: false }
        }
      }
      return next
    })
  }, [])

  const handleResetTimer = useCallback(
    (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId)
      if (!block) return
      setTimers((prev) => ({
        ...prev,
        [blockId]: { running: false, secondsLeft: (block.durationMin ?? 0) * 60 },
      }))
    },
    [blocks],
  )

  const handleSaveBlock = useCallback(
    async (data: { title: string; description?: string; durationMin?: number }) => {
      if (!eventId) return
      if (editingBlock) {
        await updateBlock(eventId, editingBlock.id, data)
        // Also reset timer if duration changed
        if (data.durationMin !== undefined) {
          setTimers((prev) => ({
            ...prev,
            [editingBlock.id]: { running: false, secondsLeft: (data.durationMin ?? 0) * 60 },
          }))
        }
      } else {
        await createBlock(eventId, data)
      }
      setShowBlockForm(false)
      setEditingBlock(null)
    },
    [eventId, editingBlock, createBlock, updateBlock],
  )

  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      if (!eventId) return
      await deleteBlock(eventId, blockId)
    },
    [eventId, deleteBlock],
  )

  const handleAttachFile = useCallback(
    async (fileId: string) => {
      if (!eventId || !attachingBlockId) return
      await attachFile(eventId, attachingBlockId, fileId)
      setAttachingBlockId(null)
    },
    [eventId, attachingBlockId, attachFile],
  )

  const handleDetachFile = useCallback(
    async (blockId: string, attachmentId: string) => {
      if (!eventId) return
      await detachFile(eventId, blockId, attachmentId)
    },
    [eventId, detachFile],
  )

  // Drag and drop
  const handleDragStart = useCallback((blockId: string) => {
    dragItemId.current = blockId
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    setDragOverId(blockId)
  }, [])

  const handleDragEnd = useCallback(() => {
    dragItemId.current = null
    setDragOverId(null)
  }, [])

  const handleDrop = useCallback(
    (targetBlockId: string) => {
      if (!eventId || !dragItemId.current || dragItemId.current === targetBlockId) {
        setDragOverId(null)
        return
      }
      const ids = blocks.map((b) => b.id)
      const fromIdx = ids.indexOf(dragItemId.current)
      const toIdx = ids.indexOf(targetBlockId)
      if (fromIdx === -1 || toIdx === -1) return

      const newIds = [...ids]
      newIds.splice(fromIdx, 1)
      newIds.splice(toIdx, 0, dragItemId.current)

      reorderBlocks(eventId, newIds)
      dragItemId.current = null
      setDragOverId(null)
    },
    [eventId, blocks, reorderBlocks],
  )

  // Find active timer block
  const activeBlock = blocks.find((b) => timers[b.id]?.running)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  if (blocks.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-brand-400" />
        </div>
        <h3 className="text-[16px] font-semibold text-text-secondary mb-1 font-serif">
          Сценарий пуст
        </h3>
        <p className="text-[14px] text-text-light mb-6">
          Добавьте первый блок, чтобы начать планирование
        </p>
        {canEdit && (
          <button
            onClick={() => {
              setEditingBlock(null)
              setShowBlockForm(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-[14px] font-semibold rounded-xl transition-colors shadow-button hover:shadow-button-hover"
          >
            <Plus className="w-4 h-4" />
            Добавить блок
          </button>
        )}

        {showBlockForm && (
          <BlockFormModal block={null} onSave={handleSaveBlock} onClose={() => setShowBlockForm(false)} />
        )}
      </div>
    )
  }

  const existingFileIds = attachingBlockId
    ? new Set(blocks.find((b) => b.id === attachingBlockId)?.attachments.map((a) => a.fileId) ?? [])
    : new Set<string>()

  return (
    <>
      <ProgressBar blocks={blocks} activeBlock={activeBlock} />

      <div className="space-y-3">
        {blocks.map((block, idx) => (
          <BlockCard
            key={block.id}
            block={block}
            index={idx}
            canEdit={canEdit}
            timerState={getTimerState(block.id)}
            onToggleComplete={() => handleToggleComplete(block.id, block.completed)}
            onToggleTimer={() => handleToggleTimer(block.id)}
            onResetTimer={() => handleResetTimer(block.id)}
            onEdit={() => {
              setEditingBlock(block)
              setShowBlockForm(true)
            }}
            onDelete={() => handleDeleteBlock(block.id)}
            onAttachFile={() => setAttachingBlockId(block.id)}
            onDetachFile={(aid) => handleDetachFile(block.id, aid)}
            onDragStart={() => handleDragStart(block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(block.id)}
          />
        ))}

        {/* Add Block Button */}
        {canEdit && (
          <button
            onClick={() => {
              setEditingBlock(null)
              setShowBlockForm(true)
            }}
            className="w-full py-4 border-2 border-dashed border-brand-400 rounded-2xl text-[14px] font-medium text-brand-600 hover:border-brand-600 hover:bg-brand-600/5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить блок
          </button>
        )}
      </div>

      {/* Block Form Modal */}
      {showBlockForm && (
        <BlockFormModal
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => {
            setShowBlockForm(false)
            setEditingBlock(null)
          }}
        />
      )}

      {/* File Picker Modal */}
      {attachingBlockId && (
        <FilePickerModal
          files={files}
          existingFileIds={existingFileIds}
          onSelect={handleAttachFile}
          onClose={() => setAttachingBlockId(null)}
        />
      )}
    </>
  )
}

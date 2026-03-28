import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Circle, Timer, RotateCcw } from 'lucide-react'
import type { TimelineBlock } from '../../store/timelineStore'

interface Props {
  blocks: TimelineBlock[]
  activeBlockId: string | null
  onSetActive: (id: string) => void
  onToggleComplete: (id: string) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function PresenterTimeline({
  blocks,
  activeBlockId,
  onSetActive,
  onToggleComplete,
}: Props) {
  const [timers, setTimers] = useState<Record<string, number>>({})
  const [runningTimer, setRunningTimer] = useState<string | null>(null)

  // Initialize timers from block durations
  useEffect(() => {
    const initial: Record<string, number> = {}
    blocks.forEach((b) => {
      if (b.durationMin && !(b.id in timers)) {
        initial[b.id] = b.durationMin * 60
      }
    })
    if (Object.keys(initial).length > 0) {
      setTimers((prev) => ({ ...initial, ...prev }))
    }
    // Only run when blocks change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  // Start timer for active block
  useEffect(() => {
    if (activeBlockId && !runningTimer) {
      setRunningTimer(activeBlockId)
    }
  }, [activeBlockId, runningTimer])

  // Countdown interval
  useEffect(() => {
    if (!runningTimer) return
    const interval = setInterval(() => {
      setTimers((prev) => {
        const current = prev[runningTimer]
        if (current === undefined || current <= 0) return prev
        return { ...prev, [runningTimer]: current - 1 }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [runningTimer])

  const handleResetTimer = useCallback(
    (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId)
      if (block?.durationMin) {
        setTimers((prev) => ({ ...prev, [blockId]: block.durationMin! * 60 }))
      }
    },
    [blocks],
  )

  const handleSetActive = useCallback(
    (blockId: string) => {
      onSetActive(blockId)
      setRunningTimer(blockId)
    },
    [onSetActive],
  )

  const completedCount = blocks.filter((b) => b.completed).length

  return (
    <div className="w-[320px] bg-[#231E18] border-r border-[#3A3228] flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-[#3A3228] flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-[#E8DDD3]">Сценарий</h2>
        <span className="text-[11px] text-[#7A6A5C]">
          {completedCount} из {blocks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {blocks.map((block, idx) => {
          const isCurrent = block.id === activeBlockId
          const isDone = block.completed
          const timerLeft = timers[block.id] ?? (block.durationMin ? block.durationMin * 60 : 0)
          const totalSec = block.durationMin ? block.durationMin * 60 : 0
          const timerPercent = totalSec > 0 ? Math.round(((totalSec - timerLeft) / totalSec) * 100) : 0

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
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleComplete(block.id)
                  }}
                  className="mt-0.5 shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-[18px] h-[18px] text-[#7A8A50]" />
                  ) : (
                    <Circle
                      className={`w-[18px] h-[18px] ${isCurrent ? 'text-[#A98B76]' : 'text-[#3A3228]'}`}
                    />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-[#A98B76] text-white' : 'bg-[#2D2620] text-[#7A6A5C]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h3
                      className={`text-[13px] font-semibold truncate ${
                        isDone
                          ? 'text-[#7A6A5C] line-through'
                          : isCurrent
                            ? 'text-[#E8DDD3]'
                            : 'text-[#C4B5A6]'
                      }`}
                    >
                      {block.title}
                    </h3>
                  </div>
                  {block.description && (
                    <p className={`text-[11px] truncate ${isDone ? 'text-[#5A4F44]' : 'text-[#7A6A5C]'}`}>
                      {block.description}
                    </p>
                  )}

                  {isCurrent && block.durationMin ? (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#A98B76]/20 rounded-lg">
                        <Timer className="w-3 h-3 text-[#A98B76]" />
                        <span className="text-[13px] font-bold text-[#A98B76] tabular-nums">
                          {formatTime(timerLeft)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResetTimer(block.id)
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[#A98B76]/10 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 text-[#7A6A5C]" />
                      </button>
                      <div className="flex-1 h-1 bg-[#3A3228] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A98B76] rounded-full transition-all duration-1000"
                          style={{ width: `${timerPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : !isCurrent && block.durationMin ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Timer className="w-3 h-3 text-[#5A4F44]" />
                      <span className="text-[11px] text-[#5A4F44]">{block.durationMin} мин</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}

        {blocks.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] text-[#7A6A5C]">Сценарий пуст</p>
            <p className="text-[11px] text-[#5A4F44] mt-1">
              Добавьте блоки в сценарий на вкладке «Сценарий»
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft, FolderOpen, Clock, Users, Settings, Loader2 } from 'lucide-react'
import { useEventStore } from '../store/eventStore'

const TABS = [
  { id: 'files', label: 'Файлы', icon: FolderOpen, path: '' },
  { id: 'timeline', label: 'Сценарий', icon: Clock, path: 'timeline' },
  { id: 'team', label: 'Команда', icon: Users, path: 'team' },
  { id: 'settings', label: 'Настройки', icon: Settings, path: 'settings' },
]

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'черновик', bg: 'bg-brand-300', text: 'text-text-muted' },
  ready: { label: 'готов', bg: 'bg-accent-green/20', text: 'text-accent-green-dark' },
  done: { label: 'завершён', bg: 'bg-brand-600/15', text: 'text-brand-600' },
}

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentEvent, isLoading, fetchEvent } = useEventStore()

  useEffect(() => {
    if (id) fetchEvent(id)
  }, [id, fetchEvent])

  // Determine active tab from URL
  const pathAfterEvent = location.pathname.split(`/events/${id}`)[1]?.replace(/^\//, '') || ''
  const activeTabId =
    TABS.find((t) => t.path && pathAfterEvent.startsWith(t.path))?.id || 'files'

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (isLoading || !currentEvent) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  const status = STATUS_MAP[currentEvent.status] || STATUS_MAP.draft
  const dateStr = formatDate(currentEvent.date)
  const meta = [dateStr, `${currentEvent.filesCount} файлов`, `${currentEvent.membersCount} участников`]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      {/* Project Header */}
      <div className="bg-white border-b border-brand-300">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-100 transition-colors duration-150"
              >
                <ChevronLeft className="w-5 h-5 text-text-muted" />
              </button>
              <div>
                <h1
                  className="text-[22px] font-bold text-text-primary"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {currentEvent.title}
                </h1>
                {meta && <p className="text-[13px] text-text-muted mt-0.5">{meta}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold ${status.bg} ${status.text}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTabId === tab.id
              const isOwner = currentEvent.role === 'owner'

              // Settings tab only for owner
              if (tab.id === 'settings' && !isOwner) return null

              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    navigate(`/events/${id}${tab.path ? '/' + tab.path : ''}`)
                  }
                  className={`flex items-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-t-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-200 text-text-primary border-t-2 border-x border-t-brand-600 border-x-brand-300'
                      : 'text-text-muted hover:text-text-secondary hover:bg-brand-50'
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

      {/* Tab Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <Outlet />
      </div>
    </>
  )
}

// Placeholder components for tabs
export function FilesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
        <FolderOpen className="w-7 h-7 text-brand-400" />
      </div>
      <h3
        className="text-[16px] font-semibold text-text-secondary mb-1"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Файлы
      </h3>
      <p className="text-[14px] text-text-light">Раздел файлов будет реализован в Фазе 3</p>
    </div>
  )
}

export function TimelineTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
        <Clock className="w-7 h-7 text-brand-400" />
      </div>
      <h3
        className="text-[16px] font-semibold text-text-secondary mb-1"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Сценарий
      </h3>
      <p className="text-[14px] text-text-light">Раздел сценария будет реализован в Фазе 4</p>
    </div>
  )
}

export function TeamTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-brand-400" />
      </div>
      <h3
        className="text-[16px] font-semibold text-text-secondary mb-1"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Команда
      </h3>
      <p className="text-[14px] text-text-light">
        Раздел команды будет реализован в Фазе 5
      </p>
    </div>
  )
}

export function SettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
        <Settings className="w-7 h-7 text-brand-400" />
      </div>
      <h3
        className="text-[16px] font-semibold text-text-secondary mb-1"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Настройки
      </h3>
      <p className="text-[14px] text-text-light">
        Раздел настроек будет реализован в следующих фазах
      </p>
    </div>
  )
}

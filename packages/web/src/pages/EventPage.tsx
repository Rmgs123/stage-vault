import { useEffect } from 'react'
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft, FolderOpen, Clock, Users, Settings, Loader2, MonitorPlay } from 'lucide-react'
import { useEventStore } from '../store/eventStore'
import { isCodeAccess } from '../utils/codeAccess'

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
                onClick={() => navigate(isCodeAccess() ? '/go' : '/')}
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
              <button
                onClick={() => navigate(`/events/${id}/presenter`)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover"
              >
                <MonitorPlay className="w-4 h-4" />
                Пульт ведущего
              </button>
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
              const codeMode = isCodeAccess()

              // Settings tab only for owner (and not for code access)
              if (tab.id === 'settings' && (!isOwner || codeMode)) return null

              // Team tab hidden for code access
              if (tab.id === 'team' && codeMode) return null

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


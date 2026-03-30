import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Calendar,
  Users,
  Search,
  ArrowUpDown,
  ChevronDown,
  FolderOpen,
  X,
  Loader2,
} from 'lucide-react'
import { useEventStore, type Event } from '../store/eventStore'

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'черновик', bg: 'bg-brand-300', text: 'text-text-muted' },
  ready: { label: 'готов', bg: 'bg-accent-green/20', text: 'text-accent-green-dark' },
  done: { label: 'завершён', bg: 'bg-brand-600/15', text: 'text-brand-600' },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { events, isLoading, fetchEvents, createEvent } = useEventStore()

  const [activeFilter, setActiveFilter] = useState<'mine' | 'participating'>('mine')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredEvents = events.filter((ev) => {
    const matchesFilter = activeFilter === 'mine' ? ev.role === 'owner' : ev.role !== 'owner'
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title, 'ru')
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const event = await createEvent({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        date: newDate ? new Date(newDate).toISOString() : undefined,
      })
      setShowCreateModal(false)
      setNewTitle('')
      setNewDescription('')
      setNewDate('')
      navigate(`/events/${event.id}`)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setCreateError(error.message || 'Ошибка при создании проекта')
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Дата не указана'
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const pluralProjects = (n: number) => {
    const lastTwo = n % 100
    const lastOne = n % 10
    if (lastTwo >= 11 && lastTwo <= 19) return `${n} проектов`
    if (lastOne === 1) return `${n} проект`
    if (lastOne >= 2 && lastOne <= 4) return `${n} проекта`
    return `${n} проектов`
  }

  return (
    <main className="max-w-[1280px] mx-auto px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-[28px] font-bold text-text-primary mb-1"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Мои мероприятия
          </h1>
          <p className="text-[14px] text-text-muted">{pluralProjects(sortedEvents.length)}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover"
        >
          <Plus className="w-4 h-4" />
          Создать проект
        </button>
      </div>

      {/* Toolbar: Filters + Search + Sort */}
      <div className="flex items-center gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-brand-300">
          <button
            onClick={() => setActiveFilter('mine')}
            className={`px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              activeFilter === 'mine'
                ? 'bg-brand-600 text-white'
                : 'bg-surface text-brand-600 hover:bg-brand-100'
            }`}
          >
            Мои
          </button>
          <button
            onClick={() => setActiveFilter('participating')}
            className={`px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              activeFilter === 'participating'
                ? 'bg-brand-600 text-white'
                : 'bg-surface text-brand-600 hover:bg-brand-100'
            }`}
          >
            Участвую
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-placeholder" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск проектов..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-brand-300 rounded-xl text-[13px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
          />
        </div>

        <div className="flex-1" />

        {/* Sort Dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-brand-300 rounded-xl text-[13px] text-brand-900 hover:border-brand-600 transition-all duration-200"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            {sortBy === 'date' ? 'По дате' : 'По названию'}
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-11 w-[180px] bg-surface rounded-xl shadow-dropdown border border-brand-300 overflow-hidden py-1 z-10">
              <button
                onClick={() => {
                  setSortBy('date')
                  setShowSortMenu(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                  sortBy === 'date'
                    ? 'bg-brand-100 text-brand-600 font-semibold'
                    : 'text-text-secondary hover:bg-brand-50'
                }`}
              >
                По дате
              </button>
              <button
                onClick={() => {
                  setSortBy('name')
                  setShowSortMenu(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                  sortBy === 'name'
                    ? 'bg-brand-100 text-brand-600 font-semibold'
                    : 'text-text-secondary hover:bg-brand-50'
                }`}
              >
                По названию
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : sortedEvents.length > 0 ? (
        <EventGrid events={sortedEvents} formatDate={formatDate} />
      ) : (
        <EmptyState
          activeFilter={activeFilter}
          onCreateClick={() => setShowCreateModal(true)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEventModal
          newTitle={newTitle}
          newDescription={newDescription}
          newDate={newDate}
          creating={creating}
          createError={createError}
          onTitleChange={setNewTitle}
          onDescriptionChange={setNewDescription}
          onDateChange={setNewDate}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false)
            setNewTitle('')
            setNewDescription('')
            setNewDate('')
            setCreateError('')
          }}
        />
      )}
    </main>
  )
}

function EventGrid({
  events,
  formatDate,
}: {
  events: Event[]
  formatDate: (d: string | null) => string
}) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-3 gap-5">
      {events.map((event) => {
        const status = STATUS_MAP[event.status] || STATUS_MAP.draft
        return (
          <div
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            className="bg-surface rounded-2xl border border-brand-300 overflow-hidden cursor-pointer hover:shadow-card hover:border-brand-500 transition-all duration-200 group"
          >
            {/* Cover */}
            <div className="relative h-[160px] bg-brand-100 overflow-hidden">
              {event.coverUrl ? (
                <img
                  src={event.coverUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-brand-400" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${status.bg} ${status.text} backdrop-blur-sm`}
                >
                  {status.label}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-[15px] font-semibold text-text-primary mb-1.5 line-clamp-1 group-hover:text-brand-600 transition-colors duration-200">
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[13px] text-text-muted mb-4">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(event.date)}
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between pt-3.5 border-t border-brand-300/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[12px] text-text-light">
                    <Users className="w-3.5 h-3.5" />
                    {event.membersCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-text-light">
                    <FolderOpen className="w-3.5 h-3.5" />
                    {event.filesCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({
  activeFilter,
  onCreateClick,
}: {
  activeFilter: string
  onCreateClick: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mb-5">
        <FolderOpen className="w-9 h-9 text-brand-400" />
      </div>
      <h3
        className="text-[18px] font-semibold text-text-secondary mb-2"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {activeFilter === 'mine'
          ? 'У вас пока нет проектов'
          : 'Вы ещё не участвуете в проектах'}
      </h3>
      <p className="text-[14px] text-text-light mb-6 text-center max-w-[320px]">
        {activeFilter === 'mine'
          ? 'Создайте свой первый проект, чтобы начать работу'
          : 'Когда вас пригласят в проект, он появится здесь'}
      </p>
      {activeFilter === 'mine' && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-button"
        >
          <Plus className="w-4 h-4" />
          Создать проект
        </button>
      )}
    </div>
  )
}

function CreateEventModal({
  newTitle,
  newDescription,
  newDate,
  creating,
  createError,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onSubmit,
  onClose,
}: {
  newTitle: string
  newDescription: string
  newDate: string
  creating: boolean
  createError: string
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onDateChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-dropdown w-full max-w-[480px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-300">
          <h2
            className="text-[18px] font-bold text-text-primary"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Новый проект
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-6 py-5 flex flex-col gap-5">
          {createError && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600">
              {createError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-900">
              Название мероприятия
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Корпоратив «Новый Год 2025»"
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-900">
              Описание <span className="text-text-placeholder font-normal">(необязательно)</span>
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="О чём это мероприятие?"
              rows={3}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-900">
              Дата проведения{' '}
              <span className="text-text-placeholder font-normal">(необязательно)</span>
            </label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {creating ? 'Создание...' : 'Создать проект'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-brand-100 hover:bg-brand-200 text-brand-600 text-[15px] font-semibold rounded-xl transition-all duration-200"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Save,
  KeyRound,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  X,
  RefreshCw,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react'
import { useEventStore } from '../../store/eventStore'
import { api, ApiError } from '../../api/client'

interface AccessCodeData {
  id: string
  code: string
  expiresAt: string
  createdAt: string
}

const TTL_OPTIONS = [
  { value: 1, label: '1 час' },
  { value: 6, label: '6 часов' },
  { value: 12, label: '12 часов' },
  { value: 24, label: '24 часа' },
  { value: 48, label: '48 часов' },
  { value: 72, label: '72 часа' },
  { value: 168, label: '7 дней' },
]

export default function SettingsTab() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentEvent, updateEvent, deleteEvent } = useEventStore()

  // Settings form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState('draft')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Access code state
  const [activeCode, setActiveCode] = useState<AccessCodeData | null>(null)
  const [isLoadingCode, setIsLoadingCode] = useState(true)
  const [ttlHours, setTtlHours] = useState(24)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [copied, setCopied] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Init form from currentEvent
  useEffect(() => {
    if (currentEvent) {
      setTitle(currentEvent.title)
      setDescription(currentEvent.description || '')
      setStatus(currentEvent.status)
      if (currentEvent.date) {
        const d = new Date(currentEvent.date)
        setDate(d.toISOString().slice(0, 10))
        setTime(d.toTimeString().slice(0, 5))
      }
    }
  }, [currentEvent])

  // Fetch active code
  useEffect(() => {
    if (id) {
      fetchActiveCode()
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchActiveCode = async () => {
    if (!id) return
    setIsLoadingCode(true)
    try {
      const res = await api.get<{ data: AccessCodeData | null }>(`/events/${id}/access-codes`)
      setActiveCode(res.data)
    } catch {
      // ignore
    } finally {
      setIsLoadingCode(false)
    }
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    setSaveMsg(null)
    try {
      const dateTime = date ? new Date(`${date}T${time || '00:00'}`).toISOString() : null
      await updateEvent(id, {
        title: title.trim(),
        description: description.trim() || null,
        date: dateTime,
        status,
      })
      setSaveMsg('Сохранено')
      setTimeout(() => setSaveMsg(null), 2000)
    } catch (err) {
      const error = err as ApiError
      setSaveMsg(error.message || 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerate = async () => {
    if (!id) return
    setIsGenerating(true)
    try {
      const res = await api.post<{ data: { id: string; code: string; expiresAt: string }; message: string }>(
        `/events/${id}/access-codes`,
        { ttlHours },
      )
      setActiveCode({
        id: res.data.id,
        code: res.data.code,
        expiresAt: res.data.expiresAt,
        createdAt: new Date().toISOString(),
      })
    } catch {
      // ignore
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRevoke = async () => {
    if (!id || !activeCode) return
    setIsRevoking(true)
    try {
      await api.delete(`/events/${id}/access-codes/${activeCode.id}`)
      setActiveCode(null)
    } catch {
      // ignore
    } finally {
      setIsRevoking(false)
    }
  }

  const handleCopy = () => {
    if (!activeCode) return
    navigator.clipboard.writeText(activeCode.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await deleteEvent(id)
      navigate('/')
    } catch {
      setIsDeleting(false)
    }
  }

  const formatTimeLeft = (expiresAt: string): string => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Истёк'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `Истекает через ${hours}ч`
    return `Истекает через ${minutes}м`
  }

  return (
    <div className="max-w-[640px]">
      <h2
        className="text-[20px] font-bold text-text-primary mb-6"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Настройки проекта
      </h2>

      {/* Basic info card */}
      <div className="bg-white rounded-2xl border border-brand-300 p-6 mb-6">
        <h3 className="text-[15px] font-semibold text-text-primary mb-5">Основная информация</h3>

        <div className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-muted">Название мероприятия</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-brand-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-muted">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary placeholder-brand-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200 resize-none"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-muted">Дата проведения</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-muted">Время начала</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-muted">Статус проекта</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50 border border-brand-300 rounded-xl text-[15px] text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
            >
              <option value="draft">Черновик</option>
              <option value="ready">Готов</option>
              <option value="done">Завершён</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 mt-6">
          {saveMsg && (
            <span className={`text-[13px] font-medium ${saveMsg === 'Сохранено' ? 'text-accent-green-dark' : 'text-red-500'}`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Сохранить изменения
          </button>
        </div>
      </div>

      {/* Access Code card */}
      <div className="bg-white rounded-2xl border border-brand-300 p-6 mb-6">
        <div className="flex items-start gap-3 mb-1">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Код доступа для площадки</h3>
            <p className="text-[13px] text-text-muted mt-0.5">
              Позволяет войти в проект без авторизации на любом устройстве
            </p>
          </div>
        </div>

        {isLoadingCode ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          </div>
        ) : activeCode ? (
          /* Active code display */
          <div className="mt-5">
            <div className="bg-brand-50 rounded-xl border border-brand-300 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-text-muted font-medium">Текущий код</span>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-accent-green-dark">
                  <span className="w-2 h-2 bg-accent-green rounded-full" />
                  Активен
                </span>
              </div>

              {/* Code display */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-2">
                  {activeCode.code.split('').map((char, idx) => (
                    <div
                      key={idx}
                      className="w-11 h-12 bg-white border border-brand-300 rounded-lg flex items-center justify-center text-[20px] font-bold text-text-primary"
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-brand-600 hover:text-brand-800 border border-brand-300 rounded-lg hover:bg-brand-50 transition-colors duration-150"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Копировать
                    </>
                  )}
                </button>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-[12px] text-text-muted">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {formatTimeLeft(activeCode.expiresAt)}
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  stage-vault.ru/go
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleRevoke}
                disabled={isRevoking}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50/50 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
                {isRevoking ? 'Отзываем...' : 'Отозвать код'}
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-brand-600 border border-brand-300 rounded-xl hover:bg-brand-50 transition-colors duration-150"
              >
                <RefreshCw className="w-4 h-4" />
                {isGenerating ? 'Генерируем...' : 'Сгенерировать новый'}
              </button>
            </div>
          </div>
        ) : (
          /* No active code */
          <div className="mt-5">
            <div className="bg-brand-50 rounded-xl border border-brand-300 p-6 text-center mb-4">
              <div className="flex justify-center mb-3">
                <KeyRound className="w-8 h-8 text-brand-400" />
              </div>
              <p className="text-[14px] font-semibold text-text-secondary mb-1">Нет активного кода</p>
              <p className="text-[13px] text-text-muted">
                Сгенерируйте код, чтобы открыть доступ по ссылке stage-vault.ru/go
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-text-muted">Срок действия (часы)</label>
                <select
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Number(e.target.value))}
                  className="px-3 py-2.5 bg-brand-50 border border-brand-300 rounded-xl text-[13px] text-text-primary outline-none focus:border-brand-600 transition-colors"
                >
                  {TTL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 mt-auto bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-button hover:shadow-button-hover"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {isGenerating ? 'Генерируем...' : 'Сгенерировать код'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-red-600">Опасная зона</h3>
            <p className="text-[13px] text-text-muted mt-0.5">Необратимые действия</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-red-50/30 rounded-xl border border-red-100 p-4">
          <div>
            <p className="text-[14px] font-semibold text-text-primary">Удалить проект</p>
            <p className="text-[12px] text-text-muted mt-0.5">
              Все файлы, сценарий и данные команды будут удалены навсегда
            </p>
          </div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-150"
            >
              <Trash2 className="w-4 h-4" />
              Удалить проект
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 text-[13px] font-semibold text-text-muted border border-brand-300 rounded-xl hover:bg-brand-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-colors"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Подтвердить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

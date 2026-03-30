import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Mail, UserMinus, Pencil, Loader2 } from 'lucide-react'
import { useNotificationStore, Notification } from '../../store/notificationStore'

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин. назад`
  if (diffHour < 24) return `${diffHour} ч. назад`
  if (diffDay < 7) return `${diffDay} дн. назад`
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const TYPE_ICON: Record<string, typeof Mail> = {
  invite: Mail,
  role_change: Pencil,
  removed: UserMinus,
}

function NotificationCard({ notification }: { notification: Notification }) {
  const { markAsRead, acceptInvite, declineInvite } = useNotificationStore()
  const navigate = useNavigate()
  const Icon = TYPE_ICON[notification.type] || Mail

  const isInvite = notification.type === 'invite' && !notification.read

  const handleAccept = async () => {
    try {
      const result = await acceptInvite(notification.id)
      if (result.eventId) {
        navigate(`/events/${result.eventId}`)
      }
    } catch {
      // error
    }
  }

  const handleDecline = async () => {
    try {
      await declineInvite(notification.id)
    } catch {
      // error
    }
  }

  const handleClick = async () => {
    if (!notification.read && notification.type !== 'invite') {
      await markAsRead(notification.id)
    }
    // Navigate to event if possible
    if (notification.meta?.eventId && notification.type !== 'invite') {
      navigate(`/events/${notification.meta.eventId}`)
    }
  }

  return (
    <div
      className={`px-5 py-3.5 transition-colors duration-150 ${
        !notification.read
          ? 'hover:bg-brand-50 border-l-[3px] border-brand-600 cursor-pointer'
          : 'hover:bg-brand-50/50 border-l-[3px] border-transparent opacity-70'
      }`}
      onClick={!isInvite ? handleClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-text-primary leading-snug">{notification.body || notification.title}</p>
          <p className="text-[11px] text-text-light mt-1">{formatTimeAgo(notification.createdAt)}</p>

          {/* Invite actions */}
          {isInvite && (
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={handleAccept}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold rounded-lg transition-colors duration-150"
              >
                <Check className="w-3.5 h-3.5" />
                Принять
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-300 hover:bg-brand-50 text-text-secondary text-[12px] font-semibold rounded-lg transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" />
                Отклонить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface InboxPanelProps {
  onClose: () => void
}

export default function InboxPanel({ onClose }: InboxPanelProps) {
  const { notifications, isLoading, fetchNotifications } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-[380px] bg-surface rounded-2xl shadow-dropdown border border-brand-300 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-brand-300">
        <h3 className="text-[15px] font-semibold text-text-primary">Уведомления</h3>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="py-8 text-center">
            <Mail className="w-8 h-8 text-brand-400 mx-auto mb-2" />
            <p className="text-[13px] text-text-muted">Нет уведомлений</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((n) => <NotificationCard key={n.id} notification={n} />)}
      </div>
    </div>
  )
}

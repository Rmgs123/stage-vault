import { useState, useEffect, useRef } from 'react'
import { X, Search, Loader2, Check } from 'lucide-react'
import { useTeamStore, SearchUser } from '../../store/teamStore'

interface InviteDialogProps {
  eventId: string
  existingMemberIds: string[]
  onClose: () => void
}

const AVATAR_COLORS = [
  'bg-brand-600',
  'bg-[#2D6A4F]',
  'bg-[#7C3AED]',
  'bg-[#E67E22]',
  'bg-[#2980B9]',
  'bg-[#E74C3C]',
  'bg-[#3498DB]',
  'bg-[#8B5CF6]',
]

function getAvatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function InviteDialog({ eventId, existingMemberIds, onClose }: InviteDialogProps) {
  const { searchResults, isSearching, searchUsers, clearSearch, inviteUser } = useTeamStore()
  const [query, setQuery] = useState('')
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      clearSearch()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [clearSearch])

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      clearSearch()
      return
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(value.trim())
    }, 300)
  }

  const handleInvite = async (user: SearchUser) => {
    setInvitingId(user.id)
    setError(null)
    try {
      await inviteUser(eventId, user.id)
      setInvitedIds((prev) => new Set(prev).add(user.id))
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr.message || 'Не удалось отправить приглашение')
    } finally {
      setInvitingId(null)
    }
  }

  // Filter out already-members from search results
  const filteredResults = searchResults.filter(
    (u) => !existingMemberIds.includes(u.id),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-dropdown border border-brand-300 w-[480px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-300 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-text-primary">Пригласить участника</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 transition-colors duration-150"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-[13px] font-medium text-text-secondary mb-2">
            Поиск по никнейму или email
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="@nickname или email..."
              className="w-full pl-10 pr-4 py-3 bg-surface border border-brand-300 rounded-xl text-[14px] text-text-primary placeholder-brand-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition-all duration-200"
              autoFocus
            />
          </div>

          {error && (
            <p className="mt-2 text-[13px] text-red-500">{error}</p>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
            </div>
          )}

          {/* Results */}
          {!isSearching && filteredResults.length > 0 && (
            <div className="mt-3 border border-brand-300 rounded-xl overflow-hidden">
              {filteredResults.map((user) => {
                const isInvited = invitedIds.has(user.id)
                const isInviting = invitingId === user.id

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-brand-50 transition-colors duration-150 border-b border-brand-300/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 ${getAvatarColor(user.id)} rounded-xl flex items-center justify-center text-white text-[13px] font-bold`}
                      >
                        {(user.nickname || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-text-primary">
                          {user.nickname || user.email.split('@')[0]}
                        </p>
                        <p className="text-[11px] text-text-light">
                          {user.nickname ? `@${user.nickname} · ` : ''}
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {isInvited ? (
                      <span className="flex items-center gap-1.5 px-3.5 py-1.5 text-accent-green-dark text-[12px] font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Отправлено
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInvite(user)}
                        disabled={isInviting}
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50"
                      >
                        {isInviting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Пригласить'
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* No results */}
          {!isSearching && query.trim().length >= 2 && filteredResults.length === 0 && searchResults.length === 0 && (
            <div className="mt-4 text-center py-6">
              <p className="text-[13px] text-text-muted">Пользователи не найдены</p>
            </div>
          )}

          {/* All found users are already members */}
          {!isSearching && query.trim().length >= 2 && filteredResults.length === 0 && searchResults.length > 0 && (
            <div className="mt-4 text-center py-6">
              <p className="text-[13px] text-text-muted">Все найденные пользователи уже в команде</p>
            </div>
          )}

          {/* Empty state */}
          {!isSearching && query.length === 0 && (
            <div className="mt-4 text-center py-6">
              <Search className="w-10 h-10 text-brand-400 mx-auto mb-2" />
              <p className="text-[13px] text-text-muted">Введите никнейм или email для поиска</p>
              <p className="text-[11px] text-brand-400 mt-1">
                Приглашённый получит уведомление в приложении
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

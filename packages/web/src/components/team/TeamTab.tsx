import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  UserPlus,
  Crown,
  Pencil,
  Eye,
  ChevronDown,
  UserMinus,
  Loader2,
} from 'lucide-react'
import { useTeamStore, TeamMember } from '../../store/teamStore'
import { useEventStore } from '../../store/eventStore'
import InviteDialog from './InviteDialog'

const ROLE_MAP: Record<
  string,
  {
    label: string
    icon: typeof Crown
    bg: string
    text: string
    border: string
    desc: string
  }
> = {
  owner: {
    label: 'Владелец',
    icon: Crown,
    bg: 'bg-brand-600/10',
    text: 'text-brand-600',
    border: 'border-brand-600/20',
    desc: 'полный доступ',
  },
  editor: {
    label: 'Редактор',
    icon: Pencil,
    bg: 'bg-accent-green-dark/10',
    text: 'text-accent-green-dark',
    border: 'border-accent-green-dark/20',
    desc: 'файлы и сценарий',
  },
  viewer: {
    label: 'Зритель',
    icon: Eye,
    bg: 'bg-[#2980B9]/10',
    text: 'text-[#2980B9]',
    border: 'border-[#2980B9]/20',
    desc: 'только просмотр',
  },
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

function getInitial(nickname: string | null, email: string): string {
  return (nickname || email)[0].toUpperCase()
}

function RoleSelector({
  member,
  eventId,
}: {
  member: TeamMember
  eventId: string
}) {
  const { changeRole } = useTeamStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const role = ROLE_MAP[member.role] || ROLE_MAP.viewer
  const RoleIcon = role.icon
  const isOwner = member.role === 'owner'

  const handleChange = async (newRole: 'editor' | 'viewer') => {
    setOpen(false)
    try {
      await changeRole(eventId, member.id, newRole)
    } catch {
      // handled by store
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !isOwner && setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${role.bg} ${role.border} ${
          isOwner ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
        } transition-opacity`}
      >
        <RoleIcon className={`w-3.5 h-3.5 ${role.text}`} />
        <span className={`text-[12px] font-semibold ${role.text}`}>{role.label}</span>
        {!isOwner && <ChevronDown className={`w-3 h-3 ${role.text}`} />}
      </button>

      {open && (
        <div className="absolute top-10 left-0 w-[180px] bg-white rounded-xl shadow-dropdown border border-brand-300 overflow-hidden py-1 z-20">
          <button
            onClick={() => handleChange('editor')}
            className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center gap-2 transition-colors duration-150 ${
              member.role === 'editor'
                ? 'bg-brand-50 font-semibold text-accent-green-dark'
                : 'text-text-secondary hover:bg-brand-50'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Редактор
          </button>
          <button
            onClick={() => handleChange('viewer')}
            className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center gap-2 transition-colors duration-150 ${
              member.role === 'viewer'
                ? 'bg-brand-50 font-semibold text-[#2980B9]'
                : 'text-text-secondary hover:bg-brand-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Зритель
          </button>
        </div>
      )}
    </div>
  )
}

export default function TeamTab() {
  const { id } = useParams<{ id: string }>()
  const { members, isLoading, fetchMembers, removeMember } = useTeamStore()
  const { currentEvent } = useEventStore()
  const [showInvite, setShowInvite] = useState(false)

  const role = currentEvent?.role as string | undefined
  const isOwner = role === 'owner'

  useEffect(() => {
    if (id) fetchMembers(id)
  }, [id, fetchMembers])

  const handleRemove = async (member: TeamMember) => {
    if (!id) return
    try {
      await removeMember(id, member.id)
    } catch {
      // handled by store
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-[20px] font-bold text-text-primary"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Команда
          </h2>
          <p className="text-[13px] text-text-muted mt-0.5">{members.length} участников</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-button"
          >
            <UserPlus className="w-4 h-4" />
            Пригласить
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-brand-300 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-brand-300 bg-brand-50/50">
          <div className="col-span-5 text-[12px] font-semibold text-text-muted uppercase tracking-wider">
            Участник
          </div>
          <div className="col-span-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider">
            Роль
          </div>
          <div className="col-span-2 text-[12px] font-semibold text-text-muted uppercase tracking-wider">
            Email
          </div>
          <div className="col-span-2 text-[12px] font-semibold text-text-muted uppercase tracking-wider text-right">
            Действия
          </div>
        </div>

        {/* Members */}
        {members.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-brand-300/50 last:border-0 hover:bg-brand-50/30 transition-colors duration-150 items-center"
          >
            {/* User info */}
            <div className="col-span-5 flex items-center gap-3">
              <div
                className={`w-10 h-10 ${getAvatarColor(member.userId)} rounded-xl flex items-center justify-center text-white text-[14px] font-bold`}
              >
                {getInitial(member.nickname, member.email)}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-primary">
                  {member.nickname || member.email.split('@')[0]}
                </p>
                <p className="text-[12px] text-text-light">
                  {member.nickname ? `@${member.nickname}` : ''}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="col-span-3">
              {isOwner ? (
                <RoleSelector member={member} eventId={id!} />
              ) : (
                (() => {
                  const r = ROLE_MAP[member.role] || ROLE_MAP.viewer
                  const Icon = r.icon
                  return (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${r.bg} ${r.border}`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${r.text}`} />
                      <span className={`text-[12px] font-semibold ${r.text}`}>{r.label}</span>
                    </div>
                  )
                })()
              )}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <span className="text-[13px] text-text-muted">{member.email}</span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-1">
              {isOwner && member.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(member)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors duration-150"
                  title="Удалить участника"
                >
                  <UserMinus className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role Legend */}
      <div className="mt-4 flex items-center gap-6">
        {Object.entries(ROLE_MAP).map(([key, r]) => {
          const RIcon = r.icon
          return (
            <div key={key} className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <RIcon className={`w-3.5 h-3.5 ${r.text}`} />
              <span>
                <span className="font-medium">{r.label}</span> — {r.desc}
              </span>
            </div>
          )
        })}
      </div>

      {/* Invite Dialog */}
      {showInvite && id && (
        <InviteDialog
          eventId={id}
          existingMemberIds={members.map((m) => m.userId)}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  )
}

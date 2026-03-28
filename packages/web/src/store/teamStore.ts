import { create } from 'zustand'
import { api } from '../api/client'

export interface TeamMember {
  id: string
  userId: string
  email: string
  nickname: string | null
  role: string
  joinedAt: string | null
}

export interface SearchUser {
  id: string
  email: string
  nickname: string | null
}

interface TeamState {
  members: TeamMember[]
  isLoading: boolean
  searchResults: SearchUser[]
  isSearching: boolean

  fetchMembers: (eventId: string) => Promise<void>
  inviteUser: (eventId: string, userId: string) => Promise<void>
  changeRole: (eventId: string, memberId: string, role: 'editor' | 'viewer') => Promise<void>
  removeMember: (eventId: string, memberId: string) => Promise<void>
  searchUsers: (query: string) => Promise<void>
  clearSearch: () => void
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  isLoading: false,
  searchResults: [],
  isSearching: false,

  fetchMembers: async (eventId) => {
    set({ isLoading: true })
    try {
      const members = await api.get<TeamMember[]>(`/events/${eventId}/members`)
      set({ members, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  inviteUser: async (eventId, userId) => {
    await api.post(`/events/${eventId}/members/invite`, { userId })
  },

  changeRole: async (eventId, memberId, role) => {
    const updated = await api.patch<TeamMember>(`/events/${eventId}/members/${memberId}`, { role })
    set((state) => ({
      members: state.members.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m)),
    }))
  },

  removeMember: async (eventId, memberId) => {
    await api.delete(`/events/${eventId}/members/${memberId}`)
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    }))
  },

  searchUsers: async (query) => {
    if (query.trim().length < 2) {
      set({ searchResults: [], isSearching: false })
      return
    }
    set({ isSearching: true })
    try {
      const results = await api.get<SearchUser[]>(`/users/search?q=${encodeURIComponent(query)}`)
      set({ searchResults: results, isSearching: false })
    } catch {
      set({ searchResults: [], isSearching: false })
    }
  },

  clearSearch: () => {
    set({ searchResults: [], isSearching: false })
  },
}))

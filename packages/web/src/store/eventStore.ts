import { create } from 'zustand'
import { api } from '../api/client'

export interface Event {
  id: string
  title: string
  description: string | null
  date: string | null
  coverUrl: string | null
  status: 'draft' | 'ready' | 'done'
  ownerId: string
  role: 'owner' | 'member'
  membersCount: number
  filesCount: number
  createdAt: string
  updatedAt: string
}

interface EventState {
  events: Event[]
  currentEvent: Event | null
  isLoading: boolean

  fetchEvents: () => Promise<void>
  fetchEvent: (id: string) => Promise<void>
  createEvent: (data: { title: string; description?: string; date?: string }) => Promise<Event>
  updateEvent: (
    id: string,
    data: { title?: string; description?: string | null; date?: string | null; status?: string },
  ) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true })
    try {
      const events = await api.get<Event[]>('/events')
      set({ events, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchEvent: async (id) => {
    set({ isLoading: true })
    try {
      const event = await api.get<Event>(`/events/${id}`)
      set({ currentEvent: event, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createEvent: async (data) => {
    const event = await api.post<Event>('/events', data)
    set((state) => ({ events: [event, ...state.events] }))
    return event
  },

  updateEvent: async (id, data) => {
    const updated = await api.patch<Event>(`/events/${id}`, data)
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updated } : e)),
      currentEvent: state.currentEvent?.id === id ? { ...state.currentEvent, ...updated } : state.currentEvent,
    }))
  },

  deleteEvent: async (id) => {
    await api.delete(`/events/${id}`)
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
    }))
  },
}))

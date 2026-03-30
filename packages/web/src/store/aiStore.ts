import { create } from 'zustand'
import { api } from '../api/client'

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'ai_chats'
const MAX_MESSAGES = 20

function getUserStorageKey(userId: string): string {
  return `${STORAGE_KEY}_${userId}`
}

function loadChats(userId: string): Record<string, AiMessage[]> {
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId))
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveChats(userId: string, chats: Record<string, AiMessage[]>) {
  try {
    // Trim each chat to MAX_MESSAGES before saving
    const trimmed: Record<string, AiMessage[]> = {}
    for (const [eventId, msgs] of Object.entries(chats)) {
      trimmed[eventId] = msgs.slice(-MAX_MESSAGES)
    }
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(trimmed))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

interface AiChatState {
  /** message history per event */
  chats: Record<string, AiMessage[]>
  isLoading: boolean
  /** current user id for localStorage scoping */
  _userId: string

  /** Initialize store with user's persisted chats */
  init: (userId: string) => void
  sendMessage: (eventId: string, message: string) => Promise<void>
  clearChat: (eventId: string) => void
}

export const useAiStore = create<AiChatState>((set, get) => ({
  chats: {},
  isLoading: false,
  _userId: '',

  init: (userId: string) => {
    const chats = loadChats(userId)
    set({ chats, _userId: userId })
  },

  sendMessage: async (eventId, message) => {
    const state = get()
    const history = state.chats[eventId] || []

    // Add user message optimistically
    const updatedHistory: AiMessage[] = [...history, { role: 'user', content: message }]
    const updatedChats = { ...state.chats, [eventId]: updatedHistory }
    set({ chats: updatedChats, isLoading: true })
    saveChats(state._userId, updatedChats)

    try {
      const res = await api.post<{ data: AiMessage; message: string }>(
        `/events/${eventId}/ai/chat`,
        {
          message,
          history: history.slice(-20), // send last 20 messages for context
        },
      )

      const assistantMsg: AiMessage = res.data
      set((s) => {
        const newChats = {
          ...s.chats,
          [eventId]: [...(s.chats[eventId] || []), assistantMsg],
        }
        saveChats(s._userId, newChats)
        return { chats: newChats, isLoading: false }
      })
    } catch (err) {
      // Add error as assistant message
      const errorText = (err as { message?: string })?.message || 'Не удалось получить ответ. Попробуйте позже.'
      set((s) => {
        const errorMsg: AiMessage = { role: 'assistant', content: errorText }
        const newChats: Record<string, AiMessage[]> = {
          ...s.chats,
          [eventId]: [...(s.chats[eventId] || []), errorMsg],
        }
        saveChats(s._userId, newChats)
        return { chats: newChats, isLoading: false }
      })
    }
  },

  clearChat: (eventId) => {
    set((s) => {
      const chats = { ...s.chats }
      delete chats[eventId]
      saveChats(s._userId, chats)
      return { chats }
    })
  },
}))

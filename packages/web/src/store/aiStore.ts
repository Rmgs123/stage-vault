import { create } from 'zustand'
import { api } from '../api/client'

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AiChatState {
  /** message history per event */
  chats: Record<string, AiMessage[]>
  isLoading: boolean

  sendMessage: (eventId: string, message: string) => Promise<void>
  clearChat: (eventId: string) => void
}

export const useAiStore = create<AiChatState>((set, get) => ({
  chats: {},
  isLoading: false,

  sendMessage: async (eventId, message) => {
    const state = get()
    const history = state.chats[eventId] || []

    // Add user message optimistically
    const updatedHistory: AiMessage[] = [...history, { role: 'user', content: message }]
    set({
      chats: { ...state.chats, [eventId]: updatedHistory },
      isLoading: true,
    })

    try {
      const res = await api.post<{ data: AiMessage; message: string }>(
        `/events/${eventId}/ai/chat`,
        {
          message,
          history: history.slice(-20), // send last 20 messages for context
        },
      )

      const assistantMsg: AiMessage = res.data
      set((s) => ({
        chats: {
          ...s.chats,
          [eventId]: [...(s.chats[eventId] || []), assistantMsg],
        },
        isLoading: false,
      }))
    } catch (err) {
      // Add error as assistant message
      const errorText = (err as { message?: string })?.message || 'Не удалось получить ответ. Попробуйте позже.'
      set((s) => ({
        chats: {
          ...s.chats,
          [eventId]: [
            ...(s.chats[eventId] || []),
            { role: 'assistant', content: errorText },
          ],
        },
        isLoading: false,
      }))
    }
  },

  clearChat: (eventId) => {
    set((s) => {
      const chats = { ...s.chats }
      delete chats[eventId]
      return { chats }
    })
  },
}))

import { create } from 'zustand'
import { api } from '../api/client'

export interface BlockAttachment {
  id: string
  fileId: string
  name: string
  originalName: string
  category: 'music' | 'presentation' | 'image' | 'video' | 'document' | 'other'
  mimeType: string
  size: number
}

export interface TimelineBlock {
  id: string
  eventId: string
  title: string
  description: string | null
  durationMin: number | null
  sortOrder: number
  completed: boolean
  createdAt: string
  attachments: BlockAttachment[]
}

interface TimelineState {
  blocks: TimelineBlock[]
  isLoading: boolean

  fetchBlocks: (eventId: string) => Promise<void>
  createBlock: (eventId: string, data: { title: string; description?: string; durationMin?: number }) => Promise<TimelineBlock>
  updateBlock: (eventId: string, blockId: string, data: { title?: string; description?: string | null; durationMin?: number | null; completed?: boolean }) => Promise<void>
  deleteBlock: (eventId: string, blockId: string) => Promise<void>
  reorderBlocks: (eventId: string, ids: string[]) => Promise<void>
  attachFile: (eventId: string, blockId: string, fileId: string) => Promise<void>
  detachFile: (eventId: string, blockId: string, attachmentId: string) => Promise<void>
}

export const useTimelineStore = create<TimelineState>((set) => ({
  blocks: [],
  isLoading: false,

  fetchBlocks: async (eventId) => {
    set({ isLoading: true })
    try {
      const blocks = await api.get<TimelineBlock[]>(`/events/${eventId}/timeline`)
      set({ blocks, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createBlock: async (eventId, data) => {
    const block = await api.post<TimelineBlock>(`/events/${eventId}/timeline`, data)
    set((state) => ({ blocks: [...state.blocks, block] }))
    return block
  },

  updateBlock: async (eventId, blockId, data) => {
    const updated = await api.patch<TimelineBlock>(`/events/${eventId}/timeline/${blockId}`, data)
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === blockId ? updated : b)),
    }))
  },

  deleteBlock: async (eventId, blockId) => {
    await api.delete(`/events/${eventId}/timeline/${blockId}`)
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== blockId),
    }))
  },

  reorderBlocks: async (eventId, ids) => {
    // Optimistic update
    set((state) => {
      const blockMap = new Map(state.blocks.map((b) => [b.id, b]))
      const reordered = ids
        .map((id, index) => {
          const block = blockMap.get(id)
          return block ? { ...block, sortOrder: index } : null
        })
        .filter((b): b is TimelineBlock => b !== null)
      return { blocks: reordered }
    })

    try {
      await api.patch(`/events/${eventId}/timeline/reorder`, { ids })
    } catch {
      // Revert on failure — refetch
      const blocks = await api.get<TimelineBlock[]>(`/events/${eventId}/timeline`)
      set({ blocks })
    }
  },

  attachFile: async (eventId, blockId, fileId) => {
    const attachment = await api.post<BlockAttachment>(
      `/events/${eventId}/timeline/${blockId}/attachments`,
      { fileId },
    )
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId ? { ...b, attachments: [...b.attachments, attachment] } : b,
      ),
    }))
  },

  detachFile: async (eventId, blockId, attachmentId) => {
    await api.delete(`/events/${eventId}/timeline/${blockId}/attachments/${attachmentId}`)
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId
          ? { ...b, attachments: b.attachments.filter((a) => a.id !== attachmentId) }
          : b,
      ),
    }))
  },
}))

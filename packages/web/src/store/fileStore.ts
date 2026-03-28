import { create } from 'zustand'
import { api } from '../api/client'

export interface FileRecord {
  id: string
  eventId: string
  name: string
  originalName: string
  mimeType: string
  size: number
  s3Key: string
  category: 'music' | 'presentation' | 'image' | 'video' | 'document' | 'other'
  sortOrder: number
  note: string | null
  createdAt: string
  downloadUrl?: string
}

interface FileState {
  files: FileRecord[]
  isLoading: boolean
  isUploading: boolean
  uploadProgress: number

  fetchFiles: (eventId: string) => Promise<void>
  uploadFiles: (eventId: string, files: File[]) => Promise<void>
  getFileUrl: (eventId: string, fileId: string) => Promise<FileRecord>
  updateFile: (eventId: string, fileId: string, data: { name?: string; note?: string | null; sortOrder?: number }) => Promise<void>
  deleteFile: (eventId: string, fileId: string) => Promise<void>
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,

  fetchFiles: async (eventId) => {
    set({ isLoading: true })
    try {
      const files = await api.get<FileRecord[]>(`/events/${eventId}/files`)
      set({ files, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  uploadFiles: async (eventId, files) => {
    set({ isUploading: true, uploadProgress: 0 })
    try {
      const uploaded = await api.upload<FileRecord[]>(`/events/${eventId}/files`, files)
      set((state) => ({
        files: [...state.files, ...uploaded],
        isUploading: false,
        uploadProgress: 100,
      }))
    } catch {
      set({ isUploading: false, uploadProgress: 0 })
      throw new Error('Ошибка загрузки файлов')
    }
  },

  getFileUrl: async (eventId, fileId) => {
    const file = await api.get<FileRecord>(`/events/${eventId}/files/${fileId}`)
    return file
  },

  updateFile: async (eventId, fileId, data) => {
    const updated = await api.patch<FileRecord>(`/events/${eventId}/files/${fileId}`, data)
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, ...updated } : f)),
    }))
  },

  deleteFile: async (eventId, fileId) => {
    await api.delete(`/events/${eventId}/files/${fileId}`)
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
    }))
  },
}))

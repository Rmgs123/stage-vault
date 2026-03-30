import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Music,
  Presentation,
  Image as ImageIcon,
  Film,
  FileText,
  File,
  Plus,
  Download,
  Trash2,
  Eye,
  Maximize2,
  Loader2,
} from 'lucide-react'
import { useFileStore, type FileRecord } from '../../store/fileStore'
import { useEventStore } from '../../store/eventStore'
import FileUploader from './FileUploader'
import AudioPlayer from './AudioPlayer'
import ImageViewer from './ImageViewer'

interface CategoryConfig {
  key: string
  label: string
  icon: typeof Music
  iconBg: string
  iconColor: string
  titleColor: string
  subtitleColor: string
  sectionBg: string
  sectionBorder: string
  cardBorder: string
  cardHoverShadow: string
  btnBg: string
  btnHoverBg: string
  btnText: string
  actionHoverBg: string
  actionColor: string
  display: 'player' | 'cards' | 'list'
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'music',
    label: 'Музыка',
    icon: Music,
    iconBg: 'bg-[#2D6A4F]',
    iconColor: 'text-white',
    titleColor: 'text-[#1B4332]',
    subtitleColor: 'text-[#52796F]',
    sectionBg: 'bg-[#1B4332]/[0.06]',
    sectionBorder: 'border-[#1B4332]/10',
    cardBorder: 'border-[#1B4332]/10',
    cardHoverShadow: '',
    btnBg: 'bg-[#2D6A4F]/10',
    btnHoverBg: 'hover:bg-[#2D6A4F]/15',
    btnText: 'text-[#2D6A4F]',
    actionHoverBg: 'hover:bg-[#2D6A4F]/10',
    actionColor: 'text-[#52796F]',
    display: 'player',
  },
  {
    key: 'presentation',
    label: 'Презентации',
    icon: Presentation,
    iconBg: 'bg-[#7C3AED]',
    iconColor: 'text-white',
    titleColor: 'text-[#4C1D95]',
    subtitleColor: 'text-[#7C3AED]/60',
    sectionBg: 'bg-[#7C3AED]/[0.04]',
    sectionBorder: 'border-[#7C3AED]/10',
    cardBorder: 'border-[#7C3AED]/10',
    cardHoverShadow: 'hover:shadow-[0_4px_16px_rgba(124,58,237,0.08)]',
    btnBg: 'bg-[#7C3AED]/10',
    btnHoverBg: 'hover:bg-[#7C3AED]/15',
    btnText: 'text-[#7C3AED]',
    actionHoverBg: 'hover:bg-[#7C3AED]/10',
    actionColor: 'text-[#7C3AED]/60',
    display: 'cards',
  },
  {
    key: 'image',
    label: 'Изображения',
    icon: ImageIcon,
    iconBg: 'bg-[#E67E22]',
    iconColor: 'text-white',
    titleColor: 'text-[#A0522D]',
    subtitleColor: 'text-[#E67E22]/60',
    sectionBg: 'bg-[#E67E22]/[0.04]',
    sectionBorder: 'border-[#E67E22]/10',
    cardBorder: 'border-[#E67E22]/10',
    cardHoverShadow: 'hover:shadow-[0_4px_16px_rgba(230,126,34,0.08)]',
    btnBg: 'bg-[#E67E22]/10',
    btnHoverBg: 'hover:bg-[#E67E22]/15',
    btnText: 'text-[#E67E22]',
    actionHoverBg: 'hover:bg-[#E67E22]/10',
    actionColor: 'text-[#E67E22]/60',
    display: 'cards',
  },
  {
    key: 'video',
    label: 'Видео',
    icon: Film,
    iconBg: 'bg-[#E74C3C]',
    iconColor: 'text-white',
    titleColor: 'text-[#922B21]',
    subtitleColor: 'text-[#E74C3C]/60',
    sectionBg: 'bg-[#E74C3C]/[0.04]',
    sectionBorder: 'border-[#E74C3C]/10',
    cardBorder: 'border-[#E74C3C]/10',
    cardHoverShadow: 'hover:shadow-[0_4px_16px_rgba(231,76,60,0.08)]',
    btnBg: 'bg-[#E74C3C]/10',
    btnHoverBg: 'hover:bg-[#E74C3C]/15',
    btnText: 'text-[#E74C3C]',
    actionHoverBg: 'hover:bg-[#E74C3C]/10',
    actionColor: 'text-[#E74C3C]/60',
    display: 'cards',
  },
  {
    key: 'document',
    label: 'Документы',
    icon: FileText,
    iconBg: 'bg-[#2980B9]',
    iconColor: 'text-white',
    titleColor: 'text-[#1A5276]',
    subtitleColor: 'text-[#2980B9]/60',
    sectionBg: 'bg-[#2980B9]/[0.04]',
    sectionBorder: 'border-[#2980B9]/10',
    cardBorder: 'border-[#2980B9]/10',
    cardHoverShadow: '',
    btnBg: 'bg-[#2980B9]/10',
    btnHoverBg: 'hover:bg-[#2980B9]/15',
    btnText: 'text-[#2980B9]',
    actionHoverBg: 'hover:bg-[#2980B9]/10',
    actionColor: 'text-[#2980B9]/60',
    display: 'list',
  },
  {
    key: 'other',
    label: 'Прочее',
    icon: File,
    iconBg: 'bg-[#9A8A7C]',
    iconColor: 'text-white',
    titleColor: 'text-[#5C4A3A]',
    subtitleColor: 'text-[#9A8A7C]',
    sectionBg: 'bg-[#9A8A7C]/[0.06]',
    sectionBorder: 'border-[#9A8A7C]/15',
    cardBorder: 'border-[#9A8A7C]/10',
    cardHoverShadow: '',
    btnBg: 'bg-[#9A8A7C]/10',
    btnHoverBg: 'hover:bg-[#9A8A7C]/15',
    btnText: 'text-[#9A8A7C]',
    actionHoverBg: 'hover:bg-[#9A8A7C]/10',
    actionColor: 'text-[#9A8A7C]',
    display: 'list',
  },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function categoryTotalSize(files: FileRecord[]): string {
  const total = files.reduce((sum, f) => sum + f.size, 0)
  return formatFileSize(total)
}

export default function FilesTab() {
  const { id } = useParams<{ id: string }>()
  const { files, isLoading, fetchFiles, deleteFile, getFileUrl } = useFileStore()
  const { currentEvent } = useEventStore()
  const [imageViewerState, setImageViewerState] = useState<{
    url: string
    name: string
    index: number
    images: FileRecord[]
  } | null>(null)

  // owner and member (editor role will be added in Phase 5)
  // For now, 'member' can also upload — role-based restrictions handled by backend
  const isOwnerOrEditor =
    currentEvent?.role === 'owner' || currentEvent?.role === 'member'

  useEffect(() => {
    if (id) fetchFiles(id)
  }, [id, fetchFiles])

  const handleDelete = useCallback(
    async (fileId: string) => {
      if (!id) return
      if (!confirm('Удалить файл?')) return
      try {
        await deleteFile(id, fileId)
      } catch (err) {
        alert('Не удалось удалить файл: ' + ((err as { message?: string })?.message || 'Неизвестная ошибка'))
      }
    },
    [id, deleteFile],
  )

  const handleDownload = useCallback(
    async (fileId: string, fileName: string) => {
      if (!id) return
      try {
        const file = await getFileUrl(id, fileId)
        if (file.downloadUrl) {
          const a = document.createElement('a')
          a.href = file.downloadUrl
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch {
        alert('Не удалось скачать файл')
      }
    },
    [id, getFileUrl],
  )

  const handleViewImage = useCallback(
    async (file: FileRecord, images: FileRecord[]) => {
      if (!id) return
      try {
        const fileData = await getFileUrl(id, file.id)
        if (fileData.downloadUrl) {
          const index = images.findIndex((f) => f.id === file.id)
          setImageViewerState({
            url: fileData.downloadUrl,
            name: file.name,
            index,
            images,
          })
        }
      } catch {
        // Error
      }
    },
    [id, getFileUrl],
  )

  const handleImageNav = useCallback(
    async (direction: 'prev' | 'next') => {
      if (!imageViewerState || !id) return
      const { images, index } = imageViewerState
      const newIndex = direction === 'prev' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= images.length) return

      const file = images[newIndex]
      try {
        const fileData = await getFileUrl(id, file.id)
        if (fileData.downloadUrl) {
          setImageViewerState({
            url: fileData.downloadUrl,
            name: file.name,
            index: newIndex,
            images,
          })
        }
      } catch {
        // Error
      }
    },
    [imageViewerState, id, getFileUrl],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  // Group files by category
  const filesByCategory: Record<string, FileRecord[]> = {}
  for (const file of files) {
    if (!filesByCategory[file.category]) {
      filesByCategory[file.category] = []
    }
    filesByCategory[file.category].push(file)
  }

  // Only show categories that have files
  const visibleCategories = CATEGORIES.filter((c) => filesByCategory[c.key]?.length > 0)

  return (
    <>
      {/* Upload Area */}
      {isOwnerOrEditor && id && <FileUploader eventId={id} />}

      {/* Category Sections */}
      {visibleCategories.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
            <File className="w-7 h-7 text-brand-400" />
          </div>
          <h3
            className="text-[16px] font-semibold text-text-secondary mb-1"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Нет файлов
          </h3>
          <p className="text-[14px] text-text-light">
            Загрузите файлы, перетащив их в область выше
          </p>
        </div>
      )}

      {visibleCategories.map((cat) => {
        const catFiles = filesByCategory[cat.key]
        const Icon = cat.icon

        return (
          <div key={cat.key} className="mb-6">
            <div
              className={`${cat.sectionBg} rounded-2xl border ${cat.sectionBorder} overflow-hidden`}
            >
              {/* Section Header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 ${cat.iconBg} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${cat.iconColor}`} />
                  </div>
                  <div>
                    <h2 className={`text-[15px] font-bold ${cat.titleColor}`}>
                      {cat.label}
                    </h2>
                    <p className={`text-[12px] ${cat.subtitleColor}`}>
                      {catFiles.length}{' '}
                      {catFiles.length === 1
                        ? 'файл'
                        : catFiles.length < 5
                          ? 'файла'
                          : 'файлов'}{' '}
                      · {categoryTotalSize(catFiles)}
                    </p>
                  </div>
                </div>
                {isOwnerOrEditor && (
                  <button
                    className={`flex items-center gap-1.5 px-3.5 py-2 ${cat.btnBg} ${cat.btnHoverBg} ${cat.btnText} text-[12px] font-semibold rounded-xl transition-colors duration-150`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Добавить
                  </button>
                )}
              </div>

              {/* Music section with player */}
              {cat.display === 'player' && id && (
                <AudioPlayer tracks={catFiles} eventId={id} />
              )}

              {/* Cards display (presentations, images, video) */}
              {cat.display === 'cards' && (
                <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                  {catFiles.map((file) => {
                    const isImage = cat.key === 'image'
                    return (
                      <div
                        key={file.id}
                        className={`bg-surface rounded-xl border ${cat.cardBorder} p-4 ${cat.cardHoverShadow} transition-all duration-200 group cursor-pointer`}
                      >
                        <div
                          className={`w-full h-24 ${cat.key === 'presentation' ? 'bg-[#7C3AED]/5' : cat.key === 'image' ? 'bg-[#E67E22]/5' : cat.key === 'video' ? 'bg-[#E74C3C]/5' : 'bg-gray-50'} rounded-lg mb-3 flex items-center justify-center relative overflow-hidden`}
                        >
                          <Icon className={`w-8 h-8 ${cat.actionColor}`} />
                          <button
                            onClick={() =>
                              isImage
                                ? handleViewImage(file, catFiles)
                                : handleDownload(file.id, file.name)
                            }
                            className="absolute top-2 right-2 w-7 h-7 bg-surface/80 backdrop-blur rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-surface"
                          >
                            {isImage ? (
                              <Eye className={`w-3.5 h-3.5 ${cat.btnText}`} />
                            ) : (
                              <Maximize2 className={`w-3.5 h-3.5 ${cat.btnText}`} />
                            )}
                          </button>
                        </div>
                        <p className="text-[13px] font-medium text-text-primary truncate mb-1">
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-muted">
                            {formatFileSize(file.size)}
                          </span>
                          {isOwnerOrEditor && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDownload(file.id, file.name)}
                                className={`w-6 h-6 flex items-center justify-center rounded-md ${cat.actionHoverBg}`}
                              >
                                <Download className={`w-3 h-3 ${cat.actionColor}`} />
                              </button>
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* List display (documents, other) */}
              {cat.display === 'list' && (
                <div className="px-5 pb-4 space-y-2">
                  {catFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border ${cat.cardBorder} hover:shadow-sm transition-all duration-200 group cursor-pointer`}
                    >
                      <Icon className={`w-5 h-5 ${cat.actionColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {formatFileSize(file.size)} · {formatDate(file.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(file.id, file.name)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg ${cat.actionHoverBg} opacity-0 group-hover:opacity-100 transition-all`}
                        >
                          <Download className={`w-3.5 h-3.5 ${cat.actionColor}`} />
                        </button>
                        {isOwnerOrEditor && (
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Image Viewer Modal */}
      {imageViewerState && (
        <ImageViewer
          url={imageViewerState.url}
          name={imageViewerState.name}
          onClose={() => setImageViewerState(null)}
          onPrev={
            imageViewerState.index > 0
              ? () => handleImageNav('prev')
              : undefined
          }
          onNext={
            imageViewerState.index < imageViewerState.images.length - 1
              ? () => handleImageNav('next')
              : undefined
          }
        />
      )}
    </>
  )
}

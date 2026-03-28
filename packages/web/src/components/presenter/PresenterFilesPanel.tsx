import { useState } from 'react'
import {
  FolderOpen,
  Sparkles,
  Music,
  Presentation,
  Image as ImageIcon,
  FileText,
  Film,
  File,
  Play,
  Eye,
  Download,
  Bot,
  Send,
} from 'lucide-react'
import type { FileRecord } from '../../store/fileStore'

interface Props {
  files: FileRecord[]
  rightPanel: 'files' | 'ai'
  onShowFiles: () => void
  onShowAI: () => void
  eventId: string
  getFileUrl: (eventId: string, fileId: string) => Promise<FileRecord>
}

const CATEGORIES: {
  key: FileRecord['category']
  label: string
  icon: typeof Music
  color: string
}[] = [
  { key: 'music', label: 'Музыка', icon: Music, color: '#2D6A4F' },
  { key: 'presentation', label: 'Презентации', icon: Presentation, color: '#7C3AED' },
  { key: 'image', label: 'Изображения', icon: ImageIcon, color: '#E67E22' },
  { key: 'video', label: 'Видео', icon: Film, color: '#E74C3C' },
  { key: 'document', label: 'Документы', icon: FileText, color: '#2980B9' },
  { key: 'other', label: 'Прочее', icon: File, color: '#7A6A5C' },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PresenterFilesPanel({
  files,
  rightPanel,
  onShowFiles,
  onShowAI,
  eventId,
  getFileUrl,
}: Props) {
  const [aiMessage, setAiMessage] = useState('')

  const handleDownload = async (fileId: string, name: string) => {
    try {
      const file = await getFileUrl(eventId, fileId)
      if (file.downloadUrl) {
        const a = document.createElement('a')
        a.href = file.downloadUrl
        a.download = name
        a.click()
      }
    } catch {
      // Download failed
    }
  }

  return (
    <div className="w-[320px] bg-[#231E18] border-l border-[#3A3228] flex flex-col shrink-0">
      {/* Panel Tabs */}
      <div className="flex border-b border-[#3A3228]">
        <button
          onClick={onShowFiles}
          className={`flex-1 py-3 text-[12px] font-semibold text-center transition-colors duration-150 ${
            rightPanel === 'files'
              ? 'text-[#A98B76] border-b-2 border-[#A98B76]'
              : 'text-[#7A6A5C] hover:text-[#9A8A7C]'
          }`}
        >
          <FolderOpen className="w-4 h-4 mx-auto mb-0.5" />
          Файлы
        </button>
        <button
          onClick={onShowAI}
          className={`flex-1 py-3 text-[12px] font-semibold text-center transition-colors duration-150 ${
            rightPanel === 'ai'
              ? 'text-[#A98B76] border-b-2 border-[#A98B76]'
              : 'text-[#7A6A5C] hover:text-[#9A8A7C]'
          }`}
        >
          <Sparkles className="w-4 h-4 mx-auto mb-0.5" />
          ИИ
        </button>
      </div>

      {rightPanel === 'files' && (
        <div className="flex-1 overflow-y-auto py-3">
          {CATEGORIES.map(({ key, label, icon: Icon, color }) => {
            const categoryFiles = files.filter((f) => f.category === key)
            if (categoryFiles.length === 0) return null

            return (
              <div key={key} className="px-3 mb-4">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-[12px] font-bold text-[#9A8A7C] uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="text-[10px] text-[#5A4F44]">{categoryFiles.length}</span>
                </div>
                {categoryFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#2D2620] transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#C4B5A6] truncate">{f.name}</p>
                      <p className="text-[10px] text-[#5A4F44]">{formatFileSize(f.size)}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(f.id, f.name)}
                      className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color }}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )
          })}

          {files.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-[#7A6A5C]">Нет файлов</p>
            </div>
          )}
        </div>
      )}

      {rightPanel === 'ai' && (
        <div className="flex-1 flex flex-col">
          {/* AI Chat placeholder — will be implemented in Phase 8 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-md flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-[#2D2620] rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[230px]">
                <p className="text-[12px] text-[#C4B5A6] leading-relaxed">
                  ИИ-ассистент будет доступен в следующем обновлении. Он сможет отвечать на вопросы
                  о файлах и сценарии вашего мероприятия.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-[#3A3228]">
            <div className="flex items-center gap-2 bg-[#2D2620] rounded-xl px-3 py-2.5">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Вопрос..."
                disabled
                className="flex-1 bg-transparent text-[12px] text-[#E8DDD3] placeholder-[#5A4F44] outline-none disabled:opacity-50"
              />
              <button
                disabled
                className="w-7 h-7 bg-[#A98B76]/30 rounded-lg flex items-center justify-center transition-colors duration-150"
              >
                <Send className="w-3.5 h-3.5 text-[#7A6A5C]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

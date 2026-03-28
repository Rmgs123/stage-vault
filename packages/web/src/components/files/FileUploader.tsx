import { useState, useRef, useCallback } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { useFileStore } from '../../store/fileStore'

interface FileUploaderProps {
  eventId: string
}

export default function FileUploader({ eventId }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isUploading, uploadFiles } = useFileStore()

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      const files = Array.from(fileList)
      try {
        await uploadFiles(eventId, files)
      } catch {
        // Error handled by store
      }
    },
    [eventId, uploadFiles],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`mb-6 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer ${
        dragOver
          ? 'border-brand-600 bg-brand-600/5'
          : 'border-brand-400 bg-white/40 hover:border-brand-500'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {isUploading ? (
        <>
          <Loader2 className="w-8 h-8 text-brand-600 mx-auto mb-2 animate-spin" />
          <p className="text-[14px] font-medium text-text-secondary">Загрузка файлов...</p>
        </>
      ) : (
        <>
          <Upload className="w-8 h-8 text-text-light mx-auto mb-2" />
          <p className="text-[14px] font-medium text-text-secondary">
            Перетащите файлы или нажмите для загрузки
          </p>
          <p className="text-[12px] text-text-light mt-1">
            До 500 MB на файл · Использовано 0 MB из 5 GB
          </p>
        </>
      )}
    </div>
  )
}

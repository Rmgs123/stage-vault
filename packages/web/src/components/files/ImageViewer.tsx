import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

interface ImageViewerProps {
  url: string
  name: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export default function ImageViewer({ url, name, onClose, onPrev, onNext }: ImageViewerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a
          href={url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
        >
          <Download className="w-5 h-5 text-white" />
        </a>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <p className="text-white text-[14px] font-medium">{name}</p>
      </div>

      {/* Nav arrows */}
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image */}
      <img
        src={url}
        alt={name}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
      />
    </div>
  )
}

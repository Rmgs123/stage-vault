import { type ReactNode, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} mx-4 bg-white rounded-2xl shadow-dropdown p-6 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-text-primary font-serif">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 transition-colors duration-150"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 transition-colors duration-150"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}

        {children}
      </div>
    </div>
  )
}

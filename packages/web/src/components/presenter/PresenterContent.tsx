import { useState, useEffect, useRef, useCallback, MutableRefObject } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Presentation,
  Image as ImageIcon,
  FileText,
} from 'lucide-react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { TimelineBlock, BlockAttachment } from '../../store/timelineStore'
import type { FileRecord } from '../../store/fileStore'

interface Props {
  activeBlock: TimelineBlock | null
  eventId: string
  getFileUrl: (eventId: string, fileId: string) => Promise<FileRecord>
  slidePrevRef: MutableRefObject<(() => void) | null>
  slideNextRef: MutableRefObject<(() => void) | null>
}

type ContentType = 'pdf' | 'image' | 'none'

export default function PresenterContent({
  activeBlock,
  eventId,
  getFileUrl,
  slidePrevRef,
  slideNextRef,
}: Props) {
  const [contentUrl, setContentUrl] = useState<string | null>(null)
  const [contentType, setContentType] = useState<ContentType>('none')
  const [currentAttachment, setCurrentAttachment] = useState<BlockAttachment | null>(null)
  const [currentSlide, setCurrentSlide] = useState(1)
  const [totalSlides, setTotalSlides] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const contentAreaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)

  // Get presentable attachments from active block
  const presentableAttachments = activeBlock?.attachments.filter(
    (a) => a.category === 'presentation' || a.category === 'image',
  ) || []

  // Load first presentable attachment when active block changes
  useEffect(() => {
    if (presentableAttachments.length > 0) {
      const first = presentableAttachments[0]
      if (first.fileId !== currentAttachment?.fileId) {
        loadAttachment(first)
        setImageIndex(0)
      }
    } else {
      setContentUrl(null)
      setContentType('none')
      setCurrentAttachment(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlock?.id])

  const loadAttachment = async (attachment: BlockAttachment) => {
    try {
      const file = await getFileUrl(eventId, attachment.fileId)
      if (!file.downloadUrl) return

      setCurrentAttachment(attachment)

      if (attachment.mimeType === 'application/pdf' || attachment.category === 'presentation') {
        setContentType('pdf')
        setContentUrl(file.downloadUrl)
        setCurrentSlide(1)
        loadPdf(file.downloadUrl)
      } else if (attachment.category === 'image') {
        setContentType('image')
        setContentUrl(file.downloadUrl)
        setCurrentSlide(1)
        setTotalSlides(1)
      }
    } catch {
      // Failed to load attachment
    }
  }

  const loadPdf = async (url: string) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const loadingTask = pdfjsLib.getDocument(url)
      const pdf = await loadingTask.promise
      pdfDocRef.current = pdf
      setTotalSlides(pdf.numPages)
      renderPage(pdf, 1)
    } catch {
      // PDF loading failed
      setContentType('none')
    }
  }

  const renderPage = async (
    pdf: PDFDocumentProxy,
    pageNum: number,
  ) => {
    try {
      const page = await pdf.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const containerWidth = container.clientWidth - 48
      const containerHeight = container.clientHeight - 48

      const viewport = page.getViewport({ scale: 1 })
      const scaleX = containerWidth / viewport.width
      const scaleY = containerHeight / viewport.height
      const scale = Math.min(scaleX, scaleY, 2)

      const scaledViewport = page.getViewport({ scale })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas } as Parameters<typeof page.render>[0]).promise
    } catch {
      // Page render failed
    }
  }

  const goToSlide = useCallback(
    (num: number) => {
      if (contentType === 'pdf' && pdfDocRef.current) {
        const clamped = Math.max(1, Math.min(num, totalSlides))
        setCurrentSlide(clamped)
        renderPage(pdfDocRef.current, clamped)
      } else if (contentType === 'image') {
        // Navigate between image attachments
        const images = presentableAttachments.filter((a) => a.category === 'image')
        if (images.length > 1) {
          const newIdx = Math.max(0, Math.min(num - 1, images.length - 1))
          setImageIndex(newIdx)
          loadAttachment(images[newIdx])
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contentType, totalSlides, presentableAttachments],
  )

  const prevSlide = useCallback(() => {
    if (contentType === 'pdf') {
      goToSlide(currentSlide - 1)
    } else if (contentType === 'image') {
      const images = presentableAttachments.filter((a) => a.category === 'image')
      if (imageIndex > 0) {
        const newIdx = imageIndex - 1
        setImageIndex(newIdx)
        loadAttachment(images[newIdx])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, currentSlide, imageIndex, goToSlide])

  const nextSlide = useCallback(() => {
    if (contentType === 'pdf') {
      goToSlide(currentSlide + 1)
    } else if (contentType === 'image') {
      const images = presentableAttachments.filter((a) => a.category === 'image')
      if (imageIndex < images.length - 1) {
        const newIdx = imageIndex + 1
        setImageIndex(newIdx)
        loadAttachment(images[newIdx])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, currentSlide, imageIndex, goToSlide])

  // Expose navigation to parent for keyboard shortcuts
  useEffect(() => {
    slidePrevRef.current = prevSlide
    slideNextRef.current = nextSlide
  }, [prevSlide, nextSlide, slidePrevRef, slideNextRef])

  // Fullscreen change listener
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!contentAreaRef.current) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await contentAreaRef.current.requestFullscreen()
    }
  }

  // Re-render PDF when exiting fullscreen (canvas size may change)
  useEffect(() => {
    if (!isFullscreen && contentType === 'pdf' && pdfDocRef.current) {
      // Small delay to let layout settle
      const t = setTimeout(() => renderPage(pdfDocRef.current!, currentSlide), 100)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen])

  const getSlideLabel = () => {
    if (contentType === 'pdf') return `${currentSlide} / ${totalSlides}`
    if (contentType === 'image') {
      const images = presentableAttachments.filter((a) => a.category === 'image')
      if (images.length > 1) return `${imageIndex + 1} / ${images.length}`
      return '1 / 1'
    }
    return ''
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Slide Area */}
      <div
        ref={contentAreaRef}
        className={`flex-1 flex items-center justify-center relative p-6 ${
          isFullscreen ? 'bg-[#1A1611]' : ''
        }`}
      >
        {contentType === 'none' ? (
          /* Empty state */
          <div className="w-full max-w-[900px] aspect-video bg-[#231E18] rounded-2xl border border-[#3A3228] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D2620] to-[#1A1611]" />
            <div className="relative z-10 text-center px-16">
              <div className="w-16 h-16 bg-[#A98B76]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Presentation className="w-8 h-8 text-[#A98B76]" />
              </div>
              <h2
                className="text-[22px] font-bold text-[#E8DDD3] mb-3"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {activeBlock ? activeBlock.title : 'Пульт ведущего'}
              </h2>
              <p className="text-[15px] text-[#9A8A7C] leading-relaxed">
                {activeBlock
                  ? 'К этому блоку не прикреплены презентации или изображения'
                  : 'Выберите блок сценария для отображения контента'}
              </p>
            </div>
          </div>
        ) : contentType === 'pdf' ? (
          /* PDF Viewer */
          <div className="w-full max-w-[900px] aspect-video bg-[#231E18] rounded-2xl border border-[#3A3228] flex items-center justify-center relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            <canvas ref={canvasRef} className="max-w-full max-h-full" />

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors duration-150 z-20"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Slide indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg z-20">
              <span className="text-[12px] text-white/80 font-medium tabular-nums">
                {getSlideLabel()}
              </span>
            </div>
          </div>
        ) : contentType === 'image' ? (
          /* Image Viewer */
          <div className="w-full max-w-[900px] aspect-video bg-[#231E18] rounded-2xl border border-[#3A3228] flex items-center justify-center relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            {contentUrl && (
              <img
                src={contentUrl}
                alt={currentAttachment?.originalName || ''}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors duration-150 z-20"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Slide indicator for multiple images */}
            {presentableAttachments.filter((a) => a.category === 'image').length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg z-20">
                <span className="text-[12px] text-white/80 font-medium tabular-nums">
                  {getSlideLabel()}
                </span>
              </div>
            )}
          </div>
        ) : null}

        {/* Slide Navigation Arrows */}
        {contentType !== 'none' && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#231E18] hover:bg-[#2D2620] border border-[#3A3228] rounded-xl flex items-center justify-center transition-colors duration-150"
            >
              <ChevronLeft className="w-6 h-6 text-[#9A8A7C]" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#231E18] hover:bg-[#2D2620] border border-[#3A3228] rounded-xl flex items-center justify-center transition-colors duration-150"
            >
              <ChevronRight className="w-6 h-6 text-[#9A8A7C]" />
            </button>
          </>
        )}
      </div>

      {/* Active Block Info Bar */}
      {activeBlock && (
        <div className="mx-6 mb-3 px-4 py-2.5 bg-[#231E18] border border-[#3A3228] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#A98B76] uppercase tracking-wider">
              Сейчас
            </span>
            <span className="text-[14px] font-semibold text-[#E8DDD3] truncate max-w-[300px]">
              {activeBlock.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {contentType === 'pdf' && (
              <span className="text-[13px] text-[#9A8A7C]">
                Слайд {currentSlide} из {totalSlides}
              </span>
            )}
            {activeBlock.attachments.length > 0 && (
              <div className="flex items-center gap-1.5">
                {activeBlock.attachments.some((a) => a.category === 'presentation') && (
                  <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                )}
                {activeBlock.attachments.some((a) => a.category === 'image') && (
                  <ImageIcon className="w-3.5 h-3.5 text-[#E67E22]" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

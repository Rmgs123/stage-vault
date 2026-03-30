import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import AiChatPanel from './AiChatPanel'

interface Props {
  eventId: string
}

export default function AiChatWidget({ eventId }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-[420px] h-[600px] bg-[#231E18] border border-[#3A3228] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3228]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A98B76]" />
              <span className="text-[13px] font-semibold text-[#E8DDD3]">
                ИИ-ассистент
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#2D2620] text-[#7A6A5C] hover:text-[#9A8A7C] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat body */}
          <AiChatPanel eventId={eventId} />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 z-50 ${
          isOpen
            ? 'bg-[#3A3228] text-[#A98B76] hover:bg-[#4A4238]'
            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-button hover:shadow-button-hover'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </button>
    </>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Loader2, Trash2 } from 'lucide-react'
import { useAiStore } from '../../store/aiStore'
import MessageBubble from './MessageBubble'

interface Props {
  eventId: string
}

export default function AiChatPanel({ eventId }: Props) {
  const [input, setInput] = useState('')
  const { chats, isLoading, sendMessage, clearChat } = useAiStore()
  const messages = chats[eventId] || []
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage(eventId, text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-md flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="bg-[#2D2620] rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[230px]">
              <p className="text-[12px] text-[#C4B5A6] leading-relaxed">
                Привет! Я вижу ваш проект. Спросите что-нибудь о файлах или сценарии.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-md flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="bg-[#2D2620] rounded-xl rounded-tl-sm px-3 py-2.5">
              <Loader2 className="w-4 h-4 text-[#A98B76] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input + Clear */}
      <div className="p-3 border-t border-[#3A3228]">
        {messages.length > 0 && (
          <button
            onClick={() => clearChat(eventId)}
            className="flex items-center gap-1.5 text-[11px] text-[#5A4F44] hover:text-[#9A8A7C] mb-2 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Очистить чат
          </button>
        )}
        <div className="flex items-center gap-2 bg-[#2D2620] rounded-xl px-3 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Вопрос..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-[12px] text-[#E8DDD3] placeholder-[#5A4F44] outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 ${
              input.trim() && !isLoading
                ? 'bg-[#A98B76] hover:bg-[#96796A] text-white'
                : 'bg-[#A98B76]/30 text-[#7A6A5C]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

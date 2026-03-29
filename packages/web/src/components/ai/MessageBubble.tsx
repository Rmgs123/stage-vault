import { Bot } from 'lucide-react'
import type { AiMessage } from '../../store/aiStore'

interface Props {
  message: AiMessage
}

export default function MessageBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex gap-2 justify-end">
        <div className="bg-[#A98B76] rounded-xl rounded-tr-sm px-3 py-2.5 max-w-[230px]">
          <p className="text-[12px] text-white leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 bg-gradient-to-br from-[#A98B76] to-[#7A6A5C] rounded-md flex items-center justify-center shrink-0">
        <Bot className="w-3 h-3 text-white" />
      </div>
      <div className="bg-[#2D2620] rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[230px]">
        <p className="text-[12px] text-[#C4B5A6] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}

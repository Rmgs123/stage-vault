import { type ReactNode, useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ content, children, position = 'top', delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 px-3 py-1.5 bg-text-primary text-white text-[12px] font-medium rounded-lg',
            'whitespace-nowrap pointer-events-none',
            'animate-in fade-in zoom-in-95 duration-150',
            positionStyles[position],
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

import { type HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white rounded-2xl border border-brand-300 overflow-hidden',
          hoverable &&
            'cursor-pointer hover:shadow-card hover:border-brand-600/40 transition-all duration-200',
          paddingStyles[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

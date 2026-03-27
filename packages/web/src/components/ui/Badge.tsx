import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-300 text-text-muted',
  success: 'bg-accent-green/20 text-accent-green-dark',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-brand-600/15 text-brand-600',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

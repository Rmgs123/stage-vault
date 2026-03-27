import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 hover:bg-brand-700 text-white shadow-button hover:shadow-button-hover',
  secondary:
    'bg-brand-100 hover:bg-brand-200 text-brand-600 border border-brand-300',
  ghost:
    'bg-transparent hover:bg-brand-50 text-brand-600',
  danger:
    'bg-red-500 hover:bg-red-600 text-white shadow-button',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-5 py-2.5 text-[14px] rounded-xl',
  lg: 'px-6 py-3.5 text-[15px] rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

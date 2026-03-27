import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-brand-900">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full px-4 py-3 bg-brand-50 border rounded-xl text-[15px] text-text-primary',
              'placeholder-text-placeholder outline-none transition-all duration-200',
              error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10',
              rightIcon && 'pr-12',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-[13px] text-red-500">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'

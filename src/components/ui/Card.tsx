import { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  subtitle?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function Card({ title, subtitle, children, className = '', contentClassName = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 flex-shrink-0">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  )
}

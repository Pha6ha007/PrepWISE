import * as React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'premium' | 'outline'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
    premium: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300',
    outline: 'bg-transparent text-gray-700 border-gray-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

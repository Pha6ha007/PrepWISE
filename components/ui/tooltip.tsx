import * as React from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${
            side === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : side === 'bottom'
              ? 'top-full left-1/2 -translate-x-1/2 mt-2'
              : side === 'left'
              ? 'right-full top-1/2 -translate-y-1/2 mr-2'
              : 'left-full top-1/2 -translate-y-1/2 ml-2'
          }`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              side === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -mt-1'
                : side === 'bottom'
                ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
                : side === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 -ml-1'
                : 'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </div>
      )}
    </div>
  )
}

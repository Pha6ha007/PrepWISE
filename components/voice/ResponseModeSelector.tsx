'use client'

import { motion } from 'framer-motion'
import { Type, Volume2, Layers } from 'lucide-react'

export type ResponseMode = 'text' | 'voice' | 'both'

const STORAGE_KEY = 'prepwise_response_mode'

interface ResponseModeSelectorProps {
  mode: ResponseMode
  onModeChange: (mode: ResponseMode) => void
}

const modes: { value: ResponseMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'text',
    label: 'Text only',
    icon: <Type className="w-4 h-4" />,
    description: 'Read responses',
  },
  {
    value: 'voice',
    label: 'Voice only',
    icon: <Volume2 className="w-4 h-4" />,
    description: 'Listen to responses',
  },
  {
    value: 'both',
    label: 'Both',
    icon: <Layers className="w-4 h-4" />,
    description: 'Read & listen',
  },
]

/**
 * Read the stored response mode from localStorage.
 * Returns 'text' as default if no preference is stored.
 */
export function getStoredResponseMode(): ResponseMode {
  if (typeof window === 'undefined') return 'text'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'text' || stored === 'voice' || stored === 'both') {
    return stored
  }
  return 'text'
}

/**
 * Save the response mode to localStorage.
 */
export function setStoredResponseMode(mode: ResponseMode): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, mode)
}

export function ResponseModeSelector({ mode, onModeChange }: ResponseModeSelectorProps) {
  return (
    <div className="flex items-center space-x-1 p-1 glass-button border border-white/20 rounded-xl">
      {modes.map((m) => {
        const isActive = mode === m.value
        return (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`
              relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-colors duration-200
              ${isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            title={m.description}
          >
            {isActive && (
              <motion.div
                layoutId="response-mode-indicator"
                className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10 flex items-center space-x-1.5">
              {m.icon}
              <span>{m.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

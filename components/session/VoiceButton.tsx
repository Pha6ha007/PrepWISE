'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceButtonProps {
  isListening: boolean
  isSpeaking: boolean
  onToggle: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Voice button with mic on/off, audio visualization ring,
 * and visual states for listening/speaking/idle.
 */
export function VoiceButton({
  isListening,
  isSpeaking,
  onToggle,
  disabled = false,
  size = 'lg',
}: VoiceButtonProps) {
  const [audioLevel, setAudioLevel] = useState(0)
  const animationFrameRef = useRef<number | null>(null)

  // Simulated audio level animation when listening
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setAudioLevel(Math.random() * 0.6 + 0.2) // 0.2-0.8 range
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      setAudioLevel(0)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isListening])

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const ringScale = 1 + audioLevel * 0.3 // Scale ring by audio level

  return (
    <div className="relative flex items-center justify-center">
      {/* Audio visualization ring */}
      {isListening && (
        <div
          className="absolute rounded-full border-2 border-red-400/40 transition-transform duration-75"
          style={{
            width: size === 'lg' ? 96 : size === 'md' ? 80 : 64,
            height: size === 'lg' ? 96 : size === 'md' ? 80 : 64,
            transform: `scale(${ringScale})`,
          }}
        />
      )}

      {/* Speaking pulse ring */}
      {isSpeaking && (
        <div className="absolute rounded-full border-2 border-blue-400/40 animate-ping"
          style={{
            width: size === 'lg' ? 96 : size === 'md' ? 80 : 64,
            height: size === 'lg' ? 96 : size === 'md' ? 80 : 64,
          }}
        />
      )}

      {/* Main button */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
          isListening
            ? 'bg-red-500 text-white shadow-red-500/30 hover:bg-red-400'
            : isSpeaking
              ? 'bg-blue-500 text-white shadow-blue-500/30 cursor-default'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-slate-900/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSpeaking ? (
          <Volume2 className={`${iconSizes[size]} animate-pulse`} />
        ) : isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {/* Status label */}
      <div className="absolute -bottom-6 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to speak'}
      </div>
    </div>
  )
}

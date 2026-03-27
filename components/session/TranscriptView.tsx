'use client'

import { useRef, useEffect } from 'react'

interface TranscriptMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface TranscriptViewProps {
  messages: TranscriptMessage[]
  isLoading?: boolean
  className?: string
}

/**
 * Real-time transcript display for voice sessions.
 * Shows conversation history with auto-scroll and role-based styling.
 */
export function TranscriptView({ messages, isLoading = false, className = '' }: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center text-slate-500 text-sm ${className}`}>
        <p>Start speaking to see the transcript here</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto space-y-3 px-4 py-3 ${className}`}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            {/* Role label */}
            <div className="text-[10px] text-slate-500 mb-0.5 px-1">
              {msg.role === 'user' ? 'You' : 'Sam'}
              <span className="ml-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Message bubble */}
            <div
              className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700/50'
              }`}
            >
              {msg.content}
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="inline-block rounded-2xl rounded-bl-md px-4 py-3 bg-slate-800 border border-slate-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

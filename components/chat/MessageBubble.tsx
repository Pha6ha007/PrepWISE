'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Message } from '@/types'
import { AudioPlayer } from '@/components/voice/AudioPlayer'

interface MessageBubbleProps {
  message: Message
  enableVoice?: boolean
}

export function MessageBubble({ message, enableVoice = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'flex w-full mb-4 animate-fade-in-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-5 py-4 transition-smooth hover-lift relative overflow-hidden',
          isUser
            ? 'bg-gradient-to-br from-[#6366F1] to-[#818CF8] text-white shadow-card hover:shadow-large'
            : 'glass-button border border-white/20 text-foreground shadow-card hover:shadow-large backdrop-blur-md'
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className="flex items-center justify-between mt-3 gap-3">
          {message.createdAt && (
            <p
              className={cn(
                'text-xs',
                isUser ? 'text-white/70' : 'text-[#6B7280]'
              )}
            >
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
          {isAssistant && enableVoice && (
            <AudioPlayer text={message.content} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

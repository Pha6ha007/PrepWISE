'use client'

import { motion } from 'framer-motion'

interface GuidedPromptProps {
  text: string
  color: string
  emoji?: string
}

export function GuidedPrompt({ text, color, emoji }: GuidedPromptProps) {
  return (
    <motion.div
      className="glass p-6 rounded-2xl shadow-large max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.4 },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      <div className="flex items-start space-x-3">
        {emoji && (
          <motion.span
            className="text-3xl flex-shrink-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {emoji}
          </motion.span>
        )}
        <motion.p
          className="font-serif text-lg leading-relaxed"
          style={{ color }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {text}
        </motion.p>
      </div>
    </motion.div>
  )
}

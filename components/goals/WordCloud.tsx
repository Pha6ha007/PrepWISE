'use client'

// WordCloud — Visual word cloud of top topics

import { motion } from 'framer-motion'

interface WordCloudProps {
  words: { word: string; count: number }[]
}

const COLORS = [
  '#6366F1', // indigo
  '#EC4899', // pink
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#10B981', // green
  '#06B6D4', // cyan
  '#EF4444', // red
]

export default function WordCloud({ words }: WordCloudProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          Not enough data yet. Keep chatting to see your top topics!
        </p>
      </div>
    )
  }

  // Calculate font sizes (11px-28px range)
  const maxCount = Math.max(...words.map((w) => w.count))
  const minCount = Math.min(...words.map((w) => w.count))
  const range = maxCount - minCount || 1

  const getFontSize = (count: number) => {
    const normalized = (count - minCount) / range
    return 11 + normalized * 17 // 11-28px
  }

  // Get top 7 for breakdown
  const top7 = words.slice(0, 7)
  const maxTop7Count = Math.max(...top7.map((w) => w.count))

  return (
    <div className="space-y-8">
      {/* Word Cloud */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-2xl border border-gray-200 min-h-[300px] flex flex-wrap items-center justify-center gap-4">
        {words.map((item, index) => {
          const fontSize = getFontSize(item.count)
          const color = COLORS[index % COLORS.length]

          return (
            <motion.span
              key={item.word}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.15, opacity: 1 }}
              className="font-serif font-semibold cursor-default transition-all opacity-80 hover:opacity-100"
              style={{
                fontSize: `${fontSize}px`,
                color,
              }}
            >
              {item.word}
            </motion.span>
          )
        })}
      </div>

      {/* Top 7 Breakdown */}
      <div className="space-y-3">
        <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
          Top Topics Breakdown
        </h4>

        {top7.map((item, index) => {
          const percentage = (item.count / maxTop7Count) * 100
          const color = COLORS[index % COLORS.length]

          return (
            <motion.div
              key={item.word}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground capitalize">{item.word}</span>
                <span className="text-muted-foreground">{item.count} times</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

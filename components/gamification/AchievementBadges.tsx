'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X } from 'lucide-react'
import type { Achievement } from '@/lib/gmat/gamification'
import { getAchievementProgress, type UserStats } from '@/lib/gmat/gamification'

interface AchievementBadgesProps {
  achievements: Achievement[]
  stats: UserStats
}

export function AchievementBadges({ achievements, stats }: AchievementBadgesProps) {
  const [selected, setSelected] = useState<Achievement | null>(null)

  const unlocked = achievements.filter((a) => a.unlockedAt !== null)
  const locked = achievements.filter((a) => a.unlockedAt === null)

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Achievements</h3>
          <span className="text-xs text-slate-400 tabular-nums">
            {unlocked.length}/{achievements.length} unlocked
          </span>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {achievements.map((achievement, i) => {
            const isUnlocked = achievement.unlockedAt !== null
            const progress = !isUnlocked ? getAchievementProgress(achievement.id, stats) : null

            return (
              <motion.button
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => setSelected(achievement)}
                className={`
                  relative flex flex-col items-center justify-center gap-1
                  p-3 rounded-xl border transition-all duration-200
                  ${isUnlocked
                    ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] opacity-50 hover:opacity-70'
                  }
                `}
                title={isUnlocked ? achievement.name : achievement.requirement}
              >
                {/* Icon or lock */}
                <span className={`text-xl ${!isUnlocked ? 'grayscale' : ''}`}>
                  {isUnlocked ? achievement.icon : '🔒'}
                </span>

                {/* Name (truncated) */}
                <span className={`text-[10px] leading-tight text-center line-clamp-1 ${
                  isUnlocked ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {isUnlocked ? achievement.name : '???'}
                </span>

                {/* Progress bar for locked achievements near completion */}
                {!isUnlocked && progress !== null && progress > 0 && (
                  <div className="absolute bottom-1 left-2 right-2 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-cyan-400/40"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="
                relative w-full max-w-xs rounded-2xl border border-white/[0.08]
                bg-[#0D1220] p-6 text-center
              "
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Achievement icon — large */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="text-5xl mb-3"
              >
                {selected.unlockedAt ? selected.icon : '🔒'}
              </motion.div>

              <h4 className="text-lg font-bold text-white mb-1">
                {selected.unlockedAt ? selected.name : '???'}
              </h4>

              <p className="text-sm text-slate-400 mb-3">
                {selected.description}
              </p>

              {selected.unlockedAt ? (
                <p className="text-xs text-cyan-400/70">
                  Unlocked {formatUnlockDate(selected.unlockedAt)}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    Requirement: {selected.requirement}
                  </p>
                  {(() => {
                    const progress = getAchievementProgress(selected.id, stats)
                    if (progress === null || progress === 0) return null
                    return (
                      <div className="mx-auto w-3/4">
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {Math.round(progress * 100)}% complete
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function formatUnlockDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

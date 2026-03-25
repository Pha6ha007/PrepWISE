'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StreakData } from '@/lib/gmat/gamification'

interface StreakRingProps {
  streak: StreakData
  size?: number // px, default 120
}

export function StreakRing({ streak, size = 120 }: StreakRingProps) {
  const [animate, setAnimate] = useState(false)

  // Trigger pulse when today is completed
  useEffect(() => {
    if (streak.todayCompleted) {
      const t = setTimeout(() => setAnimate(true), 300)
      return () => clearTimeout(t)
    }
  }, [streak.todayCompleted])

  const strokeWidth = 6
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = streak.weeklyGoal > 0
    ? Math.min(streak.weeklyProgress / streak.weeklyGoal, 1)
    : 0
  const dashOffset = circumference * (1 - progress)

  const center = size / 2
  const hasStreak = streak.currentStreak > 0

  // Day dots around the ring (Mon-Sun)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const dotRadius = radius + strokeWidth + 8

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Day segment ticks */}
          {days.map((_, i) => {
            const segAngle = (360 / 7) * i - 90
            const rad = (segAngle * Math.PI) / 180
            const x1 = center + (radius - 2) * Math.cos(rad)
            const y1 = center + (radius - 2) * Math.sin(rad)
            const x2 = center + (radius + 2) * Math.cos(rad)
            const y2 = center + (radius + 2) * Math.sin(rad)
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            )
          })}

          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={hasStreak ? 'url(#streakGradient)' : '#22d3ee'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Gradient for streak state */}
          <defs>
            <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {streak.todayCompleted && animate ? (
              <motion.div
                key="completed"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <motion.span
                  className="text-2xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: 2, repeatDelay: 0.4 }}
                >
                  🔥
                </motion.span>
                <span className="text-base font-bold text-white tabular-nums">
                  {streak.currentStreak}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl">
                  {hasStreak ? '🔥' : '📚'}
                </span>
                <span className="text-base font-bold text-white tabular-nums">
                  {streak.currentStreak}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ambient glow when on streak */}
        {hasStreak && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-xs text-slate-400">
          {streak.currentStreak > 0
            ? `${streak.currentStreak} day streak`
            : 'Start your streak!'}
        </p>
        <p className="text-[10px] text-slate-500 tabular-nums">
          {streak.weeklyProgress}/{streak.weeklyGoal} this week
        </p>
      </div>
    </div>
  )
}

'use client'

// GoalCard — Single goal card display

import { motion } from 'framer-motion'
import { getCategoryById } from '@/lib/goals/data'
import type { Goal, Milestone } from '@prisma/client'

interface GoalWithMilestones extends Goal {
  milestones: Milestone[]
  sessionCount?: number
}

interface GoalCardProps {
  goal: GoalWithMilestones
  onClick: () => void
}

export default function GoalCard({ goal, onClick }: GoalCardProps) {
  const category = getCategoryById(goal.category)
  const completedMilestones = goal.milestones.filter((m) => m.done).length
  const totalMilestones = goal.milestones.length

  const startedDate = new Date(goal.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-subtle hover:shadow-card transition-all cursor-pointer hover:border-opacity-50"
      style={{
        borderColor: category?.color ? `${category.color}20` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              backgroundColor: category?.color ? `${category.color}15` : '#F3F4F6',
            }}
          >
            {category?.emoji || '🎯'}
          </div>
          <div>
            <h3 className="font-serif font-semibold text-lg text-foreground">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{goal.progress}%</span>
          <span className="text-xs text-muted-foreground">
            {completedMilestones}/{totalMilestones} milestones
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: category?.color
                ? `linear-gradient(90deg, ${category.color}80 0%, ${category.color} 100%)`
                : 'linear-gradient(90deg, #6366F180 0%, #6366F1 100%)',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Started {startedDate}</span>
        {goal.sessionCount !== undefined && (
          <span>{goal.sessionCount} sessions</span>
        )}
      </div>
    </motion.div>
  )
}

'use client'

// GoalDetail — Detailed view of a single goal with milestones

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Circle, CheckCircle2 } from 'lucide-react'
import { getCategoryById } from '@/lib/goals/data'
import type { Goal, Milestone } from '@prisma/client'

interface GoalWithMilestones extends Goal {
  milestones: Milestone[]
}

interface GoalDetailProps {
  goal: GoalWithMilestones
  onBack: () => void
  onMilestoneToggle: (milestoneId: string, done: boolean) => Promise<void>
}

export default function GoalDetail({ goal, onBack, onMilestoneToggle }: GoalDetailProps) {
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null)
  const category = getCategoryById(goal.category)

  const handleMilestoneClick = async (milestone: Milestone) => {
    if (updatingMilestone) return
    setUpdatingMilestone(milestone.id)
    try {
      await onMilestoneToggle(milestone.id, !milestone.done)
    } finally {
      setUpdatingMilestone(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to goals</span>
      </button>

      {/* Goal Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              backgroundColor: `${category.color}15`,
            }}
          >
            {category.emoji}
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
              {goal.title}
            </h2>
            {goal.description && (
              <p className="text-lg text-muted-foreground">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">{goal.progress}%</span>
            <span className="text-sm text-muted-foreground">
              {goal.milestones.filter((m) => m.done).length}/{goal.milestones.length} milestones
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${category.color}80 0%, ${category.color} 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card">
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">Milestones</h3>

        <div className="space-y-3">
          {goal.milestones.map((milestone, index) => (
            <motion.button
              key={milestone.id}
              onClick={() => handleMilestoneClick(milestone)}
              disabled={updatingMilestone === milestone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                milestone.done
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-subtle'
              } ${updatingMilestone === milestone.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {milestone.done ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium ${
                    milestone.done
                      ? 'text-green-700 line-through'
                      : 'text-foreground'
                  }`}
                >
                  {milestone.text}
                </p>
                {milestone.completedAt && (
                  <p className="text-sm text-green-600 mt-1">
                    Completed {new Date(milestone.completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </motion.button>
          ))}

          {goal.milestones.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No milestones yet. Add some to track your progress!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

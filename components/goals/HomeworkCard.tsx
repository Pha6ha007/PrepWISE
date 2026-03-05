'use client'

// HomeworkCard — Single homework task display

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { Homework } from '@prisma/client'

interface HomeworkCardProps {
  homework: Homework
  onToggle: (id: string, done: boolean) => Promise<void>
}

const AGENT_COLORS: Record<string, string> = {
  Anxiety: '#6366F1',
  Family: '#EC4899',
  Trauma: '#EF4444',
  Relationships: '#F59E0B',
  Men: '#06B6D4',
  Women: '#8B5CF6',
}

export default function HomeworkCard({ homework, onToggle }: HomeworkCardProps) {
  const agentColor = AGENT_COLORS[homework.agent] || '#6366F1'
  const isOverdue = !homework.done && new Date(homework.dueDate) < new Date()

  const handleToggle = async () => {
    await onToggle(homework.id, !homework.done)
  }

  const dueDate = new Date(homework.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-2xl border transition-all ${
        homework.done
          ? 'border-green-200 bg-green-50'
          : isOverdue
            ? 'border-red-200 bg-red-50'
            : 'border-gray-200 hover:shadow-subtle'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`w-6 h-6 rounded-md border-2 flex-shrink-0 mt-0.5 transition-all ${
            homework.done
              ? 'bg-green-500 border-green-500'
              : `border-gray-300 hover:border-gray-400`
          }`}
          style={{
            borderColor: homework.done ? undefined : agentColor,
          }}
        >
          {homework.done && (
            <svg
              className="w-full h-full text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className={`font-serif font-semibold text-lg ${
                homework.done ? 'text-green-700 line-through' : 'text-foreground'
              }`}
            >
              {homework.title}
            </h3>

            {/* Agent Badge */}
            <span
              className="px-3 py-1 rounded-full text-xs font-medium text-white flex-shrink-0"
              style={{ backgroundColor: agentColor }}
            >
              {homework.agent}
            </span>
          </div>

          <p
            className={`text-sm mb-3 ${
              homework.done ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {homework.description}
          </p>

          {/* Due Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span
              className={`text-sm ${
                homework.done
                  ? 'text-green-600'
                  : isOverdue
                    ? 'text-red-600 font-medium'
                    : 'text-muted-foreground'
              }`}
            >
              {homework.done ? 'Completed' : isOverdue ? `Overdue (${dueDate})` : `Due ${dueDate}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

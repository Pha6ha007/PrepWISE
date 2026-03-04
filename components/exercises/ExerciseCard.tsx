'use client'

import { motion } from 'framer-motion'
import { Exercise } from '@/lib/exercises/data'
import { Clock, Zap } from 'lucide-react'

interface ExerciseCardProps {
  exercise: Exercise
  onClick: () => void
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const totalDuration = exercise.phases.reduce((sum, phase) => sum + phase.duration, 0) * exercise.cycles

  return (
    <motion.button
      className="glass p-6 rounded-xl shadow-card hover:shadow-large transition-all duration-300 text-left w-full group"
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${exercise.gradient[0]}, ${exercise.gradient[1]})`,
            }}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {exercise.icon}
          </motion.div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {exercise.name}
            </h3>
            <p className="text-sm text-muted-foreground">{exercise.category}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {exercise.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{Math.ceil(totalDuration / 60)} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap
              className="w-4 h-4"
              style={{ color: exercise.difficulty === 'Beginner' ? '#10B981' : '#F59E0B' }}
            />
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor:
                  exercise.difficulty === 'Beginner' ? '#10B98111' : '#F59E0B11',
                color: exercise.difficulty === 'Beginner' ? '#10B981' : '#F59E0B',
              }}
            >
              {exercise.difficulty}
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground italic">Best for: {exercise.bestFor}</span>
      </div>
    </motion.button>
  )
}

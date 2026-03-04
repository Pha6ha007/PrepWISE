'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare, RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Exercise } from '@/lib/exercises/data'

interface CompletionScreenProps {
  exercise: Exercise
  onRestart: () => void
  onBackToList: () => void
}

export function CompletionScreen({ exercise, onRestart, onBackToList }: CompletionScreenProps) {
  const router = useRouter()

  const handleTellAlex = () => {
    router.push(`/dashboard/chat?exercise=${exercise.id}`)
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[600px] px-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Success Icon with Gradient */}
      <motion.div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-large"
        style={{
          background: `linear-gradient(135deg, ${exercise.gradient[0]}, ${exercise.gradient[1]})`,
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
      >
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>

      {/* Well Done Message */}
      <motion.h2
        className="font-serif text-4xl font-semibold text-foreground mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Well done
      </motion.h2>

      <motion.p
        className="text-lg text-muted-foreground mb-8 text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        You completed {exercise.cycles} cycle{exercise.cycles > 1 ? 's' : ''} of{' '}
        <span className="font-semibold" style={{ color: exercise.color }}>
          {exercise.name}
        </span>
        . How are you feeling now?
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Button
          onClick={handleTellAlex}
          className="flex-1 bg-primary text-white hover:scale-105 transition-smooth shadow-lg"
          size="lg"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Tell Alex how I feel
        </Button>
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex-1 glass border-white/30 hover:bg-white/50 transition-smooth"
          size="lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Do it again
        </Button>
      </motion.div>

      <motion.div
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Button
          onClick={onBackToList}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to exercises
        </Button>
      </motion.div>
    </motion.div>
  )
}

'use client'

import { Rating } from 'ts-fsrs'
import { XCircle, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

interface Props {
  onRate: (accuracy: 'wrong_concept' | 'wrong_careless' | 'correct_slow' | 'correct_confident') => void
  disabled?: boolean
}

const ratings = [
  {
    accuracy: 'wrong_concept' as const,
    rating: Rating.Again,
    label: 'Forgot',
    sublabel: 'Concept gap',
    icon: XCircle,
    color: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400',
    activeColor: 'border-red-400 bg-red-500/20',
  },
  {
    accuracy: 'wrong_careless' as const,
    rating: Rating.Hard,
    label: 'Hard',
    sublabel: 'Careless error',
    icon: AlertTriangle,
    color: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400',
    activeColor: 'border-amber-400 bg-amber-500/20',
  },
  {
    accuracy: 'correct_slow' as const,
    rating: Rating.Good,
    label: 'Good',
    sublabel: 'Correct, took time',
    icon: CheckCircle,
    color: 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400',
    activeColor: 'border-cyan-400 bg-cyan-500/20',
  },
  {
    accuracy: 'correct_confident' as const,
    rating: Rating.Easy,
    label: 'Easy',
    sublabel: 'Confident & fast',
    icon: Zap,
    color: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400',
    activeColor: 'border-emerald-400 bg-emerald-500/20',
  },
]

export function SelfRatingButtons({ onRate, disabled }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 font-medium">How did you do?</p>
      <div className="grid grid-cols-4 gap-2">
        {ratings.map(r => (
          <button
            key={r.accuracy}
            onClick={() => onRate(r.accuracy)}
            disabled={disabled}
            className={`
              flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              ${r.color}
            `}
          >
            <r.icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{r.label}</span>
            <span className="text-[10px] opacity-70">{r.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

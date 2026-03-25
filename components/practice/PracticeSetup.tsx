'use client'

import { useState } from 'react'
import { BookOpen, Clock, Zap, Play } from 'lucide-react'
import type { Section, QuestionType, Difficulty } from '@/lib/gmat/question-types'

interface PracticeConfig {
  sections: Section[]
  questionTypes: QuestionType[]
  difficulty: Difficulty | 'all'
  questionCount: number
  timed: boolean
}

interface Props {
  onStart: (config: PracticeConfig) => void
}

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'quant', label: 'Quantitative', icon: '📐' },
  { id: 'verbal', label: 'Verbal', icon: '📝' },
  { id: 'data-insights', label: 'Data Insights', icon: '📊' },
]

const Q_TYPES: { id: QuestionType; label: string; section: Section }[] = [
  { id: 'PS', label: 'Problem Solving', section: 'quant' },
  { id: 'CR', label: 'Critical Reasoning', section: 'verbal' },
  { id: 'RC', label: 'Reading Comprehension', section: 'verbal' },
  { id: 'DS', label: 'Data Sufficiency', section: 'data-insights' },
  { id: 'TPA', label: 'Two-Part Analysis', section: 'data-insights' },
  { id: 'MSR', label: 'Multi-Source Reasoning', section: 'data-insights' },
  { id: 'GI', label: 'Graphics Interpretation', section: 'data-insights' },
]

const DIFFICULTIES: { id: Difficulty | 'all'; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: '700+', label: '700+' },
]

const Q_COUNTS = [5, 10, 20, 30]

export function PracticeSetup({ onStart }: Props) {
  const [sections, setSections] = useState<Section[]>(['quant', 'verbal', 'data-insights'])
  const [types, setTypes] = useState<QuestionType[]>(['PS', 'CR', 'RC', 'DS'])
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [count, setCount] = useState(10)
  const [timed, setTimed] = useState(false)

  const toggleSection = (s: Section) => {
    setSections(prev => {
      const next = prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
      // Also toggle related question types
      if (!next.includes(s)) {
        setTypes(t => t.filter(qt => Q_TYPES.find(q => q.id === qt)?.section !== s))
      } else {
        const related = Q_TYPES.filter(q => q.section === s).map(q => q.id)
        setTypes(t => [...new Set([...t, ...related])])
      }
      return next.length > 0 ? next : prev
    })
  }

  const toggleType = (t: QuestionType) => {
    setTypes(prev => {
      const next = prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
      return next.length > 0 ? next : prev
    })
  }

  const availableTypes = Q_TYPES.filter(q => sections.includes(q.section))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Practice Mode</h1>
        <p className="text-slate-400">Configure your practice session</p>
      </div>

      <div className="space-y-6">
        {/* Sections */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Sections</label>
          <div className="grid grid-cols-3 gap-2">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                  sections.includes(s.id)
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-white/[0.06] bg-[#0D1220] text-slate-500 hover:border-[#283244]'
                }`}
              >
                <span>{s.icon}</span>
                <span className="font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question types */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Question Types</label>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(qt => (
              <button
                key={qt.id}
                onClick={() => toggleType(qt.id)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  types.includes(qt.id)
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/[0.06] bg-[#0D1220] text-slate-500 hover:border-[#283244]'
                }`}
              >
                {qt.id} — {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                  difficulty === d.id
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-white/[0.06] bg-[#0D1220] text-slate-500 hover:border-[#283244]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Number of Questions</label>
          <div className="flex gap-2">
            {Q_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`w-16 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  count === n
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-white/[0.06] bg-[#0D1220] text-slate-500 hover:border-[#283244]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Timed mode */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => setTimed(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border text-sm transition-all ${
                !timed
                  ? 'border-cyan-500 bg-cyan-500/10 text-white'
                  : 'border-white/[0.06] bg-[#0D1220] text-slate-500 hover:border-[#283244]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Untimed</span>
            </button>
            <button
              onClick={() => setTimed(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border text-sm transition-all ${
                timed
                  ? 'border-cyan-500 bg-cyan-500/10 text-white'
                  : 'border-white/[0.06] bg-[#0D1220] text-slate-500 hover:border-[#283244]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-medium">Timed (2 min/q)</span>
            </button>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => onStart({ sections, questionTypes: types, difficulty, questionCount: count, timed })}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-base transition-all shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-5 h-5" />
          Start Practice
        </button>
      </div>
    </div>
  )
}

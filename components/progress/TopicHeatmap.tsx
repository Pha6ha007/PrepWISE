'use client'

import { useState } from 'react'
import { MOCK_TOPIC_MASTERY, type TopicMasteryData } from '@/lib/gmat/mock-analytics-data'

const SECTION_LABELS: Record<string, string> = {
  quant: 'Quantitative',
  verbal: 'Verbal',
  'data-insights': 'Data Insights',
}

const SECTION_ORDER: string[] = ['quant', 'verbal', 'data-insights']

interface MasteryLevel {
  label: string
  min: number
  color: string
  textColor: string
  bgColor: string
}

const MASTERY_LEVELS: MasteryLevel[] = [
  { label: 'Mastered',     min: 0.8,  color: 'bg-emerald-500', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { label: 'Proficient',   min: 0.6,  color: 'bg-cyan-500',    textColor: 'text-cyan-400',    bgColor: 'bg-cyan-500/20' },
  { label: 'Developing',   min: 0.4,  color: 'bg-amber-500',   textColor: 'text-amber-400',   bgColor: 'bg-amber-500/20' },
  { label: 'Needs Work',   min: 0.01, color: 'bg-red-500',     textColor: 'text-red-400',     bgColor: 'bg-red-500/20' },
  { label: 'Not Attempted', min: 0,    color: 'bg-slate-600',   textColor: 'text-slate-500',   bgColor: 'bg-slate-600/20' },
]

function getMasteryLevel(accuracy: number, attempted: number): MasteryLevel {
  if (attempted === 0) return MASTERY_LEVELS[4]
  for (const level of MASTERY_LEVELS) {
    if (accuracy >= level.min) return level
  }
  return MASTERY_LEVELS[4]
}

function formatTime(seconds: number): string {
  if (seconds === 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TopicHeatmap({ data = MOCK_TOPIC_MASTERY }: { data?: TopicMasteryData[] }) {
  const [selectedTopic, setSelectedTopic] = useState<TopicMasteryData | null>(null)

  // Group by section
  const grouped = SECTION_ORDER.reduce((acc, section) => {
    acc[section] = data.filter(t => t.section === section)
    return acc
  }, {} as Record<string, TopicMasteryData[]>)

  return (
    <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Topic Mastery</h2>
          <p className="text-sm text-slate-400 mt-0.5">Click a topic for details</p>
        </div>
        {/* Legend */}
        <div className="hidden md:flex items-center gap-3">
          {MASTERY_LEVELS.map(level => (
            <div key={level.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${level.color}`} />
              <span className="text-[10px] text-slate-400">{level.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="space-y-5">
        {SECTION_ORDER.map(section => {
          const topics = grouped[section]
          if (!topics || topics.length === 0) return null

          return (
            <div key={section}>
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                {SECTION_LABELS[section]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {topics.map(topic => {
                  const level = getMasteryLevel(topic.accuracy, topic.attempted)
                  const isSelected = selectedTopic?.topicId === topic.topicId

                  return (
                    <button
                      key={topic.topicId}
                      onClick={() => setSelectedTopic(isSelected ? null : topic)}
                      className={`relative rounded-lg p-3 text-left transition-all duration-200 border ${
                        isSelected
                          ? 'border-white/20 ring-1 ring-white/10'
                          : 'border-transparent hover:border-white/10'
                      } ${level.bgColor}`}
                    >
                      <div className="text-xs font-medium text-white truncate">{topic.topicName}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-lg font-bold tabular-nums ${level.textColor}`}>
                          {topic.attempted > 0 ? `${Math.round(topic.accuracy * 100)}%` : '—'}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${level.color}`} />
                      </div>
                      {topic.attempted > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                          {topic.attempted} questions
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      {selectedTopic && (
        <div className="mt-5 pt-5 border-t border-white/[0.04] animate-fade-in-up">
          <TopicDetail topic={selectedTopic} />
        </div>
      )}
    </div>
  )
}

function TopicDetail({ topic }: { topic: TopicMasteryData }) {
  const level = getMasteryLevel(topic.accuracy, topic.attempted)

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${level.color}`} />
          <h3 className="text-base font-semibold text-white">{topic.topicName}</h3>
          <span className={`text-xs font-medium ${level.textColor}`}>{level.label}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <DetailStat label="Questions" value={topic.attempted.toString()} />
          <DetailStat label="Correct" value={`${topic.correct}/${topic.attempted}`} />
          <DetailStat label="Avg Time" value={formatTime(topic.avgTimeSec)} />
        </div>
      </div>
      <div className="w-full sm:w-48">
        <div className="text-xs text-slate-400 mb-1.5">Accuracy</div>
        <div className="relative h-3 bg-[#1E293B] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${level.color} transition-all duration-500`}
            style={{ width: `${Math.round(topic.accuracy * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-500">0%</span>
          <span className={`text-xs font-bold tabular-nums ${level.textColor}`}>
            {Math.round(topic.accuracy * 100)}%
          </span>
          <span className="text-[10px] text-slate-500">100%</span>
        </div>
      </div>
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-bold text-white tabular-nums">{value}</div>
    </div>
  )
}

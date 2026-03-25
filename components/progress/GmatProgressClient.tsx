'use client'

import { BookOpen, Clock, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface ProgressData {
  summary: {
    totalSessions: number
    totalMinutes: number
    totalQuestions: number
    totalCorrect: number
    overallAccuracy: number
  }
  sectionStats: Record<string, { totalAttempts: number; correctAttempts: number; topics: number }>
  errorTypeBreakdown: Record<string, number>
  topicProgress: {
    id: string
    section: string
    topic: string
    subtopic: string | null
    totalAttempts: number
    correctAttempts: number
    accuracy: number
    masteryLevel: string
    lastPracticed: string | null
  }[]
  sessions: {
    id: string
    agentUsed: string
    topicsCovered: string[]
    questionsAsked: number
    correctAnswers: number
    durationMins: number | null
    createdAt: string
  }[]
  mockTests: {
    id: string
    takenAt: string
    durationMins: number
    totalScore: number | null
    quantScore: number | null
    verbalScore: number | null
    dataInsightsScore: number | null
  }[]
  learnerProfile: any
}

const MASTERY_COLORS: Record<string, string> = {
  not_started: 'bg-slate-700',
  learning: 'bg-yellow-600',
  practicing: 'bg-blue-600',
  mastered: 'bg-green-600',
}

const SECTION_LABELS: Record<string, string> = {
  quant: 'Quantitative',
  verbal: 'Verbal',
  'data-insights': 'Data Insights',
}

export function GmatProgressClient({ data }: { data: ProgressData }) {
  const { summary, sectionStats, errorTypeBreakdown, topicProgress, sessions, mockTests } = data

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">GMAT Progress</h1>
        <p className="text-slate-400 mt-1">Track your improvement across all GMAT sections</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Sessions"
          value={summary.totalSessions.toString()}
          color="text-cyan-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Study Time"
          value={`${Math.round(summary.totalMinutes / 60)}h ${summary.totalMinutes % 60}m`}
          color="text-blue-400"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Questions"
          value={`${summary.totalCorrect}/${summary.totalQuestions}`}
          color="text-green-400"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Accuracy"
          value={`${(summary.overallAccuracy * 100).toFixed(0)}%`}
          color="text-violet-400"
        />
      </div>

      {/* Section breakdown */}
      <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white mb-4">Section Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const stats = sectionStats[key]
            const accuracy = stats && stats.totalAttempts > 0
              ? (stats.correctAttempts / stats.totalAttempts * 100).toFixed(0)
              : '—'
            return (
              <div key={key} className="bg-[#1E293B]/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">{label}</div>
                <div className="text-2xl font-bold text-white">{accuracy}%</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats ? `${stats.totalAttempts} attempts · ${stats.topics} topics` : 'No data yet'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Topic heatmap */}
      <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white mb-4">Topic Mastery</h2>
        {topicProgress.length === 0 ? (
          <p className="text-slate-500 text-sm">Start practicing to see your topic mastery here.</p>
        ) : (
          <div className="space-y-2">
            {topicProgress.map(tp => (
              <div key={tp.id} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${MASTERY_COLORS[tp.masteryLevel]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white truncate">
                      {tp.topic}{tp.subtopic ? ` — ${tp.subtopic}` : ''}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {(tp.accuracy * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        tp.accuracy >= 0.8
                          ? 'bg-green-500'
                          : tp.accuracy >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${tp.accuracy * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 capitalize whitespace-nowrap">
                  {tp.masteryLevel.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error patterns */}
      {Object.keys(errorTypeBreakdown).length > 0 && (
        <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Error Patterns
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(errorTypeBreakdown).map(([type, count]) => (
              <div key={type} className="bg-[#1E293B]/50 rounded-lg p-3">
                <div className="text-sm text-slate-400 capitalize">{type.replace('_', ' ')}</div>
                <div className="text-xl font-bold text-white">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock test scores */}
      {mockTests.length > 0 && (
        <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Mock Test Scores
          </h2>
          <div className="space-y-3">
            {mockTests.map(mt => (
              <div key={mt.id} className="flex items-center justify-between bg-[#1E293B]/50 rounded-lg p-4">
                <div>
                  <div className="text-sm text-white font-medium">
                    {new Date(mt.takenAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {mt.durationMins} min
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {mt.quantScore && (
                    <div className="text-center">
                      <div className="text-xs text-slate-400">Q</div>
                      <div className="text-sm font-bold text-blue-400">{mt.quantScore}</div>
                    </div>
                  )}
                  {mt.verbalScore && (
                    <div className="text-center">
                      <div className="text-xs text-slate-400">V</div>
                      <div className="text-sm font-bold text-green-400">{mt.verbalScore}</div>
                    </div>
                  )}
                  {mt.dataInsightsScore && (
                    <div className="text-center">
                      <div className="text-xs text-slate-400">DI</div>
                      <div className="text-sm font-bold text-violet-400">{mt.dataInsightsScore}</div>
                    </div>
                  )}
                  {mt.totalScore && (
                    <div className="text-center border-l border-[#283244] pl-4">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-lg font-bold text-white">{mt.totalScore}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-slate-500 text-sm">No sessions yet. Start your first session to see history here.</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center justify-between bg-[#1E293B]/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white capitalize">{s.agentUsed.replace('_', ' ')}</span>
                  <span className="text-xs text-slate-500">
                    {s.topicsCovered.slice(0, 3).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{s.correctAnswers}/{s.questionsAsked} correct</span>
                  {s.durationMins && <span>{s.durationMins}m</span>}
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-[#0D1220] rounded-xl p-4 border border-white/[0.06]">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}

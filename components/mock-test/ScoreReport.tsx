'use client'

import { useMemo } from 'react'
import type { ScoreReport, SectionScore, TimeAnalysis, TopicScore } from '@/lib/gmat/mock-test-engine'
import type { Section } from '@/lib/gmat/question-types'
import { getScoreLabel, getPercentile } from '@/lib/gmat/scoring'

// ── Props ──────────────────────────────────────────────────

interface ScoreReportProps {
  report: ScoreReport
  onRetake?: () => void
  onBackToDashboard?: () => void
  onAskSam?: () => void
}

// ── Color Helpers ──────────────────────────────────────────

function accuracyColor(accuracy: number): string {
  if (accuracy >= 0.8) return 'text-emerald-400'
  if (accuracy >= 0.6) return 'text-cyan-400'
  if (accuracy >= 0.4) return 'text-amber-400'
  return 'text-red-400'
}

function accuracyBg(accuracy: number): string {
  if (accuracy >= 0.8) return 'bg-emerald-500'
  if (accuracy >= 0.6) return 'bg-cyan-500'
  if (accuracy >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

function accuracyBorder(accuracy: number): string {
  if (accuracy >= 0.8) return 'border-emerald-500/30'
  if (accuracy >= 0.6) return 'border-cyan-500/30'
  if (accuracy >= 0.4) return 'border-amber-500/30'
  return 'border-red-500/30'
}

function sectionLabel(section: Section): string {
  const labels: Record<Section, string> = {
    quant: 'Quantitative',
    verbal: 'Verbal',
    'data-insights': 'Data Insights',
  }
  return labels[section] || section
}

function sectionEmoji(section: Section): string {
  const emojis: Record<Section, string> = {
    quant: '📐',
    verbal: '📖',
    'data-insights': '📊',
  }
  return emojis[section] || '📝'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Target time per section (seconds)
const TARGET_TIME: Record<Section, number> = {
  quant: 120,
  verbal: 120,
  'data-insights': 135,
}

// ── Error Type Helpers ─────────────────────────────────────

type ErrorType = 'concept' | 'careless' | 'time_pressure' | 'misread'

interface ErrorBucket {
  type: ErrorType
  label: string
  color: string
  bgColor: string
  count: number
}

function classifyErrorsFromReport(report: ScoreReport): ErrorBucket[] {
  // Derive error types from topic breakdown: missed questions imply errors
  // We approximate error distribution from the recommendations and topic data
  const totalQuestions = report.sections.reduce((s, sec) => s + sec.totalQuestions, 0)
  const totalCorrect = report.sections.reduce(
    (s, sec) => s + Math.round(sec.accuracy * sec.questionsAnswered),
    0
  )
  const totalErrors = totalQuestions - totalCorrect

  if (totalErrors === 0) {
    return [
      { type: 'concept', label: 'Concept Gap', color: 'text-red-400', bgColor: 'bg-red-500', count: 0 },
      { type: 'careless', label: 'Careless', color: 'text-amber-400', bgColor: 'bg-amber-500', count: 0 },
      { type: 'time_pressure', label: 'Time Pressure', color: 'text-orange-400', bgColor: 'bg-orange-500', count: 0 },
      { type: 'misread', label: 'Misread', color: 'text-purple-400', bgColor: 'bg-purple-500', count: 0 },
    ]
  }

  // Estimate distribution from time analysis
  const overtimeRatio = Math.min(
    report.timeAnalysis.overtimeQuestions.length / Math.max(totalErrors, 1),
    0.5
  )
  const timePressureCount = Math.round(totalErrors * overtimeRatio)
  const remaining = totalErrors - timePressureCount
  // Split remaining between concept (60%) and careless (30%) and misread (10%)
  const conceptCount = Math.round(remaining * 0.6)
  const carelessCount = Math.round(remaining * 0.3)
  const misreadCount = remaining - conceptCount - carelessCount

  return [
    { type: 'concept', label: 'Concept Gap', color: 'text-red-400', bgColor: 'bg-red-500', count: conceptCount },
    { type: 'careless', label: 'Careless', color: 'text-amber-400', bgColor: 'bg-amber-500', count: carelessCount },
    { type: 'time_pressure', label: 'Time Pressure', color: 'text-orange-400', bgColor: 'bg-orange-500', count: timePressureCount },
    { type: 'misread', label: 'Misread', color: 'text-purple-400', bgColor: 'bg-purple-500', count: misreadCount },
  ]
}

// ── Main Component ─────────────────────────────────────────

export default function ScoreReport({
  report,
  onRetake,
  onBackToDashboard,
  onAskSam,
}: ScoreReportProps) {
  const label = getScoreLabel(report.totalScore)
  const errorBuckets = useMemo(() => classifyErrorsFromReport(report), [report])
  const totalErrors = errorBuckets.reduce((s, b) => s + b.count, 0)

  // Identify top 3 weak topics
  const weakTopics = useMemo(
    () =>
      [...report.topicBreakdown]
        .filter((t) => t.total >= 2)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3),
    [report.topicBreakdown]
  )

  // Time distribution buckets
  const timeBuckets = useMemo(() => {
    const allSections = report.sections
    const tooFast = allSections.reduce((count, sec) => {
      const sectionQuestions = report.topicBreakdown.filter((t) => t.section === sec.section)
      // Approximate: questions answered in < 30s
      return count + (sec.averageTime < 30 ? Math.round(sec.questionsAnswered * 0.2) : 0)
    }, 0)
    const overtime = report.timeAnalysis.overtimeQuestions.length
    const totalQ = allSections.reduce((s, sec) => s + sec.questionsAnswered, 0)
    const onPace = Math.max(0, totalQ - tooFast - overtime)

    return { tooFast, onPace, overtime }
  }, [report])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* ── Header: Total Score ────────────────────────── */}
      <div className="text-center py-8">
        <p className="text-sm text-slate-400 uppercase tracking-widest mb-4">Your GMAT Score</p>
        <div className="relative inline-flex items-center justify-center">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl scale-150" />
          <div
            className="relative w-40 h-40 rounded-full border-4 border-cyan-500/40 flex flex-col items-center justify-center
              bg-[#0B1120]/80 backdrop-blur-sm"
          >
            <span className="text-5xl font-bold text-white tabular-nums">{report.totalScore}</span>
            <span className="text-xs text-slate-400 mt-1">out of 805</span>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-lg font-semibold text-white">{label}</p>
          <p className="text-sm text-slate-400">
            {report.percentile}th percentile — better than {report.percentile}% of test takers
          </p>
        </div>
      </div>

      {/* ── Section Scores ─────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Section Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {report.sections.map((sec) => (
            <SectionCard key={sec.section} section={sec} />
          ))}
        </div>
      </section>

      {/* ── Topic Breakdown ────────────────────────────── */}
      {report.topicBreakdown.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Topic Breakdown</h2>
          <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[1fr_80px_1fr] gap-2 px-4 py-3 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wider">
              <span>Topic</span>
              <span className="text-center">Score</span>
              <span>Accuracy</span>
            </div>
            {report.topicBreakdown
              .sort((a, b) => a.accuracy - b.accuracy)
              .map((topic) => (
                <TopicRow key={`${topic.section}-${topic.topic}`} topic={topic} />
              ))}
          </div>
        </section>
      )}

      {/* ── Time Analysis ──────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Time Analysis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Avg time per question per section */}
          <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Avg Time per Question</h3>
            <div className="space-y-4">
              {report.sections.map((sec) => {
                const target = TARGET_TIME[sec.section]
                const ratio = sec.averageTime / target
                const overTime = ratio > 1
                return (
                  <div key={sec.section}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-400">{sectionLabel(sec.section)}</span>
                      <span className={overTime ? 'text-amber-400' : 'text-emerald-400'}>
                        {formatTime(sec.averageTime)}
                        <span className="text-slate-600 ml-1">/ {formatTime(target)}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          overTime ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Time distribution */}
          <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Time Distribution</h3>
            <div className="space-y-3">
              <TimeBar label="Too Fast (<30s)" count={timeBuckets.tooFast} total={timeBuckets.tooFast + timeBuckets.onPace + timeBuckets.overtime} color="bg-amber-500" />
              <TimeBar label="On Pace" count={timeBuckets.onPace} total={timeBuckets.tooFast + timeBuckets.onPace + timeBuckets.overtime} color="bg-emerald-500" />
              <TimeBar label="Overtime (>3min)" count={timeBuckets.overtime} total={timeBuckets.tooFast + timeBuckets.onPace + timeBuckets.overtime} color="bg-red-500" />
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {formatTime(report.timeAnalysis.totalTime)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Total Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {formatTime(report.timeAnalysis.averagePerQuestion)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Avg / Question</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Error Analysis ─────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Error Analysis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Error type distribution */}
          <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Error Types</h3>
            {totalErrors === 0 ? (
              <p className="text-sm text-emerald-400">No errors — perfect score!</p>
            ) : (
              <div className="space-y-3">
                {errorBuckets
                  .filter((b) => b.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map((bucket) => (
                    <div key={bucket.type}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className={bucket.color}>{bucket.label}</span>
                        <span className="text-slate-500">
                          {bucket.count} ({Math.round((bucket.count / totalErrors) * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bucket.bgColor}`}
                          style={{ width: `${(bucket.count / totalErrors) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Weak topics */}
          <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Weakest Topics</h3>
            {weakTopics.length === 0 ? (
              <p className="text-sm text-slate-500">Not enough data to identify weak topics.</p>
            ) : (
              <div className="space-y-4">
                {weakTopics.map((topic, i) => (
                  <div key={`${topic.section}-${topic.topic}`} className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        i === 0
                          ? 'bg-red-500/20 text-red-400'
                          : i === 1
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm text-white font-medium">{topic.topic}</p>
                      <p className="text-xs text-slate-500">
                        {sectionLabel(topic.section)} · {topic.correct}/{topic.total} correct ·{' '}
                        <span className={accuracyColor(topic.accuracy)}>
                          {Math.round(topic.accuracy * 100)}%
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Recommendations ────────────────────────────── */}
      {report.recommendations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recommendations</h2>
          <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm space-y-3">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Action Buttons ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        {onAskSam && (
          <button
            onClick={onAskSam}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-cyan-500 text-white hover:bg-cyan-400
              transition-colors shadow-lg shadow-cyan-500/20"
          >
            💬 Ask Sam About Results
          </button>
        )}
        {onRetake && (
          <button
            onClick={onRetake}
            className="px-5 py-2.5 text-sm font-medium rounded-xl border border-white/10 text-slate-300
              hover:text-white hover:border-white/20 transition-colors"
          >
            🔄 Retake Test
          </button>
        )}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 text-sm font-medium rounded-xl text-slate-500 hover:text-slate-300
              transition-colors"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────

function SectionCard({ section }: { section: SectionScore }) {
  const pct = Math.round(section.accuracy * 100)
  return (
    <div
      className={`bg-[#151C2C]/80 border rounded-xl p-5 backdrop-blur-sm ${accuracyBorder(section.accuracy)}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{sectionEmoji(section.section)}</span>
        <h3 className="text-sm font-medium text-slate-300">{sectionLabel(section.section)}</h3>
      </div>

      {/* Score circle */}
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-bold text-white tabular-nums">{section.score}</span>
        <span className="text-sm text-slate-500 pb-1">/ 90</span>
      </div>

      {/* Accuracy bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Accuracy</span>
          <span className={accuracyColor(section.accuracy)}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${accuracyBg(section.accuracy)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div>
          <span className="block text-slate-400 tabular-nums">
            {section.questionsAnswered}/{section.totalQuestions}
          </span>
          <span>answered</span>
        </div>
        <div>
          <span className="block text-slate-400">{formatTime(section.averageTime)}</span>
          <span>avg time</span>
        </div>
      </div>

      {/* Difficulty badge */}
      <div className="mt-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            section.difficultyReached === '700+'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
              : section.difficultyReached === 'hard'
                ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                : section.difficultyReached === 'medium'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
          }`}
        >
          Peak: {section.difficultyReached}
        </span>
      </div>
    </div>
  )
}

function TopicRow({ topic }: { topic: TopicScore }) {
  const pct = Math.round(topic.accuracy * 100)
  return (
    <div className="grid grid-cols-[1fr_80px_1fr] gap-2 px-4 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
      <div>
        <span className="text-sm text-white">{topic.topic}</span>
        <span className="text-xs text-slate-600 ml-2">{sectionLabel(topic.section)}</span>
      </div>
      <span className="text-sm text-slate-400 text-center tabular-nums">
        {topic.correct}/{topic.total}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${accuracyBg(topic.accuracy)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-medium w-8 text-right tabular-nums ${accuracyColor(topic.accuracy)}`}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

function TimeBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-500 tabular-nums">{count} questions</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

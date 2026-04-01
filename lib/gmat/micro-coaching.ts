// lib/gmat/micro-coaching.ts
// Rule-based micro-coaching tips shown before questions during practice.

export interface MicroCoach {
  tip: string | null   // null = no tip needed
  reason: string       // why this tip was chosen
  tipId: string        // stable identifier for dedup in localStorage
}

export interface ErrorHistoryEntry {
  topic: string
  type: string       // question type: 'DS', 'CR', 'PS', 'RC'
  count: number
  subtype?: string   // e.g. 'scope_shift', 'sign_error', 'careless'
  avgTime?: number   // average time in seconds for this topic
}

// ── Tip templates per question type ────────────────────────

const DS_TIPS = [
  {
    id: 'ds-test-alone',
    template: "Test Statement 1 alone → sufficient or not? Then Statement 2 alone. Don't combine early.",
    minErrors: 2,
  },
  {
    id: 'ds-chosen-c',
    template: "You've chosen C when one statement was enough {count} times. Check each independently.",
    minErrors: 3,
  },
  {
    id: 'ds-yesno',
    template: "For Yes/No DS: find one 'yes' case AND one 'no' case to prove insufficient.",
    minErrors: 2,
  },
] as const

const CR_TIPS = [
  {
    id: 'cr-conclusion',
    template: 'Identify the conclusion first. Then find the gap between premise and conclusion.',
    minErrors: 2,
  },
  {
    id: 'cr-scope-shift',
    template: "You've fallen for scope shifts {count} times. If the answer discusses something outside the argument, eliminate it.",
    minErrors: 3,
  },
  {
    id: 'cr-prephrase',
    template: 'Pre-phrase your answer before reading the choices.',
    minErrors: 2,
  },
] as const

const QUANT_TIPS = [
  {
    id: 'quant-sign',
    template: "You've had {count} sign errors. When you multiply/divide by negative, flip the inequality.",
    minErrors: 3,
  },
  {
    id: 'quant-pick-numbers',
    template: "Try picking numbers before algebraic manipulation — it's often faster.",
    minErrors: 2,
  },
  {
    id: 'quant-reread',
    template: 'Check: did you answer what was ASKED? Re-read the question stem.',
    minErrors: 3,
  },
] as const

const RC_TIPS = [
  {
    id: 'rc-map-passage',
    template: "Map the passage: P1=topic, P2=evidence, P3=conclusion. Don't memorize details.",
    minErrors: 2,
  },
  {
    id: 'rc-time',
    template: "You've averaged {avgTime}s per RC question. Target is ~117s. Skim faster on first read.",
    minErrors: 2,
  },
  {
    id: 'rc-inference',
    template: 'For inference questions: the answer must be PROVEN by the passage, not just plausible.',
    minErrors: 3,
  },
] as const

type TipEntry = { id: string; template: string; minErrors: number }

const TIPS_BY_TYPE: Record<string, readonly TipEntry[]> = {
  DS: DS_TIPS,
  CR: CR_TIPS,
  PS: QUANT_TIPS,
  RC: RC_TIPS,
}

// ── Main function ──────────────────────────────────────────

/**
 * Determines if a micro-coaching tip should be shown before a question.
 * Pure, rule-based — no AI call.
 */
export function getMicroCoachingTip(
  questionType: string,
  topic: string,
  errorHistory: ErrorHistoryEntry[],
): MicroCoach {
  const tips = TIPS_BY_TYPE[questionType]
  if (!tips) {
    return { tip: null, reason: 'No tips defined for this question type', tipId: '' }
  }

  // Find relevant errors for this question type + topic
  const relevant = errorHistory.filter(
    e => e.type === questionType && e.topic === topic,
  )

  const totalErrors = relevant.reduce((sum, e) => sum + e.count, 0)

  if (totalErrors < 2) {
    return { tip: null, reason: 'Not enough errors to warrant a tip', tipId: '' }
  }

  // Pick the best-matching tip based on error count thresholds
  // Walk tips in reverse priority order — higher minErrors = more specific
  const sortedTips = [...tips].sort((a, b) => b.minErrors - a.minErrors)

  for (const tipEntry of sortedTips) {
    if (totalErrors >= tipEntry.minErrors) {
      const avgTime = relevant.length > 0
        ? Math.round(relevant.reduce((s, e) => s + (e.avgTime ?? 0), 0) / relevant.length)
        : 0

      const filledTemplate = tipEntry.template
        .replace('{count}', String(totalErrors))
        .replace('{avgTime}', String(avgTime))

      return {
        tip: filledTemplate,
        reason: `${totalErrors} errors on ${questionType}/${topic}`,
        tipId: tipEntry.id,
      }
    }
  }

  return { tip: null, reason: 'Errors present but below tip thresholds', tipId: '' }
}

// ── LocalStorage helpers for tip tracking ──────────────────

const SHOWN_TIPS_KEY = 'samiwise:shown-tips'
const MAX_TIP_SHOWS = 3 // don't show same tip more than 3 times

interface ShownTipRecord {
  tipId: string
  count: number
  lastShown: number // timestamp
}

export function getShownTips(): ShownTipRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SHOWN_TIPS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordTipShown(tipId: string): void {
  if (typeof window === 'undefined' || !tipId) return
  try {
    const tips = getShownTips()
    const existing = tips.find(t => t.tipId === tipId)
    if (existing) {
      existing.count++
      existing.lastShown = Date.now()
    } else {
      tips.push({ tipId, count: 1, lastShown: Date.now() })
    }
    localStorage.setItem(SHOWN_TIPS_KEY, JSON.stringify(tips))
  } catch {
    // localStorage unavailable
  }
}

export function shouldShowTip(tipId: string): boolean {
  if (!tipId) return false
  const tips = getShownTips()
  const record = tips.find(t => t.tipId === tipId)
  if (!record) return true
  if (record.count >= MAX_TIP_SHOWS) return false
  // Don't show the same tip within 10 minutes
  if (Date.now() - record.lastShown < 10 * 60 * 1000) return false
  return true
}

// ── Error history from localStorage ────────────────────────

const ERROR_HISTORY_KEY = 'samiwise:error-history'

export function getErrorHistory(): ErrorHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ERROR_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordError(
  questionType: string,
  topic: string,
  timeTaken: number,
  subtype?: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const history = getErrorHistory()
    const key = `${questionType}:${topic}`
    const existing = history.find(e => e.type === questionType && e.topic === topic)

    if (existing) {
      existing.count++
      // Rolling average for time
      existing.avgTime = existing.avgTime
        ? Math.round((existing.avgTime * (existing.count - 1) + timeTaken) / existing.count)
        : timeTaken
      if (subtype) existing.subtype = subtype
    } else {
      history.push({
        topic,
        type: questionType,
        count: 1,
        avgTime: timeTaken,
        subtype,
      })
    }

    localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // localStorage unavailable
  }
}

// ── Self-reported error tracking (for Socratic debrief) ────

const SELF_REPORT_KEY = 'samiwise:self-reported-errors'

export interface SelfReportedError {
  questionType: string
  topic: string
  errorType: string  // 'misidentified' | 'missed_detail' | 'time_pressure' | 'careless' | 'concept_gap'
  timestamp: number
}

export function getSelfReportedErrors(): SelfReportedError[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SELF_REPORT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordSelfReportedError(
  questionType: string,
  topic: string,
  errorType: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const errors = getSelfReportedErrors()
    errors.push({
      questionType,
      topic,
      errorType,
      timestamp: Date.now(),
    })
    // Keep last 200 entries
    const trimmed = errors.slice(-200)
    localStorage.setItem(SELF_REPORT_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage unavailable
  }
}

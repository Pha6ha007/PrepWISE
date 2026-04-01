// lib/gmat/analyzer.ts
// SamiWISE — Session Analysis Utilities
// Analyzes completed sessions for patterns, insights, and progress tracking.

import type { GmatAgentType } from '@/types'

export interface SessionAnalysis {
  sessionId: string
  duration: number
  agentUsed: GmatAgentType
  topicsCovered: string[]
  questionsAsked: number
  correctAnswers: number
  accuracy: number
  difficultyProgression: string[]
  errorPatterns: ErrorPattern[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface ErrorPattern {
  topic: string
  errorType: 'concept' | 'careless' | 'time_pressure' | 'misread'
  frequency: number
  description: string
}

/**
 * Analyze a completed session transcript and extract patterns.
 * Called before the Memory Agent to provide structured data.
 */
export function analyzeSession(
  transcript: string,
  questionsAsked: number,
  correctAnswers: number,
  agentUsed: string,
  topicsCovered: string[]
): Partial<SessionAnalysis> {
  const accuracy = questionsAsked > 0 ? correctAnswers / questionsAsked : 0

  // Detect error patterns from transcript
  const errorPatterns = detectErrorPatterns(transcript)

  // Identify strengths and weaknesses
  const { strengths, weaknesses } = identifyStrengthsWeaknesses(
    accuracy,
    topicsCovered,
    errorPatterns
  )

  // Generate recommendations
  const recommendations = generateRecommendations(
    accuracy,
    weaknesses,
    errorPatterns,
    agentUsed
  )

  return {
    agentUsed: agentUsed as GmatAgentType,
    topicsCovered,
    questionsAsked,
    correctAnswers,
    accuracy,
    errorPatterns,
    strengths,
    weaknesses,
    recommendations,
  }
}

/**
 * Detect common error patterns from transcript text.
 */
function detectErrorPatterns(transcript: string): ErrorPattern[] {
  const patterns: ErrorPattern[] = []
  const lower = transcript.toLowerCase()

  // Careless errors
  const carelessIndicators = [
    'arithmetic mistake', 'calculation error', 'forgot to',
    'misread', 'wrong sign', 'off by one', 'simple mistake',
  ]
  const carelessCount = carelessIndicators.filter(i => lower.includes(i)).length
  if (carelessCount > 0) {
    patterns.push({
      topic: 'general',
      errorType: 'careless',
      frequency: carelessCount,
      description: 'Careless arithmetic or reading errors detected',
    })
  }

  // Time pressure
  const timePressureIndicators = [
    'ran out of time', 'took too long', 'spent too much time',
    'time pressure', 'rushing', 'hurry',
  ]
  const timeCount = timePressureIndicators.filter(i => lower.includes(i)).length
  if (timeCount > 0) {
    patterns.push({
      topic: 'general',
      errorType: 'time_pressure',
      frequency: timeCount,
      description: 'Time management issues detected',
    })
  }

  // Concept gaps
  const conceptIndicators = [
    "don't understand", "confused about", "what does",
    "how do you", "explain", "never learned", "not sure what",
  ]
  const conceptCount = conceptIndicators.filter(i => lower.includes(i)).length
  if (conceptCount > 0) {
    patterns.push({
      topic: 'general',
      errorType: 'concept',
      frequency: conceptCount,
      description: 'Conceptual gaps identified — needs more teaching on fundamentals',
    })
  }

  // Misread question
  const misreadIndicators = [
    'misread', 'didn\'t notice', 'missed that', 'overlooked',
    'thought it said', 'actually asks',
  ]
  const misreadCount = misreadIndicators.filter(i => lower.includes(i)).length
  if (misreadCount > 0) {
    patterns.push({
      topic: 'general',
      errorType: 'misread',
      frequency: misreadCount,
      description: 'Question misreading detected — needs careful reading practice',
    })
  }

  return patterns
}

/**
 * Identify strengths and weaknesses from session data.
 */
function identifyStrengthsWeaknesses(
  accuracy: number,
  topicsCovered: string[],
  errorPatterns: ErrorPattern[]
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (accuracy >= 0.8) {
    strengths.push(`High accuracy (${(accuracy * 100).toFixed(0)}%) across covered topics`)
  } else if (accuracy >= 0.6) {
    strengths.push('Solid foundational understanding')
  }

  if (accuracy < 0.5) {
    weaknesses.push(`Low accuracy (${(accuracy * 100).toFixed(0)}%) — needs focused review`)
  }

  // Error pattern-based weaknesses
  for (const pattern of errorPatterns) {
    if (pattern.frequency >= 2) {
      weaknesses.push(pattern.description)
    }
  }

  if (strengths.length === 0) {
    strengths.push('Session completed — building momentum')
  }

  return { strengths, weaknesses }
}

/**
 * Generate specific recommendations for next steps.
 */
function generateRecommendations(
  accuracy: number,
  weaknesses: string[],
  errorPatterns: ErrorPattern[],
  agentUsed: string
): string[] {
  const recommendations: string[] = []

  if (accuracy < 0.5) {
    recommendations.push('Review fundamentals before moving to harder problems')
    recommendations.push('Focus on understanding concepts rather than speed')
  } else if (accuracy < 0.7) {
    recommendations.push('Practice more problems at current difficulty level')
    recommendations.push('Review errors carefully — identify the exact step where mistakes happen')
  } else if (accuracy < 0.9) {
    recommendations.push('Ready to try harder problems')
    recommendations.push('Work on speed — try timed practice sessions')
  } else {
    recommendations.push('Excellent performance — challenge with 700+ level problems')
    recommendations.push('Consider moving to a weaker section for balanced improvement')
  }

  // Error-specific recommendations
  const hasCareless = errorPatterns.some(p => p.errorType === 'careless')
  if (hasCareless) {
    recommendations.push('Double-check calculations before selecting answers')
  }

  const hasTimePressure = errorPatterns.some(p => p.errorType === 'time_pressure')
  if (hasTimePressure) {
    recommendations.push('Practice the 2-minute rule: if stuck after 2 minutes, flag and move on')
  }

  return recommendations
}

/**
 * Calculate mastery level from accuracy and attempts.
 */
export function calculateMasteryLevel(
  accuracy: number,
  totalAttempts: number
): 'not_started' | 'learning' | 'practicing' | 'mastered' {
  if (totalAttempts === 0) return 'not_started'
  if (totalAttempts < 5 || accuracy < 0.4) return 'learning'
  if (totalAttempts < 15 || accuracy < 0.7) return 'practicing'
  if (accuracy >= 0.8 && totalAttempts >= 15) return 'mastered'
  return 'practicing'
}

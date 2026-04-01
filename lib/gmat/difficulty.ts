// lib/gmat/difficulty.ts
// SamiWISE — Adaptive Difficulty Logic
// Adjusts question difficulty based on learner performance in real-time.

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | '700+'

interface DifficultyState {
  currentLevel: DifficultyLevel
  consecutiveCorrect: number
  consecutiveWrong: number
  totalAttempts: number
  totalCorrect: number
}

/**
 * Compute next difficulty level based on performance.
 * Mirrors GMAT's adaptive algorithm at a simplified level.
 *
 * Rules:
 * - 3 consecutive correct → level up
 * - 2 consecutive wrong → level down
 * - First question starts at medium
 * - Never drops below easy, never goes above 700+
 */
export function getNextDifficulty(state: DifficultyState): DifficultyLevel {
  const levels: DifficultyLevel[] = ['easy', 'medium', 'hard', '700+']
  const currentIdx = levels.indexOf(state.currentLevel)

  // Level up after 3 consecutive correct
  if (state.consecutiveCorrect >= 3 && currentIdx < levels.length - 1) {
    return levels[currentIdx + 1]
  }

  // Level down after 2 consecutive wrong
  if (state.consecutiveWrong >= 2 && currentIdx > 0) {
    return levels[currentIdx - 1]
  }

  return state.currentLevel
}

/**
 * Create initial difficulty state.
 * If learner profile has history, start at their estimated level.
 */
export function createDifficultyState(
  estimatedAccuracy?: number
): DifficultyState {
  let startLevel: DifficultyLevel = 'medium'

  if (estimatedAccuracy !== undefined) {
    if (estimatedAccuracy < 0.4) startLevel = 'easy'
    else if (estimatedAccuracy < 0.6) startLevel = 'medium'
    else if (estimatedAccuracy < 0.8) startLevel = 'hard'
    else startLevel = '700+'
  }

  return {
    currentLevel: startLevel,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    totalAttempts: 0,
    totalCorrect: 0,
  }
}

/**
 * Update difficulty state after an answer.
 */
export function updateDifficultyState(
  state: DifficultyState,
  isCorrect: boolean
): DifficultyState {
  const newState = { ...state }
  newState.totalAttempts++

  if (isCorrect) {
    newState.totalCorrect++
    newState.consecutiveCorrect++
    newState.consecutiveWrong = 0
  } else {
    newState.consecutiveWrong++
    newState.consecutiveCorrect = 0
  }

  // Compute next difficulty
  newState.currentLevel = getNextDifficulty(newState)

  // Reset counters after level change
  if (newState.currentLevel !== state.currentLevel) {
    newState.consecutiveCorrect = 0
    newState.consecutiveWrong = 0
  }

  return newState
}

/**
 * Get difficulty label for display.
 */
export function getDifficultyLabel(level: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    easy: 'Beginner',
    medium: 'Intermediate',
    hard: 'Advanced',
    '700+': 'Expert (700+)',
  }
  return labels[level]
}

/**
 * Get difficulty color for UI.
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-orange-400',
    '700+': 'text-red-400',
  }
  return colors[level]
}

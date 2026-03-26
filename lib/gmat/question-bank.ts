// lib/gmat/question-bank.ts
// Server-side question bank loader — reads JSON files from data/questions/
// Falls back to SAMPLE_QUESTIONS if JSON files are unavailable.

import fs from 'fs'
import path from 'path'
import {
  SAMPLE_QUESTIONS,
  type GmatQuestion,
  type PSQuestion,
  type CRQuestion,
  type Section,
  type QuestionType,
  type Difficulty,
} from './question-types'

// ── Load & cache questions at module level ─────────────────

let _allQuestions: GmatQuestion[] | null = null

function loadQuestions(): GmatQuestion[] {
  if (_allQuestions) return _allQuestions

  const questions: GmatQuestion[] = []

  // All JSON question files to load
  const questionFiles = [
    'aqua-rat.json',         // 1,000 Quant PS (AQuA-RAT)
    'reclor-verbal.json',    // 4,638 Verbal CR (ReClor)
    'gen-quant-ps.json',     // AI-generated Quant PS
    'gen-ds.json',           // AI-generated Data Sufficiency
    'gen-cr.json',           // AI-generated Critical Reasoning
    'gen-rc.json',           // AI-generated Reading Comprehension
    'gen-ta.json',           // AI-generated Table Analysis
    'gen-gi.json',           // AI-generated Graphics Interpretation
    'gen-msr.json',          // AI-generated Multi-Source Reasoning
    'gen-tpa.json',          // AI-generated Two-Part Analysis
  ]

  for (const file of questionFiles) {
    try {
      const filePath = path.join(process.cwd(), 'data/questions', file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions.push(...parsed)
      }
    } catch {
      // File missing, empty, or invalid — skip silently
    }
  }

  // Fall back to sample questions if nothing loaded
  if (questions.length === 0) {
    _allQuestions = [...SAMPLE_QUESTIONS]
  } else {
    // Merge sample questions for types not covered by JSON (DI types, etc.)
    const loadedTypes = new Set(questions.map(q => q.type))
    const extras = SAMPLE_QUESTIONS.filter(q => !loadedTypes.has(q.type))
    _allQuestions = [...questions, ...extras]
  }

  return _allQuestions
}

// ── Utility: Fisher-Yates shuffle ──────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Public API ─────────────────────────────────────────────

export interface QuestionFilters {
  section?: Section
  type?: QuestionType
  difficulty?: Difficulty
  limit?: number
}

/**
 * Get questions filtered by section, type, difficulty, with optional limit.
 * Returns shuffled results.
 */
export function getQuestions(filters: QuestionFilters = {}): GmatQuestion[] {
  let pool = loadQuestions()

  if (filters.section) {
    pool = pool.filter(q => q.section === filters.section)
  }
  if (filters.type) {
    pool = pool.filter(q => q.type === filters.type)
  }
  if (filters.difficulty) {
    pool = pool.filter(q => q.difficulty === filters.difficulty)
  }

  pool = shuffle(pool)

  if (filters.limit && filters.limit > 0) {
    pool = pool.slice(0, filters.limit)
  }

  return pool
}

/**
 * Get a random selection of questions from a specific section.
 */
export function getRandomQuestions(section: Section, count: number): GmatQuestion[] {
  return getQuestions({ section, limit: count })
}

/**
 * Get total question count, optionally filtered by section.
 */
export function getQuestionCount(section?: Section): number {
  const pool = loadQuestions()
  if (!section) return pool.length
  return pool.filter(q => q.section === section).length
}

/**
 * Get questions for adaptive mock test engine.
 * Selects questions near the given difficulty, biasing toward harder
 * if the student is doing well (difficulty goes up) and easier if struggling.
 *
 * Difficulty ordering: easy < medium < hard < 700+
 */
export function getAdaptiveQuestions(
  section: Section,
  currentDifficulty: Difficulty,
  count: number
): GmatQuestion[] {
  const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard', '700+']
  const currentIdx = difficultyOrder.indexOf(currentDifficulty)

  // Build a weighted pool: exact match gets priority, adjacent difficulties fill gaps
  let pool = loadQuestions().filter(q => q.section === section)

  // Score each question by proximity to current difficulty
  const scored = pool.map(q => {
    const qIdx = difficultyOrder.indexOf(q.difficulty)
    const distance = Math.abs(qIdx - currentIdx)
    return { question: q, distance }
  })

  // Sort by distance (closest first), then shuffle within same distance
  scored.sort((a, b) => a.distance - b.distance || Math.random() - 0.5)

  return scored.slice(0, count).map(s => s.question)
}

/**
 * Strip correct answers and explanations from questions for client delivery.
 * Answers are sent separately after submission.
 */
export function stripAnswers(questions: GmatQuestion[]): Omit<GmatQuestion, 'correctAnswer' | 'explanation'>[] {
  return questions.map(q => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { correctAnswer, explanation, ...rest } = q as any
    return rest
  })
}

/**
 * Get the correct answer for a question by ID.
 */
export function getAnswer(questionId: string): { correctAnswer: string; explanation: string } | null {
  const pool = loadQuestions()
  const q = pool.find(q => q.id === questionId)
  if (!q) return null
  return {
    correctAnswer: (q as any).correctAnswer ?? '',
    explanation: (q as any).explanation ?? '',
  }
}

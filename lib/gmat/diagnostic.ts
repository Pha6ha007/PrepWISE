// lib/gmat/diagnostic.ts
// Prepwise — Quick GMAT Diagnostic Test
// 10 questions (3 quant, 3 verbal, 2 DI, 2 strategy) to assess baseline.

export interface DiagnosticQuestion {
  id: string
  section: 'quant' | 'verbal' | 'data-insights'
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  choices: string[]
  correctAnswer: number // 0-indexed
  explanation: string
}

/**
 * Quick diagnostic test — 10 questions covering all sections.
 * Used during onboarding to establish baseline level.
 */
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // Quant — Easy
  {
    id: 'diag-q1',
    section: 'quant',
    topic: 'Arithmetic',
    difficulty: 'easy',
    question: 'If 3x + 7 = 22, what is the value of x?',
    choices: ['3', '5', '7', '15', '8'],
    correctAnswer: 1,
    explanation: '3x + 7 = 22 → 3x = 15 → x = 5',
  },
  // Quant — Medium
  {
    id: 'diag-q2',
    section: 'quant',
    topic: 'Algebra',
    difficulty: 'medium',
    question: 'If x² - 9 = 0, which of the following lists all possible values of x?',
    choices: ['3 only', '-3 only', '3 and -3', '9 and -9', '0 and 3'],
    correctAnswer: 2,
    explanation: 'x² = 9 → x = ±3. Both 3 and -3 satisfy the equation.',
  },
  // Quant — Hard
  {
    id: 'diag-q3',
    section: 'quant',
    topic: 'Number Properties',
    difficulty: 'hard',
    question: 'If n is a positive integer and n² is divisible by 72, what is the smallest possible value of n?',
    choices: ['6', '12', '24', '36', '72'],
    correctAnswer: 1,
    explanation: '72 = 2³ × 3². For n² to be divisible by 72, n must contain at least 2² × 3 = 12. Check: 12² = 144, 144/72 = 2. ✓',
  },
  // Verbal — Easy
  {
    id: 'diag-q4',
    section: 'verbal',
    topic: 'Reading Comprehension',
    difficulty: 'easy',
    question: 'A passage states: "The new policy reduced emissions by 30%, but critics argue the economic costs outweigh the environmental benefits."\n\nWhat is the main point of the passage?',
    choices: [
      'The policy was a complete failure',
      'The policy reduced emissions but has faced criticism for its economic impact',
      'Critics support the policy despite its costs',
      'Economic costs are always more important than environmental benefits',
      'Emissions were not actually reduced',
    ],
    correctAnswer: 1,
    explanation: 'The passage presents both the policy\'s success (30% emission reduction) and the criticism it faces (economic costs). The main point captures both sides.',
  },
  // Verbal — Medium
  {
    id: 'diag-q5',
    section: 'verbal',
    topic: 'Critical Reasoning',
    difficulty: 'medium',
    question: 'Company X\'s profits rose 20% after they began offering free shipping. The CEO concluded that free shipping caused the profit increase.\n\nWhich of the following, if true, most weakens the CEO\'s conclusion?',
    choices: [
      'The company also raised prices by 15% at the same time',
      'Other companies also offer free shipping',
      'The company\'s revenue also increased',
      'Free shipping costs the company $2 per order',
      'Customer satisfaction surveys improved',
    ],
    correctAnswer: 0,
    explanation: 'The price increase provides an alternative explanation for the profit increase, weakening the claim that free shipping was the cause.',
  },
  // Verbal — Hard
  {
    id: 'diag-q6',
    section: 'verbal',
    topic: 'Critical Reasoning',
    difficulty: 'hard',
    question: 'Studies show that students who eat breakfast score higher on standardized tests. Therefore, schools should provide free breakfast to improve test scores.\n\nThe argument above assumes that:',
    choices: [
      'All students enjoy eating breakfast',
      'The relationship between breakfast and test scores is causal, not merely correlational',
      'Schools have the budget for free breakfast programs',
      'Standardized tests accurately measure student learning',
      'Students who skip breakfast do so by choice',
    ],
    correctAnswer: 1,
    explanation: 'The argument jumps from correlation (breakfast + high scores) to causation (providing breakfast will improve scores). This causal assumption is the logical gap.',
  },
  // DI — Medium
  {
    id: 'diag-q7',
    section: 'data-insights',
    topic: 'Table Analysis',
    difficulty: 'medium',
    question: 'A table shows 5 companies with revenue: A=$40M, B=$65M, C=$30M, D=$55M, E=$80M.\n\nWhat percentage of total revenue does Company B represent?',
    choices: ['20%', '24%', '28%', '32%', '65%'],
    correctAnswer: 1,
    explanation: 'Total = 40+65+30+55+80 = $270M. B\'s share = 65/270 ≈ 24.1%.',
  },
  // DI — Hard
  {
    id: 'diag-q8',
    section: 'data-insights',
    topic: 'Graphics Interpretation',
    difficulty: 'hard',
    question: 'A line graph shows Company X\'s quarterly revenue: Q1=$10M, Q2=$12M, Q3=$15M, Q4=$12M.\n\nThe quarter-over-quarter growth rate was highest in which quarter?',
    choices: ['Q1', 'Q2', 'Q3', 'Q4', 'Cannot be determined'],
    correctAnswer: 2,
    explanation: 'Q2 growth: (12-10)/10 = 20%. Q3 growth: (15-12)/12 = 25%. Q4 growth: (12-15)/15 = -20%. Q3 has the highest growth rate at 25%.',
  },
  // Data Sufficiency — now in Data Insights section
  {
    id: 'diag-q9',
    section: 'data-insights',
    topic: 'Data Sufficiency',
    difficulty: 'medium',
    question: 'Is x > 5?\n\n(1) x² > 25\n(2) x > -6\n\nWhich statements are sufficient?',
    choices: [
      'Statement 1 alone',
      'Statement 2 alone',
      'Both together',
      'Each alone',
      'Neither, even together',
    ],
    correctAnswer: 4,
    explanation: 'Statement 1: x²>25 → x>5 OR x<-5. Not sufficient. Statement 2: x>-6 → x could be 0, 3, 6, etc. Not sufficient. Together: x>-6 AND (x>5 or x<-5) → x could be -4 (fails) or 6 (works). Still not sufficient.',
  },
  // Quant word problem
  {
    id: 'diag-q10',
    section: 'quant',
    topic: 'Word Problems',
    difficulty: 'medium',
    question: 'A train travels from City A to City B at 60 mph and returns at 40 mph. What is the average speed for the entire round trip?',
    choices: ['45 mph', '48 mph', '50 mph', '52 mph', '55 mph'],
    correctAnswer: 1,
    explanation: 'Average speed for round trip = 2×60×40/(60+40) = 4800/100 = 48 mph. Note: it\'s NOT simply (60+40)/2 = 50.',
  },
]

/**
 * Score a completed diagnostic test.
 * Returns section-level accuracy and recommended focus areas.
 */
export function scoreDiagnostic(
  answers: Record<string, number> // questionId → selected answer index
): {
  overall: { correct: number; total: number; accuracy: number }
  sections: Record<string, { correct: number; total: number; accuracy: number }>
  weakAreas: string[]
  estimatedLevel: 'beginner' | 'intermediate' | 'advanced'
} {
  let totalCorrect = 0
  const sectionScores: Record<string, { correct: number; total: number }> = {}

  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (!sectionScores[q.section]) {
      sectionScores[q.section] = { correct: 0, total: 0 }
    }
    sectionScores[q.section].total++

    if (answers[q.id] === q.correctAnswer) {
      totalCorrect++
      sectionScores[q.section].correct++
    }
  }

  const total = DIAGNOSTIC_QUESTIONS.length
  const overallAccuracy = totalCorrect / total

  // Build section results with accuracy
  const sections: Record<string, { correct: number; total: number; accuracy: number }> = {}
  for (const [section, scores] of Object.entries(sectionScores)) {
    sections[section] = {
      ...scores,
      accuracy: scores.total > 0 ? scores.correct / scores.total : 0,
    }
  }

  // Identify weak areas (accuracy < 50%)
  const weakAreas = Object.entries(sections)
    .filter(([, s]) => s.accuracy < 0.5)
    .map(([section]) => section)

  // Estimate level
  let estimatedLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  if (overallAccuracy < 0.4) estimatedLevel = 'beginner'
  else if (overallAccuracy >= 0.8) estimatedLevel = 'advanced'

  return {
    overall: { correct: totalCorrect, total, accuracy: overallAccuracy },
    sections,
    weakAreas,
    estimatedLevel,
  }
}

// lib/gmat/question-types.ts
// Prepwise — GMAT Question type definitions for the Practice Mode

export type QuestionType = 'PS' | 'DS' | 'CR' | 'RC' | 'TPA' | 'MSR' | 'GI'
export type Section = 'quant' | 'verbal' | 'data-insights'
export type Difficulty = 'easy' | 'medium' | 'hard' | '700+'

export interface AnswerOption {
  id: string      // 'A', 'B', 'C', 'D', 'E'
  text: string
}

export interface BaseQuestion {
  id: string
  type: QuestionType
  section: Section
  difficulty: Difficulty
  topic: string
  subtopic?: string
  source?: string // "OG 2024", "Manhattan", etc.
}

export interface PSQuestion extends BaseQuestion {
  type: 'PS'
  text: string
  options: AnswerOption[]
  correctAnswer: string // 'A'-'E'
  explanation: string
}

export interface DSQuestion extends BaseQuestion {
  type: 'DS'
  text: string
  statement1: string
  statement2: string
  correctAnswer: string // 'A'-'E'
  explanation: string
}

export interface CRQuestion extends BaseQuestion {
  type: 'CR'
  passage: string
  questionStem: string
  options: AnswerOption[]
  correctAnswer: string
  explanation: string
}

export interface RCQuestion extends BaseQuestion {
  type: 'RC'
  passage: string
  passageTitle?: string
  questions: {
    id: string
    questionStem: string
    options: AnswerOption[]
    correctAnswer: string
    explanation: string
  }[]
}

export type GmatQuestion = PSQuestion | DSQuestion | CRQuestion | RCQuestion

// DS always has these 5 fixed options
export const DS_OPTIONS: AnswerOption[] = [
  { id: 'A', text: 'Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.' },
  { id: 'B', text: 'Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.' },
  { id: 'C', text: 'BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.' },
  { id: 'D', text: 'EACH statement ALONE is sufficient.' },
  { id: 'E', text: 'Statements (1) and (2) TOGETHER are NOT sufficient.' },
]

// Section labels & colors
export const SECTION_META: Record<Section, { label: string; color: string; bg: string }> = {
  quant: { label: 'Quantitative', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  verbal: { label: 'Verbal', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  'data-insights': { label: 'Data Insights', color: 'text-violet-400', bg: 'bg-violet-500/15' },
}

export const TYPE_META: Record<QuestionType, { label: string; full: string }> = {
  PS: { label: 'PS', full: 'Problem Solving' },
  DS: { label: 'DS', full: 'Data Sufficiency' },
  CR: { label: 'CR', full: 'Critical Reasoning' },
  RC: { label: 'RC', full: 'Reading Comprehension' },
  TPA: { label: 'TPA', full: 'Two-Part Analysis' },
  MSR: { label: 'MSR', full: 'Multi-Source Reasoning' },
  GI: { label: 'GI', full: 'Graphics Interpretation' },
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; bg: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  medium: { label: 'Medium', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  hard: { label: 'Hard', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  '700+': { label: '700+', color: 'text-red-400', bg: 'bg-red-500/15' },
}

// ── Sample questions for dev/demo ──────────────────────────

export const SAMPLE_QUESTIONS: GmatQuestion[] = [
  {
    id: 'ps-001',
    type: 'PS',
    section: 'quant',
    difficulty: 'medium',
    topic: 'algebra',
    subtopic: 'linear equations',
    text: 'If 3x + 7 = 22, what is the value of 6x + 3?',
    options: [
      { id: 'A', text: '27' },
      { id: 'B', text: '30' },
      { id: 'C', text: '33' },
      { id: 'D', text: '36' },
      { id: 'E', text: '39' },
    ],
    correctAnswer: 'C',
    explanation: 'From 3x + 7 = 22, we get 3x = 15, so x = 5. Therefore 6x + 3 = 6(5) + 3 = 33.',
    source: 'PrepWISE',
  },
  {
    id: 'ps-002',
    type: 'PS',
    section: 'quant',
    difficulty: 'hard',
    topic: 'number-properties',
    subtopic: 'divisibility',
    text: 'If n is a positive integer and n² is divisible by 72, what is the smallest possible value of n?',
    options: [
      { id: 'A', text: '6' },
      { id: 'B', text: '12' },
      { id: 'C', text: '24' },
      { id: 'D', text: '36' },
      { id: 'E', text: '72' },
    ],
    correctAnswer: 'B',
    explanation: '72 = 8 × 9 = 2³ × 3². For n² to be divisible by 2³ × 3², n must be divisible by 2² × 3 = 12 (since n² needs at least 2³, n needs at least 2², and since n² needs at least 3², n needs at least 3¹). So n = 12.',
    source: 'PrepWISE',
  },
  {
    id: 'ds-001',
    type: 'DS',
    section: 'data-insights',
    difficulty: 'medium',
    topic: 'algebra',
    subtopic: 'inequalities',
    text: 'Is x > 0?',
    statement1: 'x² > 0',
    statement2: 'x³ > 0',
    correctAnswer: 'B',
    explanation: 'Statement 1: x² > 0 means x ≠ 0, but x could be positive or negative. INSUFFICIENT.\nStatement 2: x³ > 0 means x > 0 (cubing preserves sign). SUFFICIENT.\nAnswer: B — Statement (2) ALONE is sufficient.',
    source: 'PrepWISE',
  },
  {
    id: 'ds-002',
    type: 'DS',
    section: 'data-insights',
    difficulty: '700+',
    topic: 'number-properties',
    subtopic: 'remainders',
    text: 'What is the remainder when the positive integer n is divided by 6?',
    statement1: 'When n is divided by 12, the remainder is 5.',
    statement2: 'When n is divided by 3, the remainder is 2.',
    correctAnswer: 'A',
    explanation: 'Statement 1: n = 12k + 5 for some non-negative integer k. When divided by 6: 12k + 5 = 6(2k) + 5, so remainder is always 5. SUFFICIENT.\nStatement 2: n = 3m + 2. Could be 2 (rem 2 when ÷6), 5 (rem 5), 8 (rem 2), 11 (rem 5)... remainder could be 2 or 5. INSUFFICIENT.\nAnswer: A.',
    source: 'PrepWISE',
  },
  {
    id: 'cr-001',
    type: 'CR',
    section: 'verbal',
    difficulty: 'medium',
    topic: 'critical-reasoning',
    subtopic: 'weaken',
    passage: 'A study of 1,000 adults found that those who drank at least three cups of coffee per day were 40% less likely to develop Type 2 diabetes than those who drank no coffee. The researchers concluded that coffee consumption protects against Type 2 diabetes.',
    questionStem: 'Which of the following, if true, most seriously weakens the conclusion drawn above?',
    options: [
      { id: 'A', text: 'Some participants in the study drank more than five cups of coffee per day.' },
      { id: 'B', text: 'The study did not account for the fact that coffee drinkers in the study also exercised more regularly and had healthier diets.' },
      { id: 'C', text: 'Tea also contains caffeine, which some researchers believe may have health benefits.' },
      { id: 'D', text: 'Type 2 diabetes rates have been increasing worldwide over the past two decades.' },
      { id: 'E', text: 'The study was funded by an independent medical research foundation.' },
    ],
    correctAnswer: 'B',
    explanation: 'Choice B identifies an alternative explanation — a confounding variable. If coffee drinkers also exercised more and ate healthier, the reduced diabetes risk could be due to lifestyle factors, not coffee itself. This directly weakens the causal conclusion.',
    source: 'PrepWISE',
  },
  {
    id: 'cr-002',
    type: 'CR',
    section: 'verbal',
    difficulty: 'hard',
    topic: 'critical-reasoning',
    subtopic: 'assumption',
    passage: 'Company X recently switched from a traditional office model to a fully remote work model. After six months, employee productivity, measured by output per hour, increased by 15%. Management concluded that remote work is more productive than office work for their employees.',
    questionStem: 'The conclusion above depends on which of the following assumptions?',
    options: [
      { id: 'A', text: 'No other changes were made to work processes during the same six-month period.' },
      { id: 'B', text: 'All employees at Company X prefer working remotely to working in an office.' },
      { id: 'C', text: 'Other companies have also experienced productivity gains from remote work.' },
      { id: 'D', text: 'The increase in productivity will continue beyond the initial six-month period.' },
      { id: 'E', text: 'Employee satisfaction surveys showed improvement after the switch to remote work.' },
    ],
    correctAnswer: 'A',
    explanation: 'For the conclusion that remote work caused the productivity increase, we must assume no other factors changed simultaneously. If new tools, processes, or incentives were also introduced, the productivity gain might not be due to remote work alone. This is a necessary assumption.',
    source: 'PrepWISE',
  },
  {
    id: 'ps-003',
    type: 'PS',
    section: 'quant',
    difficulty: 'easy',
    topic: 'arithmetic',
    subtopic: 'percents',
    text: 'A store reduced the price of a shirt from $80 to $60. What was the percent decrease in price?',
    options: [
      { id: 'A', text: '15%' },
      { id: 'B', text: '20%' },
      { id: 'C', text: '25%' },
      { id: 'D', text: '30%' },
      { id: 'E', text: '33⅓%' },
    ],
    correctAnswer: 'C',
    explanation: 'Percent decrease = (original − new) / original × 100 = (80 − 60) / 80 × 100 = 20/80 × 100 = 25%.',
    source: 'PrepWISE',
  },
  {
    id: 'ps-004',
    type: 'PS',
    section: 'quant',
    difficulty: '700+',
    topic: 'statistics-probability',
    subtopic: 'combinations',
    text: 'A committee of 5 people is to be selected from 6 men and 4 women. If the committee must have at least 2 women, how many different committees are possible?',
    options: [
      { id: 'A', text: '120' },
      { id: 'B', text: '146' },
      { id: 'C', text: '186' },
      { id: 'D', text: '200' },
      { id: 'E', text: '252' },
    ],
    correctAnswer: 'C',
    explanation: 'At least 2 women means: 2W+3M, 3W+2M, or 4W+1M.\n2W3M: C(4,2)×C(6,3) = 6×20 = 120\n3W2M: C(4,3)×C(6,2) = 4×15 = 60\n4W1M: C(4,4)×C(6,1) = 1×6 = 6\nTotal = 120 + 60 + 6 = 186.',
    source: 'PrepWISE',
  },
]

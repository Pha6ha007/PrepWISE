// lib/gmat/topics.ts
// Prepwise — GMAT Topic Taxonomy
// Complete taxonomy of GMAT topics for progress tracking and agent routing.

export interface GmatTopic {
  id: string
  section: 'quant' | 'verbal' | 'data-insights'
  name: string
  subtopics: string[]
  questionTypes: string[]
}

export const GMAT_TOPICS: GmatTopic[] = [
  // ── Quantitative ─────────────────────────────────────────
  {
    id: 'arithmetic',
    section: 'quant',
    name: 'Arithmetic',
    subtopics: ['fractions', 'decimals', 'percents', 'ratios', 'proportions', 'order of operations'],
    questionTypes: ['PS'],
  },
  {
    id: 'algebra',
    section: 'quant',
    name: 'Algebra',
    subtopics: ['linear equations', 'quadratics', 'inequalities', 'absolute value', 'exponents', 'roots', 'functions', 'coordinate geometry'],
    questionTypes: ['PS'],
  },
  {
    id: 'word-problems',
    section: 'quant',
    name: 'Word Problems',
    subtopics: ['rate/time/distance', 'work problems', 'mixtures', 'profit/loss', 'interest', 'overlapping sets', 'venn diagrams'],
    questionTypes: ['PS'],
  },
  {
    id: 'number-properties',
    section: 'quant',
    name: 'Number Properties',
    subtopics: ['divisibility', 'primes', 'GCD/LCM', 'odd/even', 'positive/negative', 'remainders', 'consecutive integers'],
    questionTypes: ['PS'],
  },
  {
    id: 'statistics-probability',
    section: 'quant',
    name: 'Statistics & Probability',
    subtopics: ['mean', 'median', 'mode', 'range', 'standard deviation', 'counting principles', 'permutations', 'combinations', 'probability'],
    questionTypes: ['PS'],
  },

  // ── Verbal ───────────────────────────────────────────────
  {
    id: 'critical-reasoning',
    section: 'verbal',
    name: 'Critical Reasoning',
    subtopics: ['strengthen', 'weaken', 'assumption', 'inference', 'evaluate', 'explain discrepancy', 'boldface', 'flaw'],
    questionTypes: ['CR'],
  },
  {
    id: 'reading-comprehension',
    section: 'verbal',
    name: 'Reading Comprehension',
    subtopics: ['main idea', 'specific detail', 'inference', 'author tone', 'function/purpose', 'analogy'],
    questionTypes: ['RC'],
  },
  // ── Data Insights ────────────────────────────────────────
  {
    id: 'multi-source-reasoning',
    section: 'data-insights',
    name: 'Multi-Source Reasoning',
    subtopics: ['synthesizing sources', 'conditional logic', 'yes/no analysis'],
    questionTypes: ['MSR'],
  },
  {
    id: 'table-analysis',
    section: 'data-insights',
    name: 'Table Analysis',
    subtopics: ['sorting', 'filtering', 'threshold conditions', 'compound conditions'],
    questionTypes: ['TA'],
  },
  {
    id: 'graphics-interpretation',
    section: 'data-insights',
    name: 'Graphics Interpretation',
    subtopics: ['bar charts', 'line graphs', 'scatter plots', 'pie charts', 'trend analysis'],
    questionTypes: ['GI'],
  },
  {
    id: 'two-part-analysis',
    section: 'data-insights',
    name: 'Two-Part Analysis',
    subtopics: ['algebraic TPA', 'verbal TPA', 'constraint matching'],
    questionTypes: ['TPA'],
  },
  {
    id: 'data-sufficiency',
    section: 'data-insights',
    name: 'Data Sufficiency',
    subtopics: ['yes/no questions', 'value questions', 'number properties DS', 'algebra DS', 'word problems DS', 'combined statements'],
    questionTypes: ['DS'],
  },
]

/**
 * Get all topics for a given section
 */
export function getTopicsForSection(section: GmatTopic['section']): GmatTopic[] {
  return GMAT_TOPICS.filter(t => t.section === section)
}

/**
 * Find a topic by its ID
 */
export function getTopicById(id: string): GmatTopic | undefined {
  return GMAT_TOPICS.find(t => t.id === id)
}

/**
 * Get all sections
 */
export const GMAT_SECTIONS = [
  { id: 'quant', name: 'Quantitative Reasoning', timeMinutes: 45, questionCount: 21 },
  { id: 'verbal', name: 'Verbal Reasoning', timeMinutes: 45, questionCount: 23 },
  { id: 'data-insights', name: 'Data Insights', timeMinutes: 45, questionCount: 20 },
] as const

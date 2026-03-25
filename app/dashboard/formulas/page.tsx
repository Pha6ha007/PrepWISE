'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Star,
  Printer,
  X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────

interface Formula {
  id: string
  title: string
  formula: string
  explanation: string
}

interface FormulaSection {
  id: string
  title: string
  color: 'cyan' | 'emerald' | 'violet'
  formulas: Formula[]
}

// ── Data ───────────────────────────────────────────────────

const FORMULA_SECTIONS: FormulaSection[] = [
  {
    id: 'quant-arithmetic',
    title: 'Quantitative — Arithmetic',
    color: 'cyan',
    formulas: [
      {
        id: 'percent-change',
        title: 'Percent Change',
        formula: '% Change = ((New − Old) / Old) × 100',
        explanation:
          'Measures relative change between two values. Always divide by the original value.',
      },
      {
        id: 'simple-interest',
        title: 'Simple Interest',
        formula: 'I = P × R × T',
        explanation:
          'Interest earned on principal only. P = principal, R = annual rate, T = time in years.',
      },
      {
        id: 'compound-interest',
        title: 'Compound Interest',
        formula: 'A = P(1 + r/n)^(nt)',
        explanation:
          'Total amount with compounding. r = annual rate, n = compounds per year, t = years.',
      },
      {
        id: 'ratio-proportion',
        title: 'Ratios & Proportions',
        formula: 'a/b = c/d  →  ad = bc',
        explanation:
          'Cross-multiply to solve proportions. Ratios compare parts; proportions equate two ratios.',
      },
      {
        id: 'average',
        title: 'Average (Arithmetic Mean)',
        formula: 'Average = Sum / Count',
        explanation:
          'Sum of all values divided by the number of values. Rearrange: Sum = Average × Count.',
      },
      {
        id: 'weighted-average',
        title: 'Weighted Average',
        formula: 'WA = (w₁x₁ + w₂x₂ + … + wₙxₙ) / (w₁ + w₂ + … + wₙ)',
        explanation:
          'Each value is multiplied by its weight. Useful for mixing problems and combined groups.',
      },
      {
        id: 'evenly-spaced-avg',
        title: 'Evenly Spaced Set — Average',
        formula: 'Average = (First + Last) / 2',
        explanation:
          'In an evenly spaced set (e.g., 2, 4, 6, 8), the average equals the median and the midpoint of extremes.',
      },
      {
        id: 'evenly-spaced-count',
        title: 'Evenly Spaced Set — Count',
        formula: 'Count = (Last − First) / Spacing + 1',
        explanation:
          "Number of terms in an evenly spaced set. Remember the +1 — it's a common trap.",
      },
    ],
  },
  {
    id: 'quant-algebra',
    title: 'Quantitative — Algebra',
    color: 'cyan',
    formulas: [
      {
        id: 'linear-eq',
        title: 'Linear Equation',
        formula: 'y = mx + b',
        explanation:
          'm = slope (rise/run), b = y-intercept. Parallel lines share the same slope.',
      },
      {
        id: 'slope',
        title: 'Slope Formula',
        formula: 'slope = (y₂ − y₁) / (x₂ − x₁)',
        explanation:
          'Rate of change between two points. Perpendicular lines have slopes that are negative reciprocals.',
      },
      {
        id: 'quadratic',
        title: 'Quadratic Formula',
        formula: 'x = (−b ± √(b² − 4ac)) / 2a',
        explanation:
          'Solves ax² + bx + c = 0. Discriminant b²−4ac: positive = 2 real roots, 0 = 1, negative = none.',
      },
      {
        id: 'diff-of-squares',
        title: 'Difference of Squares',
        formula: 'a² − b² = (a + b)(a − b)',
        explanation:
          'Factor any difference of perfect squares. Also useful in reverse to simplify multiplication.',
      },
      {
        id: 'exponent-product',
        title: 'Exponent Rule — Product',
        formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
        explanation:
          'Same base: add exponents when multiplying. Subtract when dividing: aᵐ / aⁿ = aᵐ⁻ⁿ.',
      },
      {
        id: 'exponent-power',
        title: 'Exponent Rule — Power',
        formula: '(aᵐ)ⁿ = aᵐⁿ',
        explanation:
          'Raising a power to a power: multiply the exponents. (ab)ⁿ = aⁿbⁿ.',
      },
      {
        id: 'absolute-value',
        title: 'Absolute Value',
        formula: '|x| = a  →  x = a  or  x = −a',
        explanation:
          'Distance from zero. |x| ≥ 0 always. For |x| < a, the solution is −a < x < a.',
      },
    ],
  },
  {
    id: 'quant-number-props',
    title: 'Quantitative — Number Properties',
    color: 'cyan',
    formulas: [
      {
        id: 'div-rules',
        title: 'Divisibility Rules',
        formula:
          '2: last digit even | 3: digit sum ÷ 3 | 4: last 2 digits ÷ 4\n5: ends in 0/5 | 6: ÷ by 2 and 3 | 8: last 3 digits ÷ 8\n9: digit sum ÷ 9',
        explanation:
          'Quick tests to check divisibility without long division. Combine rules for composites (e.g., 12 = 3 × 4).',
      },
      {
        id: 'num-factors',
        title: 'Number of Factors',
        formula: 'N = p₁ᵃ × p₂ᵇ × …  →  Factors = (a+1)(b+1)…',
        explanation:
          'Prime factorize, add 1 to each exponent, multiply. E.g., 72 = 2³ × 3² → (3+1)(2+1) = 12 factors.',
      },
      {
        id: 'gcd-lcm',
        title: 'GCD and LCM',
        formula: 'GCD: min exponents | LCM: max exponents\nGCD(a,b) × LCM(a,b) = a × b',
        explanation:
          'Use prime factorization. GCD picks smaller exponent per prime; LCM picks larger.',
      },
      {
        id: 'remainder',
        title: 'Remainder Patterns',
        formula: 'Dividend = Quotient × Divisor + Remainder',
        explanation:
          'Remainders cycle. To find remainder of large powers, track the pattern of remainders.',
      },
      {
        id: 'consecutive-int',
        title: 'Consecutive Integers',
        formula: 'n(n+1) is always even\nn(n+1)(n+2) is always divisible by 6',
        explanation:
          'Product of k consecutive integers is always divisible by k!. Use this for divisibility proofs.',
      },
    ],
  },
  {
    id: 'quant-stats',
    title: 'Quantitative — Statistics & Probability',
    color: 'cyan',
    formulas: [
      {
        id: 'mean-median-mode',
        title: 'Mean, Median, Mode, Range',
        formula:
          'Mean = Sum / n | Median = middle value\nMode = most frequent | Range = Max − Min',
        explanation:
          'Median is the average of two middle values for even-count sets. Range measures spread.',
      },
      {
        id: 'std-dev',
        title: 'Standard Deviation',
        formula: 'σ = √(Σ(xᵢ − x̄)² / n)',
        explanation:
          'Measures spread from the mean. Larger σ = more spread. Adding a constant shifts the set but doesn\'t change σ.',
      },
      {
        id: 'prob-or',
        title: 'Probability — OR (Union)',
        formula: 'P(A or B) = P(A) + P(B) − P(A and B)',
        explanation:
          'Inclusion-exclusion principle. Subtract the overlap to avoid double-counting.',
      },
      {
        id: 'prob-and',
        title: 'Probability — AND (Independent)',
        formula: 'P(A and B) = P(A) × P(B)',
        explanation:
          "Only when events are independent (one doesn't affect the other). Otherwise use conditional probability.",
      },
      {
        id: 'combinations',
        title: 'Combinations',
        formula: 'nCr = n! / (r!(n − r)!)',
        explanation:
          'Order doesn\'t matter. "Choose r items from n." Also written as C(n, r) or (n choose r).',
      },
      {
        id: 'permutations',
        title: 'Permutations',
        formula: 'nPr = n! / (n − r)!',
        explanation:
          'Order matters. "Arrange r items from n." nPr = nCr × r!',
      },
    ],
  },
  {
    id: 'quant-word',
    title: 'Quantitative — Word Problems',
    color: 'cyan',
    formulas: [
      {
        id: 'rate-time-dist',
        title: 'Rate × Time = Distance',
        formula: 'D = R × T',
        explanation:
          'Rearranges to R = D/T and T = D/R. For combined rates, add rates directly.',
      },
      {
        id: 'combined-work',
        title: 'Combined Work Rate',
        formula: '1/A + 1/B = 1/T',
        explanation:
          'A and B are individual times to finish. T is combined time. Convert to rates, add, invert.',
      },
      {
        id: 'mixture',
        title: 'Mixture Problems',
        formula: 'C₁V₁ + C₂V₂ = C₃V₃',
        explanation:
          'C = concentration/price, V = volume/quantity. Total amount of substance is preserved.',
      },
      {
        id: 'profit',
        title: 'Profit & Margin',
        formula: 'Profit = Revenue − Cost\nMargin = Profit / Revenue',
        explanation:
          'Markup is based on cost; margin is based on revenue. Don\'t confuse the two on the GMAT.',
      },
    ],
  },
  {
    id: 'di-ds',
    title: 'Data Insights — Data Sufficiency',
    color: 'violet',
    formulas: [
      {
        id: 'ds-answers',
        title: 'The 5 DS Answer Choices',
        formula:
          '(A) S1 alone sufficient, S2 not\n(B) S2 alone sufficient, S1 not\n(C) Together sufficient, neither alone\n(D) Each alone sufficient\n(E) Together not sufficient',
        explanation:
          'These are fixed for every DS question — memorize them. The format never changes.',
      },
      {
        id: 'ds-tree',
        title: 'DS Decision Tree',
        formula:
          '1. Test S1 alone → Sufficient? → Mark\n2. Test S2 alone → Sufficient? → Mark\n3. If both insufficient → Test together',
        explanation:
          'Always test each statement independently first. Never combine early.',
      },
      {
        id: 'ds-sufficiency',
        title: 'Sufficiency ≠ Solving',
        formula: 'Sufficient = Can you get ONE unique answer?\nYou do NOT need to calculate the answer.',
        explanation:
          "Stop as soon as you know whether a unique answer exists. Don't waste time computing the value.",
      },
    ],
  },
  {
    id: 'verbal-cr',
    title: 'Verbal — Critical Reasoning',
    color: 'emerald',
    formulas: [
      {
        id: 'argument-structure',
        title: 'Argument Structure',
        formula: 'Premise → [Gap] → Conclusion',
        explanation:
          'Every argument has premises (facts given) and a conclusion (claim made). The gap is the unstated assumption.',
      },
      {
        id: 'strengthen',
        title: 'Strengthen the Argument',
        formula: 'Correct answer → Bridges the gap',
        explanation:
          'Makes the conclusion more likely by providing evidence that fills the logical gap.',
      },
      {
        id: 'weaken',
        title: 'Weaken the Argument',
        formula: 'Correct answer → Widens the gap',
        explanation:
          'Introduces information that makes the conclusion less likely to follow from the premises.',
      },
      {
        id: 'assumption',
        title: 'Find the Assumption (Negation Test)',
        formula: "Negate the answer → Does the argument fall apart?\nIf yes → It's the assumption.",
        explanation:
          'An assumption must be true for the conclusion to hold. Negating it should destroy the argument.',
      },
      {
        id: 'common-flaws',
        title: 'Common Logical Flaws',
        formula:
          '• Correlation ≠ Causation\n• Scope Shift (different terms in premise vs. conclusion)\n• Sampling Bias (unrepresentative sample)\n• Absence of Evidence ≠ Evidence of Absence',
        explanation:
          'Recognize these patterns to quickly identify weakening answers and flawed arguments.',
      },
    ],
  },
  {
    id: 'verbal-rc',
    title: 'Verbal — Reading Comprehension',
    color: 'emerald',
    formulas: [
      {
        id: 'passage-mapping',
        title: 'Passage Mapping',
        formula:
          "P1 = Introduction / Main claim\nP2 = Evidence / Counterpoint\nP3 = Resolution / Author's view",
        explanation:
          'Jot a 3–5 word summary per paragraph while reading. Saves time on question lookups.',
      },
      {
        id: 'rc-question-types',
        title: 'Question Types',
        formula:
          `• Main Idea — "What is the primary purpose?"\n• Detail — "According to the passage…"\n• Inference — "It can be inferred…"\n• Tone — "The author's attitude is…"\n• Function — "The author mentions X in order to…"`,
        explanation:
          'Identify the type before answering. Detail questions require text evidence; inference questions require one logical step.',
      },
      {
        id: 'rc-extreme-answers',
        title: 'Extreme Answers',
        formula: 'Watch for: always, never, all, none, must, only',
        explanation:
          'Extreme language in answer choices is usually wrong. GMAT prefers moderate, hedged conclusions.',
      },
    ],
  },
]

// ── Color utilities ────────────────────────────────────────

const sectionColorMap = {
  cyan: {
    header: 'text-cyan-400',
    headerBg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    badge: 'bg-cyan-500/15 text-cyan-300',
    starActive: 'text-cyan-400',
    copyBg: 'hover:bg-cyan-500/10',
  },
  emerald: {
    header: 'text-emerald-400',
    headerBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-300',
    starActive: 'text-emerald-400',
    copyBg: 'hover:bg-emerald-500/10',
  },
  violet: {
    header: 'text-violet-400',
    headerBg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    badge: 'bg-violet-500/15 text-violet-300',
    starActive: 'text-violet-400',
    copyBg: 'hover:bg-violet-500/10',
  },
} as const

// ── Hooks ──────────────────────────────────────────────────

function useBookmarks(): [Set<string>, (id: string) => void] {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gmat-formula-bookmarks')
      if (stored) setBookmarks(new Set(JSON.parse(stored)))
    } catch {
      // ignore corrupt data
    }
  }, [])

  const toggle = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('gmat-formula-bookmarks', JSON.stringify([...next]))
      return next
    })
  }, [])

  return [bookmarks, toggle]
}

// ── Components ─────────────────────────────────────────────

function FormulaCard({
  formula,
  color,
  isBookmarked,
  onToggleBookmark,
}: {
  formula: Formula
  color: 'cyan' | 'emerald' | 'violet'
  isBookmarked: boolean
  onToggleBookmark: () => void
}) {
  const [copied, setCopied] = useState(false)
  const colors = sectionColorMap[color]

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formula.formula)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available
    }
  }, [formula.formula])

  return (
    <div className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors print:border-slate-300 print:bg-white print:p-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-slate-200 print:text-slate-800">
          {formula.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0 print:hidden">
          <button
            onClick={onToggleBookmark}
            className={`p-1 rounded-md transition-colors ${
              isBookmarked
                ? colors.starActive
                : 'text-slate-600 hover:text-slate-400'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleCopy}
            className={`p-1 rounded-md text-slate-600 transition-colors ${colors.copyBg} hover:text-slate-300`}
            aria-label="Copy formula"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Formula */}
      <pre className="text-sm font-mono whitespace-pre-wrap text-white/90 bg-white/[0.03] rounded-lg px-3 py-2 mb-2 leading-relaxed print:bg-slate-50 print:text-slate-900 print:text-xs">
        {formula.formula}
      </pre>

      {/* Explanation */}
      <p className="text-xs text-slate-400 leading-relaxed print:text-slate-600 print:text-[10px]">
        {formula.explanation}
      </p>
    </div>
  )
}

function SectionBlock({
  section,
  bookmarks,
  onToggleBookmark,
  defaultExpanded,
  searchQuery,
}: {
  section: FormulaSection
  bookmarks: Set<string>
  onToggleBookmark: (id: string) => void
  defaultExpanded: boolean
  searchQuery: string
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const colors = sectionColorMap[section.color]

  // Expand when search is active
  useEffect(() => {
    if (searchQuery) setExpanded(true)
  }, [searchQuery])

  return (
    <div className="print:break-inside-avoid">
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${colors.headerBg} transition-colors hover:brightness-110 print:bg-transparent print:px-0 print:py-2`}
      >
        <span className="print:hidden">
          {expanded ? (
            <ChevronDown className={`w-4 h-4 ${colors.header}`} />
          ) : (
            <ChevronRight className={`w-4 h-4 ${colors.header}`} />
          )}
        </span>
        <h2 className={`text-sm font-bold ${colors.header} print:text-slate-800 print:text-base`}>
          {section.title}
        </h2>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${colors.badge} print:hidden`}>
          {section.formulas.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 pb-1">
              {section.formulas.map(f => (
                <FormulaCard
                  key={f.id}
                  formula={f}
                  color={section.color}
                  isBookmarked={bookmarks.has(f.id)}
                  onToggleBookmark={() => onToggleBookmark(f.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────

export default function FormulasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false)
  const [bookmarks, toggleBookmark] = useBookmarks()

  const filteredSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return FORMULA_SECTIONS.map(section => {
      let filtered = section.formulas

      if (showBookmarksOnly) {
        filtered = filtered.filter(f => bookmarks.has(f.id))
      }

      if (query) {
        filtered = filtered.filter(
          f =>
            f.title.toLowerCase().includes(query) ||
            f.formula.toLowerCase().includes(query) ||
            f.explanation.toLowerCase().includes(query)
        )
      }

      return { ...section, formulas: filtered }
    }).filter(section => section.formulas.length > 0)
  }, [searchQuery, showBookmarksOnly, bookmarks])

  const totalFormulas = FORMULA_SECTIONS.reduce((sum, s) => sum + s.formulas.length, 0)
  const bookmarkCount = bookmarks.size

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          nav, [data-sidebar], .print\\:hidden { display: none !important; }
          main { padding: 0 !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 print:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white print:text-slate-900">
                GMAT Quick Reference
              </h1>
              <p className="text-sm text-slate-400 mt-1 print:text-slate-600">
                {totalFormulas} formulas &amp; concepts across all GMAT Focus Edition areas
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/[0.06] hover:bg-white/[0.04] transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Search & filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search formulas, concepts, keywords…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowBookmarksOnly(b => !b)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors shrink-0 ${
                showBookmarksOnly
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'text-slate-400 border-white/[0.06] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Star className={`w-4 h-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
              Bookmarked{bookmarkCount > 0 ? ` (${bookmarkCount})` : ''}
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {filteredSections.length > 0 ? (
            filteredSections.map((section, idx) => (
              <SectionBlock
                key={section.id}
                section={section}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                defaultExpanded={idx === 0}
                searchQuery={searchQuery}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm">
                {showBookmarksOnly
                  ? 'No bookmarked formulas yet. Star formulas to save them here.'
                  : `No formulas match "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

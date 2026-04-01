// lib/gmat/scoring.ts
// SamiWISE — GMAT Score Calculation Utilities

/**
 * GMAT Focus Edition score range: 205-805 (10-point increments)
 * Each section: 60-90 scale
 */

export interface GmatScoreBreakdown {
  quantitative: number | null    // 60-90
  verbal: number | null          // 60-90
  dataInsights: number | null    // 60-90
  total: number | null           // 205-805
}

/**
 * Estimate total GMAT score from section scores.
 * The actual GMAT algorithm is proprietary — this is an approximation.
 */
export function estimateTotalScore(
  quantScore: number,
  verbalScore: number,
  diScore: number
): number {
  // Approximate conversion: each section 60-90 → total 205-805
  // Average section score maps to overall score
  const avgSection = (quantScore + verbalScore + diScore) / 3
  // Linear mapping: 60 → 205, 90 → 805
  const total = Math.round(((avgSection - 60) / 30) * 600 + 205)
  return Math.max(205, Math.min(805, Math.round(total / 10) * 10))
}

/**
 * Estimate section score from accuracy percentage.
 * Rough approximation for progress tracking.
 */
export function estimateSectionScore(accuracy: number): number {
  // accuracy 0.0-1.0 → section score 60-90
  const score = Math.round(60 + accuracy * 30)
  return Math.max(60, Math.min(90, score))
}

/**
 * Get score percentile (approximate, based on public data).
 */
export function getPercentile(totalScore: number): number {
  const percentiles: Record<number, number> = {
    805: 99, 795: 99, 785: 99,
    775: 99, 765: 98, 755: 97,
    745: 96, 735: 94, 725: 91,
    715: 88, 705: 84, 695: 80,
    685: 75, 675: 70, 665: 64,
    655: 58, 645: 52, 635: 46,
    625: 40, 615: 35, 605: 30,
    595: 25, 585: 21, 575: 17,
    565: 14, 555: 11, 545: 9,
    535: 7, 525: 5, 515: 4,
    505: 3, 495: 2, 485: 1,
  }

  // Find closest score
  const rounded = Math.round(totalScore / 10) * 10
  return percentiles[rounded] || (rounded > 805 ? 99 : 1)
}

/**
 * Get score interpretation label.
 */
export function getScoreLabel(totalScore: number): string {
  if (totalScore >= 730) return 'Exceptional (Top 5%)'
  if (totalScore >= 700) return 'Excellent (Top 10%)'
  if (totalScore >= 660) return 'Good (Top 25%)'
  if (totalScore >= 600) return 'Average (Top 50%)'
  if (totalScore >= 540) return 'Below Average'
  return 'Needs Improvement'
}

/**
 * Target scores for common MBA programs.
 */
export const TARGET_SCORES: Record<string, { min: number; median: number }> = {
  'Harvard Business School': { min: 700, median: 740 },
  'Stanford GSB': { min: 700, median: 738 },
  'Wharton': { min: 700, median: 733 },
  'MIT Sloan': { min: 680, median: 730 },
  'Columbia Business School': { min: 680, median: 729 },
  'Chicago Booth': { min: 680, median: 730 },
  'Kellogg': { min: 680, median: 727 },
  'Duke Fuqua': { min: 660, median: 710 },
  'Michigan Ross': { min: 660, median: 710 },
  'NYU Stern': { min: 660, median: 714 },
  'UCLA Anderson': { min: 660, median: 706 },
  'Virginia Darden': { min: 660, median: 708 },
  'Cornell Johnson': { min: 640, median: 700 },
  'Carnegie Mellon Tepper': { min: 640, median: 695 },
  'Georgetown McDonough': { min: 620, median: 690 },
}

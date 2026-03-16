/**
 * PsyGUARD Risk Taxonomy
 * Based on: https://github.com/qiuhuachuan/PsyGUARD (EMNLP 2024)
 *
 * 4-level risk classification:
 *   none     → No risk detected
 *   ideation → Passive thoughts ("wish I wasn't here", "tired of life")
 *   planning → Active planning ("have a plan", "found a way")
 *   imminent → Immediate danger ("right now", "goodbye forever", "tonight")
 *
 * HARDCODED — no LLM in this path. Ever.
 * Assessment order: imminent → planning → ideation (highest wins)
 */

export type RiskLevel = 'none' | 'ideation' | 'planning' | 'imminent'

export interface RiskAssessment {
  level: RiskLevel
  confidence: number // 0-1
  triggers: string[] // which patterns matched (pattern source, not user text)
  category: 'suicide' | 'self_harm' | 'violence' | null
}

// ── Pattern banks ──────────────────────────────────────────────
// Ordered by severity within each category.
// Regex flags: case-insensitive. Unicode-aware where needed.

const SUICIDE_PATTERNS = {
  imminent: [
    /прямо сейчас/i,
    /последнее (сообщение|раз|прощай)/i,
    /прощай(те)?[\s,.!]*навсегда/i,
    /я ухожу[\s,.]*навсегда/i,
    /right now i('m going to|'ll|will)/i,
    /tonight i('m going to|'ll|will) (end|kill|die)/i,
    /today i('m going to|'ll|will) (end|kill|die)/i,
    /goodbye (everyone|forever|world|all)/i,
    /this is (my last|the end|goodbye)/i,
    /taking (the|my) pills (now|tonight)/i,
    /i('ve| have) (already|just) (taken|swallowed|cut)/i,
  ],
  planning: [
    /есть (план|способ|метод)/i,
    /нашёл способ/i,
    /написал(а)? (записку|завещание)/i,
    /раздаю вещи/i,
    /have a plan/i,
    /found a way/i,
    /wrote a (note|letter)/i,
    /giving (away|out) my (things|stuff|belongings)/i,
    /thinking about how (to do it|to end)/i,
    /researched (methods|ways|how to)/i,
    /bought (a gun|pills|rope)/i,
    /know (where|how|when) i('ll|'m going to)/i,
  ],
  ideation: [
    /не хочу (больше )?жить/i,
    /лучше бы меня не было/i,
    /устал(а)? от жизни/i,
    /зачем я вообще живу/i,
    /нет смысла жить/i,
    /хочу умереть/i,
    /хочу исчезнуть/i,
    /суицид/i,
    /покончить с собой/i,
    /want to die/i,
    /wish i (was|were) dead/i,
    /don'?t want to (be here|exist|live|be alive)/i,
    /better off dead/i,
    /no reason to live/i,
    /tired of (living|life|everything)/i,
    /what'?s the point (of living|anymore)/i,
    /wish i (could|would) (just )?disappear/i,
    /end (my|this) life/i,
    /kill myself/i,
    /suicide/i,
    /taking my own life/i,
    /ending it all/i,
  ],
} as const

const SELF_HARM_PATTERNS = {
  imminent: [
    /я (уже )?режу/i,
    /i('m| am) (cutting|burning|hurting) (myself )?right now/i,
    /just (cut|burned|hurt) myself/i,
  ],
  planning: [
    /хочу порезать(ся)?/i,
    /thinking about (cutting|hurting|burning) myself/i,
    /going to (cut|burn|hurt) myself/i,
  ],
  ideation: [
    /самоповреждение/i,
    /порежу себя/i,
    /причиню (себе )?боль/i,
    /режу себя/i,
    /self[- ]harm/i,
    /cut myself/i,
    /hurt myself/i,
    /burn(ing)? myself/i,
    /scratch(ing)? myself/i,
  ],
} as const

const VIOLENCE_PATTERNS = {
  imminent: [
    /я (сейчас )?убью/i,
    /i('m| am) going to (kill|hurt|attack)/i,
  ],
  planning: [
    /планирую (убить|напасть|причинить вред)/i,
    /have a plan to (kill|hurt|attack)/i,
  ],
  ideation: [
    /хочу (убить|причинить вред)/i,
    /причинить вред/i,
    /убить кого-то/i,
    /напасть на/i,
    /hurt someone/i,
    /kill someone/i,
    /harm others/i,
    /attack someone/i,
  ],
} as const

// ── Risk levels in severity order ──────────────────────────────

const SEVERITY_ORDER: RiskLevel[] = ['imminent', 'planning', 'ideation']

type Category = 'suicide' | 'self_harm' | 'violence'

const ALL_PATTERN_BANKS: Record<Category, Record<string, readonly RegExp[]>> = {
  suicide: SUICIDE_PATTERNS,
  self_harm: SELF_HARM_PATTERNS,
  violence: VIOLENCE_PATTERNS,
}

/**
 * Assess risk level of a user message.
 *
 * Returns the HIGHEST severity match across all categories.
 * Confidence scales with number of triggers found (0.5 base + 0.15 per trigger, max 1.0).
 *
 * @param message — Raw user message text
 * @returns RiskAssessment with level, confidence, triggers, and category
 */
export function assessRisk(message: string): RiskAssessment {
  const triggers: string[] = []
  let highestLevel: RiskLevel = 'none'
  let highestCategory: Category | null = null

  // Check all categories, all severity levels (highest first)
  for (const [category, patternBank] of Object.entries(ALL_PATTERN_BANKS) as [Category, Record<string, readonly RegExp[]>][]) {
    for (const level of SEVERITY_ORDER) {
      const patterns = patternBank[level]
      if (!patterns) continue

      for (const pattern of patterns) {
        if (pattern.test(message)) {
          triggers.push(`[${category}:${level}] ${pattern.source}`)

          // Update highest if this level is more severe
          const currentIdx = SEVERITY_ORDER.indexOf(highestLevel as any)
          const newIdx = SEVERITY_ORDER.indexOf(level as any)

          if (highestLevel === 'none' || (newIdx >= 0 && (currentIdx < 0 || newIdx < currentIdx))) {
            highestLevel = level as RiskLevel
            highestCategory = category
          }
        }
      }
    }
  }

  return {
    level: highestLevel,
    confidence: triggers.length > 0
      ? Math.min(0.5 + triggers.length * 0.15, 1.0)
      : 0,
    triggers,
    category: highestCategory,
  }
}

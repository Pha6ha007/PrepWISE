/**
 * Model Comparison Test: Claude Sonnet 4 vs MiniMax M2.7
 *
 * Tests memory extraction quality on a realistic GMAT tutoring transcript.
 * Measures: output quality, latency, token usage, cost estimate.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/test-model-comparison.ts
 *   or
 *   bun run scripts/test-model-comparison.ts
 */

import OpenAI from 'openai'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// ── Config ─────────────────────────────────────────────────────────────────

const MODELS = [
  {
    id: 'anthropic/claude-sonnet-4',
    label: 'Claude Sonnet 4 (current)',
    priceInput: 3.0,   // $ per 1M tokens
    priceOutput: 15.0,
  },
  {
    id: 'minimax/minimax-m2.7',
    label: 'MiniMax M2.7 (candidate)',
    priceInput: 0.30,
    priceOutput: 1.20,
  },
]

// ── Realistic GMAT session transcript ──────────────────────────────────────

const SAMPLE_TRANSCRIPT = `
[Session: DS + Critical Reasoning, 45 minutes]

Sam: Hi Alex! Good to see you again. Last session we touched on data sufficiency basics — today let's dig deeper. Ready?

Student: Yeah, I'm ready. I keep messing up DS though, like I know the format but I keep making wrong calls.

Sam: That's pretty common. What specifically trips you up — figuring out what each statement gives you, or deciding if you have "enough" information?

Student: I think I rush. Like I'll see statement 1 has a value and just say "sufficient" without actually checking if it answers the question.

Sam: Classic trap. Statement 1 might give you a value but still not answer the actual question asked. Let me try one with you. Here's a question: Is x > 0? Statement 1: x² = 4. Is that sufficient?

Student: x equals 2 or negative 2... so we don't know the sign... not sufficient?

Sam: Exactly right. That clicked fast. Now statement 2: x³ > 0. Sufficient?

Student: Cube of x is positive... so x has to be positive. Yeah that's sufficient.

Sam: Perfect. Now both together — do you even need to evaluate (C) here?

Student: No, statement 2 alone works, so it's (B).

Sam: Right. Now here's one that catches a lot of people. Is integer n divisible by 12? Statement 1: n is divisible by 4. Statement 2: n is divisible by 6.

Student: Together... 4 and 6... LCM is 12, so yes, sufficient together?

Sam: Careful — what's the LCM of 4 and 6?

Student: Oh wait... 12! So yes, (C)?

Sam: Actually this is a sneaky one. The LCM of 4 and 6 is 12, so yes n must be divisible by 12. You were right but almost for the wrong reason — what if it was 4 and 3?

Student: Then LCM is 12 too... same answer?

Sam: Yes, same answer but the logic is about LCM, not multiplication. Your instinct to multiply was wrong but led to the right answer here. Important to understand WHY. Make sense?

Student: Yeah, so I should always find the LCM, not just multiply the denominators.

Sam: Exactly. Now let's do a Critical Reasoning question. "Over the last five years, city X has increased its annual spending on parks. Yet surveys show that resident satisfaction with parks has declined over the same period. Which of the following, if true, most helps to explain the apparent discrepancy?"

Student: So... spending went up but satisfaction went down. That's weird.

Sam: What would explain it?

Student: Maybe the money is going to the wrong things? Or maybe people's expectations got higher?

Sam: Both valid. Let's look at the choices: (A) Other cities have also increased spending. (B) A large new park was built that many residents find difficult to access. (C) The parks department hired more staff. (D) Total population of city X increased dramatically. (E) Residents are generally harder to please than five years ago.

Student: I'd say (D) — more people, same parks, so per-person satisfaction goes down even if total spending went up.

Sam: That's strong reasoning. What about (B)?

Student: (B) is also possible — if the new park isn't accessible, spending didn't help residents who can't use it. Hmm.

Sam: Which is a stronger explanation?

Student: (D) is more direct. The population increase dilutes the benefit. (B) depends on how many people can't access it.

Sam: (D) is the credited answer. Good work. Notice how you used the "dilution" logic — that's a powerful CR pattern. Spending went up but beneficiaries went up faster.

Student: Oh that's a clean way to think about it. "Dilution" — yeah.

Sam: Let me throw a harder one at you. "Politician: we should raise the minimum wage because it will reduce poverty." "Economist: actually, minimum wage increases often lead to unemployment." This is a classic CR pattern. What's the structure?

Student: The politician assumes raising wages helps workers. The economist is saying there's a tradeoff — some workers might lose jobs entirely.

Sam: Exactly. If the question asked you to "weaken the politician's argument," what would you pick?

Student: Something showing that even with higher wages, net poverty doesn't go down — because people lose jobs?

Sam: Perfect. You're identifying the unstated assumption: that higher wages translate directly to lower poverty without negative side effects.

Student: So the assumption questions are about finding the gap in the logic?

Sam: Exactly. The conclusion requires an unstated bridge — find that bridge and you find the assumption. You grasped that quickly.

Student: I've done like 50 CR questions this week. Starting to feel patterns.

Sam: That practice is showing. One thing I noticed — on DS you're improving but you still sometimes skip checking negative numbers. Like in the x² = 4 example, you caught it, but not everyone does. Worth adding that to your mental checklist.

Student: Yeah I need a checklist. Something like: check both positive and negative values, check zero, check fractions.

Sam: Exactly right. DS edge cases: positive/negative, zero, fractions, integers vs non-integers. Make that your pre-submission check.

Student: Got it. How much time left?

Sam: About 5 minutes. You've covered a lot today — DS with exponents, LCM traps, CR discrepancy questions, and assumption identification. Strong session.

Student: I feel like CR is getting better. DS I still need reps.

Sam: Agreed. Next session let's do a full DS set — 15 questions, timed, then we debrief patterns. Target: under 2 minutes per question.

Student: Okay, sounds good.
`

// ── The actual memory prompt (from agents/gmat/memory.ts) ──────────────────

function buildPrompt(transcript: string): string {
  return `You are a Memory Agent for Prepwise, an AI-powered GMAT voice tutor.

Your role is to analyze GMAT tutoring conversations and extract key learning information to build the student's long-term learner profile.

## What to extract:

**weak_topics**: Topics where the learner struggled THIS session (specific, not generic)
**strong_topics**: Topics where the learner excelled THIS session
**effective_techniques**: What explanation approaches worked
**ineffective_approaches**: What did NOT work
**insight_moments**: "Aha" moments — phrases that clearly clicked
**concept_links**: Connections between topics discovered this session
**learning_style**: Updated observation on how this learner learns best
**explanation_preference**: questions vs direct explanation vs Socratic (or null)
**session_topics**: Main GMAT topics covered (2-5 topic labels)
**next_session_plan**: Recommended focus for next session
**score_trajectory**: Accuracy trend observation (or null)
**time_pressure_notes**: How learner handles time pressure (or null)
**common_error_patterns**: Recurring mistake types — WHY they got it wrong

## Guidelines:
- Be specific, not generic ("quadratic factoring when leading coefficient ≠ 1" not "algebra")
- Focus on patterns, not one-off mistakes
- Prioritize actionable observations

## Conversation to analyze:

${transcript}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "weak_topics": [],
  "strong_topics": [],
  "effective_techniques": [],
  "ineffective_approaches": [],
  "insight_moments": [],
  "concept_links": {},
  "learning_style": "",
  "explanation_preference": null,
  "session_topics": [],
  "next_session_plan": null,
  "score_trajectory": null,
  "time_pressure_notes": null,
  "common_error_patterns": []
}`
}

// ── Runner ─────────────────────────────────────────────────────────────────

interface ModelResult {
  model: string
  label: string
  success: boolean
  latencyMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  parsed: boolean
  output: unknown
  error?: string
}

async function runModel(
  client: OpenAI,
  model: { id: string; label: string; priceInput: number; priceOutput: number },
  prompt: string
): Promise<ModelResult> {
  const start = Date.now()

  try {
    const completion = await client.chat.completions.create({
      model: model.id,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const latencyMs = Date.now() - start
    const content = completion.choices[0]?.message?.content || ''
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0
    const costUsd =
      (inputTokens / 1_000_000) * model.priceInput +
      (outputTokens / 1_000_000) * model.priceOutput

    // Try to parse JSON
    let parsed = false
    let output: unknown = content
    try {
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      output = JSON.parse(clean)
      parsed = true
    } catch {
      // keep raw string
    }

    return {
      model: model.id,
      label: model.label,
      success: true,
      latencyMs,
      inputTokens,
      outputTokens,
      costUsd,
      parsed,
      output,
    }
  } catch (err) {
    return {
      model: model.id,
      label: model.label,
      success: false,
      latencyMs: Date.now() - start,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      parsed: false,
      output: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

function scoreOutput(output: unknown): { score: number; notes: string[] } {
  if (!output || typeof output !== 'object') return { score: 0, notes: ['Not valid JSON'] }

  const obj = output as Record<string, unknown>
  const notes: string[] = []
  let score = 0

  // Required fields
  const requiredFields = [
    'weak_topics', 'strong_topics', 'effective_techniques', 'ineffective_approaches',
    'insight_moments', 'concept_links', 'learning_style', 'session_topics',
    'next_session_plan', 'common_error_patterns',
  ]

  let fieldScore = 0
  for (const f of requiredFields) {
    if (f in obj) fieldScore++
    else notes.push(`Missing field: ${f}`)
  }
  score += (fieldScore / requiredFields.length) * 30
  notes.push(`Fields present: ${fieldScore}/${requiredFields.length}`)

  // Quality checks
  const weakTopics = (obj.weak_topics as string[]) || []
  const strongTopics = (obj.strong_topics as string[]) || []
  const sessionTopics = (obj.session_topics as string[]) || []
  const insightMoments = (obj.insight_moments as string[]) || []
  const errorPatterns = (obj.common_error_patterns as string[]) || []
  const techniques = (obj.effective_techniques as string[]) || []

  // session_topics should be 2-5 items
  if (sessionTopics.length >= 2 && sessionTopics.length <= 5) {
    score += 10
    notes.push(`✓ session_topics count: ${sessionTopics.length} (good)`)
  } else {
    notes.push(`✗ session_topics count: ${sessionTopics.length} (expected 2-5)`)
  }

  // weak_topics should have specific items (DS edge cases mentioned in transcript)
  const hasSpecificWeakTopic = weakTopics.some(t =>
    t.toLowerCase().includes('ds') ||
    t.toLowerCase().includes('data') ||
    t.toLowerCase().includes('edge') ||
    t.toLowerCase().includes('negative') ||
    t.toLowerCase().includes('integer')
  )
  if (hasSpecificWeakTopic) {
    score += 15
    notes.push(`✓ Specific weak topic identified (DS edge cases)`)
  } else {
    notes.push(`✗ weak_topics too generic or missed DS edge case pattern`)
  }

  // strong_topics should mention CR (learner did well on CR)
  const hasCRStrong = strongTopics.some(t =>
    t.toLowerCase().includes('cr') ||
    t.toLowerCase().includes('critical') ||
    t.toLowerCase().includes('reasoning') ||
    t.toLowerCase().includes('assumption')
  )
  if (hasCRStrong) {
    score += 10
    notes.push(`✓ CR strength identified`)
  } else {
    notes.push(`✗ CR strength not captured in strong_topics`)
  }

  // insight_moments should capture "dilution" pattern or DS mental checklist
  const hasInsight = insightMoments.some(m =>
    m.toLowerCase().includes('dilut') ||
    m.toLowerCase().includes('checklist') ||
    m.toLowerCase().includes('lcm') ||
    m.toLowerCase().includes('bridge') ||
    m.toLowerCase().includes('assumption')
  )
  if (hasInsight) {
    score += 15
    notes.push(`✓ Key insight moments captured`)
  } else {
    notes.push(`✗ Missed key insight moments (dilution, DS checklist)`)
  }

  // error_patterns should mention negative numbers check
  const hasErrorPattern = errorPatterns.some(e =>
    e.toLowerCase().includes('negative') ||
    e.toLowerCase().includes('edge') ||
    e.toLowerCase().includes('rush') ||
    e.toLowerCase().includes('sufficient')
  )
  if (hasErrorPattern) {
    score += 10
    notes.push(`✓ Specific error pattern captured`)
  } else {
    notes.push(`✗ Error patterns too generic`)
  }

  // effective_techniques present
  if (techniques.length > 0) {
    score += 10
    notes.push(`✓ Effective techniques captured: ${techniques.length} items`)
  }

  return { score: Math.round(score), notes }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set in .env.local')
    process.exit(1)
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://samiwise.app',
      'X-Title': 'PrepWISE Model Test',
    },
  })

  const prompt = buildPrompt(SAMPLE_TRANSCRIPT)
  console.log(`\n${'═'.repeat(60)}`)
  console.log('  PrepWISE — Memory Extraction Model Comparison')
  console.log(`${'═'.repeat(60)}`)
  console.log(`Prompt tokens (est.): ~${Math.round(prompt.length / 4)}`)
  console.log(`Running ${MODELS.length} models sequentially...\n`)

  const results: ModelResult[] = []

  for (const model of MODELS) {
    console.log(`⏳ Running: ${model.label}...`)
    const result = await runModel(client, model, prompt)
    results.push(result)

    if (result.success) {
      console.log(`   ✓ Done in ${(result.latencyMs / 1000).toFixed(1)}s`)
    } else {
      console.log(`   ✗ Failed: ${result.error}`)
    }
  }

  // ── Results ───────────────────────────────────────────────────────────────

  console.log(`\n${'─'.repeat(60)}`)
  console.log('  RESULTS')
  console.log(`${'─'.repeat(60)}\n`)

  for (const result of results) {
    console.log(`📊 ${result.label}`)
    console.log(`   Model ID:      ${result.model}`)

    if (!result.success) {
      console.log(`   ❌ FAILED: ${result.error}\n`)
      continue
    }

    const { score, notes } = scoreOutput(result.output)

    console.log(`   Status:        ✓ Success`)
    console.log(`   JSON parsed:   ${result.parsed ? '✓' : '✗ raw text'}`)
    console.log(`   Latency:       ${(result.latencyMs / 1000).toFixed(2)}s`)
    console.log(`   Tokens in:     ${result.inputTokens.toLocaleString()}`)
    console.log(`   Tokens out:    ${result.outputTokens.toLocaleString()}`)
    console.log(`   Cost (single): $${result.costUsd.toFixed(5)}`)
    console.log(`   Cost (1k/day): $${(result.costUsd * 1000).toFixed(3)}`)
    console.log(`   Quality score: ${score}/100`)
    console.log(`   Quality notes:`)
    for (const note of notes) {
      console.log(`     ${note}`)
    }

    if (result.parsed && result.output && typeof result.output === 'object') {
      const obj = result.output as Record<string, unknown>
      console.log(`\n   📝 Output preview:`)
      console.log(`     session_topics:   ${JSON.stringify(obj.session_topics)}`)
      console.log(`     weak_topics:      ${JSON.stringify(obj.weak_topics)}`)
      console.log(`     strong_topics:    ${JSON.stringify(obj.strong_topics)}`)
      console.log(`     insight_moments:  ${JSON.stringify(obj.insight_moments)}`)
      console.log(`     error_patterns:   ${JSON.stringify(obj.common_error_patterns)}`)
      console.log(`     next_plan:        ${JSON.stringify(obj.next_session_plan)}`)
    }

    console.log()
  }

  // ── Comparison summary ────────────────────────────────────────────────────

  const successful = results.filter(r => r.success && r.parsed)
  if (successful.length === 2) {
    const [a, b] = successful
    const costRatio = a.costUsd / b.costUsd
    const latencyRatio = a.latencyMs / b.latencyMs
    const { score: scoreA } = scoreOutput(a.output)
    const { score: scoreB } = scoreOutput(b.output)

    console.log(`${'─'.repeat(60)}`)
    console.log('  COMPARISON SUMMARY')
    console.log(`${'─'.repeat(60)}`)
    console.log(`  Cost ratio:    ${costRatio.toFixed(1)}x (${a.label} is more expensive)`)
    console.log(`  Speed ratio:   ${latencyRatio.toFixed(1)}x (${a.latencyMs < b.latencyMs ? b.label : a.label} is faster)`)
    console.log(`  Quality:       ${a.label} ${scoreA}/100 vs ${b.label} ${scoreB}/100`)
    console.log()

    // Monthly cost projection
    const callsPerDay = 200  // Rough estimate for memory extraction
    const daysPerMonth = 30
    const monthlyCostA = a.costUsd * callsPerDay * daysPerMonth
    const monthlyCostB = b.costUsd * callsPerDay * daysPerMonth
    console.log(`  Monthly projection (${callsPerDay} calls/day):`)
    console.log(`    ${a.label}: $${monthlyCostA.toFixed(2)}/mo`)
    console.log(`    ${b.label}: $${monthlyCostB.toFixed(2)}/mo`)
    console.log(`    Savings: $${(monthlyCostA - monthlyCostB).toFixed(2)}/mo`)
    console.log()
  }

  console.log(`${'═'.repeat(60)}\n`)
}

main().catch(console.error)

#!/usr/bin/env node
/**
 * PrepWISE — Memory Extraction Model Comparison
 * Claude Sonnet 4 vs MiniMax M2.7
 *
 * Usage: node scripts/test-model-comparison.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load env ────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

let envContent = ''
try {
  envContent = readFileSync(envPath, 'utf8')
} catch {
  console.error('.env.local not found')
  process.exit(1)
}

for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim()
  process.env[key] = val
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY not found in .env.local')
  process.exit(1)
}

// ── Models ──────────────────────────────────────────────────────────────────

const MODELS = [
  {
    id: 'anthropic/claude-sonnet-4',
    label: 'Claude Sonnet 4 (current)',
    priceInput: 3.0,
    priceOutput: 15.0,
  },
  {
    id: 'minimax/minimax-m2.7',
    label: 'MiniMax M2.7 (candidate)',
    priceInput: 0.30,
    priceOutput: 1.20,
  },
]

// ── Realistic GMAT session transcript ───────────────────────────────────────

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

// ── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(transcript) {
  return `You are a Memory Agent for Prepwise, an AI-powered GMAT voice tutor.

Your role is to analyze GMAT tutoring conversations and extract key learning information to build the student's long-term learner profile.

## Guidelines:
- Be specific, not generic ("quadratic factoring when leading coefficient ≠ 1" not "algebra")
- Focus on patterns, not one-off mistakes
- Prioritize actionable observations the tutor can use next session
- weak_topics: topics where learner struggled or made errors this session
- strong_topics: topics where learner answered correctly and showed confidence
- effective_techniques: explanation styles that worked
- ineffective_approaches: what did NOT work
- insight_moments: "Aha" phrases that clearly clicked for the learner
- concept_links: connections between GMAT topics discovered this session
- learning_style: updated observation on how this learner learns best
- explanation_preference: Socratic vs direct vs guided (or null)
- session_topics: main GMAT topics covered (2-5 labels)
- next_session_plan: recommended focus for next session
- score_trajectory: accuracy trend observation (or null)
- time_pressure_notes: how learner handles time (or null)
- common_error_patterns: recurring mistake types — WHY they got it wrong

## Conversation to analyze:

${transcript}

Return ONLY a valid JSON object (no markdown, no explanations, no code blocks):

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

// ── API call ─────────────────────────────────────────────────────────────────

async function callModel(model, prompt) {
  const start = Date.now()

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://prepwise.app',
        'X-Title': 'PrepWISE Model Test',
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })

    const latencyMs = Date.now() - start

    if (!response.ok) {
      const errText = await response.text()
      return { success: false, latencyMs, error: `HTTP ${response.status}: ${errText}` }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0
    const costUsd =
      (inputTokens / 1_000_000) * model.priceInput +
      (outputTokens / 1_000_000) * model.priceOutput

    let parsed = false
    let output = content
    try {
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      output = JSON.parse(clean)
      parsed = true
    } catch {
      // keep raw
    }

    return { success: true, latencyMs, inputTokens, outputTokens, costUsd, parsed, output }
  } catch (err) {
    return { success: false, latencyMs: Date.now() - start, error: err.message }
  }
}

// ── Quality scoring ──────────────────────────────────────────────────────────

function scoreOutput(output) {
  if (!output || typeof output !== 'object') return { score: 0, notes: ['Not valid JSON object'] }

  const notes = []
  let score = 0

  const requiredFields = [
    'weak_topics', 'strong_topics', 'effective_techniques', 'ineffective_approaches',
    'insight_moments', 'concept_links', 'learning_style', 'session_topics',
    'next_session_plan', 'common_error_patterns',
  ]

  let fieldCount = 0
  for (const f of requiredFields) {
    if (f in output) fieldCount++
    else notes.push(`  ✗ Missing field: ${f}`)
  }
  score += Math.round((fieldCount / requiredFields.length) * 30)
  notes.push(`  Fields: ${fieldCount}/${requiredFields.length} (+${Math.round((fieldCount / requiredFields.length) * 30)} pts)`)

  const weakTopics = output.weak_topics || []
  const strongTopics = output.strong_topics || []
  const sessionTopics = output.session_topics || []
  const insightMoments = output.insight_moments || []
  const errorPatterns = output.common_error_patterns || []
  const techniques = output.effective_techniques || []

  // session_topics: 2-5 items
  if (sessionTopics.length >= 2 && sessionTopics.length <= 5) {
    score += 10
    notes.push(`  ✓ session_topics count ok: ${sessionTopics.length} (+10 pts)`)
  } else {
    notes.push(`  ✗ session_topics count off: ${sessionTopics.length} (want 2-5)`)
  }

  // DS edge cases in weak_topics
  const dsEdge = weakTopics.some(t =>
    /ds|data.suf|edge|negative|integer|zero|fraction/i.test(t)
  )
  if (dsEdge) {
    score += 15
    notes.push(`  ✓ DS edge case pattern captured in weak_topics (+15 pts)`)
  } else {
    notes.push(`  ✗ DS edge cases missed in weak_topics: ${JSON.stringify(weakTopics)}`)
  }

  // CR in strong_topics
  const crStrong = strongTopics.some(t =>
    /cr|critical|reasoning|assumption|discrepancy/i.test(t)
  )
  if (crStrong) {
    score += 10
    notes.push(`  ✓ CR strength identified (+10 pts)`)
  } else {
    notes.push(`  ✗ CR strength not captured: ${JSON.stringify(strongTopics)}`)
  }

  // Key insight moments (dilution / checklist / bridge)
  const hasInsight = insightMoments.some(m =>
    /dilut|checklist|lcm|bridge|assumption|unstated/i.test(m)
  )
  if (hasInsight) {
    score += 15
    notes.push(`  ✓ Key insights captured (dilution / checklist / bridge) (+15 pts)`)
  } else {
    notes.push(`  ✗ Key insights missed: ${JSON.stringify(insightMoments)}`)
  }

  // Error pattern: negative check / rushing
  const hasErrPattern = errorPatterns.some(e =>
    /negative|edge|rush|sufficient|sign/i.test(e)
  )
  if (hasErrPattern) {
    score += 10
    notes.push(`  ✓ Specific error pattern captured (+10 pts)`)
  } else {
    notes.push(`  ✗ Error patterns too generic: ${JSON.stringify(errorPatterns)}`)
  }

  // Techniques present
  if (techniques.length > 0) {
    score += 10
    notes.push(`  ✓ Effective techniques present: ${techniques.length} items (+10 pts)`)
  } else {
    notes.push(`  ✗ No effective techniques extracted`)
  }

  return { score, notes }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const prompt = buildPrompt(SAMPLE_TRANSCRIPT)
const promptTokenEstimate = Math.round(prompt.length / 4)

console.log(`\n${'═'.repeat(62)}`)
console.log('  PrepWISE — Memory Extraction Model Comparison')
console.log(`${'═'.repeat(62)}`)
console.log(`  Prompt size: ~${promptTokenEstimate} tokens`)
console.log(`  Transcript:  realistic 45-min DS + CR session`)
console.log(`  Models:      ${MODELS.map(m => m.label).join(' vs ')}`)
console.log(`${'═'.repeat(62)}\n`)

const results = []

for (const model of MODELS) {
  process.stdout.write(`⏳ ${model.label} ...`)
  const result = await callModel(model, prompt)
  results.push({ model, ...result })

  if (result.success) {
    process.stdout.write(` ✓ ${(result.latencyMs / 1000).toFixed(1)}s\n`)
  } else {
    process.stdout.write(` ✗ FAILED\n`)
  }
}

console.log()

// Print detailed results
for (const r of results) {
  console.log(`${'─'.repeat(62)}`)
  console.log(`  ${r.model.label}`)
  console.log(`${'─'.repeat(62)}`)

  if (!r.success) {
    console.log(`  ❌ Failed: ${r.error}\n`)
    continue
  }

  const { score, notes } = scoreOutput(r.output)

  console.log(`  JSON parsed:    ${r.parsed ? '✓ valid JSON' : '✗ raw text (bad)'}`)
  console.log(`  Latency:        ${(r.latencyMs / 1000).toFixed(2)}s`)
  console.log(`  Tokens in:      ${r.inputTokens.toLocaleString()}`)
  console.log(`  Tokens out:     ${r.outputTokens.toLocaleString()}`)
  console.log(`  Cost per call:  $${r.costUsd.toFixed(5)}`)
  console.log(`  Quality score:  ${score}/100`)
  console.log(`  Quality detail:`)
  for (const n of notes) console.log(`   ${n}`)

  if (r.parsed && r.output && typeof r.output === 'object') {
    const o = r.output
    console.log(`\n  Output preview:`)
    console.log(`    session_topics:   ${JSON.stringify(o.session_topics)}`)
    console.log(`    weak_topics:      ${JSON.stringify(o.weak_topics)}`)
    console.log(`    strong_topics:    ${JSON.stringify(o.strong_topics)}`)
    console.log(`    insight_moments:  ${JSON.stringify(o.insight_moments)}`)
    console.log(`    error_patterns:   ${JSON.stringify(o.common_error_patterns)}`)
    console.log(`    learning_style:   ${JSON.stringify(o.learning_style)}`)
    console.log(`    next_plan:        ${JSON.stringify(o.next_session_plan)}`)
  }
  console.log()
}

// Comparison
const ok = results.filter(r => r.success && r.parsed)
if (ok.length === 2) {
  const [a, b] = ok
  const { score: sA } = scoreOutput(a.output)
  const { score: sB } = scoreOutput(b.output)

  console.log(`${'═'.repeat(62)}`)
  console.log('  VERDICT')
  console.log(`${'═'.repeat(62)}`)
  console.log(`  Cost ratio:     ${(a.costUsd / b.costUsd).toFixed(1)}x  (${a.model.label} more expensive)`)
  console.log(`  Speed:          ${a.model.label} ${(a.latencyMs/1000).toFixed(1)}s  vs  ${b.model.label} ${(b.latencyMs/1000).toFixed(1)}s`)
  console.log(`  Quality:        ${a.model.label} ${sA}/100  vs  ${b.model.label} ${sB}/100`)

  const callsPerDay = 200
  const daysPerMonth = 30
  const mA = a.costUsd * callsPerDay * daysPerMonth
  const mB = b.costUsd * callsPerDay * daysPerMonth
  console.log()
  console.log(`  Monthly cost at ${callsPerDay} calls/day:`)
  console.log(`    ${a.model.label}:  $${mA.toFixed(2)}/mo`)
  console.log(`    ${b.model.label}: $${mB.toFixed(2)}/mo`)
  console.log(`    Savings:  $${(mA - mB).toFixed(2)}/mo`)
  console.log()

  if (sB >= sA - 10) {
    console.log(`  ✅ MiniMax M2.7 delivers comparable quality at ${(a.costUsd / b.costUsd).toFixed(0)}x lower cost.`)
    console.log(`     Recommended for memory extraction task.`)
  } else if (sB < sA - 20) {
    console.log(`  ⚠️  MiniMax M2.7 quality gap too large (${sA - sB} pts). Stay on Claude for now.`)
  } else {
    console.log(`  🟡 MiniMax M2.7 slightly weaker (${sA - sB} pts gap). Worth more testing.`)
  }
  console.log(`${'═'.repeat(62)}\n`)
}

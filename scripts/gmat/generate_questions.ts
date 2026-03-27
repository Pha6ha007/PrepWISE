#!/usr/bin/env node
// scripts/gmat/generate_questions.ts
// Prepwise — Automated question generation via OpenRouter API
//
// Generates missing DI question types + 700+ level questions.
// Runs in batches to avoid context limits, saves progress after each batch.
//
// Usage:
//   npx ts-node scripts/gmat/generate_questions.ts --type gi
//   npx ts-node scripts/gmat/generate_questions.ts --type msr
//   npx ts-node scripts/gmat/generate_questions.ts --type tpa
//   npx ts-node scripts/gmat/generate_questions.ts --type ta
//   npx ts-node scripts/gmat/generate_questions.ts --type all

import { config } from 'dotenv'
config({ path: '.env.local' })

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://prepwise.app',
    'X-Title': 'PrepWISE',
  },
})

const MODEL = 'openai/gpt-4o'
const DATA_DIR = path.join(__dirname, '../../data/questions')

// ── Prompts ───────────────────────────────────────────────

const PROMPTS: Record<string, { file: string; batches: Array<{ count: number; difficulty: string; subtopics: string[] }> }> = {
  rc: {
    file: 'gen-rc.json',
    // 200 passages total = 10 batches × ~10-12 passages each
    batches: [
      { count: 10, difficulty: '4 easy, 4 medium, 2 hard', subtopics: ['business', 'science'] },
      { count: 10, difficulty: '2 easy, 5 medium, 3 hard', subtopics: ['social-science', 'humanities'] },
      { count: 10, difficulty: '2 easy, 4 medium, 3 hard, 1 "700+"', subtopics: ['technology', 'business'] },
      { count: 10, difficulty: '1 easy, 4 medium, 3 hard, 2 "700+"', subtopics: ['science', 'social-science'] },
      { count: 10, difficulty: '1 easy, 3 medium, 4 hard, 2 "700+"', subtopics: ['humanities', 'technology'] },
      { count: 10, difficulty: '1 easy, 3 medium, 4 hard, 2 "700+"', subtopics: ['business', 'science'] },
      { count: 10, difficulty: '1 easy, 3 medium, 3 hard, 3 "700+"', subtopics: ['social-science', 'humanities', 'technology'] },
      { count: 10, difficulty: '1 easy, 2 medium, 4 hard, 3 "700+"', subtopics: ['business', 'science', 'social-science'] },
      { count: 10, difficulty: '1 easy, 2 medium, 4 hard, 3 "700+"', subtopics: ['technology', 'humanities', 'business'] },
      { count: 10, difficulty: '2 medium, 4 hard, 4 "700+"', subtopics: ['science', 'social-science', 'humanities'] },
    ],
  },
  ta: {
    file: 'gen-ta.json',
    batches: [
      { count: 25, difficulty: '10 easy, 10 medium, 5 hard', subtopics: ['sorting', 'filtering', 'threshold', 'calculations', 'compound-conditions'] },
      { count: 25, difficulty: '5 medium, 15 hard, 5 "700+"', subtopics: ['sorting', 'filtering', 'threshold', 'calculations', 'compound-conditions'] },
      { count: 25, difficulty: '5 medium, 12 hard, 8 "700+"', subtopics: ['sorting', 'filtering', 'threshold', 'calculations', 'compound-conditions'] },
      { count: 25, difficulty: '5 medium, 10 hard, 10 "700+"', subtopics: ['compound-conditions', 'calculations', 'threshold'] },
    ],
  },
  gi: {
    file: 'gen-gi.json',
    batches: [
      { count: 25, difficulty: '8 easy, 12 medium, 5 hard', subtopics: ['bar-chart', 'line-graph'] },
      { count: 25, difficulty: '5 medium, 15 hard, 5 "700+"', subtopics: ['bar-chart', 'line-graph', 'scatter-plot'] },
      { count: 25, difficulty: '5 medium, 12 hard, 8 "700+"', subtopics: ['scatter-plot', 'pie-chart', 'bar-chart'] },
      { count: 25, difficulty: '5 medium, 10 hard, 10 "700+"', subtopics: ['line-graph', 'scatter-plot', 'pie-chart'] },
    ],
  },
  msr: {
    file: 'gen-msr.json',
    batches: [
      { count: 20, difficulty: '5 easy, 10 medium, 5 hard', subtopics: ['synthesis', 'yes-no'] },
      { count: 20, difficulty: '5 medium, 10 hard, 5 "700+"', subtopics: ['conditional-logic', 'inference'] },
      { count: 20, difficulty: '3 medium, 10 hard, 7 "700+"', subtopics: ['synthesis', 'conditional-logic', 'yes-no', 'inference'] },
    ],
  },
  tpa: {
    file: 'gen-tpa.json',
    batches: [
      { count: 20, difficulty: '6 easy, 10 medium, 4 hard', subtopics: ['algebraic'] },
      { count: 20, difficulty: '4 medium, 12 hard, 4 "700+"', subtopics: ['verbal'] },
      { count: 20, difficulty: '2 medium, 10 hard, 8 "700+"', subtopics: ['algebraic', 'verbal', 'constraint-matching'] },
      { count: 20, difficulty: '2 medium, 8 hard, 10 "700+"', subtopics: ['algebraic', 'verbal', 'constraint-matching'] },
    ],
  },
}

// ── System prompt shared across all ──────────────────────

const SYSTEM = `You are an expert GMAT question writer with 15 years of experience writing official GMAT Focus Edition questions. 
You write questions that are:
- Realistic in wording and difficulty calibration
- Contain plausible trap answers (not obviously wrong distractors)
- Have step-by-step explanations that name the trap
- Properly calibrated: easy questions test basic application, 700+ tests nuanced edge cases

You ALWAYS output ONLY valid JSON arrays. No markdown, no commentary, no code blocks. Start directly with [ and end with ].`

// ── Prompt builders ───────────────────────────────────────

function buildTAPrompt(count: number, difficulty: string, subtopics: string[], startId: number): string {
  return `Generate ${count} GMAT Focus Edition Table Analysis (TA) questions.

Difficulty distribution: ${difficulty}
Subtopics to include: ${subtopics.join(', ')}
ID numbering: start from gen-ta-${String(startId).padStart(4, '0')}

Table Analysis questions: student sees a sortable data table and answers multiple-choice questions about the data.

Each question MUST have:
- "id": sequential (gen-ta-XXXX)
- "type": "TA"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "table-analysis"
- "subtopic": one of the specified subtopics
- "passage": realistic data table as formatted text. Use pipe | for columns. Include 5-8 rows, 4-6 columns. Add 1-2 sentence context before the table. Tables must have realistic, internally consistent numbers (e.g., revenue figures that add up correctly).
- "questionStem": specific question about the table data
- "options": exactly 5 choices [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."},{"id":"E","text":"..."}]
- "correctAnswer": one of "A"-"E"
- "explanation": step-by-step solution. Name the specific trap: "Choice B is tempting because..."
- "source": "PrepWISE Generated"

Hard/700+ questions should test:
- Compound conditions (rows satisfying multiple criteria simultaneously)
- Percentage changes requiring multi-step calculation
- Finding min/max after filtering by multiple conditions
- Weighted averages from table data

Output ONLY the JSON array. Start with [.`
}

function buildGIPrompt(count: number, difficulty: string, subtopics: string[], startId: number): string {
  return `Generate ${count} GMAT Focus Edition Graphics Interpretation (GI) questions.

Difficulty distribution: ${difficulty}
Graph types: ${subtopics.join(', ')}
ID numbering: start from gen-gi-${String(startId).padStart(4, '0')}

GI questions: student sees a chart/graph and completes fill-in-the-blank statements using dropdown choices.

Each question MUST have:
- "id": sequential (gen-gi-XXXX)
- "type": "GI"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "graphics-interpretation"
- "subtopic": "bar-chart" | "line-graph" | "scatter-plot" | "pie-chart"
- "passage": detailed description of the chart with ALL specific data values needed to answer the question. Include axis labels, units, scale, and exact data points. The chart must be fully reconstructable from the description.
- "questionStem": a sentence with a blank: "The percentage increase from 2021 to 2023 was closest to ___"
- "options": exactly 5 choices (the dropdown options)
- "correctAnswer": one of "A"-"E"
- "explanation": step-by-step calculation referencing specific values from the passage
- "source": "PrepWISE Generated"

700+ questions should test:
- Rate of change between non-adjacent points
- Calculating percentage of total from multiple segments
- Estimating values using trend lines
- Multi-step calculations using two different chart elements

Output ONLY the JSON array. Start with [.`
}

function buildMSRPrompt(count: number, difficulty: string, subtopics: string[], startId: number): string {
  return `Generate ${count} GMAT Focus Edition Multi-Source Reasoning (MSR) questions.

Difficulty distribution: ${difficulty}
Question types: ${subtopics.join(', ')}
ID numbering: start from gen-msr-${String(startId).padStart(4, '0')}

MSR questions: student reads 2-3 information sources and answers questions requiring synthesis across sources.

Each question MUST have:
- "id": sequential (gen-msr-XXXX)
- "type": "MSR"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "multi-source-reasoning"
- "subtopic": "synthesis" | "conditional-logic" | "yes-no" | "inference"
- "passage": 2-3 sources combined. Format each as "Source 1: [Descriptive Title]\\n[content]\\n\\nSource 2: [Descriptive Title]\\n[content]". Each source 80-150 words. Sources must contain some information that supplements, qualifies, or contradicts other sources.
- "questionStem": the question (often "Based on the information provided..." or "Which of the following can be inferred...")
- "options": exactly 5 choices
- "correctAnswer": one of "A"-"E"
- "explanation": cite which source(s) provide the key information and how they combine
- "source": "PrepWISE Generated"

700+ questions require:
- Information from ALL sources to answer correctly
- A statement in one source that seems to contradict another (but doesn't)
- Conditional logic (if X then Y) that requires careful tracking

Output ONLY the JSON array. Start with [.`
}

function buildRCPrompt(count: number, difficulty: string, topics: string[], startId: number): string {
  return `Generate ${count} GMAT Focus Edition Reading Comprehension passages, each with 3-4 questions.

Difficulty distribution of passages: ${difficulty}
Topic areas: ${topics.join(', ')}
Passage ID numbering: start from gen-rc-${String(startId).padStart(4, '0')}

Passage requirements:
- Length: 250-350 words (GMAT Focus Edition standard — longer than old GMAT)
- Academic, precise prose — not casual or journalistic
- Each passage must have a clear argument or position the author advances, not just neutral description
- Topics must be distinct from each other — no two passages on the same subject
- Topic areas to use: business (strategy, markets, regulation, corporate governance), science (biology, physics, climate, neuroscience), social-science (economics, psychology, sociology, anthropology), humanities (history, literature, philosophy, art), technology (AI, biotech, computing, energy)

Question requirements (3-4 per passage):
- Must cover DIFFERENT question types across the 3-4 questions for each passage:
  - Primary Purpose / Main Idea
  - Specific Detail (requires going back to passage)
  - Inference (must be true based on passage)
  - Author's Tone or Attitude
  - Function / Purpose of a paragraph or phrase
- Answer choices must be carefully crafted: 1 clearly correct, 4 plausible but wrong
- Wrong answers must fail for identifiable reasons: too extreme, out of scope, opposite, half-right, uses passage words but distorts meaning
- Explanation must name why the correct answer is correct AND why the 2 most tempting wrong answers fail

Hard/700+ passages should:
- Contain qualified language and nuanced positions (not black-and-white claims)
- Have questions where the wrong answer is supported by something literally in the passage (but misapplied)
- Test subtle tone distinctions (skeptical vs dismissive, cautious vs opposed)

Output format — ONLY valid JSON array of passage objects:

[
  {
    "id": "gen-rc-XXXX",
    "type": "RC",
    "section": "verbal",
    "difficulty": "medium",
    "topic": "reading-comprehension",
    "passageTitle": "Descriptive Title Here",
    "passage": "Full passage text here (250-350 words)...",
    "source": "PrepWISE Generated",
    "questions": [
      {
        "id": "gen-rc-XXXX-q1",
        "questionStem": "The primary purpose of the passage is to",
        "options": [
          {"id": "A", "text": "..."},
          {"id": "B", "text": "..."},
          {"id": "C", "text": "..."},
          {"id": "D", "text": "..."},
          {"id": "E", "text": "..."}
        ],
        "correctAnswer": "B",
        "explanation": "..."
      }
    ]
  }
]

Generate all ${count} passages with their questions. ONLY the JSON array. Start with [.`
}

function buildTPAPrompt(count: number, difficulty: string, subtopics: string[], startId: number): string {
  return `Generate ${count} GMAT Focus Edition Two-Part Analysis (TPA) questions.

Difficulty distribution: ${difficulty}
Types: ${subtopics.join(', ')}
ID numbering: start from gen-tpa-${String(startId).padStart(4, '0')}

TPA questions: student selects TWO answers from the same option set — one for each "column" of the question.

Each question MUST have:
- "id": sequential (gen-tpa-XXXX)
- "type": "TPA"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "two-part-analysis"
- "subtopic": "algebraic" | "verbal" | "constraint-matching"
- "passage": the problem setup
  - For algebraic: word problem with two unknowns and enough constraints to solve
  - For verbal: a short argument (4-8 sentences) about business, science, or policy
- "questionStem": what the two columns represent. Examples:
  - Algebraic: "In the table, select the value for [X] and the value for [Y] that together satisfy the conditions above"
  - Verbal: "Select the statement that serves as the main conclusion and the statement that serves as the primary evidence"
- "options": 5-6 choices (SAME options list used for both columns)
- "correctAnswer": "A,C" format — Column 1 answer, comma, Column 2 answer
- "explanation": explain Column 1 selection, then Column 2 selection, why the pair works
- "source": "PrepWISE Generated"

700+ algebraic TPA: use systems with non-obvious constraints (optimization, "must be true" across cases)
700+ verbal TPA: multi-step argument chains where roles are ambiguous

Output ONLY the JSON array. Start with [.`
}

// ── Generation logic ──────────────────────────────────────

async function generateBatch(
  type: string,
  prompt: string,
  batchIndex: number,
): Promise<any[]> {
  console.log(`  [${type}] batch ${batchIndex + 1} — calling API...`)

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ],
    temperature: 0.85,
    max_tokens: type === 'rc' ? 32000 : 16000,
  })

  const raw = response.choices[0]?.message?.content?.trim() || '[]'

  // Strip any accidental markdown fences
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) {
      console.error(`  [${type}] batch ${batchIndex + 1}: response is not an array`)
      return []
    }
    console.log(`  [${type}] batch ${batchIndex + 1}: got ${parsed.length} questions`)
    return parsed
  } catch (e) {
    console.error(`  [${type}] batch ${batchIndex + 1}: JSON parse error — saving raw to debug file`)
    fs.writeFileSync(
      path.join(DATA_DIR, `debug-${type}-batch${batchIndex}.txt`),
      raw,
    )
    return []
  }
}

function loadExisting(file: string): any[] {
  const filePath = path.join(DATA_DIR, file)
  if (!fs.existsSync(filePath)) return []
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim()
    if (!content || content === '') return []
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(file: string, data: any[]): void {
  const filePath = path.join(DATA_DIR, file)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

async function generateType(type: string): Promise<void> {
  const config = PROMPTS[type]
  if (!config) {
    console.error(`Unknown type: ${type}. Available: ${Object.keys(PROMPTS).join(', ')}`)
    return
  }

  console.log(`\n=== Generating ${type.toUpperCase()} questions ===`)

  // Load existing
  const existing = loadExisting(config.file)

  // RC: items are passages with nested questions — count passages, not questions
  const isRC = type === 'rc'
  const realExisting = isRC
    ? existing.filter((p: any) => p.id && Array.isArray(p.questions) && p.questions.length > 0)
    : existing.filter((q: any) => q.id && q.explanation)

  console.log(`  Existing valid ${isRC ? 'passages' : 'questions'}: ${realExisting.length}`)

  let startId = realExisting.length + 1
  const allItems = [...realExisting]

  for (let i = 0; i < config.batches.length; i++) {
    const batch = config.batches[i]

    let prompt: string
    switch (type) {
      case 'rc':  prompt = buildRCPrompt(batch.count, batch.difficulty, batch.subtopics, startId); break
      case 'ta': prompt = buildTAPrompt(batch.count, batch.difficulty, batch.subtopics, startId); break
      case 'gi': prompt = buildGIPrompt(batch.count, batch.difficulty, batch.subtopics, startId); break
      case 'msr': prompt = buildMSRPrompt(batch.count, batch.difficulty, batch.subtopics, startId); break
      case 'tpa': prompt = buildTPAPrompt(batch.count, batch.difficulty, batch.subtopics, startId); break
      default: throw new Error(`No prompt builder for type: ${type}`)
    }

    const newQuestions = await generateBatch(type, prompt, i)

    if (newQuestions.length > 0) {
      allItems.push(...newQuestions)
      startId += newQuestions.length
      save(config.file, allItems)
      const totalQ = isRC
        ? allItems.reduce((s: number, p: any) => s + (p.questions?.length || 0), 0)
        : allItems.length
      console.log(`  Saved — ${isRC ? `${allItems.length} passages / ${totalQ} questions` : `${allItems.length} questions`}`)
    }

    if (i < config.batches.length - 1) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  const finalCount = isRC
    ? `${allItems.length} passages / ${allItems.reduce((s: number, p: any) => s + (p.questions?.length || 0), 0)} questions`
    : `${allItems.length} questions`
  console.log(`  ✓ ${type.toUpperCase()} complete: ${finalCount} in ${config.file}`)
}

// ── Entry point ───────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1]
    || args[args.indexOf('--type') + 1]

  if (!typeArg) {
    console.log('Usage: npx ts-node scripts/gmat/generate_questions.ts --type [gi|msr|tpa|ta|all]')
    process.exit(1)
  }

  if (typeArg === 'all') {
    for (const type of ['ta', 'gi', 'msr', 'tpa']) {
      await generateType(type)
    }
  } else {
    await generateType(typeArg)
  }

  console.log('\n✅ Done. Run validate_generated.ts to check the output.')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})

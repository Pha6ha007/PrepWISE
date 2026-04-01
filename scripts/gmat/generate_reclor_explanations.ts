#!/usr/bin/env node
// scripts/gmat/generate_reclor_explanations.ts
// SamiWISE — Generate explanations for ReClor CR questions in batches
//
// ReClor has 3748 questions without explanations.
// This script generates them in batches of 20, saving progress after each.
//
// Usage:
//   npx ts-node scripts/gmat/generate_reclor_explanations.ts
//   npx ts-node scripts/gmat/generate_reclor_explanations.ts --limit 1000
//   npx ts-node scripts/gmat/generate_reclor_explanations.ts --offset 1000 --limit 1000

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
    'HTTP-Referer': 'https://samiwise.app',
    'X-Title': 'SamiWISE',
  },
})

const MODEL = 'openai/gpt-4o-mini'   // mini — дешевле, для объяснений достаточно
const BATCH_SIZE = 20
const FILE = path.join(__dirname, '../../data/questions/reclor-verbal.json')

const SYSTEM = `You are an expert GMAT Critical Reasoning tutor. For each question I give you, write a clear, concise explanation that:

1. Identifies the argument structure: premise(s) → gap → conclusion (1 sentence each)
2. Explains WHY the correct answer is right (reference the gap it addresses)
3. Explains why the 2 most tempting wrong answers are wrong (name the specific flaw: scope shift, too extreme, wrong direction, strengthens instead of weakens, etc.)

Format rules:
- 4-6 sentences total per explanation
- Direct, no fluff — no "This is a great question" or "Let's break this down"
- Reference specific words from the passage and answer choices
- For parallel-reasoning questions: explain the logical pattern first, then show why the correct answer matches it

Output ONLY a valid JSON array, one object per question:
[{"id": "reclor-XXXX", "explanation": "..."}, ...]

No markdown, no code blocks. Start directly with [.`

function buildBatchPrompt(questions: any[]): string {
  const items = questions.map((q, i) => {
    const opts = q.options.map((o: any) => `${o.id}. ${o.text}`).join('\n')
    return `Question ${i + 1} (ID: ${q.id}):
Passage: ${q.passage}
Question: ${q.questionStem}
Options:
${opts}
Correct Answer: ${q.correctAnswer}`
  }).join('\n\n---\n\n')

  return `Generate explanations for these ${questions.length} GMAT Critical Reasoning questions.\n\n${items}\n\nOutput ONLY the JSON array with ${questions.length} explanation objects.`
}

async function generateBatch(questions: any[], batchIndex: number): Promise<Record<string, string>> {
  const prompt = buildBatchPrompt(questions)

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,  // низкая температура — хотим точные объяснения
    max_tokens: 8000,
  })

  const raw = response.choices[0]?.message?.content?.trim() || '[]'
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed: Array<{ id: string; explanation: string }> = JSON.parse(cleaned)
    const result: Record<string, string> = {}
    for (const item of parsed) {
      if (item.id && item.explanation) {
        result[item.id] = item.explanation
      }
    }
    return result
  } catch (e) {
    // Попытка спасти частичный JSON
    const rescued: Record<string, string> = {}
    const matches = cleaned.matchAll(/"id"\s*:\s*"(reclor-\d+)"[^}]*"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/g)
    for (const m of matches) {
      rescued[m[1]] = m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"')
    }
    if (Object.keys(rescued).length > 0) {
      console.log(`  batch ${batchIndex + 1}: partial rescue — ${Object.keys(rescued).length}/${questions.length}`)
      return rescued
    }
    console.error(`  batch ${batchIndex + 1}: parse failed, skipping`)
    return {}
  }
}

async function main() {
  const args = process.argv.slice(2)

  let limit = 1000
  let offset = 0

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[i + 1])
    else if (args[i].startsWith('--limit=')) limit = parseInt(args[i].split('=')[1])
    else if (args[i] === '--offset' && args[i + 1]) offset = parseInt(args[i + 1])
    else if (args[i].startsWith('--offset=')) offset = parseInt(args[i].split('=')[1])
  }

  console.log(`Loading ${FILE}...`)
  const raw = fs.readFileSync(FILE, 'utf-8')
  const questions: any[] = JSON.parse(raw)

  const needExpl = questions.filter(q =>
    !q.explanation || q.explanation.trim().length <= 20
  )

  console.log(`Questions without explanation: ${needExpl.length}`)
  console.log(`Processing: offset=${offset}, limit=${limit}`)

  const target = needExpl.slice(offset, offset + limit)
  console.log(`Target batch: ${target.length} questions\n`)

  // Index all questions by ID for fast update
  const byId: Record<string, any> = {}
  for (const q of questions) byId[q.id] = q

  let totalDone = 0
  const totalBatches = Math.ceil(target.length / BATCH_SIZE)

  for (let i = 0; i < target.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE)
    const batch = target.slice(i, i + BATCH_SIZE)

    process.stdout.write(`  batch ${batchNum + 1}/${totalBatches} (${batch[0].id}…${batch[batch.length-1].id}) — `)

    const start = Date.now()
    const explanations = await generateBatch(batch, batchNum)
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    const got = Object.keys(explanations).length
    process.stdout.write(`${got}/${batch.length} explanations in ${elapsed}s\n`)

    // Apply to questions
    for (const [id, expl] of Object.entries(explanations)) {
      if (byId[id]) {
        byId[id].explanation = expl
        totalDone++
      }
    }

    // Save after every batch
    fs.writeFileSync(FILE, JSON.stringify(questions, null, 2))

    // Rate limit pause
    if (i + BATCH_SIZE < target.length) {
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  // Final stats
  const finalHasExpl = questions.filter(q =>
    q.explanation && q.explanation.trim().length > 20
  ).length

  console.log(`\n✅ Done!`)
  console.log(`  Explanations added this run: ${totalDone}`)
  console.log(`  Total with explanation: ${finalHasExpl} / ${questions.length}`)
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})

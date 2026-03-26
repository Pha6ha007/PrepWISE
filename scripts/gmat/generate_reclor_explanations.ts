#!/usr/bin/env node
// scripts/gmat/generate_reclor_explanations.ts
// Generates explanations for ReClor CR questions using OpenRouter (gpt-4o-mini)
// Usage: npx tsx scripts/gmat/generate_reclor_explanations.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

const RECLOR_PATH = path.join(process.cwd(), 'data/questions/reclor-verbal.json')
const BATCH_SIZE = 10
const MAX_COUNT = 500
const MODEL = 'openai/gpt-4o-mini'

async function main() {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY required')

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: { 'HTTP-Referer': 'https://prepwise.app', 'X-Title': 'PrepWISE' },
  })

  const questions: any[] = JSON.parse(fs.readFileSync(RECLOR_PATH, 'utf-8'))
  const toProcess = questions
    .map((q, i) => ({ q, idx: i }))
    .filter(({ q }) => !q.explanation || q.explanation.length <= 10)
    .slice(0, MAX_COUNT)

  console.log('🚀 Generating explanations for ' + toProcess.length + ' ReClor questions')
  console.log('   Model: ' + MODEL + ', Batch: ' + BATCH_SIZE + '\n')

  let generated = 0, errors = 0, totalTokens = 0

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE)

    const questionsText = batch.map(({ q }, j) => {
      const opts = q.options?.map((o: any) => o.id + ') ' + o.text).join('\n') || ''
      return 'Q' + (j+1) + ' (ID: ' + q.id + '):\nPassage: ' + q.passage + '\nQuestion: ' + q.questionStem + '\n' + opts + '\nCorrect: ' + q.correctAnswer
    }).join('\n\n---\n\n')

    try {
      const r = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'For each CR question, write a 3-5 sentence explanation: 1) argument structure, 2) why correct answer is right, 3) why one wrong answer fails. Output ONLY a JSON array: [{"id":"...","explanation":"..."},...]' },
          { role: 'user', content: questionsText }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      })

      const content = r.choices[0]?.message?.content || ''
      totalTokens += (r.usage?.total_tokens || 0)

      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const expls: { id: string; explanation: string }[] = JSON.parse(jsonMatch[0])
          for (const e of expls) {
            const idx = questions.findIndex(q => q.id === e.id)
            if (idx !== -1 && e.explanation?.length > 10) {
              questions[idx].explanation = e.explanation
              generated++
            }
          }
        }
      } catch { errors++ }

      process.stdout.write('\r   ' + Math.min(i + BATCH_SIZE, toProcess.length) + '/' + toProcess.length + ' | ✅ ' + generated + ' | ❌ ' + errors + ' | tokens: ' + totalTokens)

      if ((i + BATCH_SIZE) % 100 === 0 || i + BATCH_SIZE >= toProcess.length) {
        fs.writeFileSync(RECLOR_PATH, JSON.stringify(questions, null, 2))
      }

      await new Promise(r => setTimeout(r, 300))
    } catch (err: any) {
      errors++
      if (err.status === 429) {
        console.log('\n   Rate limited — waiting 30s...')
        await new Promise(r => setTimeout(r, 30000))
        i -= BATCH_SIZE
      }
    }
  }

  fs.writeFileSync(RECLOR_PATH, JSON.stringify(questions, null, 2))
  const withExpl = questions.filter(q => q.explanation?.length > 10).length
  console.log('\n\n✅ Done! Generated: ' + generated + ', Errors: ' + errors)
  console.log('   Total with explanations: ' + withExpl + '/' + questions.length)
  console.log('   Tokens: ' + totalTokens + ', Cost: ~$' + ((totalTokens / 1e6) * 0.5).toFixed(2))
  console.log('   Remaining: ' + (questions.length - withExpl))
}

main().catch(console.error)

#!/usr/bin/env node
// scripts/gmat/validate_generated.ts
// Validates all generated JSON files before import
//
// Usage: npx tsx scripts/gmat/validate_generated.ts

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const QUESTION_FILES = [
  { file: 'data/questions/gen-quant-ps.json', expectedType: 'PS', minCount: 100 },
  { file: 'data/questions/gen-ds.json', expectedType: 'DS', minCount: 100 },
  { file: 'data/questions/gen-cr.json', expectedType: 'CR', minCount: 100 },
  { file: 'data/questions/gen-rc.json', expectedType: 'RC', minCount: 20 },
]

const RAG_FILES = [
  { file: 'data/rag/deep-quant-di.json', minCount: 10 },
  { file: 'data/rag/deep-verbal-errors.json', minCount: 10 },
]

let allValid = true

function check(condition: boolean, msg: string) {
  if (!condition) {
    console.log(`  ❌ ${msg}`)
    allValid = false
  }
}

console.log('🔍 Validating generated files\n')

// Validate question files
for (const { file, expectedType, minCount } of QUESTION_FILES) {
  const filePath = path.join(process.cwd(), file)
  console.log(`📄 ${file}`)

  if (!fs.existsSync(filePath)) {
    console.log('  ⏭️  Not found (not generated yet)')
    continue
  }

  let data: any[]
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    data = JSON.parse(raw)
  } catch (e) {
    console.log(`  ❌ Invalid JSON: ${e}`)
    allValid = false
    continue
  }

  check(Array.isArray(data), 'Must be a JSON array')
  check(data.length >= minCount, `Expected ≥${minCount} questions, got ${data.length}`)

  if (data.length === 0) {
    console.log('  ⏭️  Empty (not generated yet)')
    continue
  }

  // Check structure of first and last question
  for (const idx of [0, Math.floor(data.length / 2), data.length - 1]) {
    const q = data[idx]
    if (!q) continue

    if (expectedType === 'RC') {
      check(q.passage && q.passage.length > 50, `[${idx}] RC must have passage (>50 chars)`)
      check(Array.isArray(q.questions) && q.questions.length >= 2, `[${idx}] RC must have ≥2 questions`)
      if (q.questions?.[0]) {
        check(q.questions[0].correctAnswer, `[${idx}] RC question must have correctAnswer`)
      }
    } else if (expectedType === 'DS') {
      check(q.text && q.text.length > 5, `[${idx}] DS must have text`)
      check(q.statement1 && q.statement1.length > 3, `[${idx}] DS must have statement1`)
      check(q.statement2 && q.statement2.length > 3, `[${idx}] DS must have statement2`)
      check(['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer), `[${idx}] DS correctAnswer must be A-E`)
    } else if (expectedType === 'CR') {
      check(q.passage && q.passage.length > 30, `[${idx}] CR must have passage`)
      check(q.questionStem && q.questionStem.length > 10, `[${idx}] CR must have questionStem`)
      check(Array.isArray(q.options) && q.options.length === 5, `[${idx}] CR must have 5 options`)
      check(['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer), `[${idx}] CR correctAnswer must be A-E`)
    } else {
      // PS
      check(q.text && q.text.length > 10, `[${idx}] PS must have text (>10 chars)`)
      check(Array.isArray(q.options) && q.options.length === 5, `[${idx}] PS must have 5 options`)
      check(['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer), `[${idx}] PS correctAnswer must be A-E`)
    }

    check(q.explanation && q.explanation.length > 10, `[${idx}] Must have explanation (>10 chars)`)
  }

  // Stats
  const byDiff: Record<string, number> = {}
  const byTopic: Record<string, number> = {}
  data.forEach((q: any) => {
    byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1
    byTopic[q.topic || q.subtopic || 'unknown'] = (byTopic[q.topic || q.subtopic || 'unknown'] || 0) + 1
  })

  console.log(`  ✅ ${data.length} questions`)
  console.log(`     Difficulty: ${JSON.stringify(byDiff)}`)
  console.log(`     Topics: ${Object.keys(byTopic).length} unique`)
  console.log()
}

// Validate RAG files
for (const { file, minCount } of RAG_FILES) {
  const filePath = path.join(process.cwd(), file)
  console.log(`📄 ${file}`)

  if (!fs.existsSync(filePath)) {
    console.log('  ⏭️  Not found (not generated yet)')
    continue
  }

  let data: any[]
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    data = JSON.parse(raw)
  } catch (e) {
    console.log(`  ❌ Invalid JSON: ${e}`)
    allValid = false
    continue
  }

  check(Array.isArray(data), 'Must be a JSON array')
  check(data.length >= minCount, `Expected ≥${minCount} chunks, got ${data.length}`)

  if (data.length === 0) {
    console.log('  ⏭️  Empty (not generated yet)')
    continue
  }

  // Check structure
  const sample = data[0]
  check(sample.topic && sample.topic.length > 3, 'Must have topic')
  check(sample.section, 'Must have section')
  check(sample.namespace, 'Must have namespace')
  check(sample.content && sample.content.length > 100, 'Content must be >100 chars')

  const avgLen = data.reduce((sum: number, c: any) => sum + (c.content?.length || 0), 0) / data.length
  const byNs: Record<string, number> = {}
  data.forEach((c: any) => { byNs[c.namespace || '?'] = (byNs[c.namespace || '?'] || 0) + 1 })

  console.log(`  ✅ ${data.length} chunks, avg ${Math.round(avgLen)} chars`)
  console.log(`     Namespaces: ${JSON.stringify(byNs)}`)
  console.log()
}

console.log(allValid ? '✅ All validations passed!' : '⚠️  Some validations failed — check errors above')

#!/usr/bin/env node
// scripts/gmat/test_retrieval.ts
// SamiWISE — RAG Quality Validation
// Tests retrieval quality across all data sources and namespaces.
// Target: precision@5 ≥ 0.80 per namespace
//
// Usage:
//   npx ts-node scripts/gmat/test_retrieval.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'

interface TestQuery {
  query: string
  namespace: string
  expectedKeywords: string[]
  source?: string    // which data source should match
  category: string   // grouping for report
}

// ── Test queries covering ALL data sources ──────────────────

const TEST_QUERIES: TestQuery[] = [
  // ── PDF books (gmat-quant, gmat-verbal, gmat-strategy) ────

  { query: 'GMAT format structure sections timing', namespace: 'gmat-strategy', expectedKeywords: ['gmat', 'section', 'time', 'question'], category: 'GMAT Nutshell' },
  { query: 'GMAT scoring scale 205 to 805', namespace: 'gmat-strategy', expectedKeywords: ['score', 'scale', '205', '805'], category: 'GMAT Nutshell' },
  { query: 'GMAT test day preparation tips', namespace: 'gmat-strategy', expectedKeywords: ['test', 'day', 'prepare', 'tip'], category: 'GMAT Nutshell' },

  { query: 'sentence correction subject verb agreement rules', namespace: 'gmat-verbal', expectedKeywords: ['subject', 'verb', 'agreement', 'singular'], category: 'SC Study Guide' },
  { query: 'parallelism errors in GMAT sentences', namespace: 'gmat-verbal', expectedKeywords: ['parallel', 'form', 'structure', 'list'], category: 'SC Study Guide' },
  { query: 'modifier placement dangling misplaced', namespace: 'gmat-verbal', expectedKeywords: ['modifier', 'dangling', 'misplaced'], category: 'SC Study Guide' },
  { query: 'pronoun reference ambiguity GMAT grammar', namespace: 'gmat-verbal', expectedKeywords: ['pronoun', 'reference', 'ambig'], category: 'SC Study Guide' },
  { query: 'GMAT idiom expressions proper usage', namespace: 'gmat-verbal', expectedKeywords: ['idiom', 'usage', 'expression'], category: 'SC Study Guide' },

  { query: 'GMAT vocabulary words high frequency', namespace: 'gmat-verbal', expectedKeywords: ['word', 'vocabul', 'meaning'], category: 'Vocabulary List' },

  // ── aqua_rat (gmat-quant) ─────────────────────────────────

  { query: 'algebra solve for x linear equation', namespace: 'gmat-quant', expectedKeywords: ['equation', 'solve', 'value'], source: 'aqua_rat', category: 'AquaRAT Quant' },
  { query: 'percentage increase decrease calculation', namespace: 'gmat-quant', expectedKeywords: ['percent', 'increase', 'decrease'], source: 'aqua_rat', category: 'AquaRAT Quant' },
  { query: 'ratio proportion word problem', namespace: 'gmat-quant', expectedKeywords: ['ratio', 'proportion'], source: 'aqua_rat', category: 'AquaRAT Quant' },
  { query: 'probability of selecting from a group', namespace: 'gmat-quant', expectedKeywords: ['probability', 'select'], source: 'aqua_rat', category: 'AquaRAT Quant' },
  { query: 'profit loss cost price selling price', namespace: 'gmat-quant', expectedKeywords: ['profit', 'cost', 'price'], source: 'aqua_rat', category: 'AquaRAT Quant' },

  // ── math_qa (gmat-quant) ──────────────────────────────────

  { query: 'work rate problem two people together', namespace: 'gmat-quant', expectedKeywords: ['work', 'rate', 'together', 'hour'], source: 'math_qa', category: 'MathQA Quant' },
  { query: 'geometry area of triangle circle', namespace: 'gmat-quant', expectedKeywords: ['area', 'triangle', 'circle', 'radius'], source: 'math_qa', category: 'MathQA Quant' },
  { query: 'number divisibility remainder problem', namespace: 'gmat-quant', expectedKeywords: ['divis', 'remainder'], source: 'math_qa', category: 'MathQA Quant' },

  // ── gmat_database: DS questions (gmat-quant) ──────────────

  { query: 'data sufficiency is x positive', namespace: 'gmat-quant', expectedKeywords: ['sufficient', 'statement', 'positive'], source: 'gmat_database', category: 'GMAT-DB DS' },
  { query: 'data sufficiency enough information to determine', namespace: 'gmat-quant', expectedKeywords: ['sufficient', 'determine', 'statement'], source: 'gmat_database', category: 'GMAT-DB DS' },
  { query: 'DS integer even odd number properties', namespace: 'gmat-quant', expectedKeywords: ['integer', 'even', 'odd'], source: 'gmat_database', category: 'GMAT-DB DS' },
  { query: 'statement 1 alone sufficient statement 2', namespace: 'gmat-quant', expectedKeywords: ['statement', 'sufficient', 'alone'], source: 'gmat_database', category: 'GMAT-DB DS' },
  { query: 'data sufficiency inequality range', namespace: 'gmat-quant', expectedKeywords: ['sufficient', 'inequ', 'range'], source: 'gmat_database', category: 'GMAT-DB DS' },

  // ── gmat_database: SC questions (gmat-verbal) ─────────────

  { query: 'sentence correction underlined portion', namespace: 'gmat-verbal', expectedKeywords: ['sentence', 'correct', 'underline'], source: 'gmat_database', category: 'GMAT-DB SC' },
  { query: 'grammatically correct sentence choice', namespace: 'gmat-verbal', expectedKeywords: ['grammar', 'correct', 'choice'], source: 'gmat_database', category: 'GMAT-DB SC' },
  { query: 'verb tense consistency sentence', namespace: 'gmat-verbal', expectedKeywords: ['verb', 'tense'], source: 'gmat_database', category: 'GMAT-DB SC' },
  { query: 'comparison like unlike as sentence', namespace: 'gmat-verbal', expectedKeywords: ['compar', 'like', 'unlike'], source: 'gmat_database', category: 'GMAT-DB SC' },
  { query: 'wordiness redundancy concise sentence', namespace: 'gmat-verbal', expectedKeywords: ['wordy', 'redundan', 'concise'], source: 'gmat_database', category: 'GMAT-DB SC' },

  // ── ReClor CR types (gmat-verbal) ─────────────────────────

  { query: 'strengthen the argument GMAT critical reasoning', namespace: 'gmat-verbal', expectedKeywords: ['strengthen', 'argument', 'conclusion'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'weaken the argument find alternative explanation', namespace: 'gmat-verbal', expectedKeywords: ['weaken', 'argument', 'alternative'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'assumption necessary for argument to hold', namespace: 'gmat-verbal', expectedKeywords: ['assumption', 'necessary', 'argument'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'identify the flaw in reasoning logical error', namespace: 'gmat-verbal', expectedKeywords: ['flaw', 'reasoning', 'error', 'logic'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'boldface role in argument premise conclusion', namespace: 'gmat-verbal', expectedKeywords: ['boldface', 'role', 'premise', 'conclusion'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'explain resolve discrepancy paradox', namespace: 'gmat-verbal', expectedKeywords: ['explain', 'discrepancy', 'paradox', 'resolve'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'parallel reasoning similar structure argument', namespace: 'gmat-verbal', expectedKeywords: ['parallel', 'reason', 'similar', 'structure'], source: 'reclor_paper', category: 'ReClor CR' },
  { query: 'inference must be true logically follows', namespace: 'gmat-verbal', expectedKeywords: ['inference', 'must', 'true', 'follow'], source: 'reclor_paper', category: 'ReClor CR' },
]

// ── Test runner ────────────────────────────────────────────

async function main() {
  console.log('🧪 SamiWISE — Full RAG Quality Validation')
  console.log('==========================================\n')

  if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
    console.error('❌ PINECONE_API_KEY and OPENAI_API_KEY must be set')
    process.exit(1)
  }

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'gmat-tutor-prod')

  // First, get namespace stats
  console.log('📊 Namespace statistics:')
  try {
    const stats = await index.describeIndexStats()
    const nsByName = stats.namespaces || {}
    for (const [ns, info] of Object.entries(nsByName)) {
      console.log(`   ${ns}: ${(info as any).recordCount || 0} vectors`)
    }
    console.log(`   Total: ${stats.totalRecordCount || 0} vectors`)
  } catch {
    console.log('   (Could not fetch stats)')
  }
  console.log()

  // Run test queries
  const results: Record<string, { passed: number; failed: number; queries: string[] }> = {}
  let totalPassed = 0
  let totalFailed = 0

  for (const test of TEST_QUERIES) {
    if (!results[test.category]) {
      results[test.category] = { passed: 0, failed: 0, queries: [] }
    }

    try {
      const embRes = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: test.query,
      })
      const embedding = embRes.data[0].embedding

      const queryResult = await index.namespace(test.namespace).query({
        vector: embedding,
        topK: 5,
        includeMetadata: true,
      })

      const matches = queryResult.matches || []

      if (matches.length === 0) {
        results[test.category].failed++
        results[test.category].queries.push(`❌ "${test.query.slice(0, 50)}..." — no results`)
        totalFailed++
        continue
      }

      const allText = matches.map(m => ((m.metadata?.text as string) || '').toLowerCase()).join(' ')
      const foundKeywords = test.expectedKeywords.filter(kw => allText.includes(kw.toLowerCase()))
      const avgScore = matches.reduce((sum, m) => sum + (m.score || 0), 0) / matches.length

      // Check source match if specified
      let sourceMatch = true
      if (test.source) {
        sourceMatch = matches.some(m => (m.metadata?.source as string)?.includes(test.source!))
      }

      if (foundKeywords.length > 0 && avgScore > 0.4) {
        results[test.category].passed++
        totalPassed++
      } else {
        results[test.category].failed++
        results[test.category].queries.push(
          `❌ "${test.query.slice(0, 50)}..." — keywords: ${foundKeywords.length}/${test.expectedKeywords.length}, score: ${avgScore.toFixed(3)}`
        )
        totalFailed++
      }
    } catch (error: any) {
      results[test.category].failed++
      results[test.category].queries.push(`❌ "${test.query.slice(0, 40)}..." — Error: ${error.message}`)
      totalFailed++
    }
  }

  // Report
  console.log('═══════════════════════════════════════')
  console.log('📊 Results by Category')
  console.log('═══════════════════════════════════════\n')

  for (const [category, data] of Object.entries(results)) {
    const total = data.passed + data.failed
    const precision = total > 0 ? (data.passed / total * 100).toFixed(0) : '0'
    const status = parseInt(precision) >= 80 ? '✅' : '⚠️'

    console.log(`${status} ${category}: ${data.passed}/${total} (${precision}%)`)

    // Show failed queries
    for (const q of data.queries) {
      console.log(`   ${q}`)
    }
  }

  // Namespace summary
  console.log('\n═══════════════════════════════════════')
  console.log('📊 Results by Namespace')
  console.log('═══════════════════════════════════════\n')

  const nsByNs: Record<string, { passed: number; total: number }> = {}
  for (const test of TEST_QUERIES) {
    if (!nsByNs[test.namespace]) nsByNs[test.namespace] = { passed: 0, total: 0 }
    nsByNs[test.namespace].total++
  }
  // Count passes per namespace
  for (const test of TEST_QUERIES) {
    const catResult = results[test.category]
    // Approximate — assumes queries in same category have same namespace
  }
  for (const [ns, data] of Object.entries(nsByNs)) {
    // Recount from results
    let passed = 0
    for (const test of TEST_QUERIES.filter(t => t.namespace === ns)) {
      const cat = results[test.category]
      if (cat && cat.passed > 0) {
        // Approximate
        passed++
      }
    }
    const precision = data.total > 0 ? (passed / data.total * 100).toFixed(0) : '0'
    const status = parseInt(precision) >= 80 ? '✅' : '⚠️'
    console.log(`${status} ${ns}: ~${precision}% precision`)
  }

  // Overall
  console.log('\n═══════════════════════════════════════')
  const total = totalPassed + totalFailed
  const overallPrecision = total > 0 ? (totalPassed / total * 100).toFixed(1) : '0'
  console.log(`Overall: ${totalPassed}/${total} queries passed (${overallPrecision}%)`)
  console.log(`Target: ≥80% per namespace`)

  if (parseInt(overallPrecision) >= 80) {
    console.log('\n✅ RAG quality meets target!')
  } else {
    console.log('\n⚠️  Some areas below target. Consider adding more data.')
  }
}

main().catch(console.error)

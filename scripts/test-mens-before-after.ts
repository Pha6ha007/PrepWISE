#!/usr/bin/env node
/**
 * Test MENS namespace before/after chunking optimization
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import OpenAI from 'openai'
import { getPineconeIndex, NAMESPACES } from '../lib/pinecone/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const TEST_QUERIES = [
  "I don't really have anyone to talk to about how I'm actually feeling",
  "I feel like if I'm not providing for my family I'm worthless",
  "Everyone thinks I'm fine but I'm falling apart inside",
]

// Scores from BEFORE optimization (chunk_size=500, overlap=50)
const BEFORE_SCORES = [0.3332, 0.3500, 0.3052]

async function createQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  return response.data[0].embedding
}

async function searchPinecone(query: string): Promise<any[]> {
  const index = getPineconeIndex()
  const embedding = await createQueryEmbedding(query)

  const searchResults = await index.namespace(NAMESPACES.MENS).query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
  })

  return searchResults.matches || []
}

async function runTests() {
  console.log('🧪 MENS Namespace - Before/After Chunking Optimization\n')
  console.log('BEFORE: chunk_size=500, overlap=50  (58 chunks)')
  console.log('AFTER:  chunk_size=800, overlap=150 (40 chunks)')
  console.log('═'.repeat(90))
  console.log()

  const afterScores: number[] = []

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const query = TEST_QUERIES[i]
    const beforeScore = BEFORE_SCORES[i]

    console.log(`\n📝 TEST ${i + 1}/3:`)
    console.log(`Query: "${query}"`)
    console.log('─'.repeat(90))

    const results = await searchPinecone(query)

    if (results.length === 0) {
      console.log('   ⚠️  No results found!')
      afterScores.push(0)
      continue
    }

    const topScore = results[0].score || 0
    afterScores.push(topScore)

    const improvement = topScore - beforeScore
    const improvementPercent = ((improvement / beforeScore) * 100).toFixed(1)

    console.log(`\n   BEFORE: ${beforeScore.toFixed(4)} (500/50 chunking)`)
    console.log(`   AFTER:  ${topScore.toFixed(4)} (800/150 chunking)`)

    if (improvement > 0) {
      console.log(`   📈 IMPROVEMENT: +${improvement.toFixed(4)} (+${improvementPercent}%)`)
    } else if (improvement < 0) {
      console.log(`   📉 DECLINE: ${improvement.toFixed(4)} (${improvementPercent}%)`)
    } else {
      console.log(`   ➡️  NO CHANGE`)
    }

    // Show top 3 results
    console.log(`\n   Top 3 chunks:`)
    results.forEach((result, idx) => {
      const score = result.score || 0
      const text = (result.metadata?.text as string) || ''
      const scoreIcon = score >= 0.75 ? '✅' : score >= 0.50 ? '⚠️' : '❌'

      console.log(`   ${idx + 1}. ${scoreIcon} Score: ${score.toFixed(4)}`)
      console.log(`      Text: ${text.substring(0, 120)}...`)
    })

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Summary
  console.log('\n\n')
  console.log('═'.repeat(90))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(90))
  console.log()

  const avgBefore = BEFORE_SCORES.reduce((a, b) => a + b, 0) / BEFORE_SCORES.length
  const avgAfter = afterScores.reduce((a, b) => a + b, 0) / afterScores.length
  const avgImprovement = avgAfter - avgBefore
  const avgImprovementPercent = ((avgImprovement / avgBefore) * 100).toFixed(1)

  console.log(`BEFORE Average:  ${avgBefore.toFixed(4)}  (chunk_size=500, overlap=50)`)
  console.log(`AFTER Average:   ${avgAfter.toFixed(4)}  (chunk_size=800, overlap=150)`)
  console.log()

  if (avgImprovement > 0) {
    console.log(`✅ OVERALL IMPROVEMENT: +${avgImprovement.toFixed(4)} (+${avgImprovementPercent}%)`)
  } else if (avgImprovement < 0) {
    console.log(`❌ OVERALL DECLINE: ${avgImprovement.toFixed(4)} (${avgImprovementPercent}%)`)
  } else {
    console.log(`➡️  NO CHANGE`)
  }

  console.log()

  // Quality assessment
  const passBefore = BEFORE_SCORES.filter(s => s >= 0.75).length
  const passAfter = afterScores.filter(s => s >= 0.75).length
  const marginalBefore = BEFORE_SCORES.filter(s => s >= 0.50 && s < 0.75).length
  const marginalAfter = afterScores.filter(s => s >= 0.50 && s < 0.75).length

  console.log('Quality Distribution:')
  console.log(`   BEFORE: PASS ${passBefore}/3, MARGINAL ${marginalBefore}/3, FAIL ${3 - passBefore - marginalBefore}/3`)
  console.log(`   AFTER:  PASS ${passAfter}/3, MARGINAL ${marginalAfter}/3, FAIL ${3 - passAfter - marginalAfter}/3`)
  console.log()

  if (avgAfter >= 0.75) {
    console.log('   ✅ EXCELLENT - New chunking parameters are working great!')
  } else if (avgAfter >= 0.50) {
    console.log('   ⚠️  MARGINAL - Better than before but still needs work')
  } else {
    console.log('   ❌ POOR - Still below acceptable threshold')
  }

  console.log()
}

runTests().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Test Query Expansion - Before/After Comparison
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { retrieveContext } from '../lib/pinecone/retrieval'
import { NAMESPACES } from '../lib/pinecone/client'

const TEST_QUERIES = [
  "I don't really have anyone to talk to about how I'm actually feeling",
  "I feel like if I'm not providing for my family I'm worthless",
  "Everyone thinks I'm fine but I'm falling apart inside",
]

// Baseline scores (WITHOUT query expansion, topK=5)
const BASELINE_SCORES = [0.3332, 0.3500, 0.3052]

// Scores after chunking optimization (800/150, WITHOUT expansion)
const AFTER_CHUNKING_SCORES = [0.3208, 0.3381, 0.3192]

async function runTests() {
  console.log('🧪 Query Expansion Test - MENS Namespace\n')
  console.log('BASELINE:        No expansion, chunk_size=500, overlap=50, topK=5  (scores: 0.33)')
  console.log('AFTER CHUNKING:  No expansion, chunk_size=800, overlap=150, topK=5 (scores: 0.32)')
  console.log('NOW TESTING:     WITH expansion, chunk_size=800, overlap=150, topK=10')
  console.log('═'.repeat(90))
  console.log()

  const newScores: number[] = []
  const expandedQueries: string[] = []

  // Set development mode for logging
  process.env.NODE_ENV = 'development'

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const query = TEST_QUERIES[i]
    const baselineScore = BASELINE_SCORES[i]
    const chunkingScore = AFTER_CHUNKING_SCORES[i]

    console.log(`\n📝 TEST ${i + 1}/3:`)
    console.log(`Query: "${query}"`)
    console.log('─'.repeat(90))

    try {
      // Retrieve with query expansion (will log expanded query automatically)
      const chunks = await retrieveContext(query, NAMESPACES.MENS, 10)

      if (chunks.length === 0) {
        console.log('   ⚠️  No results found!')
        newScores.push(0)
        continue
      }

      const topScore = chunks[0].score
      newScores.push(topScore)

      const vsBaseline = topScore - baselineScore
      const vsChunking = topScore - chunkingScore
      const vsBaselinePercent = ((vsBaseline / baselineScore) * 100).toFixed(1)
      const vsChunkingPercent = ((vsChunking / chunkingScore) * 100).toFixed(1)

      console.log(`\n   📊 SCORES:`)
      console.log(`   BASELINE (no expansion):        ${baselineScore.toFixed(4)}`)
      console.log(`   AFTER CHUNKING (no expansion):  ${chunkingScore.toFixed(4)}`)
      console.log(`   NOW (WITH expansion):           ${topScore.toFixed(4)}`)

      console.log(`\n   📈 IMPROVEMENTS:`)
      if (vsBaseline > 0) {
        console.log(`   vs Baseline:       +${vsBaseline.toFixed(4)} (+${vsBaselinePercent}%)`)
      } else {
        console.log(`   vs Baseline:       ${vsBaseline.toFixed(4)} (${vsBaselinePercent}%)`)
      }

      if (vsChunking > 0) {
        console.log(`   vs Chunking Only:  +${vsChunking.toFixed(4)} (+${vsChunkingPercent}%)`)
      } else {
        console.log(`   vs Chunking Only:  ${vsChunking.toFixed(4)} (${vsChunkingPercent}%)`)
      }

      // Show top 3 results
      console.log(`\n   📚 Top 3 Chunks:`)
      chunks.slice(0, 3).forEach((chunk, idx) => {
        const scoreIcon = chunk.score >= 0.75 ? '✅' : chunk.score >= 0.50 ? '⚠️' : '❌'
        console.log(`   ${idx + 1}. ${scoreIcon} Score: ${chunk.score.toFixed(4)}`)
        console.log(`      Book: ${chunk.metadata.book_title}`)
        console.log(`      Text: ${chunk.text.substring(0, 120)}...`)
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`   ❌ Error:`, error)
      newScores.push(0)
    }
  }

  // Summary
  console.log('\n\n')
  console.log('═'.repeat(90))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(90))
  console.log()

  const avgBaseline = BASELINE_SCORES.reduce((a, b) => a + b, 0) / BASELINE_SCORES.length
  const avgChunking = AFTER_CHUNKING_SCORES.reduce((a, b) => a + b, 0) / AFTER_CHUNKING_SCORES.length
  const avgNew = newScores.reduce((a, b) => a + b, 0) / newScores.length

  const improvementVsBaseline = avgNew - avgBaseline
  const improvementVsChunking = avgNew - avgChunking
  const improvementPercentBaseline = ((improvementVsBaseline / avgBaseline) * 100).toFixed(1)
  const improvementPercentChunking = ((improvementVsChunking / avgChunking) * 100).toFixed(1)

  console.log(`BASELINE Average:          ${avgBaseline.toFixed(4)}  (no expansion, 500/50, topK=5)`)
  console.log(`AFTER CHUNKING Average:    ${avgChunking.toFixed(4)}  (no expansion, 800/150, topK=5)`)
  console.log(`WITH EXPANSION Average:    ${avgNew.toFixed(4)}  (WITH expansion, 800/150, topK=10)`)
  console.log()

  if (improvementVsBaseline > 0) {
    console.log(
      `✅ IMPROVEMENT vs BASELINE:  +${improvementVsBaseline.toFixed(4)} (+${improvementPercentBaseline}%)`
    )
  } else {
    console.log(
      `❌ DECLINE vs BASELINE:      ${improvementVsBaseline.toFixed(4)} (${improvementPercentBaseline}%)`
    )
  }

  if (improvementVsChunking > 0) {
    console.log(
      `✅ IMPROVEMENT vs CHUNKING:  +${improvementVsChunking.toFixed(4)} (+${improvementPercentChunking}%)`
    )
  } else {
    console.log(
      `❌ DECLINE vs CHUNKING:      ${improvementVsChunking.toFixed(4)} (${improvementPercentChunking}%)`
    )
  }

  console.log()

  // Quality assessment
  const passBaseline = BASELINE_SCORES.filter((s) => s >= 0.75).length
  const passChunking = AFTER_CHUNKING_SCORES.filter((s) => s >= 0.75).length
  const passNew = newScores.filter((s) => s >= 0.75).length
  const marginalBaseline = BASELINE_SCORES.filter((s) => s >= 0.5 && s < 0.75).length
  const marginalChunking = AFTER_CHUNKING_SCORES.filter((s) => s >= 0.5 && s < 0.75).length
  const marginalNew = newScores.filter((s) => s >= 0.5 && s < 0.75).length

  console.log('Quality Distribution:')
  console.log(
    `   BASELINE:         PASS ${passBaseline}/3, MARGINAL ${marginalBaseline}/3, FAIL ${3 - passBaseline - marginalBaseline}/3`
  )
  console.log(
    `   AFTER CHUNKING:   PASS ${passChunking}/3, MARGINAL ${marginalChunking}/3, FAIL ${3 - passChunking - marginalChunking}/3`
  )
  console.log(
    `   WITH EXPANSION:   PASS ${passNew}/3, MARGINAL ${marginalNew}/3, FAIL ${3 - passNew - marginalNew}/3`
  )
  console.log()

  if (avgNew >= 0.75) {
    console.log('   ✅ EXCELLENT - Query expansion is working great!')
  } else if (avgNew >= 0.5) {
    console.log('   ⚠️  MARGINAL - Better than before but still needs work')
  } else {
    console.log('   ❌ POOR - Still below acceptable threshold')
  }

  console.log()
}

runTests().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

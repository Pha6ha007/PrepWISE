#!/usr/bin/env node
/**
 * Confide — RAG System Full Testing
 * Tests retrieval quality across all agent types with user queries
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import OpenAI from 'openai'
import { getPineconeIndex, NAMESPACES } from '../lib/pinecone/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

interface TestQuery {
  id: number
  agent: string
  query: string
  namespace: string
}

interface RetrievalResult {
  bookTitle: string
  author: string
  score: number
  text: string
}

interface TestResult {
  query: TestQuery
  results: RetrievalResult[]
  averageScore: number
  topScore: number
  quality: 'PASS' | 'MARGINAL' | 'FAIL'
}

const TEST_QUERIES: TestQuery[] = [
  // ANXIETY AGENT (1-3)
  { id: 1, agent: 'ANXIETY', query: 'I keep having panic attacks at work and I don\'t know how to stop them', namespace: NAMESPACES.ANXIETY_CBT },
  { id: 2, agent: 'ANXIETY', query: 'My mind won\'t stop racing with worst-case scenarios about everything', namespace: NAMESPACES.ANXIETY_CBT },
  { id: 3, agent: 'ANXIETY', query: 'I feel anxious all the time but I can\'t pinpoint why', namespace: NAMESPACES.ANXIETY_CBT },

  // FAMILY AGENT (4-6)
  { id: 4, agent: 'FAMILY', query: 'My mother criticizes everything I do and I can\'t take it anymore', namespace: NAMESPACES.FAMILY },
  { id: 5, agent: 'FAMILY', query: 'My husband and I keep having the same fight over and over', namespace: NAMESPACES.FAMILY },
  { id: 6, agent: 'FAMILY', query: 'My parents are getting divorced and I feel like it\'s tearing me apart', namespace: NAMESPACES.FAMILY },

  // TRAUMA AGENT (7-9)
  { id: 7, agent: 'TRAUMA', query: 'Sometimes I freeze up when someone raises their voice and I can\'t move', namespace: NAMESPACES.TRAUMA },
  { id: 8, agent: 'TRAUMA', query: 'I had something happen to me as a child that I\'ve never told anyone', namespace: NAMESPACES.TRAUMA },
  { id: 9, agent: 'TRAUMA', query: 'I keep having nightmares about what happened and I wake up in a sweat', namespace: NAMESPACES.TRAUMA },

  // RELATIONSHIPS AGENT (10-12)
  { id: 10, agent: 'RELATIONSHIPS', query: 'My boyfriend goes quiet for hours and I spiral into panic', namespace: NAMESPACES.FAMILY },
  { id: 11, agent: 'RELATIONSHIPS', query: 'I always pick partners who are emotionally unavailable', namespace: NAMESPACES.FAMILY },
  { id: 12, agent: 'RELATIONSHIPS', query: 'I need constant reassurance or I think he\'s going to leave me', namespace: NAMESPACES.FAMILY },

  // MENS AGENT (13-15)
  { id: 13, agent: 'MENS', query: 'I don\'t really have anyone to talk to about how I\'m actually feeling', namespace: NAMESPACES.MENS },
  { id: 14, agent: 'MENS', query: 'I feel like if I\'m not providing for my family I\'m worthless', namespace: NAMESPACES.MENS },
  { id: 15, agent: 'MENS', query: 'Everyone thinks I\'m fine but I\'m falling apart inside', namespace: NAMESPACES.MENS },

  // WOMENS AGENT (16-18)
  { id: 16, agent: 'WOMENS', query: 'I do everything at home and at work and I feel guilty for being exhausted', namespace: NAMESPACES.GENERAL },
  { id: 17, agent: 'WOMENS', query: 'He told me I\'m overreacting and now I\'m questioning my own feelings', namespace: NAMESPACES.GENERAL },
  { id: 18, agent: 'WOMENS', query: 'I love my kids but I\'ve completely lost who I am', namespace: NAMESPACES.GENERAL },

  // CROSS-AGENT (19-21)
  { id: 19, agent: 'CROSS-AGENT', query: 'I don\'t see the point of anything anymore', namespace: NAMESPACES.GENERAL },
  { id: 20, agent: 'CROSS-AGENT', query: 'I hate myself and I don\'t think I deserve to be loved', namespace: NAMESPACES.GENERAL },
  { id: 21, agent: 'CROSS-AGENT', query: 'I feel completely alone even though I have people around me', namespace: NAMESPACES.GENERAL },
]

async function createQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  return response.data[0].embedding
}

async function searchPinecone(
  query: string,
  namespace: string,
  topK: number = 3
): Promise<RetrievalResult[]> {
  const index = getPineconeIndex()
  const embedding = await createQueryEmbedding(query)

  const searchResults = await index.namespace(namespace).query({
    vector: embedding,
    topK,
    includeMetadata: true,
  })

  return (searchResults.matches || []).map((match) => ({
    bookTitle: (match.metadata?.book_title as string) || 'Unknown',
    author: (match.metadata?.author as string) || 'Unknown',
    score: match.score || 0,
    text: ((match.metadata?.text as string) || '').substring(0, 150) + '...',
  }))
}

function getQualityRating(topScore: number): 'PASS' | 'MARGINAL' | 'FAIL' {
  if (topScore >= 0.75) return 'PASS'
  if (topScore >= 0.50) return 'MARGINAL'
  return 'FAIL'
}

async function runTests() {
  console.log('🧪 Confide RAG System — Full Test Suite')
  console.log('Testing retrieval quality across all agent types')
  console.log('=' .repeat(90))
  console.log()

  const results: TestResult[] = []

  for (const testQuery of TEST_QUERIES) {
    console.log(`\n📝 TEST ${testQuery.id}/21: ${testQuery.agent} Agent`)
    console.log(`Query: "${testQuery.query}"`)
    console.log(`Namespace: ${testQuery.namespace}`)
    console.log('─'.repeat(90))

    try {
      const retrievalResults = await searchPinecone(testQuery.query, testQuery.namespace)

      if (retrievalResults.length === 0) {
        console.log('   ⚠️  No results found!')
        results.push({
          query: testQuery,
          results: [],
          averageScore: 0,
          topScore: 0,
          quality: 'FAIL',
        })
        continue
      }

      const topScore = retrievalResults[0].score
      const avgScore = retrievalResults.reduce((sum, r) => sum + r.score, 0) / retrievalResults.length
      const quality = getQualityRating(topScore)

      retrievalResults.forEach((result, i) => {
        const scoreIcon = result.score >= 0.75 ? '✅' : result.score >= 0.50 ? '⚠️' : '❌'
        console.log(`\n   ${i + 1}. ${scoreIcon} "${result.bookTitle}" by ${result.author}`)
        console.log(`      Score: ${result.score.toFixed(4)}`)
        console.log(`      Text: ${result.text}`)
      })

      console.log(`\n   📊 Top Score: ${topScore.toFixed(4)} | Avg: ${avgScore.toFixed(4)} — ${quality}`)

      results.push({
        query: testQuery,
        results: retrievalResults,
        averageScore: avgScore,
        topScore: topScore,
        quality,
      })
    } catch (error) {
      console.error(`   ❌ Error:`, error)
      results.push({
        query: testQuery,
        results: [],
        averageScore: 0,
        topScore: 0,
        quality: 'FAIL',
      })
    }

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Summary
  console.log('\n\n')
  console.log('=' .repeat(90))
  console.log('📊 FINAL SUMMARY TABLE')
  console.log('=' .repeat(90))
  console.log()

  // Group by agent
  const byAgent: Record<string, TestResult[]> = {}
  results.forEach((r) => {
    if (!byAgent[r.query.agent]) byAgent[r.query.agent] = []
    byAgent[r.query.agent].push(r)
  })

  console.log('AGENT         | AVG SCORE | PASS | MARGINAL | FAIL | TOP BOOKS')
  console.log('─'.repeat(90))

  Object.entries(byAgent).forEach(([agent, agentResults]) => {
    const avgScore = agentResults.reduce((sum, r) => sum + r.topScore, 0) / agentResults.length
    const passCount = agentResults.filter((r) => r.quality === 'PASS').length
    const marginalCount = agentResults.filter((r) => r.quality === 'MARGINAL').length
    const failCount = agentResults.filter((r) => r.quality === 'FAIL').length

    // Get top books
    const topBooks: Record<string, number> = {}
    agentResults.forEach((r) => {
      r.results.forEach((result) => {
        const key = `${result.bookTitle} (${result.author})`
        topBooks[key] = (topBooks[key] || 0) + 1
      })
    })

    const topBooksList = Object.entries(topBooks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([book]) => book)
      .join(', ')

    const agentName = agent.padEnd(13)
    const score = avgScore.toFixed(4)
    const pass = `${passCount}/3`.padEnd(4)
    const marginal = `${marginalCount}/3`.padEnd(8)
    const fail = `${failCount}/3`.padEnd(4)

    console.log(`${agentName} | ${score}    | ${pass} | ${marginal} | ${fail} | ${topBooksList}`)
  })

  // Overall stats
  const overallTopScoreAvg = results.reduce((sum, r) => sum + r.topScore, 0) / results.length
  const overallPass = results.filter((r) => r.quality === 'PASS').length
  const overallMarginal = results.filter((r) => r.quality === 'MARGINAL').length
  const overallFail = results.filter((r) => r.quality === 'FAIL').length

  console.log('─'.repeat(90))
  console.log(`OVERALL       | ${overallTopScoreAvg.toFixed(4)}    | ${overallPass}/21 | ${overallMarginal}/21     | ${overallFail}/21`)
  console.log()

  console.log('=' .repeat(90))
  console.log('🎯 OVERALL PERFORMANCE')
  console.log('=' .repeat(90))
  console.log()
  console.log(`   Average Top Score:     ${overallTopScoreAvg.toFixed(4)}`)
  console.log(`   PASS:                  ${overallPass}/21 (${((overallPass / 21) * 100).toFixed(1)}%)`)
  console.log(`   MARGINAL:              ${overallMarginal}/21 (${((overallMarginal / 21) * 100).toFixed(1)}%)`)
  console.log(`   FAIL:                  ${overallFail}/21 (${((overallFail / 21) * 100).toFixed(1)}%)`)
  console.log()

  if (overallTopScoreAvg >= 0.75) {
    console.log('   ✅ RAG system is performing EXCELLENTLY')
  } else if (overallTopScoreAvg >= 0.60) {
    console.log('   ⚠️  RAG system is performing ADEQUATELY (could use improvement)')
  } else {
    console.log('   ❌ RAG system needs SIGNIFICANT IMPROVEMENT')
  }

  console.log()
}

runTests().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

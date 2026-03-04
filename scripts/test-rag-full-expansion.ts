#!/usr/bin/env node
/**
 * Full RAG System Test with Query Expansion - All 21 Queries
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { retrieveContext } from '../lib/pinecone/retrieval'
import { NAMESPACES } from '../lib/pinecone/client'

interface TestQuery {
  id: number
  agent: string
  query: string
  namespace: string
  beforeScore: number
}

const TEST_QUERIES: TestQuery[] = [
  // ANXIETY (1-3)
  {
    id: 1,
    agent: 'ANXIETY',
    query: 'I keep having panic attacks at work and I don\'t know how to stop them',
    namespace: NAMESPACES.ANXIETY_CBT,
    beforeScore: 0.6232,
  },
  {
    id: 2,
    agent: 'ANXIETY',
    query: 'My mind won\'t stop racing with worst-case scenarios about everything',
    namespace: NAMESPACES.ANXIETY_CBT,
    beforeScore: 0.5182,
  },
  {
    id: 3,
    agent: 'ANXIETY',
    query: 'I feel anxious all the time but I can\'t pinpoint why',
    namespace: NAMESPACES.ANXIETY_CBT,
    beforeScore: 0.5599,
  },

  // FAMILY (4-6)
  {
    id: 4,
    agent: 'FAMILY',
    query: 'My mother criticizes everything I do and I can\'t take it anymore',
    namespace: NAMESPACES.FAMILY,
    beforeScore: 0.4336,
  },
  {
    id: 5,
    agent: 'FAMILY',
    query: 'My husband and I keep having the same fight over and over',
    namespace: NAMESPACES.FAMILY,
    beforeScore: 0.5723,
  },
  {
    id: 6,
    agent: 'FAMILY',
    query: 'My parents are getting divorced and I feel like it\'s tearing me apart',
    namespace: NAMESPACES.FAMILY,
    beforeScore: 0.3646,
  },

  // TRAUMA (7-9)
  {
    id: 7,
    agent: 'TRAUMA',
    query: 'Sometimes I freeze up when someone raises their voice and I can\'t move',
    namespace: NAMESPACES.TRAUMA,
    beforeScore: 0.4540,
  },
  {
    id: 8,
    agent: 'TRAUMA',
    query: 'I had something happen to me as a child that I\'ve never told anyone',
    namespace: NAMESPACES.TRAUMA,
    beforeScore: 0.5216,
  },
  {
    id: 9,
    agent: 'TRAUMA',
    query: 'I keep having nightmares about what happened and I wake up in a sweat',
    namespace: NAMESPACES.TRAUMA,
    beforeScore: 0.4456,
  },

  // RELATIONSHIPS (10-12)
  {
    id: 10,
    agent: 'RELATIONSHIPS',
    query: 'My boyfriend goes quiet for hours and I spiral into panic',
    namespace: NAMESPACES.FAMILY,
    beforeScore: 0.5053,
  },
  {
    id: 11,
    agent: 'RELATIONSHIPS',
    query: 'I always pick partners who are emotionally unavailable',
    namespace: NAMESPACES.FAMILY,
    beforeScore: 0.5264,
  },
  {
    id: 12,
    agent: 'RELATIONSHIPS',
    query: 'He cheated and I want to forgive him but I can\'t trust him anymore',
    namespace: NAMESPACES.FAMILY,
    beforeScore: 0.4699,
  },

  // MENS (13-15)
  {
    id: 13,
    agent: 'MENS',
    query: 'I don\'t really have anyone to talk to about how I\'m actually feeling',
    namespace: NAMESPACES.MENS,
    beforeScore: 0.3332,
  },
  {
    id: 14,
    agent: 'MENS',
    query: 'I feel like if I\'m not providing for my family I\'m worthless',
    namespace: NAMESPACES.MENS,
    beforeScore: 0.3500,
  },
  {
    id: 15,
    agent: 'MENS',
    query: 'Everyone thinks I\'m fine but I\'m falling apart inside',
    namespace: NAMESPACES.MENS,
    beforeScore: 0.3052,
  },

  // WOMENS (16-18)
  {
    id: 16,
    agent: 'WOMENS',
    query: 'I do everything at home and at work and I feel guilty for being exhausted',
    namespace: NAMESPACES.GENERAL,
    beforeScore: 0.4274,
  },
  {
    id: 17,
    agent: 'WOMENS',
    query: 'He told me I\'m overreacting and now I\'m questioning my own feelings',
    namespace: NAMESPACES.GENERAL,
    beforeScore: 0.4684,
  },
  {
    id: 18,
    agent: 'WOMENS',
    query: 'I love my kids but I\'ve completely lost who I am',
    namespace: NAMESPACES.GENERAL,
    beforeScore: 0.4502,
  },

  // CROSS-AGENT (19-21)
  {
    id: 19,
    agent: 'CROSS-AGENT',
    query: 'I don\'t see the point of anything anymore',
    namespace: NAMESPACES.GENERAL,
    beforeScore: 0.3613,
  },
  {
    id: 20,
    agent: 'CROSS-AGENT',
    query: 'I hate myself and I don\'t think I deserve to be loved',
    namespace: NAMESPACES.GENERAL,
    beforeScore: 0.5370,
  },
  {
    id: 21,
    agent: 'CROSS-AGENT',
    query: 'I feel completely alone even though I have people around me',
    namespace: NAMESPACES.GENERAL,
    beforeScore: 0.4751,
  },
]

interface TestResult {
  id: number
  agent: string
  query: string
  beforeScore: number
  afterScore: number
  change: number
  changePercent: number
  status: 'PASS' | 'MARGINAL' | 'FAIL'
}

function getQualityStatus(score: number): 'PASS' | 'MARGINAL' | 'FAIL' {
  if (score >= 0.75) return 'PASS'
  if (score >= 0.5) return 'MARGINAL'
  return 'FAIL'
}

async function runFullTest() {
  console.log('🧪 Full RAG System Test with Query Expansion')
  console.log('Testing all 21 queries across all agent types')
  console.log('═'.repeat(100))
  console.log()

  // Disable development logging for cleaner output
  const originalEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'

  const results: TestResult[] = []

  for (const testQuery of TEST_QUERIES) {
    try {
      const chunks = await retrieveContext(testQuery.query, testQuery.namespace as any, 10)

      const afterScore = chunks.length > 0 ? chunks[0].score : 0
      const change = afterScore - testQuery.beforeScore
      const changePercent = (change / testQuery.beforeScore) * 100
      const status = getQualityStatus(afterScore)

      results.push({
        id: testQuery.id,
        agent: testQuery.agent,
        query: testQuery.query,
        beforeScore: testQuery.beforeScore,
        afterScore,
        change,
        changePercent,
        status,
      })

      // Progress indicator
      const statusIcon = status === 'PASS' ? '✅' : status === 'MARGINAL' ? '⚠️' : '❌'
      console.log(`[${testQuery.id}/21] ${statusIcon} ${testQuery.agent.padEnd(15)} ${afterScore.toFixed(4)}`)

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`[${testQuery.id}/21] ❌ Error:`, error)
      results.push({
        id: testQuery.id,
        agent: testQuery.agent,
        query: testQuery.query,
        beforeScore: testQuery.beforeScore,
        afterScore: 0,
        change: -testQuery.beforeScore,
        changePercent: -100,
        status: 'FAIL',
      })
    }
  }

  // Restore env
  process.env.NODE_ENV = originalEnv

  // Print results table
  console.log('\n\n')
  console.log('═'.repeat(100))
  console.log('📊 RESULTS TABLE')
  console.log('═'.repeat(100))
  console.log()

  console.log(
    'AGENT           | QUERY                                           | BEFORE | AFTER  | CHANGE | STATUS'
  )
  console.log('─'.repeat(100))

  results.forEach((result) => {
    const agent = result.agent.padEnd(15)
    const query = result.query.substring(0, 47).padEnd(47)
    const before = result.beforeScore.toFixed(4)
    const after = result.afterScore.toFixed(4)
    const changeSign = result.change >= 0 ? '+' : ''
    const change = `${changeSign}${result.changePercent.toFixed(0)}%`.padStart(6)
    const statusIcon = result.status === 'PASS' ? '✅ PASS' : result.status === 'MARGINAL' ? '⚠️  MARG' : '❌ FAIL'

    console.log(`${agent} | ${query} | ${before} | ${after} | ${change} | ${statusIcon}`)
  })

  // Summary by agent
  console.log('\n\n')
  console.log('═'.repeat(100))
  console.log('📈 SUMMARY BY AGENT')
  console.log('═'.repeat(100))
  console.log()

  const byAgent: Record<string, TestResult[]> = {}
  results.forEach((r) => {
    if (!byAgent[r.agent]) byAgent[r.agent] = []
    byAgent[r.agent].push(r)
  })

  console.log(
    'AGENT           | AVG BEFORE | AVG AFTER  | IMPROVEMENT | PASS | MARGINAL | FAIL | TOP BOOK'
  )
  console.log('─'.repeat(100))

  Object.entries(byAgent).forEach(([agent, agentResults]) => {
    const avgBefore = agentResults.reduce((sum, r) => sum + r.beforeScore, 0) / agentResults.length
    const avgAfter = agentResults.reduce((sum, r) => sum + r.afterScore, 0) / agentResults.length
    const improvement = ((avgAfter - avgBefore) / avgBefore) * 100

    const passCount = agentResults.filter((r) => r.status === 'PASS').length
    const marginalCount = agentResults.filter((r) => r.status === 'MARGINAL').length
    const failCount = agentResults.filter((r) => r.status === 'FAIL').length

    const agentName = agent.padEnd(15)
    const before = avgBefore.toFixed(4)
    const after = avgAfter.toFixed(4)
    const improvementStr = `+${improvement.toFixed(0)}%`.padStart(11)
    const pass = `${passCount}/3`.padEnd(4)
    const marginal = `${marginalCount}/3`.padEnd(8)
    const fail = `${failCount}/3`.padEnd(4)

    console.log(
      `${agentName} | ${before}     | ${after}     | ${improvementStr} | ${pass} | ${marginal} | ${fail} | -`
    )
  })

  // Overall summary
  console.log('─'.repeat(100))

  const overallAvgBefore = results.reduce((sum, r) => sum + r.beforeScore, 0) / results.length
  const overallAvgAfter = results.reduce((sum, r) => sum + r.afterScore, 0) / results.length
  const overallImprovement = ((overallAvgAfter - overallAvgBefore) / overallAvgBefore) * 100

  const overallPass = results.filter((r) => r.status === 'PASS').length
  const overallMarginal = results.filter((r) => r.status === 'MARGINAL').length
  const overallFail = results.filter((r) => r.status === 'FAIL').length

  console.log(
    `OVERALL         | ${overallAvgBefore.toFixed(4)}     | ${overallAvgAfter.toFixed(4)}     | +${overallImprovement.toFixed(0)}%        | ${overallPass}/21 | ${overallMarginal}/21     | ${overallFail}/21`
  )

  console.log('\n')
  console.log('═'.repeat(100))
  console.log('🎯 FINAL VERDICT')
  console.log('═'.repeat(100))
  console.log()

  console.log(`Average Score BEFORE Query Expansion:  ${overallAvgBefore.toFixed(4)}`)
  console.log(`Average Score AFTER Query Expansion:   ${overallAvgAfter.toFixed(4)}`)
  console.log(`Overall Improvement:                   +${overallImprovement.toFixed(1)}%`)
  console.log()

  console.log(`Quality Distribution:`)
  console.log(
    `  BEFORE:  PASS ${results.filter((r) => r.beforeScore >= 0.75).length}/21, MARGINAL ${results.filter((r) => r.beforeScore >= 0.5 && r.beforeScore < 0.75).length}/21, FAIL ${results.filter((r) => r.beforeScore < 0.5).length}/21`
  )
  console.log(`  AFTER:   PASS ${overallPass}/21, MARGINAL ${overallMarginal}/21, FAIL ${overallFail}/21`)
  console.log()

  if (overallAvgAfter >= 0.75) {
    console.log('   ✅ EXCELLENT - RAG system is performing at production quality!')
  } else if (overallAvgAfter >= 0.6) {
    console.log('   ✅ GOOD - RAG system is performing well, minor improvements needed')
  } else if (overallAvgAfter >= 0.5) {
    console.log('   ⚠️  ACCEPTABLE - RAG system works but needs further optimization')
  } else {
    console.log('   ❌ POOR - RAG system needs significant improvement')
  }

  console.log()
}

runFullTest().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

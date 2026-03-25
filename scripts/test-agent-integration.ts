#!/usr/bin/env node
/**
 * Test GMAT Agent Integration
 * Tests orchestrator routing and builder functions for all 5 GMAT agents
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { routeToGmatAgent } from '../agents/gmat/orchestrator'
import { getNamespaceForGmatAgent } from '../lib/pinecone/namespace-mapping'
import {
  buildQuantitativePrompt,
  buildVerbalPrompt,
  buildDataInsightsPrompt,
  buildStrategyPrompt,
} from '../agents/gmat'
import type { GmatAgentType } from '../agents/gmat/orchestrator'

// Test cases: message → expected agent
const ROUTING_TESTS: { message: string; expectedAgent: GmatAgentType; description: string }[] = [
  // Quantitative
  { message: 'How do I solve this quadratic equation?', expectedAgent: 'quantitative', description: 'Quadratic equation → quant' },
  { message: 'Is statement 1 sufficient to determine x?', expectedAgent: 'data_insights', description: 'Data sufficiency → DI' },
  { message: 'What is the probability of picking two reds?', expectedAgent: 'quantitative', description: 'Probability → quant' },

  // Verbal
  { message: 'Which answer weakens the argument?', expectedAgent: 'verbal', description: 'Weaken → verbal' },
  { message: 'What is the author\'s main point in the passage?', expectedAgent: 'verbal', description: 'RC main idea → verbal' },
  { message: 'What is the main idea of this passage?', expectedAgent: 'verbal', description: 'Reading comprehension → verbal' },

  // Data Insights
  { message: 'How do I read this table analysis question?', expectedAgent: 'data_insights', description: 'Table analysis → DI' },
  { message: 'Interpret this graph for me', expectedAgent: 'data_insights', description: 'Graphics interpretation → DI' },
  { message: 'Help me with a data sufficiency problem', expectedAgent: 'data_insights', description: 'DS → DI' },

  // Strategy
  { message: 'How should I manage my time on the GMAT?', expectedAgent: 'strategy', description: 'Time management → strategy' },
  { message: 'I have my GMAT in 3 weeks, what should I study?', expectedAgent: 'strategy', description: 'Study plan → strategy' },
  { message: 'I\'m overwhelmed and don\'t know where to start', expectedAgent: 'strategy', description: 'Overwhelmed → strategy' },

  // Default
  { message: 'hey', expectedAgent: 'quantitative', description: 'Casual greeting → default (quant)' },
]

function runTests() {
  console.log('🧪 GMAT Agent Integration Tests\n')

  let passed = 0
  let failed = 0

  // Test routing
  console.log('=== Orchestrator Routing ===\n')
  for (const test of ROUTING_TESTS) {
    const result = routeToGmatAgent(test.message)
    const ok = result.route === test.expectedAgent
    if (ok) {
      console.log(`  ✅ ${test.description}`)
      passed++
    } else {
      console.log(`  ❌ ${test.description}`)
      console.log(`     Expected: ${test.expectedAgent}, Got: ${result.route} (conf: ${result.confidence.toFixed(2)})`)
      failed++
    }
  }

  // Test namespace mapping
  console.log('\n=== Namespace Mapping ===\n')
  const agents: GmatAgentType[] = ['quantitative', 'verbal', 'data_insights', 'strategy']
  for (const agent of agents) {
    const ns = getNamespaceForGmatAgent(agent)
    console.log(`  ${agent} → ${ns}`)
    passed++
  }

  // Test prompt builders
  console.log('\n=== Prompt Builders ===\n')
  const mockParams = {
    learnerProfile: null,
    currentTopic: 'algebra',
    difficulty: 'intermediate' as const,
    sessionCount: 1,
  }

  const builders = [
    { name: 'Quantitative', fn: buildQuantitativePrompt },
    { name: 'Verbal', fn: buildVerbalPrompt },
    { name: 'Data Insights', fn: buildDataInsightsPrompt },
    { name: 'Strategy', fn: buildStrategyPrompt },
  ]

  for (const { name, fn } of builders) {
    try {
      const prompt = fn(mockParams)
      const hasRole = prompt.includes('# ROLE')
      const hasSam = prompt.includes('Sam')
      if (hasRole && hasSam) {
        console.log(`  ✅ ${name}: builds correctly (${prompt.length} chars)`)
        passed++
      } else {
        console.log(`  ❌ ${name}: missing ROLE or Sam reference`)
        failed++
      }
    } catch (error) {
      console.log(`  ❌ ${name}: threw error: ${error}`)
      failed++
    }
  }

  // Summary
  console.log(`\n=== Results ===`)
  console.log(`  Passed: ${passed}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total:  ${passed + failed}`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()

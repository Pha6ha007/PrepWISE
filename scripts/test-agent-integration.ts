#!/usr/bin/env node
/**
 * Test Agent Integration
 * Tests orchestrator routing and builder functions for all 6 agents
 */

// Load env vars
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { routeToAgent, shouldReroute } from '../lib/agents/orchestrator'
import { getNamespaceForAgent } from '../lib/pinecone/namespace-mapping'
import {
  buildAnxietyPrompt,
  buildFamilyPrompt,
  buildTraumaPrompt,
  buildRelationshipsPrompt,
  buildMensPrompt,
  buildWomensPrompt,
} from '../agents/prompts'
import { UserProfile, AgentType } from '../types'

// Mock user profile
const mockProfile: UserProfile = {
  id: 'test-profile-id',
  userId: 'test-user-id',
  communicationStyle: {},
  emotionalProfile: {
    triggers: [],
    pain_points: [],
    responds_to: 'direct questions',
  },
  lifeContext: {
    key_people: [],
    work: 'software developer',
  },
  patterns: [],
  progress: {},
  whatWorked: [],
  updatedAt: new Date(),
}

interface TestCase {
  id: number
  message: string
  expectedAgent: AgentType
  userGender?: 'male' | 'female'
}

const testCases: TestCase[] = [
  {
    id: 1,
    message: 'I keep having panic attacks at work',
    expectedAgent: 'anxiety',
  },
  {
    id: 2,
    message: 'My husband and I keep fighting about money',
    expectedAgent: 'family',
  },
  {
    id: 3,
    message: 'I freeze when someone raises their voice, it reminds me of my childhood',
    expectedAgent: 'trauma',
  },
  {
    id: 4,
    message: 'My girlfriend goes silent and I spiral into panic',
    expectedAgent: 'relationships',
  },
  {
    id: 5,
    message: "I can't show weakness at work, men aren't supposed to feel this way",
    expectedAgent: 'mens',
    userGender: 'male',
  },
  {
    id: 6,
    message: 'I feel guilty for wanting time alone, everyone needs me',
    expectedAgent: 'womens',
    userGender: 'female',
  },
]

// Builder function map
const builderMap = {
  anxiety: buildAnxietyPrompt,
  family: buildFamilyPrompt,
  trauma: buildTraumaPrompt,
  relationships: buildRelationshipsPrompt,
  mens: buildMensPrompt,
  womens: buildWomensPrompt,
  general: buildAnxietyPrompt, // fallback
}

async function testAgentIntegration() {
  console.log('🧪 Testing Agent Integration')
  console.log('=' .repeat(90))
  console.log()

  for (const testCase of testCases) {
    console.log(`\n📝 TEST ${testCase.id}/6: ${testCase.expectedAgent.toUpperCase()} Agent`)
    console.log(`Message: "${testCase.message}"`)
    console.log('─'.repeat(90))

    // 1. Route to agent
    const routing = await routeToAgent(
      'test-user-id',
      testCase.message,
      mockProfile,
      testCase.userGender,
      0
    )

    // 2. Get namespace
    const namespace = getNamespaceForAgent(routing.route)

    // 3. Build system prompt
    const builder = builderMap[routing.route]
    const systemPrompt = builder({
      userProfile: mockProfile,
      recentHistory: undefined,
      pastSessions: undefined,
      ragContext: undefined,
      companionName: 'Alex',
      preferredName: 'John',
      language: 'en',
    })

    // 4. Output results
    const match = routing.route === testCase.expectedAgent ? '✅' : '❌'
    console.log(`\n${match} ROUTING DECISION:`)
    console.log(`   Agent Selected:    ${routing.route}`)
    console.log(`   Expected:          ${testCase.expectedAgent}`)
    console.log(`   Confidence:        ${routing.confidence.toFixed(2)}`)
    console.log(`   Detected Topics:   ${routing.detectedTopics.join(', ') || 'none'}`)
    console.log(`   Detected Emotion:  ${routing.detectedEmotion}`)
    console.log(`   Gender Relevant:   ${routing.genderRelevant}`)
    console.log(`   Reasoning:         ${routing.reasoning}`)
    if (routing.monitoringNotes) {
      console.log(`   Monitoring:        ${routing.monitoringNotes}`)
    }

    console.log(`\n📚 RAG NAMESPACE:`)
    console.log(`   Namespace:         ${namespace}`)

    console.log(`\n📄 SYSTEM PROMPT (first 200 chars):`)
    const promptPreview = systemPrompt.substring(0, 200).replace(/\n/g, ' ')
    console.log(`   "${promptPreview}..."`)

    // Verification
    if (routing.route !== testCase.expectedAgent) {
      console.log(`\n⚠️  WARNING: Expected ${testCase.expectedAgent} but got ${routing.route}`)
    }
  }

  // Test handoff detection
  console.log('\n\n')
  console.log('=' .repeat(90))
  console.log('🔄 TESTING HANDOFF PROTOCOL (mid-conversation re-routing)')
  console.log('=' .repeat(90))

  // Simulate family → trauma handoff
  const handoffMessages = [
    { role: 'user', content: 'My mother is very critical of me' },
    { role: 'assistant', content: 'That sounds difficult. How does her criticism affect you?' },
    { role: 'user', content: "It makes me feel small. Like I'm never good enough." },
    { role: 'assistant', content: 'Have you talked to her about how this makes you feel?' },
    { role: 'user', content: "I can't. She used to hit me when I was young if I disagreed." },
    { role: 'assistant', content: 'That must have been frightening...' },
    { role: 'user', content: 'Yeah. I still freeze when she raises her voice. My body just shuts down.' },
  ]

  console.log('\nScenario: User discussing critical mother (family agent)')
  console.log('Then reveals: "She used to hit me" + "I freeze when she raises her voice"')
  console.log('\nExpected: Handoff from family → trauma')
  console.log('─'.repeat(90))

  const handoffCheck = await shouldReroute(
    'test-session-id',
    'family',
    handoffMessages,
    mockProfile,
    undefined
  )

  if (handoffCheck.shouldReroute) {
    console.log(`\n✅ HANDOFF TRIGGERED:`)
    console.log(`   From Agent:        family`)
    console.log(`   To Agent:          ${handoffCheck.newAgent}`)
    console.log(`   Reason:            ${handoffCheck.reason}`)
    if (handoffCheck.handoffPayload) {
      console.log(`   Emotional State:   ${handoffCheck.handoffPayload.emotionalState}`)
      console.log(`   Key Insights:      ${handoffCheck.handoffPayload.keyInsights.join(', ')}`)
      console.log(`   Continuation:      ${handoffCheck.handoffPayload.continuationNotes}`)
      console.log(`   Avoid:             ${handoffCheck.handoffPayload.avoid}`)
    }
  } else {
    console.log(`\n❌ HANDOFF NOT TRIGGERED (expected: trauma)`)
  }

  console.log('\n')
  console.log('=' .repeat(90))
  console.log('✅ INTEGRATION TEST COMPLETE')
  console.log('=' .repeat(90))
}

// Run tests
testAgentIntegration().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

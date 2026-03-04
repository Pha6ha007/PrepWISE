// lib/agents/orchestrator.ts
// Orchestrator routing logic for multi-agent system

import { AgentType, UserProfile } from '@/types'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface RoutingDecision {
  route: AgentType
  confidence: number
  reasoning: string
  detectedTopics: string[]
  detectedEmotion: string
  secondaryAgent: AgentType | null
  crisisFlag: boolean
  softTriggersDetected: string[]
  genderRelevant: boolean
  userContextUsed: string[]
  monitoringNotes: string
}

/**
 * Analyze user message and route to appropriate specialist agent
 * Called for NEW sessions (first 2-3 messages)
 */
export async function routeToAgent(
  userId: string,
  userMessage: string,
  userProfile: UserProfile,
  userGender?: 'male' | 'female',
  messageCount: number = 0
): Promise<RoutingDecision> {
  // Default to anxiety agent (most versatile)
  let route: AgentType = 'anxiety'
  let confidence = 0.5
  let reasoning = 'Default to anxiety agent for initial assessment'
  const detectedTopics: string[] = []
  let detectedEmotion = 'neutral'
  let secondaryAgent: AgentType | null = null
  let genderRelevant = false
  const userContextUsed: string[] = []
  let monitoringNotes = ''

  const msgLower = userMessage.toLowerCase()

  // ===== TOPIC DETECTION =====

  // ANXIETY signals
  const anxietySignals = [
    'anxiety', 'anxious', 'panic', 'panic attack', 'worry', 'worried',
    'nervous', 'stressed', 'stress', "can't breathe", 'racing heart',
    'ocd', 'intrusive thoughts', 'phobia', "can't sleep",
    'catastrophizing', 'spiraling', 'overthinking'
  ]
  const anxietyScore = anxietySignals.filter(s => msgLower.includes(s)).length

  // FAMILY signals (family of origin, not romantic partner)
  const familySignals = [
    'mom', 'dad', 'mother', 'father', 'parents', 'parent',
    'brother', 'sister', 'sibling', 'family', 'in-laws',
    'mother-in-law', 'father-in-law', 'family dinner',
    'holiday with family', 'my family', 'upbringing', 'childhood home',
    'raised by', 'grew up with', 'family of origin'
  ]
  const familyScore = familySignals.filter(s => msgLower.includes(s)).length

  // TRAUMA signals
  const traumaSignals = [
    'trauma', 'ptsd', 'flashback', 'nightmare',
    'something happened to me', 'when i was a child', 'when i was young',
    'body memory', 'dissociation', 'hypervigilance',
    "i can't talk about it", 'freeze', 'abuse', 'abused',
    'hit me', 'hurt me', 'scared of', 'reminds me of my childhood',
    'raises their voice', 'body shuts down'
  ]
  const traumaScore = traumaSignals.filter(s => msgLower.includes(s)).length

  // RELATIONSHIPS signals (romantic partner)
  const relationshipsSignals = [
    'boyfriend', 'girlfriend', 'partner', 'my partner',
    'dating', 'breakup', 'broke up', 'divorce', 'ex',
    'cheated', 'cheating', 'jealous', 'trust issues',
    "won't commit", 'attachment', 'intimacy', 'we had a fight',
    'my relationship', 'in a relationship', 'goes silent',
    'spiral into panic', 'need reassurance'
  ]
  let relationshipsScore = relationshipsSignals.filter(s => msgLower.includes(s)).length

  // Special handling: "husband/wife" can be family OR relationships
  // If mentioned with "fighting", "argue", "money", "issues" → relationships (marital conflict)
  // If mentioned with parents, in-laws → family
  const hasSpouse = msgLower.includes('husband') || msgLower.includes('wife')
  const hasConflictKeywords =
    msgLower.includes('fight') || msgLower.includes('fighting') ||
    msgLower.includes('argue') || msgLower.includes('arguing') ||
    msgLower.includes('about money') || msgLower.includes('keep having') ||
    msgLower.includes('we keep')

  if (hasSpouse && hasConflictKeywords) {
    // "My husband and I keep fighting about money" → relationships, not family
    // Boost relationships score significantly
    relationshipsScore += 3
  }

  // MENS signals (requires userGender = male)
  const mensSignals = [
    'no one to talk to', "can't talk about feelings", "can't show weakness",
    'anger', 'angry', 'provider', 'providing for my family',
    'man up', 'fatherhood', 'work identity',
    "i'm fine", 'male friend', 'guy friends',
    "men aren't supposed", "men don't", 'weakness at work',
    "supposed to feel", 'be strong', 'handle it alone'
  ]
  const mensScore = userGender === 'male'
    ? mensSignals.filter(s => msgLower.includes(s)).length
    : 0

  // WOMENS signals (requires userGender = female)
  const womensSignals = [
    'mental load', 'guilt', 'guilty', 'inner critic',
    'feel selfish', 'selfish for wanting', 'boundary', 'boundaries',
    'people-pleasing', 'too much', 'too sensitive',
    'overreacting', 'perfectionism', "i've disappeared",
    'dismissed', 'emotional labor', 'everyone needs me',
    'time alone', 'time for myself'
  ]
  const womensScore = userGender === 'female'
    ? womensSignals.filter(s => msgLower.includes(s)).length
    : 0

  // ===== SCORING & ROUTING =====

  const scores: Record<AgentType, number> = {
    anxiety: anxietyScore * 0.4,
    family: familyScore * 0.4,
    trauma: traumaScore * 0.4,
    relationships: relationshipsScore * 0.4,
    mens: mensScore * 0.4,
    womens: womensScore * 0.4,
    general: 0, // General is fallback, not directly scored
  }

  // Add user profile context weighting (20%)
  if (userProfile.patterns.length > 0) {
    userContextUsed.push('patterns')
    // Could add pattern-based scoring here
  }

  // Gender context weighting (10%)
  if (userGender === 'male' && mensScore > 0) {
    scores.mens += 0.1
    genderRelevant = true
  }
  if (userGender === 'female' && womensScore > 0) {
    scores.womens += 0.1
    genderRelevant = true
  }

  // Find highest score
  const maxScore = Math.max(...Object.values(scores))
  const topAgent = (Object.keys(scores) as AgentType[]).find(
    key => scores[key] === maxScore
  )

  if (topAgent && maxScore > 0.3) {
    route = topAgent
    confidence = Math.min(0.95, maxScore + 0.3)
    reasoning = `Topic analysis indicates ${topAgent} agent (score: ${maxScore.toFixed(2)})`

    // Set secondary agent
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
    if (sortedScores[1] && sortedScores[1][1] > 0.2) {
      secondaryAgent = sortedScores[1][0] as AgentType
    }
  }

  // Collect detected topics
  if (anxietyScore > 0) detectedTopics.push('anxiety')
  if (familyScore > 0) detectedTopics.push('family')
  if (traumaScore > 0) detectedTopics.push('trauma')
  if (relationshipsScore > 0) detectedTopics.push('relationships')
  if (mensScore > 0) detectedTopics.push('male-specific')
  if (womensScore > 0) detectedTopics.push('female-specific')

  // Detect emotion (simple keyword-based)
  if (msgLower.includes('angry') || msgLower.includes('furious')) {
    detectedEmotion = 'anger'
  } else if (msgLower.includes('sad') || msgLower.includes('depressed')) {
    detectedEmotion = 'sadness'
  } else if (msgLower.includes('scared') || msgLower.includes('afraid')) {
    detectedEmotion = 'fear'
  } else if (msgLower.includes('lonely') || msgLower.includes('alone')) {
    detectedEmotion = 'loneliness'
  }

  // Monitoring notes
  if (msgLower.includes("don't care") || msgLower.includes("nothing matters")) {
    monitoringNotes = 'Watch for anhedonia/depression indicators'
  }
  if (traumaScore > 0 && route !== 'trauma') {
    monitoringNotes += ' Consider trauma processing if topic deepens.'
  }

  return {
    route,
    confidence,
    reasoning,
    detectedTopics,
    detectedEmotion,
    secondaryAgent,
    crisisFlag: false,
    softTriggersDetected: [],
    genderRelevant,
    userContextUsed,
    monitoringNotes,
  }
}

export interface HandoffPayload {
  fromAgent: AgentType
  toAgent: AgentType
  reason: string
  sessionSummary: string
  emotionalState: string
  keyInsights: string[]
  continuationNotes: string
  avoid: string
}

/**
 * Check if mid-conversation re-routing is needed
 * Analyzes recent messages to detect topic shifts
 */
export async function shouldReroute(
  sessionId: string,
  currentAgent: AgentType,
  recentMessages: { role: string; content: string }[],
  userProfile: UserProfile,
  userGender?: 'male' | 'female'
): Promise<{
  shouldReroute: boolean
  newAgent?: AgentType
  reason?: string
  handoffPayload?: HandoffPayload
}> {
  // Don't reroute if less than 5 messages (let agent establish rapport)
  if (recentMessages.length < 5) {
    return { shouldReroute: false }
  }

  // Get last 3 user messages for topic analysis
  const lastUserMessages = recentMessages
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => m.content.toLowerCase())
    .join(' ')

  // Detect topic shifts using keyword analysis
  const topicSignals = {
    anxiety: ['panic', 'anxiety', 'worried', 'can\'t breathe', 'racing heart', 'intrusive thoughts'],
    family: ['mom', 'dad', 'mother', 'father', 'parents', 'family', 'sibling', 'in-laws'],
    trauma: ['trauma', 'flashback', 'nightmare', 'abuse', 'something happened', 'dissociation', 'freeze'],
    relationships: ['boyfriend', 'girlfriend', 'husband', 'wife', 'partner', 'breakup', 'cheated', 'relationship'],
    mens: ['no one to talk to', 'can\'t express', 'provider', 'man up', 'work identity', 'father'],
    womens: ['mental load', 'guilt', 'selfish', 'boundaries', 'people-pleasing', 'dismissed', 'too much'],
  }

  // Count signals for each topic
  const signalCounts: Record<string, number> = {}
  for (const [topic, signals] of Object.entries(topicSignals)) {
    signalCounts[topic] = signals.filter((s) => lastUserMessages.includes(s)).length
  }

  // Find strongest non-current topic
  const sortedTopics = Object.entries(signalCounts)
    .filter(([topic]) => topic !== currentAgent)
    .sort(([, a], [, b]) => b - a)

  const strongestTopic = sortedTopics[0]

  // Handoff if new topic has 3+ signals (strong shift)
  if (strongestTopic && strongestTopic[1] >= 3) {
    const newAgent = strongestTopic[0] as AgentType

    // Build handoff payload
    const handoffPayload: HandoffPayload = {
      fromAgent: currentAgent,
      toAgent: newAgent,
      reason: `User's focus shifted from ${currentAgent} to ${newAgent}. Detected ${strongestTopic[1]} ${newAgent}-related signals in recent messages.`,
      sessionSummary: `Session started with ${currentAgent} agent. User discussed relevant topics but conversation has evolved toward ${newAgent} themes.`,
      emotionalState: 'Engaged, exploring new topic area',
      keyInsights: [
        `Topic shift detected after ${recentMessages.length} messages`,
        `${newAgent} signals: ${strongestTopic[1]}`,
      ],
      continuationNotes: `Pick up seamlessly. Don't re-introduce yourself. Continue the conversation naturally as if you've been here all along.`,
      avoid: 'Don\'t say "I see you want to talk about something different" or acknowledge the agent switch. Stay invisible.',
    }

    return {
      shouldReroute: true,
      newAgent,
      reason: handoffPayload.reason,
      handoffPayload,
    }
  }

  // Special cases: Always handoff these combinations

  // Family agent → Trauma agent (when abuse surfaces)
  if (currentAgent === 'family') {
    const traumaKeywords = ['abuse', 'hit me', 'hurt me', 'scared of', 'violence', 'used to hit', 'freeze when']
    const traumaCount = traumaKeywords.filter((k) => lastUserMessages.includes(k)).length
    if (traumaCount >= 1) {  // Lower threshold to 1 for strong signals
      return {
        shouldReroute: true,
        newAgent: 'trauma',
        reason: 'Family dynamics conversation surfaced trauma/abuse. Trauma agent better equipped for this.',
        handoffPayload: {
          fromAgent: 'family',
          toAgent: 'trauma',
          reason: 'Abuse disclosure during family discussion requires trauma-informed approach',
          sessionSummary: 'Discussing family relationships. User disclosed abuse.',
          emotionalState: 'Vulnerable, potentially activated',
          keyInsights: ['Abuse disclosure', 'May need grounding'],
          continuationNotes: 'User is vulnerable. Go slow. Offer grounding if needed.',
          avoid: 'Don\'t push for details. Let user control pace.',
        },
      }
    }
  }

  // Relationships agent → Trauma agent (when attachment wounds go deep)
  if (currentAgent === 'relationships') {
    const deepWoundKeywords = ['childhood', 'when i was young', 'my parent', 'always been this way']
    const woundCount = deepWoundKeywords.filter((k) => lastUserMessages.includes(k)).length
    if (woundCount >= 2) {
      return {
        shouldReroute: true,
        newAgent: 'trauma',
        reason: 'Relationship patterns traced to childhood trauma. Needs trauma processing.',
        handoffPayload: {
          fromAgent: 'relationships',
          toAgent: 'trauma',
          reason: 'Attachment issues rooted in childhood trauma',
          sessionSummary: 'Discussing relationship patterns. User connected to childhood experiences.',
          emotionalState: 'Reflective, making connections',
          keyInsights: ['Pattern traces to early experiences'],
          continuationNotes: 'User is making important connections. Support the exploration.',
          avoid: 'Don\'t rush. Let insights emerge.',
        },
      }
    }
  }

  // Anxiety agent → Trauma agent (when panic is trauma-based)
  if (currentAgent === 'anxiety') {
    const traumaBasedPanic = ['flashback', 'happens when', 'reminds me of', 'body remembers']
    const traumaCount = traumaBasedPanic.filter((k) => lastUserMessages.includes(k)).length
    if (traumaCount >= 2) {
      return {
        shouldReroute: true,
        newAgent: 'trauma',
        reason: 'Anxiety symptoms are trauma-based (flashbacks, body memory). Trauma agent more appropriate.',
        handoffPayload: {
          fromAgent: 'anxiety',
          toAgent: 'trauma',
          reason: 'Anxiety is trauma-based, not generalized',
          sessionSummary: 'Discussing anxiety. User revealed trauma symptoms.',
          emotionalState: 'Activated, body-based response',
          keyInsights: ['Anxiety tied to past trauma', 'Somatic symptoms present'],
          continuationNotes: 'Focus on grounding and window of tolerance.',
          avoid: 'Don\'t treat as generalized anxiety. This is trauma response.',
        },
      }
    }
  }

  // No handoff needed
  return { shouldReroute: false }
}

// User & Auth Types
export interface User {
  id: string
  email: string
  createdAt: Date
  plan: 'free' | 'pro' | 'premium'
  voiceId?: string
  companionName: string
  companionGender?: 'male' | 'female'
  language: 'en' | 'ru'
}

// User Profile (Long-term Memory)
export interface UserProfile {
  id: string
  userId: string
  communicationStyle: Record<string, any>
  emotionalProfile: {
    triggers?: string[]
    pain_points?: string[]
    responds_to?: string
  }
  lifeContext: {
    key_people?: string[]
    work?: string
    situation?: string
  }
  patterns: string[]
  progress: Record<string, any>
  whatWorked: string[]

  // Memory Agent Upgrade (март 2026)
  styleMetrics?: StyleMetrics
  whatDidntWork?: string[]
  emotionalAnchors?: string[]
  topicConnections?: Record<string, string[]>

  updatedAt: Date
}

// Style Metrics (автоматический анализ стиля общения)
export interface StyleMetrics {
  avgMessageLength: number // средняя длина сообщения в словах
  avgMessageChars: number // средняя длина в символах
  usesEmoji: boolean // использует ли emoji
  usesSlang: boolean // использует ли сленг
  usesCaps: boolean // пишет ли КАПСОМ
  punctuationStyle: 'formal' | 'casual' | 'minimal'
  emotionalOpenness: 'high' | 'medium' | 'low'
  responsePreference: 'questions' | 'reflections' | 'advice' | 'mixed'
  sessionCount: number
  totalMessages: number
  lastActive: string
}

// Session Types
export interface Session {
  id: string
  userId: string
  agentType: AgentType
  createdAt: Date
  endedAt?: Date
  summary?: string
  moodScore?: number
}

// Session Preview (for chat history sidebar)
export interface SessionPreview {
  id: string
  createdAt: string
  agentType: string
  messageCount: number
  moodBefore: number | null
  moodAfter: number | null
  summary: string | null
  firstUserMessage: string | null
  lastAssistantMessage: string | null
  isActive: boolean
}

// Agent Types (Prepwise GMAT)
export type AgentType =
  | 'quantitative'
  | 'verbal'
  | 'data_insights'
  | 'strategy'

// Message Types
export interface Message {
  id: string
  sessionId?: string
  userId?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  audioUrl?: string
  createdAt: string
  isCrisis?: boolean
}

// Journal Types
export interface JournalEntry {
  id: string
  userId: string
  content: string
  insight?: string
  sourceMessageId?: string
  createdAt: Date
}

// Subscription Types
export interface Subscription {
  id: string
  userId: string
  paddleCustomerId?: string
  paddleSubscriptionId?: string
  plan: 'free' | 'starter' | 'pro' | 'intensive'
  status: 'active' | 'cancelled' | 'on_hold' | 'expired' | 'trialing' | 'past_due'
  trialEndsAt?: Date
  expiresAt?: Date
  createdAt?: Date
}

// RAG / Knowledge Base Types
export interface KnowledgeSource {
  title: string
  author?: string
  namespace: string
  chunkIndex: number
  pineconeId: string
}

export interface RAGSource {
  title: string
  author?: string
  excerpt: string
  score?: number
}

// API Response Types
export interface ChatResponse {
  message: string
  messageId: string
  sessionId: string
  audioUrl?: string // URL голосового ответа (если enableVoiceResponse)
  sources?: RAGSource[]
  isCrisis?: boolean
}

export interface ErrorResponse {
  error: string
  details?: string
}

// Rate Limiting
export interface RateLimit {
  plan: 'free' | 'starter' | 'pro' | 'intensive'
  maxRequests: number
  windowMs: number
}

// ============================================
// PREPWISE — GMAT Types
// ============================================

export type GmatAgentType =
  | 'quantitative'
  | 'verbal'
  | 'data_insights'
  | 'strategy'

export interface GmatSession {
  id: string
  userId: string
  startedAt: Date
  endedAt?: Date
  durationMins?: number
  agentUsed: GmatAgentType
  topicsCovered: string[]
  questionsAsked: number
  correctAnswers: number
  transcript?: string
  memoryUpdated: boolean
}

export interface TopicProgress {
  id: string
  userId: string
  section: 'quant' | 'verbal' | 'data-insights'
  topic: string
  subtopic?: string
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  lastPracticed?: Date
  masteryLevel: 'not_started' | 'learning' | 'practicing' | 'mastered'
}

export interface GmatErrorLog {
  id: string
  userId: string
  sessionId?: string
  section: string
  topic: string
  questionType: 'PS' | 'DS' | 'CR' | 'RC' | 'TPA' | 'MSR' | 'GI' | 'TA'
  difficulty: 'easy' | 'medium' | 'hard' | '700+'
  errorType: 'concept' | 'careless' | 'time_pressure' | 'misread'
  errorDetail: string
  correctApproach?: string
}

export interface MockTestResult {
  id: string
  userId: string
  takenAt: Date
  durationMins: number
  quantScore?: number
  verbalScore?: number
  dataInsightsScore?: number
  totalScore?: number
  quantAccuracy?: number
  verbalAccuracy?: number
  diAccuracy?: number
  notes?: string
}

export interface GmatChunkMetadata {
  source: string
  chapter: string
  section: 'quant' | 'verbal' | 'data-insights'
  topic: string
  subtopic: string
  difficulty: 'easy' | 'medium' | 'hard' | '700+'
  question_type?: 'PS' | 'DS' | 'CR' | 'RC' | 'TPA' | 'MSR' | 'GI' | 'TA'
  page?: number
}

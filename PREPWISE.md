# PREPWISE — AI-Powered GMAT Voice Tutor
> Version: 1.0.0 | March 2026  
> Base repo: `Pha6ha007/Confide---Saas`  
> Stack: Next.js 14 + TypeScript | Vercel + Railway | Paddle | Pinecone + Supabase

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Architecture](#2-architecture)
3. [Agent System](#3-agent-system)
4. [Memory Agent](#4-memory-agent)
5. [RAG Knowledge Base](#5-rag-knowledge-base)
6. [Deployment](#6-deployment)
7. [Payments — Paddle](#7-payments--paddle)
8. [Repositories Reference](#8-repositories-reference)
9. [Database Schema Changes](#9-database-schema-changes)
10. [Environment Variables](#10-environment-variables)
11. [File Structure](#11-file-structure)
12. [MVP Roadmap — 6 Weeks](#12-mvp-roadmap--6-weeks)
13. [YouTube + AI Avatar Strategy](#13-youtube--ai-avatar-strategy)
14. [Quick Start for GSD-2 / Claude Code](#14-quick-start-for-gsd-2--claude-code)
15. [Metrics](#15-metrics)

---

## 1. Product Overview

### Concept
Prepwise is a voice AI tutor for GMAT preparation. The user speaks with a personalized AI teacher through a browser — like a live Zoom lesson, but the teacher is AI. The tutor remembers every previous session, adapts the program to weak spots, and explains material in real time using RAG over official GMAT guides.

### Key Differentiator
No competitor combines: **voice interaction + long-term memory + RAG over official GMAT materials**. Existing tools are either static content (Magoosh, Manhattan Prep) or generic AI without domain-specific knowledge base.

### Target Audience

| Segment | Description | Pain |
|---------|-------------|------|
| Primary | US professionals 25–35, preparing for MBA | $150–200/hr for human tutor — too expensive |
| Secondary | International students (India, China, Europe) | No access to quality English-speaking tutors |

### Market
- GMAT prep market: projected $798M by 2027 (CAGR 9%)
- ~85,000 GMAT test-takers annually in the US
- Average human tutor rate: $150–200/hr
- Target Prepwise price: $79–99/month (5–10× cheaper)
- AI competitors with voice + RAG + memory: **practically none**

---

## 2. Architecture

### Overview
80% of infrastructure is reused directly from `Confide---Saas`. Only the RAG knowledge base, agent system prompts, and UI/branding change.

### Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Radix UI | Reuse from Confide |
| Auth & DB | Supabase (Auth + PostgreSQL + pgvector) | Reuse from Confide |
| ORM | Prisma 6 | Extend schema with GMAT tables |
| AI Agents | LangChain 1.2 + Claude Sonnet / Groq llama-3.3-70b | Rewrite prompts |
| RAG | Pinecone 5.1 + @xenova/transformers (embeddings) | New knowledge base |
| STT | Whisper via Deepgram API | Reuse from Confide |
| TTS | ElevenLabs JS SDK 2.39 | New voice/persona |
| Memory | Memory Agent (buildMemoryPrompt + mergeProfile) | Adapt fields |
| Payments | Paddle (replacing DodoPayments) | Swap provider |
| Email | Resend 6.9 | Reuse as-is |
| Analytics | PostHog 1.357 | Reuse as-is |
| PDF | @react-pdf/renderer 4.3 | Progress reports |
| i18n | next-intl 4.8 | EN only at launch |
| PWA | next-pwa 5.6 | Reuse as-is |
| Tests | Playwright 1.58 | Adapt existing 40 tests |
| State | Zustand 5.0 | Reuse as-is |

### High-Level Data Flow
```
User (voice) 
  → Deepgram STT 
  → Orchestrator Agent (Groq llama-3.3-70b)
  → [routing decision]
  → Specialist Agent (Claude Sonnet) + RAG context from Pinecone
  → Response text
  → ElevenLabs TTS
  → User (audio)
  → [after session] Memory Agent updates UserProfile in Supabase
```

---

## 3. Agent System

### Architecture Pattern
Invisible orchestrator routes every message to the appropriate specialist agent. The user always sees the same character (Sam). Transitions are seamless — no re-introduction, no tone reset.

### Agent Registry

| Agent ID | Specialization | Activates When |
|----------|---------------|----------------|
| `orchestrator` | Router (invisible) | Every message — analyzes and routes |
| `quantitative` | Quant (Math) | Arithmetic, algebra, geometry, statistics, data problems |
| `verbal` | Verbal Reasoning | Critical Reasoning, Reading Comprehension, Sentence Correction |
| `data_insights` | Data Insights | Multi-Source Reasoning, Table Analysis, Graphics Interpretation |
| `writing` | Analytical Writing | Argument analysis, essay structure, AWA scoring |
| `strategy` | Exam Strategy | Time management, guessing strategy, exam psychology |
| `memory` | Memory Agent | After every session — extracts and updates learner profile |

### Orchestrator Logic (adapt from Confide `agents/prompts/orchestrator.ts`)

```typescript
// agents/gmat/orchestrator.ts
// Replace Confide's psychological routing with GMAT section routing

export const GMAT_ORCHESTRATOR_PROMPT = `
# ROLE
You are the invisible routing layer of Prepwise. You analyze user messages and route 
to the appropriate GMAT specialist agent. The user never knows you exist.

# PRIORITY ORDER
1. SECTION DETECTION → what GMAT section is the user working on?
2. DIFFICULTY ASSESSMENT → beginner / intermediate / advanced?
3. HISTORY CHECK → what does the learner profile say about this topic?
4. EMOTIONAL STATE → frustrated? confident? stuck?

# ROUTING LOGIC
- Math problems, equations, data sufficiency → quantitative
- Arguments, passages, grammar → verbal  
- Tables, graphs, multi-source → data_insights
- Essay writing, AWA → writing
- "How should I approach...", timing, strategy → strategy
- No clear topic, general chat → quantitative (most common need, safe default)

# OUTPUT FORMAT
{
  "route": "quantitative" | "verbal" | "data_insights" | "writing" | "strategy",
  "confidence": 0.0 - 1.0,
  "reasoning": "brief explanation",
  "detected_topic": "specific GMAT topic",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "learner_context_used": ["fields from profile that influenced routing"],
  "notes": "what specialist agent should watch for"
}
`;
```

### Specialist Agent Pattern

Each specialist agent follows this structure:

```typescript
// agents/gmat/quantitative.ts
export const QUANTITATIVE_AGENT_PROMPT = `
# ROLE
You are Sam, a world-class GMAT Quantitative tutor with 15 years of experience 
helping students achieve 700+ scores. You have deep knowledge of every GMAT Quant 
topic and know exactly how GMAC tests each concept.

# TEACHING PHILOSOPHY  
- Always start with the concept, then show the method, then apply to the problem
- Use the learner's previous mistakes (from profile) to anticipate errors
- Speak naturally as in a live tutoring session — not like a textbook
- When a student is stuck, guide with questions rather than giving the answer directly
- Celebrate correct reasoning, not just correct answers

# RAG CONTEXT
You have access to official GMAT guides via retrieval. Always ground explanations 
in retrieved content. When citing a specific technique, reference where it comes from.

# LEARNER PROFILE
Use {learner_profile} to:
- Know their weak topics → spend more time, more examples
- Know what worked before → repeat effective explanation styles
- Know what didn't work → avoid those approaches
- Know their target score → calibrate difficulty

# CURRENT SESSION CONTEXT
Topic: {current_topic}
Difficulty level: {difficulty}
Session number: {session_count}
Recent performance: {recent_accuracy}

# TOPICS COVERED
Problem Solving: Arithmetic, Algebra, Geometry, Word Problems, Statistics
Data Sufficiency: Sufficiency logic, combining statements, common traps
`;
```

---

## 4. Memory Agent

### Adaptation from Confide
The Memory Agent from `agents/prompts/memory.ts` is reused with adapted field names. Replace psychological profile fields with learner progress fields.

### Field Mapping

| Confide Field | Prepwise Field | Description |
|---------------|---------------|-------------|
| `updated_triggers` | `weak_topics` | Topics with ≥40% error rate over last 3 sessions |
| `what_worked` | `effective_techniques` | Explanation type that helped (visual, analogy, step-by-step) |
| `what_didnt_work` | `ineffective_approaches` | What didn't land — avoid in future sessions |
| `emotional_anchors` | `insight_moments` | Phrases/analogies that "clicked" for the learner |
| `topic_connections` | `concept_links` | Links between topics `{"algebra": ["percentages", "profit"]}` |
| `communication_style_notes` | `learning_style` | Prefers examples / theory / practice / visual |
| `key_themes` | `session_topics` | Topics covered this session |
| `follow_up` | `next_session_plan` | What to work on next session |
| `progress_notes` | `score_trajectory` | Accuracy trend by section over time |
| `new_people` | *(remove)* | Not needed |
| `response_preference_note` | `explanation_preference` | Questions vs direct explanation vs Socratic |

### Updated Interface

```typescript
// agents/gmat/memory.ts
interface GmatMemoryExtractionResult {
  weak_topics: string[]              // Topics with high error rate this session
  strong_topics: string[]            // Topics where learner excelled
  effective_techniques: string[]     // What explanation styles worked
  ineffective_approaches: string[]   // What didn't work
  insight_moments: string[]          // "Aha" moments — phrases that clicked
  concept_links: Record<string, string[]>  // Discovered connections between topics
  learning_style: string             // Updated observation on learning preferences
  explanation_preference: string | null    // Questions vs direct vs Socratic
  session_topics: string[]           // Main topics covered
  next_session_plan: string | null   // Recommended focus for next session
  score_trajectory: string | null    // Accuracy trend observation
  time_pressure_notes: string | null // How learner handles timed conditions
  common_error_patterns: string[]    // Recurring mistake types (e.g. "misreads DS question stem")
}
```

---

## 5. RAG Knowledge Base

### Source Materials

| Source | Priority | Namespace | What it provides |
|--------|----------|-----------|-----------------|
| GMAC Official GMAT Guide 2024/2025 | ★★★★★ | `gmat-quant`, `gmat-verbal` | Official problems with explanations — core of the knowledge base |
| GMAC Official GMAT Focus Edition Guide | ★★★★★ | `gmat-focus` | New 2024 format — critical for current test-takers |
| GMAC Official Verbal Review | ★★★★★ | `gmat-verbal` | 600+ verbal problems with detailed explanations |
| GMAC Official Quantitative Review | ★★★★★ | `gmat-quant` | 600+ quant problems with detailed explanations |
| Manhattan Prep GMAT Strategy Guides | ★★★★☆ | `gmat-strategy` | Section-by-section solving methodologies |
| Kaplan GMAT Prep Plus 2024 | ★★★★☆ | `gmat-strategy` | Test strategies and practice tests |
| GMAT Error Log Templates | ★★★☆☆ | `gmat-errors` | Error patterns for Memory Agent training |

### Pinecone Namespaces
```
gmat-quant       → Quantitative problems and methods
gmat-verbal      → Verbal problems and methods  
gmat-di          → Data Insights problems
gmat-awa         → Analytical Writing examples and rubrics
gmat-strategy    → General strategies, timing, test psychology
gmat-focus       → GMAT Focus Edition specific content
gmat-errors      → Common error patterns and how to avoid them
```

### Chunk Metadata Schema
```typescript
interface GmatChunkMetadata {
  source: string          // "Official GMAT Guide 2025"
  chapter: string         // "Chapter 4: Data Sufficiency"
  section: string         // "quant" | "verbal" | "data-insights" | "awa"
  topic: string           // "algebra" | "critical-reasoning" | etc.
  subtopic: string        // "quadratic equations" | "assumption questions" | etc.
  difficulty: "easy" | "medium" | "hard" | "700+"
  question_type?: string  // "PS" | "DS" | "CR" | "RC" | "SC"
  page?: number
}
```

### Indexing Script

```typescript
// scripts/gmat/ingest_books.ts
import { PineconeClient } from '@pinecone-database/pinecone'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { pipeline } from '@xenova/transformers'

const CHUNK_SIZE = 512
const CHUNK_OVERLAP = 64

async function ingestGmatBooks() {
  const pdfFiles = await fs.readdir('./scripts/gmat/data')
  
  for (const file of pdfFiles) {
    const text = await extractPdfText(`./scripts/gmat/data/${file}`)
    const chunks = await splitter.splitText(text)
    const namespace = detectNamespace(file) // 'gmat-quant', 'gmat-verbal', etc.
    
    for (const chunk of chunks) {
      const embedding = await embedder(chunk)
      await pinecone.upsert({
        namespace,
        vectors: [{ id: generateId(), values: embedding, metadata: extractMetadata(chunk, file) }]
      })
    }
  }
}
```

### Retrieval Test
After indexing, validate quality:
```bash
npx ts-node scripts/gmat/test_retrieval.ts
# Target: precision@5 ≥ 0.85 on 20 test queries
```

---

## 6. Deployment

### Strategy: Vercel (frontend) + Railway (agents)

Vercel has an 800-second serverless function limit — incompatible with long voice sessions. Split the stack:

#### Vercel — Frontend
- Next.js App Router (all pages, UI)
- API routes: auth, billing webhooks, short requests
- Edge functions for fast operations
- Static assets, PWA, i18n

**Why Vercel:** Already deploying Confide here (45 deployments). Zero-config for Next.js. Global CDN. Git push = deploy.

#### Railway — AI Backend
- AI agents (long-running, WebSocket, persistent)
- Memory Agent (background jobs after sessions)
- RAG indexing scripts
- Redis (session cache)

**Why Railway:** Persistent containers without time limits. No cold starts for agents. ~$15–40/month for MVP. Full infrastructure control.

### Railway Service Config

```yaml
# railway.yaml
services:
  - name: gmat-agents
    type: web
    startCommand: npx ts-node agents/server.ts
    
  - name: memory-worker  
    type: worker
    startCommand: npx ts-node agents/memory-worker.ts
    
  - name: redis
    type: redis
```

### Deploy Commands

```bash
# Frontend → Vercel
vercel --prod

# Agents backend → Railway  
railway login
railway init
railway up

# Add to Vercel env vars:
# RAILWAY_AGENT_URL=https://gmat-agents.railway.app
```

---

## 7. Payments — Paddle

### Why Paddle Instead of DodoPayments

Confide uses `@dodopayments/nextjs`. For Prepwise (US-focused product), switch to Paddle:

| Criterion | DodoPayments | Paddle |
|-----------|-------------|--------|
| Merchant of Record | Yes | Yes — Paddle legally sells on your behalf |
| US Sales Tax (all states) | Partial | Fully automatic |
| Transaction fee | ~4% | 5% + $0.50 (includes tax, VAT, disputes) |
| US market maturity | Developing | Mature — primary audience is US |
| Documentation | Limited | Extensive, active community |
| Vercel integration | Basic | Official partner |

### Migration Steps

```bash
# 1. Remove DodoPayments
npm uninstall @dodopayments/nextjs dodopayments

# 2. Install Paddle
npm install @paddle/paddle-js

# 3. Replace all imports in:
#    lib/billing/
#    app/api/webhooks/payments/
#    app/api/subscriptions/
#    components/billing/
```

### Pricing Plans

| Plan | Price | Trial | Included |
|------|-------|-------|----------|
| Starter | $49/month | 7 days | 20 sessions/month, Quant + Verbal basics |
| Pro | $99/month | 14 days | Unlimited sessions, all sections, priority memory, progress reports |
| Intensive | $199/month | 7 days | Pro + 90-day personalized plan, mock tests, AWA review |

### Paddle Setup

```typescript
// lib/billing/paddle.ts
import Paddle from '@paddle/paddle-js'

export const paddle = new Paddle({
  token: process.env.PADDLE_CLIENT_TOKEN!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
})

export const PADDLE_PRODUCTS = {
  starter:   process.env.PADDLE_PRODUCT_STARTER!,
  pro:       process.env.PADDLE_PRODUCT_PRO!,
  intensive: process.env.PADDLE_PRODUCT_INTENSIVE!,
}
```

```typescript
// app/api/webhooks/paddle/route.ts
import { paddle } from '@/lib/billing/paddle'

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature')
  const body = await req.text()
  
  const event = paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET!, signature!)
  
  switch (event.eventType) {
    case 'subscription.created':
      await activateSubscription(event.data)
      break
    case 'subscription.canceled':
      await deactivateSubscription(event.data)
      break
    case 'transaction.completed':
      await handlePayment(event.data)
      break
  }
  
  return Response.json({ received: true })
}
```

---

## 8. Repositories Reference

### Base Repository
```
Pha6ha007/Confide---Saas
https://github.com/Pha6ha007/Confide---Saas
Language: TypeScript (Next.js 14)
Status: Production (45 deployments on Vercel)
```

**What to reuse directly:**
- `agents/` — orchestrator pattern, memory agent
- `lib/` — ElevenLabs streaming, Supabase client, auth utilities
- `components/` — UI component library
- `app/(auth)/` — registration, login, onboarding
- `prisma/` — base schema (extend, don't rewrite)
- `e2e/` — 40 Playwright tests (adapt)
- `locales/` — i18n setup (EN only at launch)
- `scripts/` — PDF parsing utilities, indexing pipeline base

**What to replace:**
- `agents/prompts/` — rewrite all for GMAT domain
- `scripts/data/` — replace psychology books with GMAT books
- `app/(dashboard)/` — redesign for GMAT learning UI
- Branding, colors, copy

---

### Voice & Real-time

| Repo | Stars | Purpose | Use in Prepwise |
|------|-------|---------|----------------|
| [livekit/agents](https://github.com/livekit/agents) | 6.9k | Realtime voice AI framework, WebRTC, RAG plugins | Main voice agent framework. Has voice+RAG example in `/examples/voice_agents/llamaindex-rag` |
| [openai/whisper](https://github.com/openai/whisper) | 77k | Speech-to-text, best accuracy for accents | STT for learner voice input via Deepgram API |
| [elevenlabs/elevenlabs-python](https://github.com/elevenlabs/elevenlabs-python) | 2.1k | TTS SDK — already in Confide | Tutor voice. Character: Sam — experienced MBA coach sound |
| [livekit-rag-voice-agent](https://github.com/Arjunheregeek/livekit-rag-voice-agent) | — | Toolkit: LiveKit + RAG + multiple vector DBs | Reference architecture for voice agent with RAG |
| [RealTime Voice+RAG+Redis](https://github.com/RamziRebai/a-Realtime-Voice-to-Voice-Agentic-RAG-Application-using-LiveKit-and-Redis) | — | Full stack: voice + RAG + Redis memory + Next.js UI | Closest reference to target architecture. Study carefully |

---

### RAG Frameworks

| Repo | Stars | Purpose | Use in Prepwise |
|------|-------|---------|----------------|
| [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | 125k | LLM orchestration — already in Confide | Core RAG pipeline. Already installed: `@langchain/openai`, `@langchain/pinecone` |
| [run-llama/llama_index](https://github.com/run-llama/llama_index) | 46.5k | Data framework for LLMs, best for complex sources | Alternative to LangChain for indexing GMAT PDFs. Better at parsing book structure |
| [infiniflow/ragflow](https://github.com/infiniflow/ragflow) | 70k | RAG engine with deep document understanding | Use for initial PDF parsing before loading into Pinecone |
| [Open-TutorAI](https://github.com/Open-TutorAi/open-tutor-ai-CE) | — | Open-source educational platform: RAG + avatar + analytics | Study for pedagogical logic and lesson structure ideas |

---

### Vector Databases

| Repo | Stars | Purpose | Use in Prepwise |
|------|-------|---------|----------------|
| [pinecone-database](https://github.com/pinecone-io/pinecone-ts-client) | — | Already in Confide (`@pinecone-database/pinecone 5.1.2`) | Production vector DB. Namespaces: gmat-quant, gmat-verbal, gmat-di, gmat-awa |
| [supabase/supabase](https://github.com/supabase/supabase) | 80k | PostgreSQL + pgvector + Auth — already in Confide | Main DB (users, sessions, progress). pgvector for additional embeddings |
| [qdrant/qdrant](https://github.com/qdrant/qdrant) | 22k | Production-ready vector DB, better for self-hosting | Alternative to Pinecone if cost reduction needed at scale |
| [chroma-core/chroma](https://github.com/chroma-core/chroma) | 18k | Simple local vector DB for development | Local dev and RAG testing before deploying to Pinecone |

---

### UI & Tools

| Repo | Stars | Purpose | Use in Prepwise |
|------|-------|---------|----------------|
| [livekit/components-js](https://github.com/livekit/components-js) | — | React components for voice UI | Mic button, voice visualization, agent status indicators |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 85k | React UI — already used via radix-ui in Confide | Progress dashboard, topic cards, modal dialogs |
| [anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) | 4k | Claude API SDK | Main LLM for specialist agents (Claude Sonnet 4.6) |

---

## 9. Database Schema Changes

Add these tables to the existing Prisma schema from Confide. Do not modify existing tables.

```prisma
// prisma/schema.prisma — ADD to existing schema

model GmatSession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  startedAt     DateTime @default(now())
  endedAt       DateTime?
  durationMins  Int?
  
  agentUsed     String   // "quantitative" | "verbal" | "data_insights" | "writing" | "strategy"
  topicsCovered String[] // array of topics discussed
  questionsAsked Int     @default(0)
  correctAnswers Int     @default(0)
  
  transcript    String?  // full session transcript for Memory Agent
  memoryUpdated Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
}

model TopicProgress {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  section       String   // "quant" | "verbal" | "data-insights" | "awa"
  topic         String   // "algebra" | "critical-reasoning" | etc.
  subtopic      String?
  
  totalAttempts Int      @default(0)
  correctAttempts Int    @default(0)
  accuracy      Float    @default(0.0)  // 0.0 - 1.0
  
  lastPracticed DateTime?
  masteryLevel  String   @default("not_started") // "not_started" | "learning" | "practicing" | "mastered"
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([userId, section, topic, subtopic])
  @@index([userId])
}

model ErrorLog {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  sessionId     String?
  
  section       String
  topic         String
  questionType  String   // "PS" | "DS" | "CR" | "RC" | "SC" | "TPA" etc.
  difficulty    String   // "easy" | "medium" | "hard" | "700+"
  
  errorType     String   // "concept" | "careless" | "time_pressure" | "misread"
  errorDetail   String   // specific description of what went wrong
  correctApproach String? // how it should have been solved
  
  createdAt     DateTime @default(now())
  
  @@index([userId])
  @@index([userId, section])
}

model MockTest {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  takenAt       DateTime @default(now())
  durationMins  Int
  
  quantScore    Int?     // 60–90 scale
  verbalScore   Int?
  dataInsightsScore Int?
  totalScore    Int?     // 205–805 scale
  
  quantAccuracy Float?
  verbalAccuracy Float?
  diAccuracy    Float?
  
  notes         String?
  
  @@index([userId])
}

// Add to User model (extend existing):
// sessions    GmatSession[]
// topicProgress TopicProgress[]
// errorLogs   ErrorLog[]
// mockTests   MockTest[]
// gmatProfile Json?  // stores the GmatLearnerProfile from Memory Agent
```

---

## 10. Environment Variables

Complete `.env.local` for Prepwise (extends Confide):

```bash
# ── AI Models ──────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=                    # Claude Sonnet for specialist agents
GROQ_API_KEY=                         # llama-3.3-70b for orchestrator (fast, cheap)
OPENAI_API_KEY=                       # Fallback, embeddings if needed

# ── Voice ──────────────────────────────────────────────────────────────────
ELEVENLABS_API_KEY=                   # TTS for tutor voice
ELEVENLABS_VOICE_ID=                  # Sam persona voice ID
DEEPGRAM_API_KEY=                     # STT (Whisper under the hood)

# ── Vector DB ──────────────────────────────────────────────────────────────
PINECONE_API_KEY=
PINECONE_INDEX=gmat-tutor-prod
PINECONE_ENVIRONMENT=us-east-1-aws

# ── Database ───────────────────────────────────────────────────────────────
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                         # Supabase PostgreSQL connection string

# ── Payments ───────────────────────────────────────────────────────────────
PADDLE_CLIENT_TOKEN=                  # Frontend (public)
PADDLE_API_KEY=                       # Backend (secret)
PADDLE_WEBHOOK_SECRET=
PADDLE_PRODUCT_STARTER=
PADDLE_PRODUCT_PRO=
PADDLE_PRODUCT_INTENSIVE=
PADDLE_ENVIRONMENT=sandbox            # → production when live

# ── Email ──────────────────────────────────────────────────────────────────
RESEND_API_KEY=
RESEND_FROM_EMAIL=sam@prepwise.app

# ── Analytics ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ── App ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://prepwise.app
NEXT_PUBLIC_APP_NAME=Prepwise

# ── Infrastructure ─────────────────────────────────────────────────────────
RAILWAY_AGENT_URL=                    # Railway URL for AI agents backend
REDIS_URL=                            # Railway Redis for session cache

# ── Remove from Confide ────────────────────────────────────────────────────
# DODO_PAYMENTS_* → replaced by PADDLE_*
```

---

## 11. File Structure

Changes relative to `Confide---Saas`:

```
prepwise/
├── agents/
│   ├── crisis/              ← REMOVE (not needed for education)
│   ├── prompts/             ← KEEP base pattern, adapt
│   └── gmat/                ← NEW
│       ├── orchestrator.ts  ← Rewrite for GMAT routing
│       ├── quantitative.ts  ← New specialist agent
│       ├── verbal.ts        ← New specialist agent
│       ├── data_insights.ts ← New specialist agent
│       ├── writing.ts       ← New specialist agent
│       ├── strategy.ts      ← New specialist agent
│       └── memory.ts        ← Adapted Memory Agent (GMAT fields)
│
├── app/
│   ├── (auth)/              ← KEEP from Confide
│   ├── (dashboard)/
│   │   ├── session/         ← NEW: voice lesson UI
│   │   │   └── page.tsx
│   │   ├── progress/        ← NEW: topic progress dashboard
│   │   │   └── page.tsx
│   │   ├── practice/        ← NEW: text-based practice (no voice)
│   │   │   └── page.tsx
│   │   ├── mock-test/       ← NEW: full mock GMAT test
│   │   │   └── page.tsx
│   │   └── settings/        ← KEEP from Confide
│   └── api/
│       ├── agents/          ← NEW: agent API routes
│       ├── webhooks/
│       │   └── paddle/      ← NEW: replace dodo webhook
│       └── progress/        ← NEW: progress tracking API
│
├── components/
│   ├── session/             ← NEW: voice session UI components
│   │   ├── VoiceButton.tsx
│   │   ├── AgentStatus.tsx
│   │   ├── TranscriptView.tsx
│   │   └── SessionControls.tsx
│   ├── progress/            ← NEW: progress charts
│   │   ├── TopicHeatmap.tsx
│   │   ├── ScoreChart.tsx
│   │   └── SessionHistory.tsx
│   └── billing/             ← UPDATE: Paddle instead of Dodo
│
├── lib/
│   ├── gmat/                ← NEW
│   │   ├── scoring.ts       ← GMAT score calculation utilities
│   │   ├── difficulty.ts    ← Adaptive difficulty logic
│   │   ├── topics.ts        ← Topic taxonomy
│   │   └── analyzer.ts      ← Session analysis utilities
│   └── billing/             ← UPDATE: Paddle client
│       └── paddle.ts
│
├── prisma/
│   └── schema.prisma        ← EXTEND with GMAT tables
│
├── scripts/
│   └── gmat/                ← NEW
│       ├── data/            ← PDF books (gitignored)
│       ├── ingest_books.ts  ← PDF → Pinecone indexing
│       ├── chunk_pdf.ts     ← PDF chunking utilities
│       └── test_retrieval.ts ← RAG quality validation
│
└── e2e/                     ← ADAPT existing Playwright tests
    ├── session.spec.ts      ← New: voice session flow
    └── progress.spec.ts     ← New: progress tracking
```

---

## 12. MVP Roadmap — 6 Weeks

### Week 1–2: RAG + Agents
**Goal:** Working knowledge base and adapted agent system

- [ ] Fork `Pha6ha007/Confide---Saas` → rename to `prepwise`
- [ ] Create `agents/gmat/` with all 6 agents
- [ ] Rewrite `orchestrator.ts` for GMAT section routing
- [ ] Adapt `memory.ts` — replace psychological fields with GMAT learner fields
- [ ] Collect GMAT PDF books → `scripts/gmat/data/`
- [ ] Run indexing script → Pinecone (target: 6 books, ~4000 chunks)
- [ ] Test retrieval quality: `npx ts-node scripts/gmat/test_retrieval.ts`
- [ ] Validate: ask 20 GMAT questions → verify correct retrieval

**Definition of done:** Agent answers GMAT Quant question correctly with RAG context in console test

---

### Week 3–4: Voice Session UI
**Goal:** End-to-end voice lesson in browser

- [ ] Integrate LiveKit Agents + Deepgram STT
- [ ] Connect ElevenLabs TTS (create Sam voice persona)
- [ ] Build `app/(dashboard)/session/page.tsx` — lesson UI
- [ ] Voice button component (mic on/off, audio visualization)
- [ ] Agent status indicator (thinking, speaking, listening)
- [ ] Session transcript display
- [ ] Memory Agent runs automatically after session end
- [ ] Basic progress tracking: session saved to DB

**Definition of done:** Full 15-minute voice lesson from browser — tutor explains Quant topic, answers questions, session saved to DB

---

### Week 5: Payments + Onboarding
**Goal:** Complete monetization flow

- [ ] Remove DodoPayments, install Paddle
- [ ] Create 3 products in Paddle Dashboard (Starter/Pro/Intensive)
- [ ] Onboarding flow: diagnostic test to assess current level
- [ ] Subscription page with plan comparison
- [ ] Paddle webhook handler
- [ ] Trial logic: 7/14 days depending on plan
- [ ] Post-trial gating: redirect to upgrade if no subscription
- [ ] Test complete flow: register → onboard → trial → subscribe

**Definition of done:** New user can register, take diagnostic, start trial, upgrade to paid — all via Paddle

---

### Week 6: Launch Prep + First Users
**Goal:** First 10 paying users

- [ ] Deploy: `vercel --prod` + `railway up`
- [ ] Configure all production env vars
- [ ] Run Playwright e2e tests on production
- [ ] Set up error monitoring (Sentry or PostHog)
- [ ] Post in r/GMAT, r/MBA, r/ApplyingToBS (valuable content, not spam)
- [ ] DM 10 users currently asking for GMAT help on Reddit
- [ ] Collect feedback from 5+ beta users
- [ ] Iterate on critical issues
- [ ] Set price: $79/month for Pro

**Definition of done:** 3+ paying users, NPS ≥ 7/10, no critical bugs

---

## 13. YouTube + AI Avatar Strategy

### Channel Concept
YouTube channel with AI avatar that visually represents the in-app tutor (Sam). The avatar is both a product demo and organic acquisition channel. People share videos because of the novelty of AI teaching GMAT.

### Content Formats

| Format | Example Title | Goal |
|--------|--------------|-------|
| Quick concept | "GMAT Quant: Probability in 8 minutes" | SEO traffic from study searches |
| Experiment | "I used AI to study for GMAT for 30 days. Here's what happened" | Viral potential |
| Free walkthrough | "GMAT Critical Reasoning: Full tutorial with 5 problems" | Lead generation |
| News/update | "GMAT Focus Edition 2024: Everything That Changed" | Timely search traffic |
| Feature demo | "How Prepwise AI Remembers Your Mistakes (and fixes them)" | Product awareness |
| Shorts | 60-second problem walkthrough | Reach / algorithm boost |

**Posting cadence:** 1 video per week + 2 Shorts

### AI Avatar Tools

| Tool | Price | Best For |
|------|-------|---------|
| [HeyGen](https://heygen.com) | $29–89/month | Most realistic video avatar, best for YouTube |
| [D-ID](https://d-id.com) | $5.99–49/month | Faster and cheaper, good for Shorts |
| [Synthesia](https://synthesia.io) | $22–67/month | Corporate style, good for educational content |
| [Tavus](https://tavus.io) | Custom | Most realistic personalized avatar |

**Recommendation for MVP:** Start with HeyGen ($29/month). Create Sam — professional, confident, 30-something avatar that matches the in-app tutor character.

### First 30 Days Plan

**Week 1:**
- Create channel "Prepwise — GMAT AI Tutor"
- Record intro video with avatar: "Meet Sam, your AI GMAT tutor"
- Post in r/GMAT with valuable post (not promo): "Here's how I approach Data Sufficiency problems"

**Week 2:**
- 2 tutorial videos (Quant walkthrough + Verbal walkthrough)
- Find 10 beta users from Reddit (DM people asking for GMAT help)
- Collect feedback from beta users

**Week 3:**
- Product Hunt launch
- Hacker News: "Show HN: Prepwise — AI voice tutor for GMAT with long-term memory"
- Reddit experiment post: "I built an AI GMAT tutor. First 50 users get free month"
- 1 Shorts video

**Week 4:**
- Collect testimonials from beta users
- First paying subscribers
- Launch referral program: "Refer a friend — both get 1 free month"
- Reach out to GMAT bloggers for product review

---

## 14. Quick Start for GSD-2 / Claude Code

### Step 1: Clone and Setup
```bash
git clone https://github.com/Pha6ha007/Confide---Saas prepwise
cd prepwise
npm install
cp .env.example .env.local
# Fill in env vars (see Section 10)
npx prisma db push
npm run dev
```

### Step 2: Index GMAT Materials
```bash
mkdir -p scripts/gmat/data
# Place GMAT PDF books in scripts/gmat/data/
npx ts-node scripts/gmat/ingest_books.ts
# Validate: npx ts-node scripts/gmat/test_retrieval.ts
```

### Step 3: Adapt Agents (GSD-2 tasks)
```
Read the entire agents/ directory and understand the Confide architecture.
Then create agents/gmat/ with the following files:
- orchestrator.ts: route by GMAT section (quant/verbal/data-insights/writing/strategy)
- quantitative.ts: GMAT Quant specialist (PS + DS)
- verbal.ts: GMAT Verbal specialist (CR + RC + SC)  
- data_insights.ts: GMAT DI specialist (TPA + MSR + GI + TA)
- writing.ts: AWA specialist
- strategy.ts: exam strategy and timing specialist
- memory.ts: adapt memory.ts replacing psychological fields with GMAT learner fields
```

### Step 4: Replace DodoPayments → Paddle
```
Replace all DodoPayments references with Paddle:
- Remove: @dodopayments/nextjs, dodopayments packages
- Install: @paddle/paddle-js
- Update: lib/billing/, app/api/webhooks/, components/billing/
- Create: 3 Paddle products (Starter $49, Pro $99, Intensive $199)
```

### Step 5: Extend Prisma Schema
```
Add to prisma/schema.prisma (do not modify existing tables):
- GmatSession model
- TopicProgress model  
- ErrorLog model
- MockTest model
- Add relations to existing User model
Run: npx prisma db push
```

### Step 6: Build Session UI
```
Create app/(dashboard)/session/page.tsx
Use existing components from Confide as base.
Add new components in components/session/:
- VoiceButton.tsx (mic control)
- AgentStatus.tsx (listening/thinking/speaking states)
- TranscriptView.tsx (real-time transcript)
```

### Step 7: Deploy
```bash
# Frontend
vercel --prod

# Add env var in Vercel dashboard:
# RAILWAY_AGENT_URL = <your railway URL>

# Backend agents
railway login && railway init
railway up
```

---

### Priority Task List for GSD-2

Copy-paste this list as your task queue:

```
1. Read agents/ directory — understand Confide orchestrator and memory architecture
2. Create agents/gmat/orchestrator.ts — GMAT section routing (adapt from Confide)
3. Create agents/gmat/memory.ts — replace psychological fields with GMAT learner fields
4. Create agents/gmat/quantitative.ts — PS and DS specialist
5. Create agents/gmat/verbal.ts — CR, RC, SC specialist
6. Create agents/gmat/data_insights.ts — TPA, MSR, GI, TA specialist
7. Create agents/gmat/writing.ts — AWA specialist
8. Create agents/gmat/strategy.ts — timing and strategy specialist
9. Extend prisma/schema.prisma — add GmatSession, TopicProgress, ErrorLog, MockTest
10. Run npx prisma db push — apply schema changes
11. Replace DodoPayments with Paddle in all files
12. Create lib/billing/paddle.ts — Paddle client setup
13. Update app/api/webhooks/ — Paddle webhook handler
14. Create scripts/gmat/ingest_books.ts — PDF indexing pipeline
15. Create scripts/gmat/test_retrieval.ts — RAG quality validation
16. Build app/(dashboard)/session/page.tsx — voice lesson UI
17. Build app/(dashboard)/progress/page.tsx — progress dashboard
18. Create components/session/ — VoiceButton, AgentStatus, TranscriptView
19. Adapt e2e/ Playwright tests for new flows
20. Deploy: Vercel (frontend) + Railway (agents backend)
```

---

## 15. Metrics

### Launch Targets

| Metric | Week 6 | Month 2 | Month 3 |
|--------|--------|---------|---------|
| Registrations | 10–20 (beta) | 50–100 | 150–300 |
| Trial → Paid | — | 15–20% | 20–25% |
| MRR | $0 (free beta) | $300–600 | $1,000–2,500 |
| 7-day Retention | — | 45%+ | 50%+ |
| NPS | — | ≥40 | ≥50 |
| Avg session duration | — | 25+ min | 30+ min |
| YouTube subscribers | — | 200+ | 500+ |

### Unit Economics

```
Cost per AI session (estimate):
- Claude Sonnet (agent): ~$0.04
- ElevenLabs TTS (30 min): ~$0.15
- Deepgram STT (30 min): ~$0.05
- Pinecone retrieval: ~$0.01
Total per session: ~$0.25

Pro plan: $99/month
Estimated sessions per user/month: 20
Total AI costs per user: $5.00
Gross margin: ~95%
```

---

*Prepwise Documentation v1.0.0 | March 2026*  
*Base: Pha6ha007/Confide---Saas | Target: prepwise.app*

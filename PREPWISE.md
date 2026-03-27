# PREPWISE — AI-Powered GMAT Voice Tutor
> **Version: 2.0** | March 2026  
> **Status: In active development — deployed on Vercel**  
> **Stack:** Next.js 14 + TypeScript | Vercel + Railway | Paddle | Pinecone + Supabase + Prisma

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Competitive Analysis](#2-competitive-analysis)
3. [Question Bank](#3-question-bank)
4. [Architecture](#4-architecture)
5. [Agent System & Sam](#5-agent-system--sam)
6. [Sam Coaching Features](#6-sam-coaching-features)
7. [Memory System](#7-memory-system)
8. [RAG Knowledge Base](#8-rag-knowledge-base)
9. [Practice & Learning Flow](#9-practice--learning-flow)
10. [Pre-Exam Mode](#10-pre-exam-mode)
11. [Database Schema](#11-database-schema)
12. [Environment Variables](#12-environment-variables)
13. [Deployment](#13-deployment)
14. [Payments](#14-payments)
15. [Security](#15-security)
16. [File Structure](#16-file-structure)
17. [Generation Scripts](#17-generation-scripts)
18. [Metrics & Targets](#18-metrics--targets)

---

## 1. Product Overview

### Concept
PrepWISE is a voice AI tutor for GMAT preparation. Students speak with a personalized AI teacher (Sam) through a browser — like a live tutoring session, but the teacher is AI. Sam remembers every session, adapts to weak spots, coaches contextually, and explains material in real time using RAG over official GMAT guides.

### Key Differentiators
No competitor combines all five:
1. **Voice interaction** — talk to Sam like a real tutor
2. **Long-term memory** — Sam remembers your history across all sessions
3. **RAG over official GMAT content** — answers grounded in real test material
4. **Contextual micro-coaching** — Sam intervenes at the right moments, not just on demand
5. **Progress anchor** — "you went from 45% to 71% on DS" — not generic praise

### Target Audience

| Segment | Profile | Pain |
|---------|---------|------|
| **Primary** | US professionals 27–33, preparing for MBA | $150–200/hr human tutor — too expensive |
| **Secondary** | International students (India, China, Europe) | No quality English-speaking tutors available |

**Typical user:** Studies evenings and weekends (1–2 hrs/day), 2–4 months of prep, target score 700+.

### Market
- GMAT prep market: **$798M projected by 2027** (CAGR 9%)
- ~85,000 GMAT test-takers annually in the US
- Average human tutor: $150–200/hr
- PrepWISE price: $39–149/month (5–10× cheaper)

---

## 2. Competitive Analysis

### Feature Comparison

| Feature | PrepWISE | Magoosh | Manhattan Prep | GMAT Club | Target Test Prep | E-GMAT |
|---------|----------|---------|---------------|-----------|-----------------|--------|
| **Voice AI tutor** | ✅ Sam — real-time voice | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Long-term memory** | ✅ Full session history | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Contextual micro-coaching** | ✅ Before each question | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Socratic debrief** | ✅ After wrong answers | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Weekly progress review** | ✅ Sam narrates it | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pre-exam mode** | ✅ 7-day countdown | ❌ | ❌ | ❌ | ❌ | ❌ |
| **RAG over official guides** | ✅ 7 Pinecone namespaces | ❌ | ❌ | ❌ | ❌ | ❌ |
| **All GMAT Focus sections** | ✅ Q + V + DI | ✅ | ✅ | ✅ | ✅ | ✅ V+Q |
| **Question explanations** | ✅ 100% coverage | ✅ | ✅ | Partial | ✅ | ✅ |
| **Spaced repetition** | ✅ FSRS algorithm | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mock tests** | ✅ | ✅ (6) | ✅ (6) | ✅ | ✅ | ✅ |
| **Score prediction** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Price/month** | **$39–149** | $179 (6mo) | $249 (3mo) | Free/forums | $199 | $99+ |
| **Personalization** | ✅ Deep (memory-based) | Basic | Basic | None | Adaptive | Moderate |

### Question Bank Comparison

| Platform | PS/Quant | DS | CR | RC | GI | MSR | TA | TPA | **Total** | All w/ explanations |
|----------|---------|----|----|----|----|-----|----|-----|-----------|---------------------|
| **PrepWISE** | **1,500** | **400** | **5,138** | **672** | **140** | **105** | **98** | **126** | **🏆 8,179** | **✅ 8,172 (99.9%)** |
| Magoosh | ~600 | ~200 | ~600 | ~200 | ~50 | ~50 | ~50 | ~50 | ~1,800 | ✅ |
| Manhattan Prep | ~1,200 | ~400 | ~800 | ~400 | ~100 | ~100 | ~100 | ~100 | ~3,200 | ✅ |
| Target Test Prep | ~1,000 | ~300 | ~700 | ~300 | ~100 | ~80 | ~80 | ~80 | ~2,640 | ✅ |
| GMAT Official Guide | ~700 | ~230 | ~700 | ~140 | ~75 | ~45 | ~45 | ~45 | ~1,980 | ✅ |
| GMAT Club (free) | ~500 | ~200 | ~2,000 | ~500 | ~100 | ~50 | ~50 | ~50 | ~3,450 | ⚠️ partial |

**PrepWISE has the largest question bank of any GMAT prep platform — and all questions have AI-generated explanations.**

### Pricing Comparison

| Platform | Price | Questions | Voice AI | Memory |
|----------|-------|-----------|----------|--------|
| **PrepWISE Starter** | **$39/mo** | 8,179 | ✅ | ✅ |
| **PrepWISE Pro** | **$79/mo** | 8,179 | ✅ | ✅ |
| **PrepWISE Intensive** | **$149/mo** | 8,179 | ✅ | ✅ |
| Magoosh | $179 (6-mo) | ~1,800 | ❌ | ❌ |
| Manhattan Prep | $249 (3-mo) | ~3,200 | ❌ | ❌ |
| Target Test Prep | $199/mo | ~2,640 | ❌ | ❌ |
| Human tutor | $150–200/hr | — | Human | Human |

**PrepWISE is 5–10× cheaper than competitors and the only platform with voice AI + memory.**

### What No Competitor Does
- Sam remembers your error patterns and warns you **before** you repeat them
- Sam generates a personalized weekly review in natural language — not a dashboard
- Sam adapts its opening greeting every session based on what happened last time
- Pre-exam mode kicks in automatically 7 days before test date with AI coaching
- Socratic debrief: "You chose C — walk me through your thinking" after wrong answers

---

## 3. Question Bank

### Current State (March 2026)

| Type | Section | Count | With Explanations | Source |
|------|---------|-------|-------------------|--------|
| **PS** (Problem Solving) | Quant | 1,500 | 1,493 (99.5%) | 500 generated + 1,000 AquaRat |
| **DS** (Data Sufficiency) | Data Insights | 400 | 400 (100%) | Generated |
| **CR** (Critical Reasoning) | Verbal | 5,138 | 5,138 (100%) | 500 generated + 4,638 ReClor |
| **RC** (Reading Comprehension) | Verbal | 672 | 672 (100%) | 218 passages generated |
| **GI** (Graphics Interpretation) | Data Insights | 140 | 140 (100%) | Generated |
| **MSR** (Multi-Source Reasoning) | Data Insights | 105 | 105 (100%) | Generated |
| **TA** (Table Analysis) | Data Insights | 98 | 98 (100%) | Generated |
| **TPA** (Two-Part Analysis) | Data Insights | 126 | 126 (100%) | Generated |
| **TOTAL** | | **8,179** | **8,172 (99.9%)** | |

### Difficulty Distribution
All generated question types include:
- `easy` — basic application (20–25%)
- `medium` — standard GMAT difficulty (40–45%)
- `hard` — above average, requires careful reasoning (25–30%)
- `700+` — top percentile, edge cases and nuanced traps (8–12%)

### RC Passages
218 passages covering 5 topic domains:
- Business (strategy, markets, regulation, corporate governance)
- Science (biology, physics, climate, neuroscience)
- Social science (economics, psychology, sociology, anthropology)
- Humanities (history, literature, philosophy, art)
- Technology (AI, biotech, computing, energy)

Average 3.1 questions per passage. All passages 250–350 words (GMAT Focus standard).

### Data Files
```
data/questions/
├── gen-quant-ps.json    — 500 PS questions
├── aqua-rat.json        — 1,000 PS questions (AquaRat dataset)
├── gen-ds.json          — 400 DS questions
├── gen-cr.json          — 500 CR questions
├── reclor-verbal.json   — 4,638 CR questions (ReClor dataset, 100% explained)
├── gen-rc.json          — 218 RC passages / 672 questions
├── gen-gi.json          — 140 GI questions
├── gen-msr.json         — 105 MSR questions
├── gen-ta.json          — 98 TA questions
└── gen-tpa.json         — 126 TPA questions
```

### Generation Scripts
```bash
# Generate new questions by type
npx ts-node scripts/gmat/generate_questions.ts --type [gi|msr|tpa|ta|rc|all]

# Generate ReClor explanations in batches
npx ts-node scripts/gmat/generate_reclor_explanations.ts --offset 0 --limit 1000

# Validate generated questions
npx ts-node scripts/gmat/validate_generated.ts
```

---

## 4. Architecture

### Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Radix UI | App Router |
| Auth & DB | Supabase (Auth + PostgreSQL) | Row-Level Security enabled |
| ORM | Prisma 6 | 20 models (16 base + 4 GMAT) |
| AI Agents | 5 specialist agents + orchestrator | Via OpenRouter (Claude/GPT-4o) |
| RAG | Pinecone (7 namespaces) + OpenAI embeddings | text-embedding-3-small |
| STT | Deepgram API | Whisper-based |
| TTS | ElevenLabs JS SDK | Voice persona: Sam |
| Memory | GMAT Memory Agent | Learner profile in Supabase `gmat_profile` JSON |
| Payments | Paddle (Dodo Payments migrated) | Webhook verified |
| Email | Resend | Welcome email |
| Analytics | PostHog | Event tracking |
| PWA | next-pwa | Offline support |
| Tests | Playwright | e2e smoke tests |
| State | Zustand | Client state |
| Deploy | Vercel (frontend) + Railway (agents) | Auto-deploy from main |

### Data Flow
```
User (voice)
  → Deepgram STT
  → /api/agents/stream (Next.js)
  → routeToGmatAgent() — keyword-based routing + profile boost
  → Specialist Agent prompt (Claude/GPT-4o via OpenRouter)
    + RAG context from Pinecone (primary + secondary namespace)
  → SSE stream → frontend
  → ElevenLabs TTS (sentence-level streaming)
  → User (audio)
  → [after session] Memory Agent → mergeGmatProfile() → Supabase gmat_profile
```

### Models in Use
| Client | Model | Usage |
|--------|-------|-------|
| `agentClient` | `anthropic/claude-sonnet-4` (via OpenRouter) | Sam tutoring responses |
| `routerClient` | `llama-3.3-70b-versatile` (Groq) | Fast orchestrator routing |
| `embeddingClient` | `text-embedding-3-small` (OpenAI) | RAG indexing & retrieval |
| Generation scripts | `openai/gpt-4o` (via OpenRouter) | Question generation |
| Explanation scripts | `openai/gpt-4o-mini` (via OpenRouter) | ReClor explanations (cost-optimized) |

---

## 5. Agent System & Sam

### Character
Sam is a direct, warm GMAT tutor — 15 years of coaching experience, no generic praise, no filler. Sam speaks like a person, not a dashboard. Sam remembers everything.

### Agent Registry

| Agent | Activates When | Model |
|-------|---------------|-------|
| `quantitative` | PS problems, algebra, arithmetic, statistics | Claude Sonnet |
| `verbal` | CR, RC, arguments, passages | Claude Sonnet |
| `data_insights` | DS, TPA, MSR, GI, TA, graphs, tables | Claude Sonnet |
| `strategy` | Timing, study planning, test anxiety, meta questions | Claude Sonnet |
| `orchestrator` | Every message — invisible router | Groq llama-3.3-70b |
| `memory` | After every session — background extraction | GPT-4o-mini |

### Routing Logic
`routeToGmatAgent()` in `agents/gmat/orchestrator.ts`:
1. Keyword scoring across 4 signal sets (quant/verbal/di/strategy)
2. Learner profile boost — weak topics get +0.2 to relevant agent
3. Emotional state detection → overwhelmed boosts strategy
4. Default to `quantitative` when confidence < 0.4

### Streaming
`/api/agents/stream` returns SSE with three event types:
```
data: {"type": "routing", "agentType": "verbal", "topic": "critical-reasoning"}
data: {"type": "token", "content": "The premise..."}
data: {"type": "done", "fullResponse": "..."}
```
TTS queues complete sentences as they arrive — no waiting for full response.

---

## 6. Sam Coaching Features

Five live coaching surfaces implemented as of March 2026:

### 1. Micro-Coaching Tip Before Questions
**File:** `components/practice/MicroCoachTip.tsx`  
**Logic:** `lib/gmat/micro-coaching.ts` (pure rule-based, no AI)

Before each question in practice mode, Sam shows a contextual tip based on the student's error history from localStorage:
- DS: "Test Statement 1 alone first — you've combined statements early 4 times"
- CR: "Identify conclusion before reading answer choices"
- RC: "You've averaged 2:40/question. Target is 1:57"

Shows only when ≥2 errors on this type/topic. Max 3 shows per tip. Dismissible.

### 2. Socratic Debrief After Wrong Answers
**File:** `components/practice/SocraticDebrief.tsx`

After an incorrect answer, Sam asks: *"You chose C — what was your reasoning?"*  
Student selects error type (misidentified / missed detail / time pressure / careless / concept gap).  
Sam returns a targeted micro-lesson for that specific error type, with reference to what broke down.

### 3. Post-Practice Progress Anchor
**File:** `components/practice/SamMotivator.tsx`  
**API:** `/api/agents/sam-reflect` (POST)

After each practice session, Sam calls the DB to compare current accuracy against historical `TopicProgress` and generates a specific delta statement:
> *"DS went from 45% to 71% over the past two weeks — that's real movement, not noise. RC timing is still the gap: 2:40 vs 1:57 target."*

Uses Claude directly (not Railway fallback). Includes TTS listen button.

### 4. Weekly Progress Review
**File:** `components/dashboard/WeeklyReview.tsx`  
**API:** `/api/weekly-review` (GET)

Shown Sunday/Monday on both session and practice pages. Sam generates a 150–200 word review with:
- Specific accuracy delta vs prior week (+12pp, -5pp — honest either way)
- #1 focus area for next week with reasoning
- Realistic score range estimate ("At this level, ~630–650. Gap to 700 is RC timing")
- No "Great job!" — direct and warm

Has TTS listen button. Dismissible weekly.

### 5. Personalized Session Opening
**API:** `/api/agents/session-start` (GET)

When student starts a voice session, Sam generates a specific greeting using their learner profile:
> *"Back after 3 days — last time we pushed DS hard. Your test is in 18 days, so let's keep that pressure. RC is still the weakest section — want to start there?"*

Falls back to generic greeting if no profile exists yet.

### 6. Pre-Exam AI Coaching (see Section 10)

---

## 7. Memory System

### GmatLearnerProfile
Stored as JSON in `users.gmat_profile` column.

```typescript
interface GmatLearnerProfile {
  weakTopics: string[]            // ≥40% error rate over last 3 sessions
  strongTopics: string[]
  effectiveTechniques: string[]   // what explanation styles worked
  ineffectiveApproaches: string[]
  insightMoments: string[]        // phrases that "clicked" — kept last 20
  conceptLinks: Record<string, string[]>
  learningStyle: string
  explanationPreference: string | null
  sessionTopics: string[]         // last 50 topics
  nextSessionPlan: string | null
  scoreTrajectory: string | null
  timePressureNotes: string | null
  commonErrorPatterns: string[]
  targetScore: number | null      // 205–805
  currentEstimatedScore: number | null
  studyHoursPerWeek: number | null
  testDate: string | null         // ISO date
  preferredDifficulty: 'easy' | 'medium' | 'hard' | '700+' | null
}
```

### Memory Update Flow
After every session ends:
1. Full transcript sent to Memory Agent (GPT-4o-mini)
2. `buildGmatMemoryPrompt()` extracts new learning data
3. `mergeGmatProfile()` merges — never overwrites, only adds
4. If topic appears in `strong_topics` this session → removed from `weak_topics`
5. `insightMoments` capped at 20, `sessionTopics` at 50

### Memory Used In
- Session opening greeting (session-start API)
- Orchestrator routing boost (weak topics → relevant agent)
- Sam-reflect post-practice analysis
- Weekly review data summary
- Pre-exam coaching context
- Specialist agent prompts (`{learnerProfile}` injected)

---

## 8. RAG Knowledge Base

### Pinecone Namespaces

| Namespace | Content | Used By |
|-----------|---------|---------|
| `gmat-quant` | Quantitative methods, problem solving strategies | quantitative agent |
| `gmat-verbal` | CR frameworks, RC strategies, argument analysis | verbal agent |
| `gmat-di` | Data Insights approaches, DS decision tree | data_insights agent |
| `gmat-strategy` | Timing, test psychology, study planning | strategy agent |
| `gmat-errors` | Common error patterns and corrections | all agents (secondary) |
| `gmat-focus` | GMAT Focus Edition specific content | all agents (secondary) |
| `gmat-awa` | Writing rubrics and examples | strategy agent |

### Retrieval
`lib/pinecone/retrieval.ts` — `retrieveContext()`:
- Primary namespace (5 chunks) + secondary namespace (reranked)
- Reranker: `lib/pinecone/reranker.ts` — Cohere rerank
- Context formatted into `<gmat_knowledge>` blocks injected into agent prompt

### RAG Content Sources
- Deep Quant + DI study guide: `data/rag/deep-quant-di.json` (50 chunks, 500–800 words each)
- Deep Verbal + Errors guide: `data/rag/deep-verbal-errors.json` (50 chunks)
- Official GMAT materials (indexed via `scripts/gmat/ingest_books.ts`)

---

## 9. Practice & Learning Flow

### Practice Page (`/dashboard/practice`)
1. **Setup** — choose section, type, difficulty, question count, timed mode
2. **SmartReviewPanel** — FSRS spaced repetition: shows topics due for review
3. **WeeklyReview** — Sam's weekly nudge (if Sunday/Monday or no recent activity)
4. **Question** — `QuestionCard` with optional timer
   - `MicroCoachTip` shown above question (if error history exists)
5. **Explanation** — `ExplanationPanel` after submission
   - `SocraticDebrief` for wrong answers (error type selection → micro-lesson)
   - `AudioExplanation` — TTS of the explanation
6. **Summary** — `PracticeSummary`
   - `SamMotivator` — AI progress anchor at top
   - Accuracy by section, by type, weakest topics
   - "Ask Sam to review" → session page with context

### Session Page (`/dashboard/session`)
Full voice conversation with Sam. Streaming TTS per sentence. Supports text fallback.
- `WeeklyReview` shown at top of message area
- Personalized opening greeting from `/api/agents/session-start`
- Agent routing visible in header (Quant / Verbal / Data Insights / Strategy)

### FSRS Spaced Repetition
`lib/gmat/spaced-repetition.ts` — Free Spaced Repetition Scheduler algorithm.  
`/api/review` — GET (fetch schedule) + POST (update after answer).  
`SmartReviewPanel` shows topics due now, due today, and mastered.

### Progress Dashboard (`/dashboard/progress`)
- `TopicHeatmap` — accuracy by topic, color-coded
- `ScorePredictor` — estimated current GMAT score
- `ErrorAnalysis` — error type breakdown
- `TimingAnalytics` — avg time per question type vs targets

---

## 10. Pre-Exam Mode

Activates automatically when `testDate` is within 7 days.

### Components
- `components/dashboard/PreExamBanner.tsx` — amber countdown banner in dashboard layout
- `lib/gmat/pre-exam.ts` — 7-day plan generator (pure, no AI)
- `/api/pre-exam-coaching` (GET) — AI-generated Sam message for today

### Daily Plan Structure
| Day | Focus | Activities | Duration |
|-----|-------|------------|----------|
| 7 | Weakest topic targeted drill | Error log review, formula refresh | 60 min |
| 6 | Full Mock Test #N | Timed, full simulation | 150 min |
| 5 | Mock review + 2nd weak area | Error categorization, targeted drill | 60 min |
| 4 | 3rd weak area + mixed practice | 15 mixed questions timed | 45 min |
| 3 | Full Mock Test #N+1 | Last dress rehearsal | 150 min |
| 2 | Light review only | Formula sheet, no new problems | 30 min |
| 1 | Rest | No studying. Logistics only. | 0 min |

### AI Coaching Message
`/api/pre-exam-coaching` loads:
- Mock test scores, week accuracy, weak topics, error patterns, target score, days to exam
- Generates a Sam message specific to today's countdown day
- "Stop. DS works when you follow the process — 85% when you do. Today: 30 min RC pacing, then rest."

Has TTS "Listen to Sam" button. Falls back to static mindset tip on API error.

---

## 11. Database Schema

### GMAT-Specific Tables (added to base Confide schema)

#### GmatSession
Records every voice/chat session. Memory Agent reads `transcript` after session end.
```
id, userId, startedAt, endedAt, durationMins
agentUsed, topicsCovered[], questionsAsked, correctAnswers
transcript (Text), memoryUpdated (Bool)
```

#### TopicProgress
Per-topic accuracy tracking. Powers FSRS, SmartReviewPanel, progress dashboard.
```
id, userId, section, topic, subtopic
totalAttempts, correctAttempts, accuracy (Float)
lastPracticed, masteryLevel (not_started|learning|practicing|mastered)
Unique: [userId, section, topic, subtopic]
```

#### ErrorLog
Detailed error records with type and approach. Feeds micro-coaching tip logic.
```
id, userId, sessionId, section, topic, questionType, difficulty
errorType (concept|careless|time_pressure|misread)
errorDetail, correctApproach
```

#### MockTest
Full mock test results for score tracking and progress dashboard.
```
id, userId, takenAt, durationMins
quantScore, verbalScore, dataInsightsScore, totalScore
quantAccuracy, verbalAccuracy, diAccuracy, notes
```

#### StudyJournalEntry
Daily aggregated stats. `samInsight` auto-generated after last session of each day.
```
id, userId, date (Date — unique per user per day)
totalMinutes, sessionsCount, questionsTotal, questionsCorrect, accuracy
topicsCovered[], sectionsWorked[], errorsCount, errorTypes (JSON)
samInsight (Text), milestones[], userNote, confidenceLevel
```

### User Extensions
On existing `User` model:
- `gmatProfile Json` — stores full `GmatLearnerProfile` object
- Relations to all 4 GMAT tables above

---

## 12. Environment Variables

```bash
# ── AI ─────────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY=         # Primary AI provider (Claude, GPT-4o)
OPENROUTER_MODEL=           # e.g. anthropic/claude-sonnet-4
GROQ_API_KEY=               # Fast orchestrator routing
GROQ_MODEL=                 # llama-3.3-70b-versatile
OPENAI_API_KEY=             # Embeddings (text-embedding-3-small)

# ── Voice ──────────────────────────────────────────────────────────────────
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=        # Sam's voice
DEEPGRAM_API_KEY=           # STT

# ── Vector DB ──────────────────────────────────────────────────────────────
PINECONE_API_KEY=
PINECONE_INDEX_NAME=        # e.g. gmat-tutor-prod
PINECONE_ENVIRONMENT=

# ── Database ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=               # Supabase PostgreSQL direct URL

# ── Payments ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_PRODUCT_STARTER=
NEXT_PUBLIC_PADDLE_PRODUCT_PRO=
NEXT_PUBLIC_PADDLE_PRODUCT_INTENSIVE=

# ── Email ──────────────────────────────────────────────────────────────────
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# ── Analytics ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ── App ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://prepwise.app

# ── Infrastructure ─────────────────────────────────────────────────────────
RAILWAY_AGENT_URL=          # Railway agents backend URL
RAILWAY_AGENT_SECRET=       # Auth token for Railway
```

---

## 13. Deployment

### Frontend — Vercel
- Auto-deploys on push to `main`
- All Next.js pages and API routes
- Short-lived operations only (auth, billing, practice API)

### Agents Backend — Railway
- Long-running agent processes without timeout limits
- `railway.yaml` defines services:
  - `gmat-agents` — HTTP server (`agents/server.ts`)
  - `memory-worker` — background session analysis (`agents/memory-worker.ts`)

### Deploy Commands
```bash
# Frontend
git push origin main  # Vercel auto-deploys

# Agents backend
railway login
railway up

# Database migrations
npx prisma migrate deploy
```

---

## 14. Payments

### Plans

| Plan | Price | Trial | Key Features |
|------|-------|-------|-------------|
| Starter | $39/mo | 7 days | 20 sessions/month, Quant + Verbal |
| Pro | $79/mo | 7 days | Unlimited sessions, all sections, mock tests, smart review |
| Intensive | $149/mo | 7 days | Pro + personalized plan, score prediction, audio explanations |

### Webhook Events Handled
- `subscription.created` → activate plan
- `subscription.canceled` → deactivate
- `subscription.updated` → plan change
- `transaction.completed` → one-time payments

### Trial Logic (`lib/billing/trial.ts`)
- 7-day free trial, no credit card required
- `trialStartDate`, `trialEndDate` on User model
- `getTrialStatus()` → `active | expired | none`
- `TrialBanner` component shown in sidebar with days remaining

---

## 15. Security

### Implemented (March 2026)
- **Row-Level Security** — Supabase RLS on all user data tables
- **Rate limiting** — per-user per-endpoint (DB-backed, not Redis)
- **Content Security Policy** — strict CSP headers via Next.js
- **HSTS** — strict transport security with 1-year max-age
- **Permissions Policy** — camera/microphone scoped to self
- **Paddle webhook verification** — signature checked before processing
- **Auth guard middleware** — all `/dashboard/*` routes protected
- **Automated scanning** — Dependabot + npm audit in CI

See `SECURITY.md` for full architecture.

---

## 16. File Structure

```
prepwise/
├── agents/gmat/
│   ├── index.ts              — exports all agent prompts
│   ├── orchestrator.ts       — routing logic + GmatRoutingDecision
│   ├── quantitative.ts       — PS/DS specialist
│   ├── verbal.ts             — CR/RC specialist
│   ├── data_insights.ts      — TPA/MSR/GI/TA specialist
│   ├── strategy.ts           — timing, planning, mindset
│   └── memory.ts             — GmatLearnerProfile + mergeGmatProfile
│
├── app/
│   ├── api/
│   │   ├── agents/
│   │   │   ├── chat/route.ts          — non-streaming fallback
│   │   │   ├── stream/route.ts        — SSE streaming (main)
│   │   │   ├── session-start/route.ts — personalized greeting
│   │   │   └── sam-reflect/route.ts   — post-practice progress anchor
│   │   ├── pre-exam-coaching/route.ts — AI coaching for countdown days
│   │   ├── weekly-review/route.ts     — Sam's weekly review
│   │   ├── practice/questions/route.ts — question serving API
│   │   ├── review/route.ts            — FSRS spaced repetition
│   │   └── tts/route.ts + stream/    — ElevenLabs TTS
│   └── dashboard/
│       ├── session/page.tsx   — voice chat with Sam
│       ├── practice/page.tsx  — text-based practice
│       ├── progress/page.tsx  — progress dashboard
│       ├── mock-test/page.tsx — full mock test
│       ├── study-plan/page.tsx
│       ├── journal/page.tsx
│       ├── flashcards/page.tsx
│       └── formulas/page.tsx
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardClient.tsx  — sidebar + layout
│   │   ├── PreExamBanner.tsx    — 7-day countdown with AI coaching
│   │   ├── WeeklyReview.tsx     — Sam's weekly review widget
│   │   └── QuestionOfTheDay.tsx
│   ├── practice/
│   │   ├── MicroCoachTip.tsx    — before-question contextual tip
│   │   ├── SamMotivator.tsx     — post-session progress anchor
│   │   ├── SocraticDebrief.tsx  — after wrong answer error analysis
│   │   ├── ExplanationPanel.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── PracticeSummary.tsx
│   │   └── SmartReviewPanel.tsx — FSRS due topics
│   └── progress/
│       ├── GmatProgressClient.tsx
│       ├── TopicHeatmap.tsx
│       ├── ScorePredictor.tsx
│       ├── ErrorAnalysis.tsx
│       └── TimingAnalytics.tsx
│
├── lib/
│   ├── gmat/
│   │   ├── micro-coaching.ts      — rule-based tip engine
│   │   ├── pre-exam.ts            — 7-day plan generator
│   │   ├── spaced-repetition.ts   — FSRS algorithm
│   │   ├── scoring.ts             — GMAT score calculation
│   │   ├── analyzer.ts            — session analysis
│   │   ├── difficulty.ts          — adaptive difficulty
│   │   ├── gamification.ts        — streak calculation
│   │   └── question-bank.ts       — question serving logic
│   ├── openai/client.ts           — agentClient / routerClient / embeddingClient
│   └── pinecone/
│       ├── retrieval.ts           — RAG context fetching
│       ├── reranker.ts            — Cohere rerank
│       └── namespace-mapping.ts   — agent → namespace mapping
│
├── data/
│   ├── questions/                 — 8,179 questions (JSON)
│   └── rag/                       — RAG content chunks (JSON)
│
└── scripts/gmat/
    ├── generate_questions.ts          — AI question generation
    ├── generate_reclor_explanations.ts — ReClor batch explanation gen
    ├── ingest_books.ts                — PDF → Pinecone indexing
    ├── ingest_datasets.ts             — HuggingFace dataset ingestion
    ├── validate_generated.ts          — Quality validation
    └── test_retrieval.ts              — RAG quality testing
```

---

## 17. Generation Scripts

### Question Generation
`scripts/gmat/generate_questions.ts`

Generates questions via OpenRouter API in batches. Saves after each batch (no progress loss on interrupt).

```bash
npx ts-node scripts/gmat/generate_questions.ts --type [gi|msr|tpa|ta|rc|all]
```

**Batch sizes:**
- TA/GI/MSR/TPA: 25 questions/batch, 4 batches = ~100/type
- RC: 10 passages/batch, 10 batches = ~100 passages

**Quality control:**
- Self-contradicting explanations detected and removed automatically
- DS answer key vs explanation consistency checked post-run
- RC passages validated for minimum length (>100 chars)

### Explanation Generation
`scripts/gmat/generate_reclor_explanations.ts`

Adds explanations to ReClor questions in batches of 20. Idempotent — skips questions that already have explanations.

```bash
# First 1,000
npx ts-node scripts/gmat/generate_reclor_explanations.ts --limit 1000

# Next 1,000
npx ts-node scripts/gmat/generate_reclor_explanations.ts --offset 1000 --limit 1000

# Fill all remaining
npx ts-node scripts/gmat/generate_reclor_explanations.ts --offset 0 --limit 4638
```

**Performance:** ~20 questions/batch, ~45s/batch, ~1,000 questions/hour using GPT-4o-mini.

### Validation
```bash
npx ts-node scripts/gmat/validate_generated.ts
```
Checks: all required fields present, explanations meet minimum length, correct answer is one of the option IDs, TPA answers in `X,Y` format.

---

## 18. Metrics & Targets

### Current State (March 2026)
- Question bank: **8,179 questions** — largest of any GMAT prep platform
- Explanation coverage: **99.9%** (8,172 / 8,179)
- 5 Sam coaching surfaces live
- Full GMAT Focus Edition coverage (Q + V + DI, all 8 question types)
- Deployed on Vercel, auto-deploy from main

### Launch Targets

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Registrations | 20–50 | 150–300 | 500–1,000 |
| Trial → Paid | 10–15% | 15–20% | 20–25% |
| MRR | $300–600 | $1,500–3,000 | $5,000–10,000 |
| 7-day Retention | 40% | 50% | 60% |
| Avg session (min) | 20 | 25 | 30 |

### Unit Economics
```
Cost per AI session (~25 min):
  Claude Sonnet (tokens):    ~$0.04
  ElevenLabs TTS (25 min):  ~$0.12
  Deepgram STT (25 min):    ~$0.04
  Pinecone retrieval:        ~$0.01
  Total per session:         ~$0.21

Pro plan ($79/month, 20 sessions avg):
  AI costs:     ~$4.20
  Gross margin: ~95%
```

### Next Priorities
1. **User acquisition** — Reddit (r/GMAT, r/MBA), Product Hunt launch
2. **ReClor 700+ questions** — currently `hard:3773` — add subtopic classification
3. **Mock test engine** — full adaptive CAT simulation
4. **Score prediction model** — calibrate against real GMAT score distributions
5. **YouTube channel** — Sam as AI avatar teaching GMAT concepts

---

*PrepWISE Documentation v2.0 | March 2026*  
*prepwise.app | Pha6ha007/PrepWISE*

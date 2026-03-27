# REQUIREMENTS — PrepWISE

> Derived from PREPWISE.md specification v1.0.0

---

## R001 — Voice AI Tutoring

**Description:** Users interact with Sam (AI tutor) via voice in the browser. Real-time speech-to-text (Deepgram) → agent processing → text-to-speech (ElevenLabs).

**Status:** `active`
**Primary owner:** Session UI + agents backend
**Validation:** User can have a 15-minute voice conversation with Sam about a GMAT topic, with correct STT transcription and natural TTS responses.

---

## R002 — GMAT Agent System (5 Specialists + Orchestrator)

**Description:** Invisible orchestrator routes every message to the correct specialist agent based on GMAT section detection, difficulty assessment, and learner profile. Agents: quantitative, verbal, data_insights, writing, strategy.

**Status:** `active`
**Primary owner:** agents/gmat/
**Validation:** Orchestrator routes "solve x² - 5x + 6 = 0" → quantitative, "weaken the argument" → verbal, "interpret this graph" → data_insights, "how should I study" → strategy with confidence > 0.8.

---

## R003 — Long-Term Memory (GMAT Learner Profile)

**Description:** Memory Agent runs after every session, extracts learning patterns (weak_topics, effective_techniques, insight_moments, common_error_patterns, etc.), and merges with existing GmatLearnerProfile stored in User.gmatProfile.

**Status:** `active`
**Primary owner:** agents/gmat/memory.ts + app/api/memory/
**Validation:** After a session discussing quadratics where the student struggled with factoring, the profile contains "quadratic factoring" in weak_topics and the next session references this.

---

## R004 — RAG Knowledge Base (Pinecone)

**Description:** 7 Pinecone namespaces (gmat-quant, gmat-verbal, gmat-di, gmat-awa, gmat-strategy, gmat-focus, gmat-errors) indexed from official GMAT PDF books. Query expansion + embedding + retrieval + reranking pipeline.

**Status:** `active` (pipeline built, awaiting book ingestion)
**Primary owner:** scripts/gmat/ + lib/pinecone/
**Validation:** `npx ts-node scripts/gmat/test_retrieval.ts` achieves precision@5 ≥ 0.85 on 20 test queries.

---

## R005 — Paddle Payments (3 Plans)

**Description:** Starter ($49/mo, 7-day trial), Pro ($99/mo, 14-day trial), Intensive ($199/mo, 7-day trial). Paddle handles tax, disputes, and acts as Merchant of Record.

**Status:** `active`
**Primary owner:** lib/billing/paddle.ts + app/api/webhooks/paddle/
**Validation:** New user → register → select Pro plan → Paddle checkout → webhook fires → subscription active in DB → user plan updated.

---

## R006 — Session UI (Voice Lesson Page)

**Description:** /dashboard/session — pre-session agent selection, voice button (mic on/off with audio visualization), real-time transcript, agent status indicator (listening/thinking/speaking), session timer, question counter.

**Status:** `active`
**Primary owner:** app/dashboard/session/ + components/session/
**Validation:** User can start a session, select "Quantitative", tap mic, speak a question, see Sam's response in transcript, and see status transitions.

---

## R007 — Progress Dashboard

**Description:** /dashboard/progress — summary stats (sessions, study time, questions, accuracy), section breakdown (quant/verbal/DI/AWA), topic mastery heatmap, error pattern analysis, mock test score history, session history.

**Status:** `active`
**Primary owner:** app/dashboard/progress/ + components/progress/
**Validation:** After 3 sessions, progress page shows correct session count, accuracy percentage, and topic mastery levels.

---

## R008 — Database Schema (4 GMAT Tables)

**Description:** GmatSession (session tracking), TopicProgress (per-topic accuracy + mastery), ErrorLog (error pattern tracking), MockTest (score history). All linked to User via userId. User model extended with gmatProfile JSON field.

**Status:** `active`
**Primary owner:** prisma/schema.prisma
**Validation:** `npx prisma validate` passes. `npx prisma db push` applies without errors.

---

## R009 — Adaptive Difficulty

**Description:** Question difficulty adjusts based on real-time performance. 3 consecutive correct → level up. 2 consecutive wrong → level down. Levels: easy, medium, hard, 700+.

**Status:** `active`
**Primary owner:** lib/gmat/difficulty.ts
**Validation:** Student answers 3 easy questions correctly → system serves medium questions.

---

## R010 — GMAT Topic Taxonomy

**Description:** Complete taxonomy of GMAT topics (14 top-level topics with subtopics) used for progress tracking, agent routing, and practice mode navigation. Covers all 4 sections.

**Status:** `active`
**Primary owner:** lib/gmat/topics.ts
**Validation:** Every GMAT question type (PS, DS, CR, RC, SC, MSR, TA, GI, TPA, AWA) maps to a topic in the taxonomy.

---

## R011 — Session Analysis

**Description:** Post-session analysis detects error patterns (concept, careless, time_pressure, misread), identifies strengths/weaknesses, generates specific recommendations. Feeds into Memory Agent.

**Status:** `active`
**Primary owner:** lib/gmat/analyzer.ts
**Validation:** After a session with 2 careless errors and 1 time pressure error, analyzer returns correct error type counts and relevant recommendations.

---

## R012 — GMAT Scoring Utilities

**Description:** Score estimation (section accuracy → section score → total score), percentile lookup, score interpretation labels, target scores for MBA programs.

**Status:** `active`
**Primary owner:** lib/gmat/scoring.ts
**Validation:** 80% accuracy across sections estimates ~725 total score, 91st percentile.

---

## R013 — Practice Mode (Text-Based)

**Description:** /dashboard/practice — browse topics by section, select specific topics, practice GMAT problems with typed answers (no voice).

**Status:** `active` (UI built, practice engine pending)
**Primary owner:** app/dashboard/practice/
**Validation:** User can navigate to Practice, see all 4 sections, expand topics, and see subtopics.

---

## R014 — Mock Test Mode

**Description:** /dashboard/mock-test — full-length (135 min, 64 questions) or section practice (45 min). Timed, adaptive difficulty, score report at end.

**Status:** `active` (UI built, test engine pending)
**Primary owner:** app/dashboard/mock-test/
**Validation:** User can select Full Test or Section Practice, see time/question estimates.

---

## R015 — Deploy: Vercel + Railway

**Description:** Frontend on Vercel (git push = deploy, global CDN). AI agents backend on Railway (persistent containers, no time limits, WebSocket support). Redis on Railway for session cache.

**Status:** `active` (configs ready, awaiting deployment)
**Primary owner:** vercel.json + railway.yaml + agents/server.ts
**Validation:** `vercel --prod` deploys successfully. `railway up` starts gmat-agents and memory-worker services.

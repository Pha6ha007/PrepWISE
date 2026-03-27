# CURRENT STATE — PrepWISE

> Last updated: 2026-03-25

---

## Completed Work

### Phase 1: Section 14 Priority Tasks (All 20 Complete)

| # | Task | Status | Key Files |
|---|------|--------|-----------|
| 1 | Read agents/ directory — understand Confide architecture | ✅ | — |
| 2 | Create agents/gmat/orchestrator.ts | ✅ | 423 lines, keyword routing + emotional state detection |
| 3 | Create agents/gmat/memory.ts | ✅ | 310 lines, GmatLearnerProfile + buildPrompt + mergeProfile |
| 4 | Create agents/gmat/quantitative.ts | ✅ | 237 lines, PS + DS specialist |
| 5 | Create agents/gmat/verbal.ts | ✅ | 209 lines, CR + RC + SC specialist |
| 6 | Create agents/gmat/data_insights.ts | ✅ | 192 lines, MSR + TA + GI + TPA specialist |
| 7 | Create agents/gmat/writing.ts | ✅ | 171 lines, AWA specialist |
| 8 | Create agents/gmat/strategy.ts | ✅ | 209 lines, timing + planning + mindset |
| 9 | Extend prisma/schema.prisma | ✅ | 4 new models: GmatSession, TopicProgress, ErrorLog, MockTest |
| 10 | Prisma schema validated | ✅ | 20 models total, all relations correct |
| 11 | Replace DodoPayments → Paddle | ✅ | All files updated, lib/dodo/ deleted |
| 12 | Create lib/billing/paddle.ts | ✅ | 133 lines, products + plans + webhook verify |
| 13 | Create Paddle webhook handler | ✅ | 262 lines, full subscription lifecycle |
| 14 | Create scripts/gmat/ingest_books.ts | ✅ | 320 lines, PDF → chunk → embed → Pinecone |
| 15 | Create scripts/gmat/test_retrieval.ts | ✅ | 273 lines, 20 test queries across all sections |
| 16 | Build session page | ✅ | 339 lines, voice + text chat with agent selection |
| 17 | Build progress page | ✅ | Server component + GmatProgressClient (280 lines) |
| 18 | Create session components | ✅ | VoiceButton, AgentStatus, TranscriptView, SessionControls |
| 19 | Adapt Playwright tests | ✅ | 3 spec files, 333 lines total |
| 20 | Deploy config | ✅ | vercel.json, railway.yaml, server.ts, memory-worker.ts |

### Phase 2: Full Codebase Audit & Cleanup

| Task | Status | Details |
|------|--------|---------|
| Delete agents/prompts/ (Confide psychology) | ✅ | 10 files removed |
| Delete agents/crisis/ | ✅ | 3 files removed |
| Delete .gsd/ (Confide task history) | ✅ | 29 files removed |
| Delete .claude/ (Confide agent configs) | ✅ | 7 files removed |
| Delete Confide documentation | ✅ | 7 top-level .md files + docs/ directory (~15 files) |
| Delete Confide scripts | ✅ | 20 files (ingest-counseling, test-rag, etc.) |
| Delete Confide lib modules | ✅ | 17 files (agents/, blog/, diary/, memory/, mood/, etc.) |
| Delete Confide components | ✅ | 37 files (chat/, blog/, exercises/, goals/, mood/, etc.) |
| Delete Confide API routes | ✅ | 21 routes (diary, goals, homework, mood, survey, etc.) |
| Delete Confide app pages | ✅ | 6 pages (blog, exercises, journal) |
| Delete lib/dodo/ | ✅ | DodoPayments client removed |
| Rebrand landing page | ✅ | Full rewrite: Prepwise GMAT landing with pricing |
| Rebrand layout, privacy, terms | ✅ | All Confide → Prepwise, Alex → Sam |
| Rewrite DashboardClient | ✅ | GMAT navigation: Session, Practice, Progress, Mock Test |
| Rewrite app/api/chat/route.ts | ✅ | GMAT agents, no crisis detection |
| Rewrite app/api/memory/route.ts | ✅ | GMAT memory, no psychological extraction |
| Clean Pinecone constants | ✅ | Removed Confide namespaces, GMAT-only |
| Clean types/index.ts | ✅ | Removed AgentType (psychology), CrisisResponse, MonthSummary |
| Fix localStorage keys | ✅ | confide_ → prepwise_ |
| **Total files deleted** | | **~134** |
| **Total files modified** | | **36** |
| **Final grep validation** | ✅ | 0 hits for Confide/PsyGUARD/COUNSELING_QA/DodoPayments |

## Current File Counts

| Directory | Files | Purpose |
|-----------|-------|---------|
| agents/gmat/ | 8 | GMAT specialist agents + orchestrator + memory |
| agents/ (root) | 2 | server.ts, memory-worker.ts |
| app/dashboard/ | 6 | session, progress, practice, mock-test, chat (redirect), settings |
| app/api/ | 7 | agents/chat, billing, webhooks/paddle, memory, chat, contact, tts |
| components/session/ | 4 | VoiceButton, AgentStatus, TranscriptView, SessionControls |
| components/progress/ | 1 | GmatProgressClient |
| components/billing/ | 2 | PaddleCheckout, AutoCheckout |
| lib/gmat/ | 4 | topics, scoring, difficulty, analyzer |
| lib/pinecone/ | 4 | client, constants, namespace-mapping, retrieval, reranker |
| scripts/gmat/ | 2 | ingest_books, test_retrieval |
| e2e/ | 3 | app.spec, session.spec, progress.spec |

## What Works Now

1. ✅ GMAT agent routing (orchestrator correctly routes to 5 specialists)
2. ✅ GMAT memory extraction and profile merging
3. ✅ Paddle billing integration (checkout + webhooks)
4. ✅ Session UI (voice button, agent selection, transcript, timer)
5. ✅ Progress dashboard (stats, section breakdown, topic mastery)
6. ✅ Practice and mock test page UIs (navigation ready)
7. ✅ RAG ingestion pipeline (scripts ready, awaiting PDFs)
8. ✅ Prisma schema (validated, awaiting db push)
9. ✅ E2E tests (adapted for Prepwise flows)
10. ✅ Deploy configs (Vercel + Railway)
11. ✅ GMAT onboarding flow (name, target score, weak sections, timeline, study hours)
12. ✅ Streaming agent API (SSE via /api/agents/stream/)
13. ✅ useGmatAgent React hook for streaming responses
14. ✅ Quick diagnostic test (10 questions, auto-scoring, level estimation)
15. ✅ Practice mode with agent-evaluated answers
16. ✅ Dashboard navigation: Session, Practice, Progress, Mock Test, Settings
17. ✅ Settings page: GMAT profile, subscription, about Sam

### Phase 4: RAG Data Pipeline (Scripts Built)

| Script | Purpose | Data Source | License | Namespace |
|--------|---------|-------------|---------|-----------|
| `ingest_books.ts` | Index 4 GMAT PDFs from scripts/gmat/data/ | Local PDFs | N/A | gmat-quant, gmat-verbal, gmat-strategy |
| `ingest_datasets.ts` | Download + index HuggingFace datasets | deepmind/aqua_rat (97k problems), allenai/math_qa | Apache 2.0 | gmat-quant |
| `ingest_github.ts` | Fetch + index GitHub repo data | mister-teddy/gmat-database (MIT), danyuchn/GMAT-score-report-analysis | MIT | gmat-quant, gmat-verbal, gmat-strategy |
| `ingest_reclor.ts` | Extract 17 CR question types from ReClor paper | ReClor PDF + structured CR taxonomy | Research | gmat-verbal |
| `test_retrieval.ts` | 42 test queries across all sources + namespaces | — | — | All |

**PDF files available (scripts/gmat/data/):**
- GMAT in a Nutshell About the GMAT.pdf (399 KB)
- GMAT Review- GMAT Vocabulary List.pdf (922 KB)
- RECLOR- A READING COMPREHENSION DATASET REQUIRING LOGICAL REASONING.pdf (331 KB)
- Turbocharge Your GMAT Sentence Correction Study Guide.pdf (754 KB)

### Phase 5: GMAT Focus Edition Alignment (Complete)

| Task | Status | Details |
|------|--------|---------|
| Remove AWA section & writing agent | ✅ | agents/gmat/writing.ts deleted, all references removed |
| Remove Sentence Correction from Verbal | ✅ | Verbal is now CR + RC only |
| Remove traditional Geometry from Quant | ✅ | Coordinate geometry kept under Algebra |
| Move Data Sufficiency to Data Insights | ✅ | DS routing, topics, questions all under DI now |
| Add DS content to Data Insights agent | ✅ | Full DS framework, strategy, traps added |
| Update diagnostic test | ✅ | SC question → RC question, DS → DI section |
| Remove gmat-awa Pinecone namespace | ✅ | 6 namespaces remain (was 7) |
| Update all UI (session, practice, progress, mock-test) | ✅ | 4 agents (was 5), no SC option, DS in DI |
| Build verification | ✅ | 37/37 pages, zero TypeScript errors |
| **Total files changed** | | **28** |

## What Doesn't Work Yet

1. ✅ npm install completed (860 packages)
2. ✅ Prisma Client generated (20 models)
3. ✅ Next.js build passes (37/37 pages, zero errors)
4. ❌ Prisma db push not run (no DATABASE_URL with real Supabase)
5. ❌ No GMAT content indexed in Pinecone yet (scripts ready, need API keys)
6. ❌ Railway agents backend not deployed
7. ❌ LLM not wired (agents return placeholder responses without API keys)
8. ❌ Voice pipeline not connected (Deepgram STT + ElevenLabs TTS need keys)
9. ❌ No question bank (0 curated questions — critical gap vs competitors)
10. ❌ No adaptive mock test engine
11. ❌ No study plan generator

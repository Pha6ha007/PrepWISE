# PROJECT — PrepWISE

> AI-Powered GMAT Voice Tutor
> Version: 1.0.0 | March 2026

---

## Identity

| Field | Value |
|-------|-------|
| **Product** | PrepWISE (Prepwise) |
| **Domain** | GMAT test preparation |
| **Tagline** | Your AI GMAT tutor that remembers, adapts, and helps you score 700+ |
| **URL** | prepwise.app |
| **Base repo** | `Pha6ha007/Confide---Saas` (forked, rebranded, psychology content removed) |

## Concept

Prepwise is a voice AI tutor for GMAT preparation. The user speaks with a personalized AI teacher (Sam) through a browser — like a live tutoring session, but the teacher is AI. The tutor remembers every previous session, adapts the program to weak spots, and explains material in real time using RAG over official GMAT guides.

**Key differentiator:** No competitor combines voice interaction + long-term memory + RAG over official GMAT materials.

## Target Audience

| Segment | Description | Pain |
|---------|-------------|------|
| Primary | US professionals 25–35, preparing for MBA | $150–200/hr for human tutor — too expensive |
| Secondary | International students (India, China, Europe) | No access to quality English-speaking tutors |

## Market

- GMAT prep market: projected $798M by 2027 (CAGR 9%)
- ~85,000 GMAT test-takers annually in the US
- Average human tutor rate: $150–200/hr
- Prepwise price: $49–199/month (5–10× cheaper)

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Radix UI | Reused from Confide |
| Auth & DB | Supabase (Auth + PostgreSQL + pgvector) | Reused from Confide |
| ORM | Prisma 6 | Extended with 4 GMAT tables |
| AI Agents | GMAT agent system (5 specialists + orchestrator + memory) | Built |
| RAG | Pinecone (7 GMAT namespaces) + OpenAI embeddings | Configured |
| STT | Deepgram API (Whisper) | Reused from Confide |
| TTS | ElevenLabs JS SDK | Voice persona: Sam |
| Memory | GMAT Memory Agent (learner profile extraction + merge) | Built |
| Payments | Paddle (Starter $49 / Pro $99 / Intensive $199) | Integrated |
| Email | Resend | Reused |
| Analytics | PostHog | Reused |
| PWA | next-pwa | Reused |
| Tests | Playwright (3 spec files, ~330 lines) | Adapted |
| State | Zustand | Reused |
| Deploy | Vercel (frontend) + Railway (agents backend) | Configured |

## Data Flow

```
User (voice)
  → Deepgram STT
  → Orchestrator Agent (routes by GMAT section)
  → Specialist Agent (Quant/Verbal/DI/Writing/Strategy) + RAG from Pinecone
  → Response text
  → ElevenLabs TTS → User (audio)
  → [after session] Memory Agent updates GmatLearnerProfile in Supabase
```

## Repository Structure

```
prepwise/
├── agents/gmat/           ← 5 specialist agents + orchestrator + memory + index
├── agents/server.ts       ← Railway HTTP entry point
├── agents/memory-worker.ts ← Railway background worker
├── app/
│   ├── dashboard/session/  ← Voice lesson UI
│   ├── dashboard/progress/ ← GMAT progress dashboard
│   ├── dashboard/practice/ ← Text-based practice
│   ├── dashboard/mock-test/ ← Mock test page
│   ├── api/agents/chat/    ← GMAT agent API
│   ├── api/billing/        ← Paddle checkout
│   ├── api/webhooks/paddle/ ← Paddle webhooks
│   └── api/memory/         ← GMAT memory API
├── components/
│   ├── session/            ← VoiceButton, AgentStatus, TranscriptView, SessionControls
│   ├── progress/           ← GmatProgressClient
│   └── billing/            ← PaddleCheckout, AutoCheckout
├── lib/
│   ├── gmat/               ← topics, scoring, difficulty, analyzer
│   ├── billing/paddle.ts
│   └── pinecone/           ← GMAT namespaces, retrieval, reranker
├── prisma/schema.prisma    ← 20 models (16 base + 4 GMAT)
├── scripts/gmat/           ← ingest_books.ts, test_retrieval.ts
├── e2e/                    ← app.spec.ts, session.spec.ts, progress.spec.ts
├── railway.yaml
└── vercel.json
```

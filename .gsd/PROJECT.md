# PROJECT — PrepWISE

> AI-Powered GMAT Voice Tutor
> Version: 2.0 | March 2026

---

## Identity

| Field | Value |
|-------|-------|
| **Product** | PrepWISE |
| **Domain** | GMAT test preparation (GMAT Focus Edition) |
| **Tagline** | Your AI GMAT tutor that remembers, adapts, and helps you score 700+ |
| **URL** | prepwise.app |
| **Deployed** | Vercel (frontend) + Railway (agents backend) |

## What It Is Now

Voice AI tutor for GMAT. Student speaks with Sam — an AI tutor with full session memory, RAG over official GMAT material, and 5 active coaching surfaces. Sam intervenes contextually: before questions (micro-coaching tips), after wrong answers (Socratic debrief), after sessions (progress anchor), weekly (progress review), and 7 days before exam (pre-exam mode).

**Key differentiator:** No competitor combines voice + long-term memory + contextual coaching + 8,179 questions with explanations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Auth & DB | Supabase + Prisma (20 models) |
| AI | OpenRouter (Claude Sonnet) + Groq (llama routing) + OpenAI (embeddings) |
| RAG | Pinecone (7 namespaces) |
| Voice | ElevenLabs TTS + Deepgram STT |
| Payments | Paddle ($39/$79/$149/mo) |
| Deploy | Vercel + Railway |

## Question Bank (March 2026)

| Type | Count | Explanations |
|------|-------|-------------|
| PS (Quant) | 1,500 | 99.5% |
| DS | 400 | 100% |
| CR | 5,138 | 100% |
| RC | 672 (218 passages) | 100% |
| GI | 140 | 100% |
| MSR | 105 | 100% |
| TA | 98 | 100% |
| TPA | 126 | 100% |
| **TOTAL** | **8,179** | **99.9%** |

**Largest question bank of any GMAT prep platform.**

## Sam Coaching Surfaces

1. **MicroCoachTip** — rule-based tip before each question (error history based)
2. **SocraticDebrief** — error type classification + micro-lesson after wrong answer
3. **SamMotivator** — AI progress anchor after practice ("DS: 45% → 71% — real movement")
4. **WeeklyReview** — 150-200 word Sam narration on Sunday/Monday with specific delta
5. **PreExamBanner** — 7-day countdown with AI-generated daily coaching + TTS
6. **Session opening** — personalized greeting from learner profile

## Competitive Position

PrepWISE is the only GMAT platform with:
- Voice AI tutor (Sam)
- Long-term memory across sessions
- Contextual micro-coaching (before/after questions)
- 8,179 questions with full explanations (largest bank)
- Pre-exam mode with AI coaching

Price: $39–149/mo vs Magoosh $179 (6-mo), Manhattan Prep $249 (3-mo).

## Next Priorities

1. User acquisition — Reddit launch, Product Hunt
2. Mock test adaptive CAT engine
3. Score prediction model calibration
4. YouTube/AI avatar content channel

# Competitive Analysis — GMAT Prep Market 2026

> Research date: 2026-03-25

---

## Executive Summary

PrepWISE's voice AI tutor differentiator remains unique — no competitor combines real-time voice interaction + long-term memory + RAG over GMAT materials. However, the research reveals **critical gaps in content, format alignment, and features** that competitors have and PrepWISE currently lacks.

---

## Major Competitors Feature Matrix

| Feature | Manhattan Prep | TTP | Magoosh | e-GMAT (Prepathon) | Princeton Review | PrepWISE |
|---------|---------------|-----|---------|---------------------|-----------------|----------|
| **Practice Questions** | 2,300+ (1,100 official + 1,200 custom) | 3,000+ Quant | 1,300+ | 2,800+ reviewed | 4,400+ | ❌ ~0 (agent-generated only) |
| **Full-Length Mock Tests** | 6+ adaptive | ❌ none | 2 | 10+ | 6 | ❌ none |
| **Adaptive Difficulty** | ✅ | ✅ per sub-topic | ✅ | ✅ | ✅ AI-powered | ⚠️ basic (3 correct → up) |
| **Video Lessons** | ✅ interactive | ✅ per chapter | 340+ | ✅ | ✅ | ❌ none |
| **AI Tutor/Chatbot** | ❌ | ✅ TTP AI Assist (2025) | ✅ AI Companion | ✅ Prepathon AI | ❌ | ✅ Voice AI (Sam) |
| **Voice Interaction** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **unique** |
| **Long-Term Memory** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **unique** |
| **Error Pattern Analysis** | ✅ | ✅ tracks "why you missed" | ✅ | ✅ "why you make mistakes" | ✅ | ⚠️ basic types only |
| **Study Plan Generation** | ✅ 12-16 week structured | ✅ adaptive path | ✅ AI-generated | ✅ daily adaptation | ✅ | ❌ none |
| **Detailed Explanations** | ✅ with takeaways | ✅ written + video | ✅ video per question | ✅ | ✅ per answer choice | ❌ agent explains on demand |
| **Online Whiteboard** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Mobile App** | ✅ | ✅ | ✅ dedicated | ✅ | ✅ | ❌ (PWA only) |
| **Community/Forum** | ❌ | ❌ | ❌ | ❌ (via GMATClub) | ❌ | ❌ |
| **Score Guarantee** | ❌ | ❌ | ✅ +50 points | ✅ +100 points | ✅ | ❌ |
| **Live Instruction** | ✅ 99th% instructors | ❌ | ✅ tutoring add-on | ✅ mentors | ✅ | ❌ |
| **GMAT Focus Edition Aligned** | ✅ fully updated 2025 | ✅ | ✅ | ✅ | ✅ | ⚠️ **partially — see below** |
| **Price** | $300-$2,000 | $200-400/mo | $249 one-time | Premium | $499-$2,399 | $49-199/mo |

---

## CRITICAL FINDING: GMAT Focus Edition Misalignment

PrepWISE's topic taxonomy and agent system are **partially outdated** — they reference the classic GMAT format in several areas:

### 1. AWA (Analytical Writing) — REMOVED from GMAT Focus Edition
- PrepWISE has: `agents/gmat/writing.ts` (171 lines), AWA topic in taxonomy, AWA section in GMAT_SECTIONS
- Reality: **AWA was completely removed** from the GMAT Focus Edition. No essay section exists.
- Impact: We're offering prep for a section that doesn't exist on the actual test

### 2. Sentence Correction — REMOVED from GMAT Focus Edition  
- PrepWISE has: `sentence-correction` topic with SC questionType in verbal section
- Reality: **Sentence Correction was removed** from Focus Edition. Verbal is now only CR + RC.
- Impact: Students would waste time studying an irrelevant question type

### 3. Geometry — REMOVED from Quant section
- PrepWISE has: full `geometry` topic (lines, triangles, circles, quadrilaterals, 3D shapes)
- Reality: **Traditional geometry was removed** from Quant. Only coordinate geometry remains (under algebra).
- Impact: Students study geometry formulas they'll never see on the test

### 4. Data Sufficiency — MOVED to Data Insights
- PrepWISE has: DS listed as questionType in Quant topics (arithmetic, algebra, etc.)
- Reality: **DS questions moved entirely to the Data Insights section**. Quant is now purely Problem Solving.
- Impact: Incorrect routing — DS questions should route to Data Insights agent, not Quant

### 5. Data Insights Section — INCOMPLETE
- PrepWISE has: 4 DI topics (MSR, TA, GI, TPA) but missing DS as a DI question type
- Reality: DI section has 5 question types: DS + MSR + TA + GI + TPA. DS is 20-40% of DI.
- Impact: Missing the single largest question type in the DI section

### 6. Question Review & Edit Feature — NOT ADDRESSED
- GMAT Focus allows bookmarking questions and changing up to 3 answers per section
- PrepWISE mock test doesn't implement this feature
- Impact: Students miss practice with a key test-taking strategy

---

## Content Gaps vs Competitors

### Gap 1: Question Bank (CRITICAL)
- Competitors: 1,300 - 4,400 curated questions with detailed explanations
- PrepWISE: 0 curated questions — relies entirely on agent-generated questions on the fly
- **Action needed:** Build or source a structured question bank with difficulty tags, explanations, and topic mapping

### Gap 2: Full-Length Adaptive Mock Tests (CRITICAL)
- Competitors: 2-12 full-length adaptive tests that mirror real GMAT
- PrepWISE: Mock test page exists but no test engine
- **Action needed:** Build adaptive mock test engine (64 questions, 3 sections × 45 min, computer-adaptive scoring)

### Gap 3: Structured Study Plans (HIGH)
- TTP: Adaptive learning path per sub-topic with mastery gates
- Manhattan: 12-16 week structured curriculum
- Magoosh: AI-generated custom plans
- PrepWISE: Nothing — user just starts voice sessions
- **Action needed:** Generate personalized study plans based on diagnostic results

### Gap 4: Detailed Per-Question Explanations (HIGH)
- TTP: Written + video explanations per question, "actionable takeaway" per problem
- Manhattan: Explanations "better than GMAC's own"
- PrepWISE: Sam explains live but nothing persists or can be reviewed
- **Action needed:** Store session explanations; build a reviewable explanation archive

### Gap 5: Performance Analytics Dashboard (MEDIUM)
- TTP: Tracks "why you missed" (concept error, careless, time pressure, misread) + granular sub-topic analytics
- Prepathon: "not just what mistakes, but why you make them"
- PrepWISE: Basic accuracy/mastery tracking exists, but no timing analytics or error pattern drill-down
- **Action needed:** Enhance analytics with timing per question, error classification trends, sub-topic heatmaps

### Gap 6: Video Content (MEDIUM)
- All competitors have video lessons (340+ at Magoosh, interactive at Manhattan)
- PrepWISE: Zero video content — voice tutoring is the substitute
- **Action needed:** Voice is the differentiator, so this is acceptable. But consider recording Sam's explanations as replayable audio lessons.

---

## PrepWISE Unique Advantages (to protect and amplify)

1. **Voice-first tutoring** — No competitor offers real-time voice conversation for GMAT prep. TTP AI Assist and Prepathon AI are text-only chatbots.
2. **Long-term memory** — Sam remembers past sessions, knows weak spots, recalls what techniques worked. No competitor has this.
3. **Price point** — $49-199/mo positions between budget (Magoosh $249 total) and premium (Manhattan $1,000+), but with AI tutoring that premium charges $150-500/hr for human equivalent.
4. **24/7 availability** — Like having a human tutor on demand without scheduling constraints.
5. **Adaptive conversation** — Sam can Socratic-method teach, something only live human tutors do. Text-based AI tutors can do it but voice feels more natural.

---

## Recommended Priority Actions

### P0 — Fix GMAT Focus Edition alignment (BLOCKING)
1. Remove AWA section, writing agent, and AWA topic
2. Remove Sentence Correction topic from Verbal  
3. Remove traditional Geometry topic from Quant (keep coordinate geometry under Algebra)
4. Move Data Sufficiency from Quant question types to Data Insights
5. Add Data Sufficiency as a DI topic/question type
6. Update GMAT_SECTIONS to remove AWA (3 sections, not 4)
7. Update agents: repurpose writing agent → strengthen DI agent

### P1 — Question Bank
1. Source/build 500+ curated GMAT Focus questions across all sections
2. Tag each with: topic, sub-topic, difficulty, question type, explanation
3. HuggingFace datasets (aqua_rat, math_qa) already in ingestion pipeline — activate
4. Generate CR and RC questions from RAG content

### P2 — Adaptive Mock Test Engine
1. Build 64-question adaptive test (21Q + 23V + 20DI, 45 min each)
2. Implement computer-adaptive difficulty adjustment
3. Score report matching GMAT Focus format (205-805 total, 60-90 per section)
4. Question Review & Edit feature (bookmark + change up to 3 per section)

### P3 — Study Plan Generator
1. Based on diagnostic test results, generate personalized week-by-week plan
2. Track completion and adapt as student progresses
3. Factor in target score, test date, available hours/week

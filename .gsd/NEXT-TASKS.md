# ROADMAP — PrepWISE Post-Competitor Analysis

> Created: 2026-03-25
> Source: Competitive analysis of TTP, Magoosh, Manhattan Prep, e-GMAT, GMAT Club, Princeton Review
> Full analysis: .gsd/milestones/M001/M001-COMPETITOR-ANALYSIS.md

---

## 🔴 P0 — Critical (blocks launch)

- [x] **1. Fix Confide branding on 5 pages** — Privacy, Terms, Contact, Refund, Offline pages rebranded to PrepWISE dark cyan theme.
- [x] **2. Fix pricing inconsistency** — All pages aligned to $39/$79/$149. Old $49/$99/$199 and $19/$29 removed.
- [x] **3. Add Free Trial (7 days)** — Trial system with TrialBanner, trial utility, schema fields, onboarding + OAuth integration.

## 🟡 P1 — High Priority (month 1)

- [x] **4. Study Plan Generator** — Rule-based plan with 4 phases, daily schedule, weekly calendar UI. New dashboard page + API.
- [x] **5. Settings edit mode** — Full edit form: name, target score, test date, hours/week, weak sections. Subscription management. PUT API with Zod validation.
- [x] **6. Enhanced Analytics** — Error analysis (4 types), timing analytics (pace vs target), topic heatmap (mastery grid), score predictor with sparkline. All pure CSS/SVG charts.
- [x] **7. Score Report after Mock Test** — Premium report: total score + percentile, section cards, topic breakdown, time analysis, error analysis, recommendations.

## 🟢 P2 — Medium Priority (months 2-3)

- [ ] **8. Blog/SEO content** — 10-20 SEO-optimized articles for organic traffic. Topics: "How to score 700+", "GMAT Focus Edition changes", "Data Insights strategies", etc.
- [x] **9. Formula Sheet / Quick Reference** — 710-line page with 8 sections, search, bookmarks, print CSS. Added to dashboard nav.
- [ ] **10. Flashcards** — AI-generated flashcards based on weak topics. Spaced repetition integration. Inspiration: TTP AI-generated flashcards.
- [ ] **11. Score Guarantee** — "+70 points or money back" policy. Conditions: complete diagnostic, 20+ practice sessions, 3+ mock tests. Inspiration: Magoosh guarantee.
- [x] **12. Gamification** — Streak ring (SVG, weekly progress), 12 achievements, daily challenges. Integrated in dashboard sidebar.
- [x] **13. Question of the Day** — Deterministic daily selector with day-of-week section rotation. Sidebar widget with inline solve + localStorage tracking.
- [x] **14. Audio explanations** — TTS button in ExplanationPanel. Calls /api/tts, auto-hides if no API key.

## ⚪ P3 — Low Priority (later)

- [ ] **15. Community forum** — Not core to voice AI positioning. GMAT Club dominates this space. Consider lightweight "Ask Sam publicly" feature instead.
- [ ] **16. Native mobile app** — PWA is sufficient for MVP. Native app when revenue justifies ($10K+ MRR).
- [ ] **17. Live instruction** — Add as premium tier ($299/mo) with scheduled live sessions with human GMAT experts + Sam AI combo.

---

## PrepWISE Unique Advantages (protect and amplify)

| Advantage | vs Competitors | Status |
|-----------|---------------|--------|
| Voice AI Tutoring | Nobody has this | ✅ Built |
| Long-term Memory | Nobody has this | ✅ Built |
| Study Journal with streaks | Unique for GMAT prep | ✅ Built |
| FSRS Spaced Repetition | Only TTP/e-GMAT have similar | ✅ Built |
| "Ask Sam" from Practice | Nobody links practice→AI tutor | ✅ Built |
| Socratic method via voice | Only $150-500/hr human tutors | ✅ Built |
| $49-199/mo pricing | 5-10× cheaper than human tutor | ✅ Configured |

## Key Metrics by Competitor

| Competitor | Questions | Mocks | Videos | Price/mo | AI Tutor |
|-----------|-----------|-------|--------|----------|----------|
| TTP | 4,000+ ∞AI | Custom builder | 2,200 | $150-250 | ✅ Text |
| Magoosh | 800 | ❌ | 200 | $29 | ✅ Text |
| Manhattan | 2,300 | 6 adaptive | Live+VOD | $83-167 | ✅ Text |
| e-GMAT | 7,500 | 5+90 | 250hrs | $83-125 | ✅ Embedded |
| Princeton | 4,400 | 6 adaptive | ✅ | $42-200 | ⚠️ Vague |
| **PrepWISE** | **5,638** | **✅ Engine** | **❌ (voice)** | **$49-199** | **✅ Voice** |

# Competitive Comparison — Updated After Content Generation

> Updated: 2026-03-26
> Previous version: M001-COMPETITOR-ANALYSIS.md

---

## Question Bank Comparison

| Platform | Total Questions | PS (Quant) | DS | CR | RC | Other Verbal | DI Types | AI-Generated | Explanations |
|----------|---------------|------------|-----|-----|-----|-------------|----------|-------------|-------------|
| **e-GMAT** | 7,500+ | ✅ | ✅ | ✅ | ✅ | ✅ SC (old) | ✅ | ❌ | ✅ expert |
| **PrepWISE** | **7,372** | **1,500** | **400** | **5,138** | **334** | ❌ (Focus) | ⚠️ via DS | **✅** | **✅ mixed** |
| Princeton Review | 4,400+ | ✅ | ✅ | ✅ | ✅ | ✅ SC (old) | ✅ | ❌ | ✅ expert |
| TTP | 4,000+ (+∞ AI) | ✅ deep | ✅ | ⚠️ weak | ⚠️ weak | ❌ | ✅ | ✅ unlimited | ✅ expert+video |
| Manhattan Prep | 2,300+ | ✅ 1,100 GMAC | ✅ | ✅ | ✅ | ✅ SC (old) | ✅ | ❌ | ✅ expert |
| Magoosh | 700-800 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ video per Q |
| GMAT Club | community | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ community |

### PrepWISE Question Quality Analysis

| Metric | PrepWISE | Industry Standard | Gap |
|--------|----------|------------------|-----|
| **Total count** | 7,372 | 700-7,500 | ✅ Competitive (2nd largest) |
| **Quant PS** | 1,500 (500 AI + 1,000 HuggingFace) | 1,000-3,000 | ✅ Good |
| **Data Sufficiency** | 400 (AI-generated) | 300-1,000 | ✅ Adequate |
| **Critical Reasoning** | 5,138 (500 AI + 4,638 ReClor) | 300-2,000 | ✅ Strong (largest) |
| **Reading Comp** | 334 questions across 100 passages | 200-500 | ✅ Good |
| **DI other (MSR/TA/GI/TPA)** | 0 dedicated | 200-500 | 🔴 Gap |
| **Difficulty range** | easy/medium/hard/700+ | Same | ✅ Matches |
| **Explanations** | 2,400 have explanations, 4,638 don't (ReClor) | 100% with explanations | 🟡 Gap |
| **Official GMAC questions** | 0 | 0-1,100 (Manhattan) | 🟡 Gap (copyright) |
| **GMAT Focus Edition aligned** | ✅ 100% | Mixed (some still have SC/AWA) | ✅ Advantage |

### Question Source Quality Tiers

| Source | Questions | Quality | Calibration to GMAT |
|--------|-----------|---------|-------------------|
| gen-quant-ps (Claude AI) | 500 | ⭐⭐⭐⭐ Good — trap answers, step-by-step explanations | ⭐⭐⭐ Good — GMAT style format |
| gen-ds (Claude AI) | 400 | ⭐⭐⭐⭐ Good — proper DS framework, S1/S2 testing | ⭐⭐⭐⭐ Very good — correct ABCDE format |
| gen-cr (Claude AI) | 500 | ⭐⭐⭐⭐ Good — premise/conclusion/gap analysis | ⭐⭐⭐ Good — realistic passages |
| gen-rc (Claude AI) | 334 | ⭐⭐⭐⭐⭐ Excellent — full passages with diverse topics | ⭐⭐⭐⭐ Very good — GMAT length & style |
| aqua-rat (HuggingFace) | 1,000 | ⭐⭐⭐ Decent — real math problems | ⭐⭐ Moderate — GRE/GMAT overlap, not Focus-specific |
| reclor-verbal (HuggingFace) | 4,638 | ⭐⭐⭐ Decent — logical reasoning | ⭐⭐ Moderate — LSAT-style, no explanations |

---

## RAG Knowledge Base Comparison

| Platform | Knowledge Source | Volume | Depth |
|----------|-----------------|--------|-------|
| **TTP** | Expert-written lessons + 2,200 video solutions | Massive | ⭐⭐⭐⭐⭐ Deep per-topic |
| **Manhattan Prep** | Strategy Guide books (6 volumes) + 100+ formulas | Large | ⭐⭐⭐⭐⭐ Industry standard |
| **e-GMAT** | 250+ hours video + concept files + application files | Massive | ⭐⭐⭐⭐⭐ Most comprehensive |
| **Magoosh** | 150-200 video lessons + PDF guides | Medium | ⭐⭐⭐⭐ Good coverage |
| **PrepWISE** | **1,809 vectors (AI-generated + PDF)** | Small-Medium | ⭐⭐⭐ Adequate |
| **GMAT Club** | Community-contributed + Math Book PDF | Medium | ⭐⭐⭐ Variable quality |

### PrepWISE RAG Breakdown

| Namespace | Vectors | Source | Depth Assessment |
|-----------|---------|--------|-----------------|
| gmat-strategy | 964 | PDF books | ⭐⭐⭐⭐ Good — covers study strategies, test format |
| gmat-verbal | 722 | PDF + AI-generated (50 chunks) | ⭐⭐⭐ Adequate — CR/RC strategies covered |
| gmat-quant | 53 | AI-generated (50 chunks) | ⭐⭐ Thin — needs more depth per topic |
| gmat-di | 41 | AI-generated (25 chunks) | ⭐⭐ Thin — DS/MSR/TA/GI basics only |
| gmat-errors | 29 | AI-generated (18 chunks) | ⭐⭐ Thin — common mistakes covered |
| **TOTAL** | **1,809** | | |

---

## Feature Comparison (Updated)

| Feature | TTP | Magoosh | Manhattan | e-GMAT | **PrepWISE** | Verdict |
|---------|-----|---------|-----------|--------|-------------|---------|
| **Total Questions** | 4K+∞AI | 800 | 2,300 | 7,500 | **7,372** | ✅ 2nd place |
| **Voice AI Tutor** | ❌ | ❌ | ❌ | ❌ | **✅ unique** | 🏆 Only us |
| **Long-term Memory** | ❌ | ❌ | ❌ | ❌ | **✅ unique** | 🏆 Only us |
| **Voice Latency** | — | — | — | — | **~2-3s** | ✅ Near-human |
| **Mock Tests** | custom | ❌ | 6 adaptive | 5+90 | **✅ engine** | ✅ Competitive |
| **Study Plan** | AI+calendar | blog | 12-wk | AI+tracker | **✅ rule-based** | ✅ Competitive |
| **Analytics** | deep | topic | Navigator | Scholaranium | **✅ 4 components** | ✅ Competitive |
| **Score Report** | ✅ | predictor | per-mock | ESR+ | **✅ premium** | ✅ Competitive |
| **Flashcards** | AI | app | 1,500 | ❌ | **✅ 100 cards** | ⚠️ Small |
| **Formula Sheet** | ❌ | ❌ | 100+ | ❌ | **✅ 8 sections** | ✅ Competitive |
| **Gamification** | ❌ | ❌ | ❌ | streaks | **✅ streaks+badges** | ✅ Better |
| **Blog/SEO** | ✅ | ✅ | ✅ | ✅ | **✅ 10 articles** | ⚠️ Needs more |
| **Free Trial** | 5 days | 7 days | Starter Kit | free trial | **✅ 7 days** | ✅ Standard |
| **Score Guarantee** | 130pts | +70pts | Higher Score | +100pts | **✅ +70pts** | ✅ Competitive |
| **Audio Explanations** | ❌ | ❌ | ❌ | ❌ | **✅ unique** | 🏆 Only us |
| **Spaced Repetition** | ✅ | ❌ | ❌ | ✅ | **✅ FSRS** | ✅ Competitive |
| **Question of Day** | ❌ | ❌ | ❌ | ❌ | **✅** | 🏆 Only us |
| **Study Journal** | ❌ | ❌ | ❌ | ❌ | **✅ unique** | 🏆 Only us |
| **Video Lessons** | 2,200 | 200 | live+VOD | 250hrs | **❌** | 🔴 Gap |
| **Community/Forum** | ❌ | ❌ | forum | support | **❌** | ⚪ Not priority |
| **Live Instruction** | ✅ | ❌ | 99th% | 3x/week | **❌** | ⚪ Future P3 |
| **Mobile App** | ✅ | ✅ | ✅ | ✅ | **PWA** | ⚠️ Acceptable |
| **Price** | $150-250/mo | $29/mo | $83-167/mo | $83-125/mo | **$39-149/mo** | ✅ Competitive |

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Question Quantity** | 9/10 | 7,372 — 2nd largest after e-GMAT |
| **Question Quality** | 6/10 | AI-generated good but not expert-validated. 4,638 ReClor without explanations |
| **RAG Depth** | 4/10 | 1,809 vectors adequate but thin vs competitors with years of expert content |
| **Unique Features** | 10/10 | Voice AI, Memory, Audio Explanations, Journal — nobody has these |
| **Feature Coverage** | 8/10 | All major features present. Missing: video lessons, community |
| **Price Competitiveness** | 8/10 | Below mid-tier, above budget. Good value for voice AI |
| **GMAT Focus Alignment** | 10/10 | 100% aligned. Some competitors still have AWA/SC content |
| **UX/Design** | 7/10 | Dark theme, functional. Needs real-user testing |
| **Brand/Trust** | 1/10 | Zero track record. Biggest weakness |

**Overall: 7.0/10** — Competitive product, strong on unique features, needs content quality improvement and first users.

---

## Remaining Gaps (Prioritized)

### Must fix before serious traction:
1. **ReClor questions need explanations** — 4,638 CR questions without explanations reduces practice value. Can AI-generate explanations (~$10-15 via Claude).
2. **DI question types missing** — No MSR, TA, GI, TPA questions. Only DS. Need ~200 questions across these types.
3. **RAG quant/DI thin** — 53 and 41 vectors respectively. Need 200+ each for Sam to give deep answers.

### Should fix within first month:
4. **Flashcards too few** — 100 vs Manhattan's 1,500. Generate 400 more.
5. **Blog too few** — 10 articles vs competitors' 50-200. Need 30+ for SEO impact.
6. **AQuA-RAT quality** — 1,000 questions are GRE/GMAT overlap, not Focus-specific. Consider replacing with AI-generated.

### Nice to have:
7. **Video content** — Voice is our differentiator, but some students want video. Consider recording Sam's audio explanations as "video" with animated slides.
8. **Expert validation** — Pay a GMAT tutor $500-1,000 to review 200 representative questions and flag quality issues.

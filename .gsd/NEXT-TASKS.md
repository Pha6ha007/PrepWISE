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

- [x] **8. Blog/SEO content** — 10 full articles (800-1200 words each), blog index + article pages, sitemap updated, blog link on landing.
- [x] **9. Formula Sheet / Quick Reference** — 710-line page with 8 sections, search, bookmarks, print CSS. Added to dashboard nav.
- [x] **10. Flashcards** — 100 cards across 5 decks (Quant Formulas, Number Props, CR Patterns, DS Framework, Vocabulary). Flip animation, rating, localStorage progress.
- [x] **11. Score Guarantee** — '+70 Points or Money Back' page with 7 conditions, 6 FAQ items, CTA. Link from pricing section.
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

---

## Фазы после запуска

### Фаза 1 — первые 2 недели (0→10 пользователей)

**Главная задача: не потерять первых пользователей из-за технических проблем**

- [ ] **1. Error tracking (Sentry)** — Сейчас если что-то сломается у пользователя — не узнаем. Sentry ловит JS ошибки, API падения, тихие фейлы. ~30 минут на интеграцию, бесплатный план.
- [ ] **2. Session replay (PostHog или LogRocket)** — Запись экрана: как пользователь кликал, где завис, что не понял. Без этого нет понимания где реальное трение.
- [x] **3. Onboarding-опросник** — Реализован. Multi-step flow: welcome → profile (имя, целевой балл, предыдущий опыт) → diagnostic (слабые секции, дата теста, часы/неделю) → ready. Middleware редиректит на `/onboarding` пока `preferred_name` не заполнен.

### Фаза 2 — недели 2–4 (10→50 пользователей)

**Главная задача: понять почему уходят**

- [ ] **4. Email последовательность (retention)** — День 1: "Вот что Sam заметил за вашу первую сессию". День 3 без активности: "Вы пропустили 3 дня — вот где вы остановились". День 7: Sam's weekly review на email если не открыл в приложении. Один из главных рычагов retention.
- [x] **5. Страница "Мои тесты" / прогресс** — Реализована. `/dashboard/mock-test/history` — SVG-график прогресса баллов, сравнение Test #1 vs Latest по всем 4 показателям (Total/Q/V/DI), таблица всех тестов с delta между тестами и percentile. Кнопка "View History" добавлена на страницу mock-test. API: `GET /api/mock-test/history`.
- [ ] **6. Referral механика** — "Пригласи друга — оба получают +2 недели". GMAT готовятся парами/группами из одного офиса — органический канал.

### Фаза 3 — 1–3 месяца (50→200 пользователей)

**Главная задача: улучшить продукт по реальным данным**

- [ ] **7. Адаптивный study plan** — Сейчас study plan статичный. Нужна динамическая адаптация под прогресс пользователя. Ценная фича для retention после week 3, когда мотивация падает.
- [ ] **8. Score predictor с калибровкой** — Накопив данные по реальным пользователям, откалибровать предсказание баллов. "Ваш текущий уровень соответствует ~660 на реальном GMAT" с confidence interval. Снижает тревогу, высоко ценится пользователями.
- [ ] **9. Нативное мобильное приложение** — GMAT студенты учатся в метро, в перерывах. PWA уже есть, но нативное приложение даёт пуш-уведомления ("Не забудь про DS — 3 дня перерыв") и лучше работает с микрофоном на iOS. React Native + Expo, ~80% кода переиспользуется.

### Фаза 4 — 3–6 месяцев (200+ пользователей)

**Главная задача: масштабирование и дифференциация**

- [ ] **10. Social proof** — Первый пользователь сдал GMAT на 720 — это кейс-стади, пост в LinkedIn, testimonial на лендинге. Активно собирать с первых же пользователей.
- [ ] **11. B2B канал** — Корпоративные программы для консультантов (McKinsey, BCG, etc.) и MBA prep-программы. Групповые лицензии.
- [ ] **12. Контент-маркетинг** — Blog + YouTube (AI avatar Sam) с реальными разборами GMAT вопросов. SEO трафик по запросам "GMAT DS tips", "GMAT 700 score" — долгосрочный актив.

### Что НЕ делать сразу

- ❌ **Видеоуроки** — дорого создавать, Sam объясняет голосом лучше
- ❌ **Community/форум** — до 500 пользователей это пустой город
- ❌ **Gamification (badges, leaderboard)** — не differentiator, это Duolingo territory
- ❌ **Поддержка других экзаменов (GRE, LSAT)** — размывает фокус пока нет product-market fit

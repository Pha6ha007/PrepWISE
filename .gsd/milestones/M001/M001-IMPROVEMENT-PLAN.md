# Improvement Plan — Closing Gaps with Competitors

> Created: 2026-03-25
> Context: Based on competitive analysis (M001-COMPETITOR-ANALYSIS.md) and market assessment (M001-ASSESSMENT.md)

---

## 1. Качество контента (вопросы)

**Сейчас:** 5,638 вопросов из открытых datasets (AQuA-RAT, ReClor) — хорошие, но generic.

**Что нужно для уровня конкурентов:**

| Действие | Что даст | Нужно | Стоимость |
|----------|----------|-------|-----------|
| AI-генерация 2,000 GMAT-калиброванных вопросов | Вопросы специально под GMAT Focus Edition формат, с trap answers, правильной сложностью | OpenRouter (Claude) | ~$15-20 |
| Загрузить GMAT Official Guide PDF | 802 реальных GMAC вопроса с объяснениями | Купить книгу $35-45 | $45 |
| Загрузить Manhattan Prep Strategy Guides | Глубокие стратегии по каждой секции | Купить set $80-120 | $120 |
| Загрузить TTP-style пошаговые решения | AI-генерация подробных решений к каждому вопросу | OpenRouter | ~$10 |

**Книги которые стоит купить (инвестиция ~$200):**

1. GMAT Official Guide 2025-2026 ($45) — 802 реальных вопроса. Это золотой стандарт.
2. GMAT Official Quantitative Review ($25) — доп. quant вопросы от GMAC
3. GMAT Official Verbal Review ($25) — доп. verbal вопросы от GMAC
4. GMAT Official Data Insights Review ($25) — DI вопросы от GMAC
5. Manhattan Prep GMAT All the Quant ($30) — лучший quant guide
6. Manhattan Prep GMAT All the Verbal ($30) — лучший verbal guide

**Важно:** Загружать книги в RAG — это для обучающего контента (стратегии, объяснения). Сами вопросы из Official Guide **нельзя копировать** в нашу базу — это копирайт GMAC. Их можно использовать как reference для AI-генерации похожих по стилю вопросов.

**Что можно сделать без книг:**
Сгенерировать через Claude 2,000+ вопросов калиброванных под GMAT Focus Edition. Это то, что делает TTP с "unlimited AI-generated questions". Стоимость ~$15-20 через OpenRouter.

---

## 2. Track Record

Это **не техническая проблема** — это маркетинговая. Код тут не поможет. Но можно подготовить инфраструктуру:

| Действие | Что даст |
|----------|----------|
| Добавить отзывы/testimonials секцию на лендинг | Место для будущих отзывов |
| Добавить "Score Improvement Tracker" | Публичная статистика: средний рост баллов пользователей |
| Настроить сбор отзывов (после 10 сессий → prompt) | Автоматический сбор feedback |
| Подготовить шаблоны для Reddit/GMAT Club постов | Быстрый старт маркетинга |

---

## 3. RAG база (глубина контента)

**Сейчас:** 1,709 векторов — базовые формулы и стратегии.

**Что нужно:**

| Namespace | Сейчас | Нужно | Как |
|-----------|--------|-------|-----|
| gmat-quant | 28 | 300-500 | AI-генерация детальных объяснений + книги |
| gmat-verbal | 697 | 1,000+ | Больше CR стратегий, RC passage analysis |
| gmat-di | 16 | 300-500 | DS framework подробнее, MSR/TA/GI примеры |
| gmat-strategy | 957 | 1,000+ | Уже нормально, можно дополнить |
| gmat-errors | 11 | 200+ | Подробные разборы ошибок по каждому топику |

Можно сгенерировать глубокий контент через Claude за ~$5-10.

---

## 4. Voice AI — Возможные улучшения

### Текущий стек:
- STT: Deepgram (Whisper) — речь → текст
- TTS: ElevenLabs — текст → речь (голос Sam)
- Latency: STT (~1s) + LLM (~3-5s) + TTS (~1-2s) = ~5-8s total

### Как улучшить:

| Улучшение | Что даст | Как | Ресурсы |
|-----------|----------|-----|---------|
| Streaming TTS | Sam начинает говорить до конца генерации | ElevenLabs streaming API (уже поддерживает) | Код |
| Real-time STT | Транскрипция по ходу речи, не после | Deepgram live streaming WebSocket | Код |
| Voice Activity Detection (VAD) | Автоматическое определение "пользователь закончил говорить" | Silero VAD (open source) или Deepgram endpointing | Код |
| Lower latency LLM | Быстрее ответы | Groq для простых ответов (~200ms), Claude для сложных | Архитектура |
| Voice cloning / custom voice | Уникальный узнаваемый голос Sam | ElevenLabs Voice Lab (уже в плане) | $5/мес |
| Emotion detection | Sam слышит фрустрацию/уверенность в голосе | Hume AI (API) или Deepgram sentiment | $20-50/мес |
| Multi-language support | Sam говорит на языке студента | ElevenLabs multilingual v2 | Уже поддерживается |

### Open-source репозитории для улучшения Voice AI:

| Репо | Что делает | Лицензия |
|------|-----------|----------|
| `fixie-ai/ultravox` | End-to-end voice AI (speech-to-speech, без промежуточного текста) | Apache 2.0 |
| `livekit/agents` | Real-time voice AI pipeline framework | Apache 2.0 |
| `pipecat-ai/pipecat` | Open source framework for voice and multimodal AI agents | BSD |
| `snakers4/silero-vad` | Voice Activity Detection model | MIT |
| `openai/whisper` | STT model (self-hosted alternative to Deepgram) | MIT |
| `coqui-ai/TTS` | Open source TTS (self-hosted alternative to ElevenLabs) | MPL 2.0 |

---

## 5. Long-term Memory — Возможные улучшения

### Текущее состояние:
- Memory Agent запускается после каждой сессии
- Извлекает: weak_topics, strong_topics, effective_techniques, common_error_patterns, learning_style
- Сохраняет в User.gmatProfile (JSON в Prisma)
- Следующая сессия получает профиль в system prompt

### Как улучшить:

| Улучшение | Что даст | Как |
|-----------|----------|-----|
| Session summaries | Sam может сказать "В прошлый раз мы остановились на..." | Сохранять краткое резюме каждой сессии, не только профиль |
| Spaced repetition memory | Sam знает когда пора повторить тему (не только FSRS в practice, но и в voice sessions) | Интеграция FSRS с Memory Agent |
| Emotional memory | "В прошлый раз DS вызвал фрустрацию — подойдём мягче" | Добавить emotional_patterns в профиль |
| Progress milestones | Sam отмечает прогресс: "Месяц назад ты не мог решить DS, а сейчас 80% правильных" | Сохранять snapshots профиля по датам |
| Cross-session topic linking | "Это похоже на ту задачу с неравенствами из прошлой сессии" | Vector search по прошлым сессиям |
| Forgetting curve | Sam знает что студент скорее всего забыл (прошло 2 недели без practice) | Exponential decay model на topic mastery |

### Нужно ли улучшать сейчас?

**Нет — текущая memory достаточна для запуска.** Улучшения memory — это то, что создаёт WOW-эффект у retention пользователей (сессия 5, 10, 20). Но для первых 10 пользователей текущий уровень достаточен. Улучшать после получения реального feedback.

---

## Приоритет усилений

### Сейчас (до запуска):
1. AI-генерация 2,000 калиброванных вопросов (~$15-20)
2. Углубление RAG до 3,000+ векторов (~$5-10)

### После первых 10 пользователей:
3. Streaming TTS (снижение latency)
4. Real-time STT (WebSocket)
5. Session summaries в memory

### После первых 100 пользователей:
6. Покупка и индексация Official Guide + Manhattan books ($200)
7. Emotion detection in voice
8. Cross-session topic linking
9. Score Improvement Tracker (публичная статистика)

### После $5K MRR:
10. Custom voice для Sam (ElevenLabs Voice Lab)
11. Self-hosted Whisper (снижение costs)
12. Multi-language support

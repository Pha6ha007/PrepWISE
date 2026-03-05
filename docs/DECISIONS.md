# Architectural Decisions

> Почему мы выбрали определенные технологии и сделали конкретные архитектурные решения.
> Этот файл редко обновляется - только при принятии важных решений.

---

## Technology Stack Decisions

### Why Paddle Instead of Stripe

**Решение:** Использовать Paddle как платежный провайдер

**Обоснование:**
- **Paddle = Merchant of Record** - они сами платят все налоги и VAT в 40+ странах
- Для solo-разработчика на рынках EN + RU - огромная экономия времени и денег
- Комиссия 5% + $0.50 но ноль головной боли с налогами, бухгалтером, compliance
- Trade-off: более высокая комиссия vs полное отсутствие налоговых проблем

**Альтернатива (Stripe):**
- Комиссия ниже (2.9% + $0.30)
- НО: нужен бухгалтер, регистрация VAT в каждой стране, tax compliance
- Для стартапа это тысячи долларов в год только на бухгалтерию

### Why PWA Before React Native

**Решение:** Сначала Progressive Web App, потом нативные приложения

**Обоснование:**
- **Одна кодовая база** - Next.js работает как веб и как PWA
- **0% комиссий** - нет App Store / Google Play (Apple/Google берут 15-30%)
- **Мгновенные обновления** - без процесса ревью магазинов
- **SEO работает** - PWA индексируется, React Native нет
- **next-pwa** превращает Next.js в PWA с минимальными изменениями

**Этапы мобильной стратегии:**
1. **Веб (сейчас)** - responsive Next.js для всех устройств
2. **PWA (Phase 2)** - установка на домашний экран, push notifications, offline
3. **React Native (v2.0+)** - только после доказанного Product-Market Fit

### Why Supabase for Database

**Решение:** PostgreSQL через Supabase вместо прямой БД

**Обоснование:**
- **Встроенная Auth** - email/password + Google OAuth из коробки
- **Realtime subscriptions** - для живых обновлений чата
- **Storage** - для аудио файлов и PDF дневников
- **Connection pooling** - pgbouncer включен (важно для serverless)
- **Free tier** - достаточен для MVP (500MB БД, 1GB storage, 2GB bandwidth)
- **Managed service** - нет DevOps overhead

**Альтернативы:**
- Прямой PostgreSQL на Vercel - нужен отдельный hosting для БД
- PlanetScale (MySQL) - хорош, но нет встроенной auth и storage

### Why Groq for Development, OpenAI for Production

**Решение:** Использовать Groq API (бесплатно) во время разработки

**Обоснование:**
- **llama-3.3-70b-versatile бесплатен** во время разработки
- **Тот же OpenAI SDK интерфейс** - легко переключаться
- **Экономия денег** во время раннего тестирования
- **Fallback на OpenAI** когда нужна стабильность

**Реализация:**
```typescript
// lib/openai/client.ts автоматически выбирает провайдера
const provider = process.env.GROQ_API_KEY ? 'groq' : 'openai'
```

---

## RAG System Decisions

### Query Expansion Strategy

**Решение:** Расширять пользовательские запросы перед embedding

**Обоснование:**
- **Короткие запросы** типа "I'm anxious" недостаточно семантически богаты
- **Expansion добавляет domain keywords** → лучший retrieval
- **Результаты:** +48.8% улучшение baseline → expansion
- **Стоимость negligible:** ~$0.00004 на запрос (GPT-4o-mini)
- **Latency приемлемая:** ~500ms

**Пример:**
```
User: "I'm anxious"
Expanded: "I'm feeling anxious, worried, experiencing panic, stress,
           overwhelmed, racing thoughts, physical tension"
```

### LLM-based Reranking vs Transformer Models

**Решение:** Использовать GPT-4o-mini для reranking вместо локальных cross-encoders

**Обоснование:**
- **Нет overhead** на скачивание/хостинг моделей
- **Лучше semantic understanding** чем BERT-based модели
- **Reasoning output** помогает с debugging
- **Результаты:** +10.3% улучшение поверх expansion
- **Стоимость приемлемая:** ~$0.0001 на запрос

**Альтернативы:**
- Local cross-encoder (ms-marco-MiniLM-L-6-v2) - требует hosting, хуже accuracy
- Cohere Rerank API - платно, vendor lock-in

### Chunk Size: 500 Tokens with 50 Overlap

**Решение:** Использовать чанки по 500 токенов с overlap 50

**Обоснование:**
- **Баланс** между сохранением контекста и гранулярностью
- **Слишком маленькие** (<200): теряют coherence
- **Слишком большие** (>800): retrieval возвращает irrelevant content
- **50-token overlap** предотвращает разрыв концептов посередине

**Параметры:**
```typescript
chunkSize: 500 tokens
overlap: 50 tokens
separator: "\n\n" (абзацы)
```

---

## Agent Architecture Decisions

### Specialist Agents vs One Universal Agent

**Решение:** 6 специализированных агентов вместо одного универсального

**Обоснование:**
- **Domain-specific prompts** для каждого агента
- **Специализированные RAG namespaces** (anxiety_cbt, family, trauma, mens, womens, general)
- **Лучший retrieval accuracy** - MENS: +117.9% улучшение после создания namespace
- **Handoff protocol** позволяет seamless переключение
- **Пользователь не видит сложности** - выглядит как один собеседник

**Агенты:**
1. Anxiety - CBT/ACT/DBT для тревоги
2. Family - Gottman/Satir для семейных проблем
3. Trauma - van der Kolk для ПТСР и детских травм
4. Relationships - Attachment Theory для личных отношений
5. Men's - Terry Real для мужской специфики
6. Women's - Mental load для женской специфики

### Orchestrator Routing: Keyword-based

**Решение:** Использовать keyword detection вместо LLM classification

**Обоснование:**
- **Быстрее** - нет дополнительного LLM вызова
- **Более предсказуемо** - четкие правила
- **Достаточная accuracy** - 5/6 routing тестов passed
- **Можно upgrade** на LLM если понадобится

**Логика:**
```typescript
if (message.includes('mom' || 'dad' || 'family')) → FamilyAgent
if (message.includes('anxious' || 'panic' || 'worry')) → AnxietyAgent
// etc.
```

### Mid-Conversation Handoff Protocol

**Решение:** Разрешить агентам передавать разговор друг другу

**Обоснование:**
- **Темы меняются** - пользователь может начать про тревогу, потом перейти к отношениям
- **shouldReroute()** анализирует последние 3-5 сообщений
- **Seamless переход** - пользователь не замечает смену агента
- **Контекст сохраняется** - новый агент получает всю историю

---

## Memory System Decisions

### JSON Profile Storage vs Embeddings

**Решение:** Хранить профиль пользователя как JSON в PostgreSQL

**Обоснование:**
- **Структурированные данные** легко обновлять инкрементально
- **Memory Agent может merge** новые факты без перезаписи
- **Быстрый retrieval** - не нужен vector search
- **Дополняет** semantic search в Pinecone

**Структура:**
```json
{
  "communication_style": "...",
  "emotional_profile": {
    "triggers": [...],
    "pain_points": [...]
  },
  "life_context": {...},
  "patterns": [...],
  "what_worked": [...]
}
```

### Session Summaries: Post-conversation

**Решение:** Генерировать summary после завершения разговора, не в реальном времени

**Обоснование:**
- **Не замедляет чат** - пользователь не ждёт
- **Более полный контекст** для summary
- **Memory Agent thoughtfully извлекает** 5-7 ключевых фактов
- **Fire-and-forget** операция

**Триггер:**
- "New Conversation" button → завершает сессию → запускает Memory Agent

### 3-Layer Memory Architecture

**Решение:** Три уровня памяти вместо одного

**Обоснование:**
- **Short-term (30 messages)** - быстрый доступ, живой контекст разговора
- **Long-term (JSON profile)** - структурированные знания о пользователе
- **Semantic (Pinecone)** - поиск по всей истории разговоров

**Почему не один слой:**
- Semantic search медленный для каждого запроса
- JSON профиль fast lookup для частых паттернов
- Short-term для immediate context

---

## Security & Privacy Decisions

### Crisis Detection: Hardcoded Protocol

**Решение:** Crisis protocol НЕ через LLM, а hardcoded

**Обоснование:**
- **Safety critical** - нельзя доверять LLM
- **Предсказуемость** - всегда один и тот же ответ
- **Мгновенно** - нет латентности LLM вызова
- **Compliance** - юридическая ответственность требует детерминизма

**Триггеры (keyword-based):**
```typescript
['suicide', 'kill myself', 'end it all', 'не хочу жить', ...]
```

**Ресурсы hardcoded по странам:**
- USA: 988 Suicide & Crisis Lifeline
- UK: Samaritans - 116 123
- Russia: 8-800-2000-122

### Never Log Message Content

**Решение:** НИКОГДА не логировать содержимое сообщений пользователей

**Обоснование:**
- **Приватность** - ментальное здоровье extremely sensitive
- **Trust** - breach of trust = конец продукта
- **Compliance** - GDPR, HIPAA требования
- **Логируем только:** user_id, timestamp, агент, mood_score, кризис (boolean)

### Rate Limiting by Plan

**Решение:** Разные лимиты для Free/Pro/Premium

**Обоснование:**
- **Abuse prevention** - без лимитов = спам
- **Cost control** - OpenAI API стоит денег
- **Monetization** - incentive для upgrade

**Лимиты:**
- Free: 5 сообщений / 10 минут
- Pro: 30 сообщений / 10 минут
- Premium: 60 сообщений / 10 минут

---

## UI/UX Design Decisions

### Warm Minimalism vs Playful Design

**Решение:** Тёплый минималистичный дизайн как дорогой дневник

**Обоснование:**
- **НЕ игровой** (как Replika/Wysa с пингвинами) - не trivializes проблемы
- **НЕ корпоративный холодный** (как BetterHelp) - не intimidating
- **Тёплый личный** - как Moleskine дневник или уютное кафе

**Референсы:**
- Notion (чистота, минимализм)
- Linear (плавные анимации)
- Apple Health (доверие, медицинский но не холодный)

### Color Palette: Indigo + Amber

**Решение:**
- Primary: #6366F1 (indigo)
- Warm: #F59E0B (amber)
- Background: #FAFAF9 (кремовый)

**Обоснование:**
- **Indigo** - trust, calm, professional (но не корпоративный синий)
- **Amber** - warmth, support, hope
- **Кремовый фон** - уют, не холодный белый (#FFFFFF)

### Typography: Instrument Serif + Inter

**Решение:**
- Заголовки: Instrument Serif
- Основной текст: Inter

**Обоснование:**
- **Instrument Serif** - тёплый, личный, дневник
- **Inter** - читаемость, современность, не скучный

---

## Monetization Decisions

### Pricing: $19/month Pro Plan

**Решение:** $19/мес как основной платный план

**Обоснование:**
- **10× дешевле BetterHelp** ($240-360/мес)
- **На уровне Replika** ($19/мес) - доказанная willingness to pay
- **Выше Wysa** ($75/год = $6.25/мес) - но больше value (голос, память)
- **Sweet spot** для perceived value

**План Free:**
- 5 сессий/неделю - достаточно для try, недостаточно для rely

**План Premium ($29/мес):**
- Для power users - полная аналитика, приоритетная поддержка

### Crisis Support Always Free

**Решение:** Crisis detection доступен даже на Free плане

**Обоснование:**
- **Этика** - нельзя paywall safety
- **Юридическая ответственность** - если доступно только платящим = liability
- **Brand** - "мы заботимся о людях, не только о деньгах"

---

## Future Decisions to Document

По мере роста проекта добавляй сюда:
- React Native vs Flutter (когда дойдём до нативных приложений)
- Self-hosting LLM vs API (если масштаб вырастет)
- B2B корпоративная архитектура
- Marketplace живых терапевтов - модель комиссий
- 3D аватар - технология выбора

---

*Последнее обновление: март 2026*

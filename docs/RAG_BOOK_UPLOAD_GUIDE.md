# RAG Book Upload Guide

Пошаговая инструкция по загрузке психологических книг в RAG систему Confide.

---

## 📋 Быстрый старт

```bash
# 1. Положить PDF в папку books/
cp /path/to/book.pdf books/

# 2. Загрузить в Pinecone
npx tsx scripts/ingest-knowledge.ts \
  --file="books/[filename].pdf" \
  --namespace="[namespace]" \
  --title="[Book Title]" \
  --author="[Author Name]"

# 3. Проверить загрузку
npx tsx scripts/list-knowledge.ts
```

---

## 1️⃣ Подготовка PDF

### ✅ Качественный PDF

**Требования:**
- Текстовый PDF (не отсканированный)
- Чистый текст без водяных знаков
- Полная версия книги (не summary/excerpts)
- Английский или русский язык

**Проверка качества:**
```bash
# Откройте PDF и выделите текст мышкой
# Если текст выделяется — PDF текстовый ✅
# Если текст НЕ выделяется — PDF скан ❌ (нужен OCR)
```

### ❌ Проблемные PDF

**НЕ загружайте:**
- Сканы книг без OCR
- Summaries/excerpts (нужна полная книга)
- PDF с DRM защитой
- Книги с обилием картинок/диаграмм

### 🧹 Очистка PDF (опционально)

**Удалите перед загрузкой:**
- Endorsement quotes (первые 5-10 страниц)
- Preface/Foreword от других авторов
- Index/Table of Contents
- Appendices (если не критичны)

**Оставьте:**
- Основной контент (Chapter 1 onwards)
- Примеры из практики
- Упражнения и техники

**Инструмент:** Adobe Acrobat или Preview (Mac) для удаления страниц

---

## 2️⃣ Выбор Namespace

### Доступные namespaces

| Namespace | Когда использовать | Примеры книг |
|-----------|-------------------|--------------|
| **anxiety_cbt** | Тревога, панические атаки, ОКР, CBT/ACT/DBT методики | Feeling Good, Brain Lock, DBT Skills |
| **family** | Семейные отношения, брак, attachment theory, воспитание | Seven Principles (Gottman), Attached, Hold Me Tight |
| **trauma** | ПТСР, детские травмы, freeze/fight/flight, body work | The Body Keeps the Score, Trauma and Recovery |
| **general** | Самооценка, meaning, экзистенциальные темы, общая психология | On Becoming a Person, Man's Search for Meaning |
| **mens** | Мужская депрессия, masculinity, скрытые эмоции | I Don't Want to Talk About It |
| **womens** | Женские темы, материнство, emotional labor | (пока пусто — использовать general) |
| **crisis** | Суицидальные мысли, self-harm, кризисное вмешательство | (зарезервировано) |

### 🤔 Как выбрать namespace?

**Вопросы для выбора:**
1. Какую проблему пользователя решает книга?
2. Какой агент будет использовать эти знания?
3. Есть ли overlap с другими namespaces?

**Правила:**
- Если книга покрывает **несколько тем** → выбрать основную или загрузить в 2 namespace
- Если **не уверен** → использовать `general`
- Если про **specific technique (CBT/DBT)** → `anxiety_cbt`
- Если про **relationships** → `family`

---

## 3️⃣ Загрузка книги

### Команда

```bash
npx tsx scripts/ingest-knowledge.ts \
  --file="books/[filename].pdf" \
  --namespace="[namespace]" \
  --title="[Book Title]" \
  --author="[Author Name]"
```

### Параметры

| Параметр | Описание | Пример |
|----------|----------|--------|
| `--file` | Путь к PDF файлу | `books/Feeling Good.pdf` |
| `--namespace` | Namespace в Pinecone | `anxiety_cbt` |
| `--title` | Название книги | `Feeling Good: The New Mood Therapy` |
| `--author` | Автор | `David Burns` |

### Примеры

**Anxiety book:**
```bash
npx tsx scripts/ingest-knowledge.ts \
  --file="books/Feeling Good.pdf" \
  --namespace="anxiety_cbt" \
  --title="Feeling Good: The New Mood Therapy" \
  --author="David Burns"
```

**Family book:**
```bash
npx tsx scripts/ingest-knowledge.ts \
  --file="books/Seven Principles.pdf" \
  --namespace="family" \
  --title="The Seven Principles for Making Marriage Work" \
  --author="John Gottman"
```

**Trauma book:**
```bash
npx tsx scripts/ingest-knowledge.ts \
  --file="books/Body Keeps Score.pdf" \
  --namespace="trauma" \
  --title="The Body Keeps the Score" \
  --author="Bessel van der Kolk"
```

### Процесс загрузки

```
🚀 Confide RAG Knowledge Ingestion

📄 File: books/Feeling Good.pdf
📚 Title: Feeling Good: The New Mood Therapy
✍️  Author: David Burns
🏷️  Namespace: anxiety_cbt

🔍 Checking for duplicates...
   ✓ No duplicates found

📖 Reading PDF...
   Pages: 190
   Characters: 124,318

✂️  Chunking text...
   Created 73 chunks

🔢 Creating embeddings...
   Creating embeddings for chunks 1-73...
   ✓ Created 73 embeddings

☁️  Uploading to Pinecone...
   Uploaded 73/73 vectors
   ✓ Upload complete

💾 Saving metadata to database...
   ✓ Saved 73 entries

✅ Knowledge ingestion complete!
```

**Время загрузки:**
- Маленькая книга (100-200 страниц): 1-2 минуты
- Средняя книга (200-400 страниц): 2-4 минуты
- Большая книга (400+ страниц): 4-8 минут

---

## 4️⃣ Проверка загрузки

### Инвентаризация RAG системы

```bash
npx tsx scripts/list-knowledge.ts
```

**Вывод:**
```
📚 Confide RAG System — Full Inventory

📊 SOURCE 1: PostgreSQL knowledge_base table

📁 Namespace: ANXIETY_CBT (1791 chunks)
────────────────────────────────────────────────
1. "Feeling Good: The New Mood Therapy"
   Author: David Burns
   Chunks: 73
```

### Тестовый запрос

```bash
# Создать простой test script
node -e "
const { retrieveContext } = require('./lib/pinecone/retrieval');
const { NAMESPACES } = require('./lib/pinecone/client');

(async () => {
  const chunks = await retrieveContext(
    'I feel anxious all the time',
    NAMESPACES.ANXIETY_CBT,
    5
  );
  console.log('Found chunks:', chunks.length);
  console.log('Top score:', chunks[0]?.score);
  console.log('Book:', chunks[0]?.metadata.book_title);
})();
"
```

**Ожидаемый результат:**
- Found chunks: 5
- Top score: 0.6+ (хороший score)
- Book: название загруженной книги

---

## 5️⃣ Удаление книги (если нужно)

### Удалить из Pinecone + PostgreSQL

```bash
npx tsx scripts/delete-vectors.ts \
  --namespace="anxiety_cbt" \
  --title="Feeling Good: The New Mood Therapy" \
  --author="David Burns"
```

**Использовать когда:**
- Загружен дубликат
- Книга плохого качества (low scores при тестировании)
- Нужно обновить версию книги

---

## 6️⃣ Troubleshooting

### ❌ "Duplicate detected"

**Проблема:**
```
⚠️  Warning: Book already exists in database
   Title: Feeling Good
   Author: David Burns
   Existing chunks: 73
   This will ADD duplicate vectors to Pinecone!
```

**Решение:**
1. Проверить что это действительно дубликат
2. Удалить старую версию: `npx tsx scripts/delete-vectors.ts ...`
3. Загрузить заново

### ❌ "File not found"

**Проблема:**
```
❌ File not found: books/Feeling Good.pdf
```

**Решение:**
- Проверить путь к файлу: `ls -la books/`
- Использовать правильное имя файла (с учётом пробелов и спецсимволов)
- Использовать кавычки: `--file="books/My Book.pdf"`

### ❌ Low retrieval scores после загрузки

**Проблема:**
Книга загружена, но при тестировании scores низкие (< 0.5)

**Возможные причины:**
1. PDF плохого качества (scan, OCR ошибки)
2. Книга содержит много endorsements/metadata
3. Неправильный namespace (книга про семью, а загружена в anxiety_cbt)

**Решение:**
1. Удалить книгу
2. Очистить PDF (удалить endorsements)
3. Проверить namespace
4. Загрузить заново
5. Протестировать: `npx tsx scripts/test-rag.ts`

---

## 7️⃣ Рекомендации по книгам

### Высокоприоритетные книги (нужно добавить)

**ANXIETY namespace:**
- [ ] "Anxiety and Phobia Workbook" — Edmund Bourne
- [ ] "When Panic Attacks" — David Burns
- [ ] "The Happiness Trap" — Russ Harris (ACT)

**FAMILY namespace:**
- [ ] "Attached" — Amir Levine (attachment theory)
- [ ] "Hold Me Tight" — Sue Johnson (EFT)
- [ ] "Adult Children of Emotionally Immature Parents" — Lindsay Gibson

**TRAUMA namespace:**
- [ ] "Trauma and Recovery" — Judith Herman (полная версия)
- [ ] "The Body Keeps the Score" — van der Kolk (полная версия)

**MENS namespace (КРИТИЧЕСКИ НУЖНЫ):**
- [ ] "No More Mr. Nice Guy" — Robert Glover
- [ ] "The Mask of Masculinity" — Lewis Howes
- [ ] "Man Enough" — Justin Baldoni

**WOMENS namespace (создать!):**
- [ ] "Daring Greatly" — Brené Brown
- [ ] "Women Who Run With the Wolves" — Clarissa Pinkola Estés
- [ ] "The Gifts of Imperfection" — Brené Brown

**GENERAL namespace:**
- [ ] "Self-Compassion" — Kristin Neff
- [ ] "The Six Pillars of Self-Esteem" — Nathaniel Branden
- [ ] "Lost Connections" — Johann Hari

### Где найти книги

**Легальные источники:**
- Library Genesis (archive)
- Open Library
- Internet Archive
- Z-Library (если доступен)

**Коммерческие:**
- Amazon Kindle (конвертировать в PDF)
- Google Books
- Apple Books

---

## 8️⃣ Best Practices

### ✅ DO

- Загружать полные версии книг (не excerpts)
- Проверять качество PDF перед загрузкой
- Использовать правильный namespace
- Тестировать retrieval после загрузки
- Удалять endorsements/preface из PDF
- Документировать какие книги загружены

### ❌ DON'T

- Загружать summaries вместо полных книг
- Игнорировать duplicate warnings
- Загружать книги в неправильный namespace
- Забывать тестировать после загрузки
- Оставлять endorsements в PDF
- Загружать книги без проверки качества

---

## 📊 Текущее состояние RAG (2026-03-04)

**Статистика:**
- Книг: 37
- Векторов: 9,431
- Средний retrieval score: **0.64** (MARGINAL)

**По namespaces:**

| Namespace | Books | Vectors | Status |
|-----------|-------|---------|--------|
| general | 19 | 5,937 | ✅ Хорошо |
| anxiety_cbt | 9 | 1,789 | ✅ Хорошо |
| family | 4 | 869 | ⚠️ Нужно больше книг |
| trauma | 4 | 778 | ⚠️ Нужно больше книг |
| mens | 1 | 40 | ❌ Критически мало |
| womens | 0 | 0 | ❌ Пусто |

**Приоритеты:**
1. Добавить 2-3 книги в MENS
2. Создать WOMENS namespace
3. Добавить больше книг в FAMILY и TRAUMA

---

## 🔧 Технические детали

**Chunking параметры:**
- Chunk size: 800 tokens (~3200 символов)
- Overlap: 150 tokens (~600 символов)
- Model: `text-embedding-3-small` (OpenAI)
- Dimensions: 1536
- Similarity: cosine

**Metadata каждого chunk:**
```json
{
  "text": "chunk content...",
  "book_title": "Feeling Good",
  "author": "David Burns",
  "namespace": "anxiety_cbt",
  "chunk_index": 42
}
```

**Хранение:**
- Pinecone: векторы + metadata
- PostgreSQL: reference записи (book title, author, chunk count)

---

**Вопросы?** Создай issue в GitHub или спроси в Claude Code.

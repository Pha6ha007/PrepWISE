# Генерация DI вопросов + объяснений к ReClor

> Открой claude.ai, создай отдельные чаты для каждого промпта.
> Сохрани результаты в указанные файлы.

---

## ЧАТ 1: Table Analysis вопросы (50 шт)

```
Generate 50 GMAT Focus Edition Table Analysis (TA) questions in JSON format.

Table Analysis questions present a sortable data table and ask Yes/No or fill-in-the-blank questions about the data.

Requirements:
- Difficulty: 12 easy, 20 medium, 12 hard, 6 "700+"
- Topics: business revenue, demographics, scientific measurements, economic data, survey results
- Each question must include a realistic data table (as text) in the passage

Each question MUST have:
- "id": "gen-ta-0001" (sequential)
- "type": "TA"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "table-analysis"
- "subtopic": "sorting" | "filtering" | "threshold" | "compound-conditions" | "calculations"
- "passage": the table data as formatted text (use | for columns, one row per line). Include 5-8 rows and 4-6 columns. Add a brief context sentence before the table.
- "questionStem": the question about the table
- "options": 5 choices [{"id":"A","text":"..."}, ...]
- "correctAnswer": "A"-"E"
- "explanation": step-by-step solution referencing specific rows/values
- "source": "PrepWISE Generated"

Example passage format:
"The following table shows quarterly sales data for five retail chains in 2024.\n\n| Company | Q1 ($M) | Q2 ($M) | Q3 ($M) | Q4 ($M) | Employees |\n|---------|---------|---------|---------|---------|----------|\n| AlphaRetail | 12.4 | 15.1 | 14.8 | 18.2 | 3,400 |\n..."

Output ONLY a valid JSON array. Start with [ and end with ].
```

### Сохрани в: `data/questions/gen-ta.json`

---

## ЧАТ 2: Graphics Interpretation вопросы (50 шт)

```
Generate 50 GMAT Focus Edition Graphics Interpretation (GI) questions in JSON format.

GI questions present a graph or chart (described in text) with fill-in-the-blank statements using dropdown selections.

Requirements:
- Difficulty: 12 easy, 20 medium, 12 hard, 6 "700+"
- Graph types: bar charts (15), line graphs (15), scatter plots (10), pie charts (10)
- Each question describes a graph in text and asks to complete a statement

Each question MUST have:
- "id": "gen-gi-0001" (sequential)
- "type": "GI"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "graphics-interpretation"
- "subtopic": "bar-chart" | "line-graph" | "scatter-plot" | "pie-chart"
- "passage": description of the graph/chart with specific data points. Be detailed enough that the question can be answered from the description. Include axis labels, units, and specific values.
- "questionStem": a fill-in-the-blank statement like "The percentage increase from 2020 to 2022 was closest to ___"
- "options": 5 choices [{"id":"A","text":"..."}, ...]
- "correctAnswer": "A"-"E"
- "explanation": step-by-step calculation referencing the graph data
- "source": "PrepWISE Generated"

Example passage:
"A bar chart shows the annual revenue (in millions of dollars) for Company X from 2019 to 2024. The bars show the following values: 2019: $45M, 2020: $38M, 2021: $52M, 2022: $61M, 2023: $58M, 2024: $72M. The y-axis ranges from $0 to $80M in increments of $10M."

Output ONLY a valid JSON array. Start with [ and end with ].
```

### Сохрани в: `data/questions/gen-gi.json`

---

## ЧАТ 3: Multi-Source Reasoning вопросы (50 шт)

```
Generate 50 GMAT Focus Edition Multi-Source Reasoning (MSR) questions in JSON format.

MSR questions present 2-3 sources of information (text passages, tables, emails, reports) and ask questions that require synthesizing across sources.

Requirements:
- Difficulty: 10 easy, 20 medium, 14 hard, 6 "700+"
- Source types: text+table, email+report, two text passages, text+chart description
- Questions often use Yes/No format ("Does the information support X?")

Each question MUST have:
- "id": "gen-msr-0001" (sequential)
- "type": "MSR"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "multi-source-reasoning"
- "subtopic": "synthesis" | "conditional-logic" | "yes-no" | "inference"
- "passage": all sources combined in one text block, separated by headers like "Source 1: [Title]" and "Source 2: [Title]". Each source should be 80-150 words. Include 2-3 sources per question.
- "questionStem": the question
- "options": 5 choices [{"id":"A","text":"..."}, ...]
- "correctAnswer": "A"-"E"
- "explanation": step-by-step showing which source provides which information
- "source": "PrepWISE Generated"

Output ONLY a valid JSON array. Start with [ and end with ].
```

### Сохрани в: `data/questions/gen-msr.json`

---

## ЧАТ 4: Two-Part Analysis вопросы (50 шт)

```
Generate 50 GMAT Focus Edition Two-Part Analysis (TPA) questions in JSON format.

TPA questions require selecting two answers from the same set of options to satisfy two related conditions (e.g., "Column 1" and "Column 2").

Requirements:
- Difficulty: 10 easy, 20 medium, 14 hard, 6 "700+"
- Types: algebraic TPA (25), verbal/argument TPA (25)
- Algebraic: two unknowns that satisfy two constraints
- Verbal: identify premise + conclusion, or two roles in an argument

Each question MUST have:
- "id": "gen-tpa-0001" (sequential)
- "type": "TPA"
- "section": "data-insights"
- "difficulty": "easy" | "medium" | "hard" | "700+"
- "topic": "two-part-analysis"
- "subtopic": "algebraic" | "verbal" | "constraint-matching"
- "passage": the problem setup (for algebraic: word problem with two unknowns; for verbal: a short argument passage)
- "questionStem": what the two columns represent (e.g., "Select a value for X and a value for Y that together satisfy the conditions" or "Select the statement that is a premise and the statement that is a conclusion")
- "options": 6-8 choices [{"id":"A","text":"..."}, ...] — same options for both columns
- "correctAnswer": "A,C" format — two letters separated by comma (first letter = Column 1, second = Column 2)
- "explanation": step-by-step showing why each selection satisfies its column's requirement
- "source": "PrepWISE Generated"

Output ONLY a valid JSON array. Start with [ and end with ].
```

### Сохрани в: `data/questions/gen-tpa.json`

---

## ЧАТ 5: Объяснения к ReClor вопросам (batch 1 — первые 500)

Это большая задача. ReClor имеет 4,638 CR вопросов без объяснений. Генерируем объяснения пачками по 500.

```
I have GMAT Critical Reasoning questions that need explanations added. For each question, generate a clear explanation that:
1. Identifies the argument structure (premise → conclusion → gap)
2. Explains why the correct answer is right
3. Explains why at least 2 wrong answers are tempting but incorrect

I'll give you 20 questions at a time. For each, return ONLY a JSON object: {"id": "question_id", "explanation": "your explanation"}

Here are the first 20 questions:

Question 1 (ID: reclor-0001):
Passage: [I'll paste from the file]
Question: [question stem]  
Correct Answer: [letter]
Options: [A-E options]

[...repeat for 20 questions...]

Output a JSON array of 20 objects with id and explanation. ONLY the JSON array.
```

### ВАЖНО: Это нужно делать итеративно — по 20 вопросов за сообщение.
### Это займёт ~230 сообщений (4,638 / 20).
### Рекомендация: начни с первых 500, остальные позже.

### Для первых 500: я подготовлю файл с вопросами для копирования.

---

## ЧАТ 6: Альтернатива к ReClor — просто отметить что объяснения нет

Вместо генерации 4,638 объяснений можно:
1. Добавить в UI пометку "Explanation not available — Ask Sam!" с кнопкой перехода к тьютору
2. Sam объяснит вопрос в реальном времени через голос — это наше преимущество

Это быстрее и использует наш differentiator. Генерация объяснений к ReClor можно делать постепенно.

---

## После генерации

Когда файлы готовы (gen-ta.json, gen-gi.json, gen-msr.json, gen-tpa.json):
1. Сохрани каждый файл в `data/questions/`
2. Скажи мне — я валидирую и обновлю question-bank.ts
3. Общее количество вопросов станет: 7,372 + 200 DI = ~7,572

Для ReClor объяснений — решим отдельно (Чат 5 vs Чат 6 подход).

# Инструкции по генерации контента через Claude (подписка)

> Открой claude.ai, создай 6 отдельных чатов, и в каждый вставь соответствующий промпт.
> Скопируй ВЕСЬ ответ Claude (JSON) и сохрани в указанный файл.

---

## ЧАТ 1: Quant PS вопросы (500 шт)

### Промпт:

```
Generate 500 GMAT Focus Edition Quantitative Reasoning (Problem Solving) questions in JSON format.

Requirements:
- All questions must be multiple choice with 5 options (A-E)
- Difficulty distribution: 150 easy, 200 medium, 100 hard, 50 "700+"
- Topic distribution:
  - Arithmetic (ratios, percents, fractions, decimals): 100 questions
  - Algebra (linear equations, quadratics, functions, exponents, inequalities): 120 questions
  - Number Properties (primes, divisibility, remainders, odd/even, GCD/LCM): 80 questions
  - Word Problems (rate/time/distance, work, mixtures, profit/loss, interest): 100 questions
  - Statistics & Probability (mean, median, combinations, permutations, probability): 100 questions

Each question MUST include:
- Realistic GMAT-style wording (concise, unambiguous)
- One clearly correct answer
- 4 plausible wrong answers (trap answers that test common mistakes)
- Step-by-step explanation
- The explanation should name the trap: "Choice C is tempting because..."

Output format — ONLY valid JSON array, no markdown, no commentary:

[
  {
    "id": "gen-quant-ps-0001",
    "type": "PS",
    "section": "quant",
    "difficulty": "easy",
    "topic": "arithmetic",
    "subtopic": "percents",
    "text": "If a shirt originally priced at $80 is discounted by 25%, what is the sale price?",
    "options": [
      {"id": "A", "text": "$20"},
      {"id": "B", "text": "$55"},
      {"id": "C", "text": "$60"},
      {"id": "D", "text": "$65"},
      {"id": "E", "text": "$75"}
    ],
    "correctAnswer": "C",
    "explanation": "Discount = 25% of $80 = $20. Sale price = $80 - $20 = $60. Choice A ($20) is the discount amount, not the sale price — a common trap.",
    "source": "SamiWISE Generated"
  },
  ...
]

Generate all 500 questions. Output ONLY the JSON array. Start immediately with [ and end with ].
```

### Сохрани ответ в файл: `data/questions/gen-quant-ps.json`

---

## ЧАТ 2: Data Sufficiency вопросы (400 шт)

### Промпт:

```
Generate 400 GMAT Focus Edition Data Sufficiency questions in JSON format.

In the GMAT Focus Edition, Data Sufficiency is part of the Data Insights section (not Quant).

Requirements:
- Difficulty distribution: 100 easy, 160 medium, 100 hard, 40 "700+"
- Topic distribution:
  - Algebra DS (equations, inequalities, absolute value): 100 questions
  - Number Properties DS (divisibility, primes, odd/even, remainders): 80 questions
  - Word Problems DS (rate, work, age, mixtures): 80 questions
  - Statistics DS (mean, median, range, sets): 60 questions
  - Arithmetic DS (percents, ratios, fractions): 80 questions

DS answer choices are ALWAYS the same:
A = Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.
B = Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.
C = BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.
D = EACH statement ALONE is sufficient.
E = Statements (1) and (2) TOGETHER are NOT sufficient.

Each question MUST include:
- A clear question stem
- Two statements that are logically independent
- Realistic traps (e.g., C trap when A or B is correct, E trap when C is correct)
- Step-by-step explanation testing each statement alone then together

Output format — ONLY valid JSON array:

[
  {
    "id": "gen-ds-0001",
    "type": "DS",
    "section": "data-insights",
    "difficulty": "medium",
    "topic": "algebra",
    "subtopic": "inequalities",
    "text": "Is x > 0?",
    "statement1": "x² > 9",
    "statement2": "x > -4",
    "correctAnswer": "C",
    "explanation": "Statement 1: x² > 9 means x > 3 or x < -3. Not sufficient (x could be 4 or -4). Statement 2: x > -4 means x could be -3, 0, 1, 5, etc. Not sufficient. Together: x > -4 AND (x > 3 or x < -3). If x < -3 and x > -4, then -4 < x < -3, so x is negative. If x > 3, x is positive. Still not sufficient — x could be -3.5 (negative) or 4 (positive). Wait — actually x² > 9 means x > 3 OR x < -3. Combined with x > -4: x could be in (-4, -3) where x < -3 is false, or x > 3. So x > 3, which means x > 0. SUFFICIENT. Answer: C.",
    "source": "SamiWISE Generated"
  },
  ...
]

Generate all 400 questions. Output ONLY the JSON array.
```

### Сохрани ответ в файл: `data/questions/gen-ds.json`

---

## ЧАТ 3: Verbal CR вопросы (500 шт)

### Промпт:

```
Generate 500 GMAT Focus Edition Critical Reasoning questions in JSON format.

Requirements:
- Difficulty distribution: 125 easy, 200 medium, 125 hard, 50 "700+"
- Question type distribution:
  - Weaken: 100 questions
  - Strengthen: 80 questions
  - Assumption: 80 questions
  - Inference / Must Be True: 60 questions
  - Evaluate: 40 questions
  - Explain Discrepancy: 40 questions
  - Flaw: 40 questions
  - Boldface: 30 questions
  - Complete the Argument: 30 questions

Each question MUST include:
- A short passage (2-5 sentences) presenting an argument or situation
- A question stem clearly indicating the question type
- 5 answer choices (A-E) with one correct answer
- 4 plausible distractors that test common CR mistakes (scope shifts, correlation≠causation, extreme language)
- Explanation identifying the argument structure (premise→gap→conclusion) and why each wrong answer fails

Passage topics should be diverse: business, science, health, environment, technology, economics, education, policy.

Output format — ONLY valid JSON array:

[
  {
    "id": "gen-cr-0001",
    "type": "CR",
    "section": "verbal",
    "difficulty": "medium",
    "topic": "critical-reasoning",
    "subtopic": "weaken",
    "passage": "A study of 500 employees found that those who took regular breaks during work hours were 30% more productive than those who worked continuously. The company's management concluded that implementing mandatory break times would increase overall productivity.",
    "questionStem": "Which of the following, if true, most seriously weakens the conclusion drawn above?",
    "options": [
      {"id": "A", "text": "The study was conducted during the summer months when workloads are typically lighter."},
      {"id": "B", "text": "Employees who chose to take regular breaks were already among the most motivated workers."},
      {"id": "C", "text": "Some companies that have implemented mandatory breaks reported mixed results."},
      {"id": "D", "text": "The study measured productivity using output per hour rather than total daily output."},
      {"id": "E", "text": "Not all employees in the study took the same number of breaks."}
    ],
    "correctAnswer": "B",
    "explanation": "Premise: Break-takers are 30% more productive. Conclusion: Mandatory breaks will increase productivity. Gap: Assumes the breaks CAUSED the productivity (not that productive people happen to take breaks). Choice B introduces a selection bias — motivated workers chose breaks AND were productive. The breaks may not be the cause. This directly weakens the causal conclusion.",
    "source": "SamiWISE Generated"
  },
  ...
]

Generate all 500 questions. Output ONLY the JSON array.
```

### Сохрани ответ в файл: `data/questions/gen-cr.json`

---

## ЧАТ 4: Verbal RC passages + вопросы (100 passages × 3-4 вопроса = ~350 шт)

### Промпт:

```
Generate 100 GMAT Focus Edition Reading Comprehension passages with 3-4 questions each, in JSON format.

Requirements:
- Passage length: 200-350 words each (GMAT Focus standard)
- Difficulty distribution: 25 easy, 40 medium, 25 hard, 10 "700+"
- Topic diversity: business (25), science (25), social science (20), humanities (15), technology (15)
- Each passage should have 3-4 questions covering different question types:
  - Main Idea / Primary Purpose
  - Detail / Specific Information
  - Inference
  - Author's Tone or Function/Purpose

Each question must have 5 answer choices (A-E) with clear explanations.

Output format — ONLY valid JSON array:

[
  {
    "id": "gen-rc-0001",
    "type": "RC",
    "section": "verbal",
    "difficulty": "medium",
    "topic": "reading-comprehension",
    "passage": "In recent years, the concept of 'circular economy' has gained significant traction among policymakers and business leaders alike. Unlike the traditional linear model of 'take, make, dispose,' a circular economy aims to minimize waste by keeping resources in use for as long as possible. Proponents argue that this approach not only reduces environmental impact but also creates new business opportunities...[200-350 words]",
    "passageTitle": "Circular Economy in Business",
    "questions": [
      {
        "id": "gen-rc-0001-q1",
        "questionStem": "The primary purpose of the passage is to",
        "options": [
          {"id": "A", "text": "advocate for government regulation of waste management"},
          {"id": "B", "text": "describe an emerging economic model and its potential benefits and challenges"},
          {"id": "C", "text": "compare the environmental policies of different countries"},
          {"id": "D", "text": "argue that traditional business models are inherently unsustainable"},
          {"id": "E", "text": "analyze the financial returns of recycling programs"}
        ],
        "correctAnswer": "B",
        "explanation": "The passage describes the circular economy concept (emerging model), discusses benefits (reduced waste, new opportunities) and challenges. It doesn't advocate regulation (A), compare countries (C), argue against all traditional models (D), or focus on recycling financials (E)."
      },
      {
        "id": "gen-rc-0001-q2",
        "questionStem": "According to the passage, a circular economy differs from a linear economy primarily in that it",
        "options": [...],
        "correctAnswer": "...",
        "explanation": "..."
      }
    ],
    "source": "SamiWISE Generated"
  },
  ...
]

Generate all 100 passages with their questions. Output ONLY the JSON array.
```

### Сохрани ответ в файл: `data/questions/gen-rc.json`

---

## ЧАТ 5: RAG контент — углублённый Quant + DI (для Pinecone)

### Промпт:

```
Generate deep GMAT educational content for indexing into a knowledge base. Write detailed study material that a GMAT tutor would teach.

Generate 50 content chunks, each 500-800 words. Topics:

QUANTITATIVE (25 chunks):
1. Arithmetic: Fractions — adding/subtracting with unlike denominators, complex fractions, GMAT traps
2. Arithmetic: Percents — successive percent changes (why 20% up then 20% down ≠ 0%), percent of a percent
3. Arithmetic: Ratios — setting up ratio problems, ratio changes, three-part ratios
4. Arithmetic: Weighted averages — formula, mixture problems with weighted average, GMAT applications
5. Algebra: Linear equations — systems of 2 and 3 variables, when no unique solution exists, word problem translation
6. Algebra: Quadratics — factoring patterns (difference of squares, perfect square trinomials), discriminant meaning
7. Algebra: Inequalities — compound inequalities, absolute value inequalities, sign analysis
8. Algebra: Exponents — negative exponents, fractional exponents, comparing expressions with different bases
9. Algebra: Functions — composite functions f(g(x)), domain restrictions, function notation traps
10. Number Properties: Divisibility — divisibility rules 2-12, factor counting formula with prime factorization, GMAT divisibility problems
11. Number Properties: Primes — prime factorization method, uniqueness of prime factorization, counting primes in a range
12. Number Properties: Remainders — remainder arithmetic (add, multiply, cycle), pattern recognition, GMAT remainder problems
13. Number Properties: Even/Odd — rules for add/subtract/multiply, why division doesn't preserve even/odd, "must be true" problems
14. Number Properties: Consecutive integers — sum formula, product properties (n consecutive contain a multiple of n), divisibility
15. Word Problems: Rate/Time/Distance — combined rates, converging objects, round trip average speed trap
16. Word Problems: Work problems — combined work formula, opposing work (filling and draining), three workers
17. Word Problems: Mixtures — alligation method, concentration mixing, evaporation problems
18. Word Problems: Profit/Loss — markup vs margin, successive discounts, break-even analysis
19. Word Problems: Overlapping sets — two-set Venn formula, three-set formula, matrix method for two variables
20. Statistics: Mean/Median — mean of combined groups, median of even/odd sets, how adding a number changes mean
21. Statistics: Standard deviation — conceptual understanding, what changes SD (adding constant vs multiplying), comparing SDs
22. Probability: Basic — complementary counting (1 - P(not)), independent events, conditional probability
23. Probability: Combinatorics — when to use P vs C, slot method, restrictions (must include / must exclude)
24. Problem Solving: Number picking strategy — when to use it, choosing smart numbers (fractions, negatives, 0, 1)
25. Problem Solving: Backsolving strategy — when faster than algebra, starting from C, adjusting direction

DATA INSIGHTS (25 chunks):
26. DS: Framework — the ABCDE decision tree, testing statements independently, "together" testing
27. DS: Yes/No questions — testing with multiple values, finding one "yes" and one "no" = insufficient
28. DS: Value questions — unique value = sufficient, multiple possible values = insufficient
29. DS: Number properties DS — testing with specific numbers (0, 1, -1, fractions, large primes)
30. DS: Algebra DS — when equation = sufficient, when inequality = insufficient, system requirements
31. DS: Traps — the C trap (both needed when one is enough), the E trap (not sufficient when it is), constraint assumptions
32. DS: Advanced — combining constraints, hidden information in question stem, "what is the value of x+y" (don't need x and y separately)
33. Table Analysis: Strategy — reading the table systematically, sorting by relevant column, compound conditions (AND/OR)
34. Table Analysis: Calculations — percentage of total from table, growth rates between rows, weighted calculations
35. Table Analysis: Traps — unit confusion (thousands vs actual), header misreading, "at least" vs "more than"
36. Graphics Interpretation: Bar charts — reading values, comparing bars, percentage calculations from bars
37. Graphics Interpretation: Line graphs — trend identification, rate of change (steepest/flattest), interpolation
38. Graphics Interpretation: Scatter plots — correlation direction, outliers, trend line estimation
39. Graphics Interpretation: Complex charts — dual axis, stacked bars, area charts, what GMAT asks about them
40. Multi-Source Reasoning: Strategy — read ALL sources first, map what each provides, cross-reference systematically
41. Multi-Source Reasoning: Yes/No format — test each statement against all sources, one counterexample = No
42. Multi-Source Reasoning: Conditional logic — "If X then Y" problems, converting conditionals, necessary vs sufficient
43. Two-Part Analysis: Algebraic — systems of equations in TPA format, constraint matching, optimization
44. Two-Part Analysis: Verbal — argument-based TPA, identifying premise + conclusion, strengthen/weaken both columns
45. Two-Part Analysis: Strategy — use one column to eliminate for the other, process of elimination
46. DI Section strategy: Pacing — 2:15 per question target, which question types to prioritize, when to guess
47. DI Section strategy: Calculator — when to use the on-screen calculator vs mental math, estimation techniques
48. DI Section strategy: Common errors — most frequent mistakes by question type, how to catch them
49. DI Section strategy: Question Review & Edit — how to use the bookmark feature, when to change answers
50. DI Section strategy: Score optimization — how DI section is scored, equal weight with Q and V, impact on total

Output format — ONLY valid JSON array:

[
  {
    "topic": "Arithmetic: Fractions",
    "section": "quant",
    "namespace": "gmat-quant",
    "content": "Fractions on the GMAT Focus Edition test your ability to manipulate and compare fractional values quickly and accurately. The most common mistake students make is...[500-800 words of detailed educational content with examples]"
  },
  ...
]

Generate all 50 chunks. Output ONLY the JSON array.
```

### Сохрани ответ в файл: `data/rag/deep-quant-di.json`

---

## ЧАТ 6: RAG контент — углублённый Verbal + Errors (для Pinecone)

### Промпт:

```
Generate deep GMAT educational content for indexing into a knowledge base. Write detailed study material that a GMAT tutor would teach.

Generate 50 content chunks, each 500-800 words. Topics:

VERBAL (25 chunks):
1. CR: Argument structure — identifying premise, conclusion, gap. Practice with 3 examples.
2. CR: Strengthen questions — how the correct answer bridges the gap, common wrong answer patterns
3. CR: Weaken questions — how the correct answer widens the gap, alternative explanations
4. CR: Assumption questions — the Negation Test method, necessary vs sufficient assumptions
5. CR: Inference questions — "must be true" vs "could be true", staying within scope
6. CR: Evaluate questions — finding the question that determines if the argument is valid
7. CR: Explain the Discrepancy — identifying two seemingly contradictory facts, finding the reconciling answer
8. CR: Boldface questions — identifying the role of each bolded statement (conclusion, premise, counterargument, evidence)
9. CR: Flaw questions — identifying logical errors (ad hominem, false dichotomy, circular reasoning, etc.)
10. CR: Common traps — scope shifts, extreme language, correlation≠causation, irrelevant comparisons
11. CR: Pre-phrasing strategy — predicting the answer before reading choices, benefits of pre-phrasing
12. CR: Elimination strategy — identifying clearly wrong answers first, "out of scope" elimination
13. RC: Active reading strategy — reading for structure not detail, passage mapping (what each paragraph does)
14. RC: Main idea questions — how to identify the main argument, avoid answers that are too narrow or too broad
15. RC: Detail questions — how to locate information quickly, paraphrasing traps
16. RC: Inference questions — what "can be inferred" actually means on GMAT (must be true, not might be true)
17. RC: Author tone questions — identifying neutral, critical, supportive, skeptical, etc.
18. RC: Function/Purpose questions — "why does the author mention X" — identifying rhetorical purpose
19. RC: Science passages — how to read technical content without domain knowledge, focus on structure
20. RC: Business passages — common themes (innovation, regulation, market dynamics), how to process dense data
21. RC: Timing strategy — 4 min on passage + 1-1.5 min per question, when to skim vs close read
22. RC: Wrong answer patterns — too extreme, out of scope, opposite of passage, half right/half wrong
23. Verbal section strategy: Pacing — 1:57 per question target, CR vs RC time allocation
24. Verbal section strategy: Question order — tackle easier CR first, save hard RC passages for later
25. Verbal section strategy: Review & Edit — using bookmarks on hard passages, when to change answers

ERRORS & STRATEGIES (25 chunks):
26. Quant errors: Careless sign mistakes — when negatives flip inequalities, distributing negatives, common examples
27. Quant errors: Percent traps — "percent of" vs "percent more than", percent change from wrong base
28. Quant errors: Time pressure shortcuts that backfire — when estimation goes wrong, rounding errors
29. Quant errors: Misreading the question — "which is NOT", "approximately", "could be true vs must be true"
30. Quant errors: Forgetting constraints — positive integers, non-zero, "different" values, domain restrictions
31. Verbal errors: Scope in CR — answer discusses industry when argument is about one company
32. Verbal errors: Extreme answers — "always", "never", "completely" — why they're almost always wrong
33. Verbal errors: Confusing correlation and causation — how GMAT exploits this in strengthen/weaken questions
34. Verbal errors: RC memory vs passage — answering from what you remember vs going back to the text
35. Verbal errors: Attraction to familiar topics — choosing an answer because it sounds right, not because it's logical
36. DS errors: The C trap explained — when students assume both statements are needed but one alone works
37. DS errors: The E trap explained — when students think statements are insufficient but they actually work together
38. DS errors: Not testing extreme values — only trying positive integers, forgetting 0, negatives, fractions
39. DS errors: Sufficiency vs solving — you don't need to find the answer, just know that a unique answer exists
40. DS errors: Hidden constraints in the question stem — "positive integer n", "x is a prime number" matter
41. DI errors: Misreading tables — wrong column, wrong row, unit confusion (thousands vs millions)
42. DI errors: Graph misinterpretation — confusing axis labels, extrapolating beyond data, reading between gridlines
43. DI errors: MSR incomplete reading — not checking all tabs, missing conditional information
44. Test strategy: First week study plan — what to do in the first 7 days of GMAT prep
45. Test strategy: Last week before test — what to practice, what to avoid, mental preparation
46. Test strategy: Test day tips — arrival time, section order choice, break usage, score preview decision
47. Test strategy: Adaptive test psychology — hard questions = doing well, don't panic, manage emotions
48. Test strategy: Guessing strategy — when to guess, how to guess smart (eliminate 2+, pick and move on)
49. Test strategy: Score plateau breaking — stuck at 650? Here's what's likely wrong and how to fix it
50. Test strategy: From 700 to 750 — advanced strategies for high scorers, diminishing returns, error elimination

Output format — ONLY valid JSON array:

[
  {
    "topic": "CR: Argument structure",
    "section": "verbal",
    "namespace": "gmat-verbal",
    "content": "Understanding argument structure is the single most important skill for GMAT Critical Reasoning. Every CR argument has three components...[500-800 words of detailed educational content with examples]"
  },
  ...
]

Generate all 50 chunks. Output ONLY the JSON array.
```

### Сохрани ответ в файл: `data/rag/deep-verbal-errors.json`

---

## После генерации

Когда все 6 файлов готовы, скажи мне и я:
1. Валидирую JSON
2. Загружу вопросы в question bank
3. Проиндексирую RAG контент в Pinecone
4. Обновлю статистику

Итого будет:
- Вопросы: 5,638 (текущие) + 500 PS + 400 DS + 500 CR + ~350 RC = **~7,400 вопросов**
- RAG: 1,709 (текущие) + ~100 чанков = **~1,800+ векторов** (чанки длиннее → больше знаний при меньшем количестве)

export interface BlogArticle {
  slug: string
  title: string
  description: string
  content: string
  section: 'quant' | 'verbal' | 'data-insights' | 'strategy' | 'general'
  tags: string[]
  publishedAt: string
  readingTime: number
  author: string
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'gmat-focus-edition-2026-everything-you-need-to-know',
    title: 'GMAT Focus Edition 2026: Everything You Need to Know',
    description: 'Complete guide to the GMAT Focus Edition — new format, 3 sections, scoring 205-805, and what was removed. Updated for 2026.',
    section: 'general',
    tags: ['GMAT Focus', 'test format', '2026', 'beginners'],
    publishedAt: '2026-01-15',
    readingTime: 10,
    author: 'PrepWISE Team',
    content: `The GMAT has undergone its most significant transformation in decades. The GMAT Focus Edition, which fully replaced the classic GMAT, is a shorter, sharper exam that tests the skills business schools actually care about. If you're planning to take the GMAT in 2026, here's everything you need to know.

## What Changed in the GMAT Focus Edition

The classic GMAT was a 3.5-hour marathon with four sections. The Focus Edition trims that down to **2 hours and 15 minutes** with three sections. That's not just a time savings — it reflects a fundamental rethinking of what the test measures.

**Gone from the exam:**
- Analytical Writing Assessment (AWA) — no more essay
- Sentence Correction — removed from Verbal
- Geometry — removed from Quant
- The experimental/research section

**What remains and what's new:**
- **Quantitative Reasoning** — 21 questions, 45 minutes. Problem Solving only, no Data Sufficiency (that moved to Data Insights)
- **Verbal Reasoning** — 23 questions, 45 minutes. Critical Reasoning and Reading Comprehension only
- **Data Insights** — 20 questions, 45 minutes. This is the new flagship section combining Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics Interpretation, and Two-Part Analysis

## The New Scoring System

The Focus Edition uses a **total score range of 205 to 805**, in 10-point increments. Each section is scored individually on a scale of 60 to 90.

Here's what's different about the scoring:
- Your **total score** is a combination of all three section scores
- There's no separate AWA or IR score to worry about
- The percentile rankings have been recalibrated for the new format
- A 705 on the Focus Edition is roughly equivalent to a 700 on the classic GMAT

**Score benchmarks for competitive programs:**
- 655+ puts you in a strong position for most programs
- 705+ is competitive for top-20 programs
- 755+ is competitive for M7 schools (HBS, Stanford GSB, Wharton, etc.)

## Section-by-Section Breakdown

### Quantitative Reasoning (21 questions, 45 minutes)

This section is purely Problem Solving. With geometry gone, the focus shifts to:
- **Algebra** — equations, inequalities, functions
- **Arithmetic** — number properties, ratios, percents
- **Word problems** — rate/work, mixtures, sets
- **Statistics** — mean, median, standard deviation

The removal of geometry means fewer "visual" problems and more emphasis on algebraic reasoning and number theory. You need strong mental math and the ability to work through multi-step problems efficiently.

**Key strategy:** With about 2 minutes per question, you can't afford to get stuck. If a problem doesn't click within 30 seconds, start working your approach. If after a minute you're nowhere close, make an educated guess and move on.

### Verbal Reasoning (23 questions, 45 minutes)

Without Sentence Correction, the Verbal section is now entirely about comprehension and logic:
- **Critical Reasoning** — strengthen, weaken, assumption, inference, evaluate
- **Reading Comprehension** — main idea, detail, inference, structure, tone

The removal of Sentence Correction is a game-changer for non-native English speakers. The section now tests your ability to reason with arguments and extract information from dense passages — skills that translate directly to business school and leadership.

**Key strategy:** For CR, always identify the conclusion and the gap in the argument before looking at answer choices. For RC, read for structure (what's the author doing in each paragraph?) rather than memorizing details.

### Data Insights (20 questions, 45 minutes)

This is the most distinctive section and where many test-takers struggle. It combines five question types:

1. **Data Sufficiency (DS)** — Given a question, determine which of two statements (alone or together) provide enough information to answer it
2. **Multi-Source Reasoning (MSR)** — Synthesize information from 2-3 tabs of data (text, tables, charts)
3. **Table Analysis** — Sort and analyze spreadsheet-style data
4. **Graphics Interpretation** — Read and interpret charts, graphs, and visual data
5. **Two-Part Analysis (TPA)** — Solve problems with two interrelated components

**Key strategy:** DS and MSR are the heaviest hitters here. For DS, develop a systematic approach (the AD/BCE framework is essential). For MSR, read all tabs carefully before attempting questions — most errors come from incomplete information gathering.

## How to Prepare for the Focus Edition

### Study timeline
- **8-12 weeks** is ideal for most test-takers
- **4-6 weeks** is possible if you have a strong quantitative background
- **16+ weeks** for career changers or those starting from a lower baseline

### What to prioritize
1. **Data Insights** — This is the differentiator. Many students neglect it because it's new and unfamiliar. Don't be one of them.
2. **Critical Reasoning** — High ROI for study time. The patterns repeat and are learnable.
3. **Quant fundamentals** — Without geometry, double down on algebra and number properties.

### Resources
- GMAT Official Practice Exams (the gold standard)
- AI-powered prep tools like PrepWISE that adapt to your weak areas
- Official GMAT Focus question sets from GMAC

## Section Order Flexibility

One major improvement in the Focus Edition: **you choose the order** of your three sections. This is a real strategic advantage.

**Recommended order for most test-takers:**
1. Start with your strongest section to build confidence
2. Take your weakest section second, when you still have mental energy
3. End with your middle section

There's an optional 10-minute break you can take between any two sections. Most people benefit from taking it.

## The Bottom Line

The GMAT Focus Edition is a better test. It's shorter, more focused, and tests skills that actually matter for business school success. The removal of geometry and sentence correction reduces rote memorization, while the new Data Insights section adds a practical, data-driven challenge.

If you're starting your GMAT prep in 2026, you're preparing for a test that rewards critical thinking and data literacy. Build those skills systematically, and the score will follow.`,
  },
  {
    slug: 'how-to-score-700-on-gmat',
    title: 'How to Score 700+ on the GMAT: A Complete Guide',
    description: 'Proven strategies to score 700+ on the GMAT Focus Edition. Study plans, section tips, and the mindset shifts that separate 600s from 700s.',
    section: 'strategy',
    tags: ['700+', 'study plan', 'strategy', 'score improvement'],
    publishedAt: '2026-01-22',
    readingTime: 11,
    author: 'Sam (AI Tutor)',
    content: `Scoring 700+ on the GMAT Focus Edition (roughly 705+ on the new scale) puts you in the top 10-12% of test-takers and makes you competitive for the world's best business programs. Here's what it actually takes to get there.

## What a 700+ Score Means on the Focus Edition

On the GMAT Focus Edition's 205-805 scale, a **705** is the new benchmark for "700-level" performance. To hit this, you typically need section scores around:
- Quantitative: 83-85+
- Verbal: 83-85+
- Data Insights: 82-84+

You don't need perfection in any one section. You need consistent strength across all three. A 90 in Quant won't save a 72 in Verbal.

## The Three Phases of 700+ Prep

### Phase 1: Build the Foundation (Weeks 1-3)

Before you optimize, you need to understand where you stand. Take an official practice test — cold, no prep. Your baseline score tells you everything:

- **Below 550:** You need fundamental skill building before strategy matters. Budget 12+ weeks.
- **550-650:** You have the basics. Focus on closing skill gaps and building efficiency. Budget 8-10 weeks.
- **650+:** You're in striking distance. Focus on error patterns, timing, and mental endurance. Budget 4-6 weeks.

During this phase, rebuild your core skills:
- **Quant:** Review algebra fundamentals, number properties, and word problem frameworks. Don't just re-learn formulas — practice applying them under time pressure.
- **Verbal:** Study argument structure (CR) and build active reading habits (RC). Learn to identify conclusions, premises, and logical gaps.
- **Data Insights:** Learn the DS decision framework (AD/BCE method). Practice interpreting tables and graphs quickly.

### Phase 2: Pattern Recognition (Weeks 4-6)

This is where most of the score improvement happens. The GMAT recycles the same patterns in different wrappers. Your job is to see through the surface to the underlying structure.

**In Quant:**
- Most problems have a "trick" — a shortcut that avoids brute-force calculation
- Learn to recognize when back-solving (plugging in answer choices) is faster than algebra
- Practice number properties: divisibility, remainders, odds/evens, primes

**In Verbal:**
- CR question types each have specific patterns. A "weaken" question always targets the assumption. A "strengthen" question always supports the gap.
- RC passages follow predictable structures. Academic passages argue a thesis. Business passages analyze a situation. Science passages explain a phenomenon.

**In Data Insights:**
- DS is 50% logic, 50% math. Many problems can be solved without calculating — just determining whether enough information exists.
- MSR questions reward systematic tab-reading. Read all sources before answering.

### Phase 3: Optimize and Refine (Weeks 7-8+)

This is where you go from "good" to "700+." The focus shifts from learning new content to eliminating errors and optimizing performance.

**Error journaling is non-negotiable.** After every practice set, review every wrong answer AND every question where you guessed correctly. Ask:
- Why did I get this wrong?
- What concept was being tested?
- How should I have approached this differently?
- How long did I spend on this?

Track your errors by type. Most students find that 3-4 error patterns account for 80% of their mistakes. Fix those patterns and your score jumps.

## The Mindset Shifts That Separate 600s from 700s

### 1. Time management is score management

The single biggest difference between a 650 and a 700+ scorer isn't knowledge — it's time allocation. A 700+ scorer spends 30 seconds recognizing a problem type and choosing an approach. A 650 scorer spends 2 minutes trying different approaches and runs out of time on later (often easier) questions.

**The rule:** If you don't have a clear approach within 45 seconds, switch strategies or make an educated guess. Missing one hard question costs less than rushing three easy ones.

### 2. Accuracy on easy questions matters more than attempts on hard ones

The GMAT is adaptive. Missing easy questions early hurts more than missing hard questions later. Protect your accuracy on the first 8-10 questions of each section — these set your scoring trajectory.

This doesn't mean go slow. It means go deliberately. Double-check your work on straightforward problems. The careless error on a question you "know" is the most expensive mistake on the GMAT.

### 3. Every wrong answer is data

Stop thinking of wrong answers as failures. Start thinking of them as diagnostic information. When you miss a question in practice, you've just identified exactly what to study. That's valuable.

## Section-Specific Tips for 700+

### Quant: Aim for 84+

- **Master mental math.** You should be able to multiply two-digit numbers, work with fractions, and estimate percentages without writing anything down.
- **Know your number properties cold.** Prime factorization, LCM/GCD, remainder patterns — these come up constantly and can be solved quickly if you know the rules.
- **Use strategic guessing.** If you can eliminate 2-3 answer choices, guessing is a legitimate strategy on a time-consuming problem.

### Verbal: Aim for 84+

- **Pre-phrase answers in CR.** Before looking at answer choices, predict what the right answer should say. This prevents you from being seduced by attractive wrong answers.
- **Read RC passages for structure, not detail.** You can always go back for specifics. Your first read should map: What's the main idea? What's the author's tone? How does each paragraph relate to the thesis?
- **Watch for scope shifts.** Many wrong answers in both CR and RC are wrong because they go beyond the scope of the passage or argument.

### Data Insights: Aim for 82+

- **Internalize the DS framework.** For every DS problem: (1) What do I need to find? (2) Can Statement 1 alone answer it? (3) Can Statement 2 alone answer it? (4) Can they together? Practice this until it's automatic.
- **In MSR, read ALL tabs before answering.** The most common error is answering based on incomplete information.
- **For Table Analysis, sort before you analyze.** The ability to sort data is a feature of the question — use it.

## The Practice Test Protocol

Take at least 4-5 full-length official practice tests during your prep. Here's how to use them:

1. **Test 1 (Week 1):** Diagnostic baseline. No prep beforehand. Accept the score.
2. **Test 2 (Week 3):** Check progress after foundation building. Adjust study plan.
3. **Test 3 (Week 5):** Mid-point check. Should see improvement. Focus on weak areas.
4. **Test 4 (Week 7):** Near-final assessment. Should be within 20-30 points of target.
5. **Test 5 (Week 8):** Final confidence builder. Take 3-4 days before your real test.

**Space them out.** Taking practice tests too close together leads to inflated scores from question familiarity. At least 5-7 days apart.

## The Real Secret

There's no single "trick" to scoring 700+. It's the compound effect of doing many things slightly better: managing your time more efficiently, catching careless errors, recognizing problem patterns faster, maintaining focus for the full 135 minutes.

The students who hit 700+ aren't the ones with the highest IQ. They're the ones who studied most deliberately — who treated every practice problem as a learning opportunity and systematically closed their gaps.

Start where you are. Know your weaknesses. Study them specifically. And trust the process.`,
  },
  {
    slug: 'gmat-data-insights-mastering-newest-section',
    title: 'GMAT Data Insights: Mastering the Newest Section',
    description: 'Master the GMAT Data Insights section — strategies for Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics Interpretation, and Two-Part Analysis.',
    section: 'data-insights',
    tags: ['Data Insights', 'Data Sufficiency', 'MSR', 'strategy'],
    publishedAt: '2026-02-01',
    readingTime: 11,
    author: 'Sam (AI Tutor)',
    content: `The Data Insights (DI) section is the GMAT Focus Edition's most distinctive feature — and the one that trips up the most test-takers. It combines data analysis, logical reasoning, and quantitative skills in ways that neither the old Quant nor IR sections did. Here's how to master it.

## What Makes Data Insights Different

Data Insights tests your ability to **analyze and synthesize information from multiple sources** — a skill that's directly relevant to business decision-making. It's not about doing hard math. It's about determining what data matters, whether you have enough information, and what conclusions the data supports.

The section has 20 questions in 45 minutes, divided across five question types:

1. **Data Sufficiency (DS)** — ~5-6 questions
2. **Multi-Source Reasoning (MSR)** — ~3-4 questions
3. **Table Analysis (TA)** — ~3-4 questions
4. **Graphics Interpretation (GI)** — ~3-4 questions
5. **Two-Part Analysis (TPA)** — ~3-4 questions

## Data Sufficiency: The Logic Puzzle

DS is the most important question type in Data Insights, and it migrated here from the old Quant section. The format: you're given a question and two statements. You must determine which statements, alone or together, are sufficient to answer the question.

### The AD/BCE Framework

This framework eliminates confusion:

**Step 1: Evaluate Statement 1 alone.**
- If sufficient → Answer is **A** or **D** (go to Step 2)
- If insufficient → Answer is **B**, **C**, or **E** (go to Step 3)

**Step 2: (Statement 1 was sufficient) Evaluate Statement 2 alone.**
- If sufficient → Answer is **D** (each alone is sufficient)
- If insufficient → Answer is **A** (only Statement 1)

**Step 3: (Statement 1 was insufficient) Evaluate Statement 2 alone.**
- If sufficient → Answer is **B** (only Statement 2)
- If insufficient → go to Step 4

**Step 4: Evaluate Statements 1 and 2 together.**
- If sufficient → Answer is **C** (together but not alone)
- If insufficient → Answer is **E** (not even together)

### Common DS Traps

**Trap 1: Solving instead of evaluating.** You don't need to find the actual answer — just determine whether an answer CAN be found. Many students waste time calculating when they only need to assess sufficiency.

**Trap 2: Forgetting to try statements together.** After finding both statements individually insufficient, students sometimes jump to E without testing the combination.

**Trap 3: Number properties assumptions.** "x² = 4" doesn't mean x = 2. It means x = 2 OR x = -2. Unless you're told x is positive, you have two possible values — and that's insufficient.

**Trap 4: Implied constraints.** If the problem says "the number of employees," you know it's a positive integer. These implicit constraints can make a statement sufficient when it looks insufficient at first glance.

## Multi-Source Reasoning: The Information Synthesis Challenge

MSR presents 2-3 tabs of information — text, tables, charts, or a combination — and asks questions that require synthesizing across sources. These are often "yes/no" format where each sub-question is independent.

### MSR Strategy

**Before answering any questions:**
1. Read ALL tabs thoroughly (spend 2-3 minutes on this)
2. Note what type of information each tab contains
3. Identify connections between tabs (shared variables, categories, etc.)

**Common MSR patterns:**
- Tab 1 has a policy/rule, Tab 2 has data — you apply the rule to the data
- Tab 1 has text describing a situation, Tab 2 has a table of numbers — you cross-reference
- Three tabs each provide partial information that must be combined

**The #1 MSR mistake:** Answering based on only one tab when the answer requires data from multiple tabs. Always ask yourself: "Am I using all available information?"

## Table Analysis: Sort and Conquer

Table Analysis questions present a sortable spreadsheet. You'll answer 3-4 yes/no questions about the data.

### TA Strategy

1. **Read the questions first.** Know what you're looking for before sorting.
2. **Sort strategically.** Each question typically requires sorting by a different column. Sort, answer, re-sort.
3. **Watch for conditional questions.** "Of the companies with revenue over $10M, which had the highest growth rate?" requires you to filter mentally while sorting.
4. **Don't try to memorize the table.** Sort and look. It's faster than scanning unsorted data.

### Common TA Traps
- Confusing "at least" with "more than" — boundary values matter
- Overlooking tied values when questions ask about ranking
- Missing conditional language that narrows the relevant data

## Graphics Interpretation: Read the Axes

GI questions present a chart (scatter plot, bar chart, line graph, bubble chart, etc.) and ask you to fill in statements about the data. These often use dropdown menus where you select the correct value.

### GI Strategy

1. **Read axis labels and legends carefully.** Many errors come from misreading what's being measured or the scale.
2. **Identify the relationship being tested.** Is it correlation? Comparison? Trend?
3. **Estimate, don't calculate exactly.** GI questions usually test your ability to read and interpret visual data, not compute precise values.
4. **Watch for dual axes.** Some graphs have a left and right y-axis measuring different things. Confusing them is an easy error.

### Quick GI tips:
- For scatter plots, look at the trend (positive, negative, no correlation)
- For bar charts, compare relative heights, not exact values
- For line graphs, focus on slope changes (acceleration/deceleration)
- For bubble charts, consider all three dimensions (x, y, and bubble size)

## Two-Part Analysis: The Interlinked Problem

TPA questions present a problem with two components. You select one answer for each component from a shared set of answer choices. The components are usually related — getting one right often depends on understanding both.

### TPA Strategy

1. **Identify the relationship between parts.** Common relationships: two variables in an equation, two steps in a process, two elements of an argument.
2. **Look for constraints that link the answers.** If Part A + Part B must equal 100, and you know Part A, you've solved both.
3. **Solve the more constrained part first.** If one part has fewer possible values, start there.
4. **Verify that your answers satisfy all stated conditions.** It's easy to find an answer that works for one part but violates a condition for the other.

### TPA can test either quant or verbal reasoning:
- **Quant TPA:** Solve for two unknowns, allocate resources, find rate and time
- **Verbal TPA:** Identify an argument's assumption AND the fact that weakens it, find two statements that complete a logical chain

## Time Management in Data Insights

With 20 questions in 45 minutes, you have an average of **2 minutes 15 seconds per question**. But not all question types take equal time:

- **GI and TA:** Aim for 1.5-2 minutes. These are straightforward if you read carefully.
- **DS:** Aim for 2-2.5 minutes. The logic is quick once you've mastered the framework.
- **MSR:** Budget 3-4 minutes including initial reading time. These are the most time-intensive.
- **TPA:** Aim for 2.5-3 minutes. The interlinked nature requires careful verification.

**Critical time rule:** If you've spent 3 minutes on any single question (other than MSR), make your best guess and move on. One hard question isn't worth three easy ones.

## Building Data Insights Skills

### Week 1-2: Learn the formats
Practice each question type separately. Get comfortable with DS logic, MSR reading, TA sorting, GI interpretation, and TPA problem-solving.

### Week 3-4: Build speed
Do timed sets mixing all five types. Focus on recognizing question types quickly and applying the right strategy automatically.

### Week 5+: Simulate test conditions
Include DI in full practice tests. Build stamina for the full 45-minute section and practice transitions between question types.

Data Insights rewards the prepared and punishes the careless. Master the frameworks, practice the formats, and always — always — read the data carefully before answering.`,
  },
  {
    slug: '5-most-common-gmat-quant-mistakes',
    title: '5 Most Common GMAT Quant Mistakes (And How to Fix Them)',
    description: 'The 5 most expensive errors GMAT test-takers make in Quantitative Reasoning — careless mistakes, time traps, and how to eliminate them.',
    section: 'quant',
    tags: ['quant', 'mistakes', 'careless errors', 'time management'],
    publishedAt: '2026-02-10',
    readingTime: 9,
    author: 'Sam (AI Tutor)',
    content: `You studied the concepts. You understood the solutions in review. But somehow your Quant score doesn't reflect what you know. Sound familiar? The problem usually isn't knowledge — it's execution. Here are the five most common mistakes GMAT Quant test-takers make and, more importantly, how to fix them.

## Mistake 1: Not Reading the Question Carefully

This sounds obvious. It isn't. GMAT question writers are masters at testing whether you answered the question that was asked versus the question you assumed was asked.

**What this looks like:**
- The question asks for the *remainder* when you solve for the *quotient*
- The question asks "which of the following CANNOT be true" and you pick something that CAN be true
- The question asks for the value of 3x and you solve for x, then pick that answer
- The question gives values in different units (hours vs. minutes) and you don't convert

**The fix: Circle what you're solving for.** Literally. Before doing any math, identify exactly what the question asks. Write it at the top of your scratch work. After solving, check that your answer matches what was requested.

A specific technique: after selecting your answer, re-read the last sentence of the question stem. Does your answer directly address what was asked? If there's any doubt, re-check.

## Mistake 2: Getting Trapped by Time-Sink Problems

Some GMAT Quant problems are designed to look straightforward but involve tedious calculations. Others seem hard but have elegant shortcuts. The difference between a 650 and 750 Quant score is knowing which is which.

**What this looks like:**
- Spending 4 minutes on an algebra problem that could be back-solved in 90 seconds
- Setting up a system of equations for a problem that can be solved by plugging in smart numbers
- Computing exact values when estimation would identify the answer
- Trying to solve a problem algebraically when testing answer choices is faster

**The fix: Have multiple approaches in your toolkit.** For every problem, you should be able to consider at least two approaches before committing:

1. **Algebraic:** Set up equations and solve (the "textbook" approach)
2. **Back-solve:** Plug answer choices into the problem conditions
3. **Smart numbers:** Pick easy values for variables and test
4. **Estimation:** Approximate to narrow or identify the answer

**The 45-second rule:** If you haven't made meaningful progress in 45 seconds with your chosen approach, switch to a different one. If after 90 seconds you're still stuck, make an educated guess.

**Which approach to try first:**
- If the answer choices are specific numbers → back-solve
- If the problem has ratios or percents → plug in 100 or the LCM
- If answer choices are far apart → estimate
- If the problem is definitional (what is X?) → algebraic

## Mistake 3: Careless Calculation Errors

You know how to solve the problem. You set it up correctly. And then you get 7 × 8 = 54 and select the wrong answer. This is the most frustrating type of error because it feels random. It's not. Calculation errors follow patterns.

**Common calculation error patterns:**
- Sign errors: losing a negative sign during distribution or subtraction
- Fraction arithmetic: adding numerators without finding common denominators
- Exponent rules: confusing x² × x³ = x⁵ with (x²)³ = x⁶
- Order of operations: computing left-to-right instead of respecting PEMDAS
- Decimal point placement: especially in percent calculations

**The fix: Slow is fast.** Write neatly. Write each step. Don't skip steps to save time. Every "shortcut" in your head is an opportunity for error.

Specific techniques:
- **Verify calculations at each step**, not just at the end. If Step 2 is wrong, Steps 3-5 are wasted time.
- **Use estimation as a sanity check.** If you calculated that 48% of 250 is 180, something went wrong — 50% of 250 is 125, so the answer should be near 120.
- **Track signs explicitly.** When you distribute a negative, put parentheses around the negative term: -3(x - 4) = (-3)(x) + (-3)(-4) = -3x + 12.

**Practice drill:** Do 20 Quant problems without a calculator (you don't get one on the GMAT anyway). For every calculation error, log the specific type. After a week, you'll see your patterns clearly.

## Mistake 4: Forgetting Number Properties Edge Cases

Number properties questions are among the highest-value topics on GMAT Quant. They're also where edge cases cause the most damage. The GMAT loves testing whether you've considered zero, negative numbers, fractions between 0 and 1, and boundary conditions.

**The dangerous assumptions:**
- Assuming a variable is positive when the problem doesn't say so
- Forgetting that zero is an integer (and an even integer)
- Assuming "number" means "integer" — it doesn't unless stated
- Forgetting that squaring a fraction between 0 and 1 makes it smaller (1/2)² = 1/4
- Assuming x < y means x is negative and y is positive

**The fix: Always test edge cases.** When a problem introduces a variable, immediately ask:
- Could this be 0?
- Could this be negative?
- Could this be a non-integer (fraction/decimal)?
- Could this be 1 (the identity element)?

**Create a "test values" reflex.** When a problem says "x is a positive integer," test x = 1, 2, and 3. When it says "x is a number," also test x = 0, -1, 0.5, and -0.5.

**Key number properties to have cold:**
- 0 is even, 0 is neither positive nor negative
- 1 is neither prime nor composite
- Negative × negative = positive
- |x| ≥ 0 for all x (absolute value is never negative)
- If 0 < x < 1, then x² < x < √x

## Mistake 5: Poor Time Allocation Across the Section

The Quant section has 21 questions in 45 minutes — roughly 2 minutes and 8 seconds per question. But treating every question equally is a mistake. Some questions deserve 90 seconds. Others might deserve 3 minutes. None deserve 5 minutes.

**What poor time allocation looks like:**
- Spending 4+ minutes on a hard question, then rushing the last 5 questions
- Going too fast on easy questions and making careless errors
- Not tracking time at all and discovering you have 6 questions left with 4 minutes remaining
- Spending extra time on a question you've already answered because you're "not sure"

**The fix: Use time checkpoints.**
- After question 7: ~15 minutes should have elapsed
- After question 14: ~30 minutes should have elapsed
- After question 21: ~45 minutes (section over)

If you're more than 2 minutes behind at any checkpoint, you need to speed up — which means guessing on 1-2 questions to buy time back.

**The triage system:**
1. **Quick wins (60-90 seconds):** You see the approach immediately. Execute cleanly.
2. **Standard problems (2-2.5 minutes):** Requires work but the path is clear. Stay focused.
3. **Time sinks (3+ minutes):** Complex setup or multiple approaches needed. If you don't crack it in 2.5 minutes, make your best guess.

**Never go back.** On the GMAT Focus Edition, you can bookmark and return to questions. This is mostly a trap. The time you spend reconsidering a previous answer is almost always better spent on the current question. The exception: if you finish with time remaining, then review your bookmarked questions.

## Putting It All Together

These five mistakes compound. Read the problem wrong (Mistake 1), choose a slow approach (Mistake 2), make a calculation error (Mistake 3), forget an edge case (Mistake 4), and blow your time budget (Mistake 5) — and a question you "knew" becomes a wrong answer that costs you 20 points.

The solution isn't to study more content. It's to study your errors. Keep an error log. Categorize every mistake. You'll find that fixing 2-3 recurring patterns can boost your score by 30-50 points with zero new content knowledge.

That's not theory — it's the most consistent pattern in GMAT score improvement.`,
  },
  {
    slug: 'gmat-critical-reasoning-ultimate-strategy-guide',
    title: 'GMAT Critical Reasoning: The Ultimate Strategy Guide',
    description: 'Master GMAT Critical Reasoning with proven strategies for every question type — strengthen, weaken, assumption, inference, evaluate, and more.',
    section: 'verbal',
    tags: ['Critical Reasoning', 'verbal', 'logic', 'strategy'],
    publishedAt: '2026-02-18',
    readingTime: 11,
    author: 'Sam (AI Tutor)',
    content: `Critical Reasoning (CR) is arguably the highest-ROI topic to study for the GMAT Verbal section. The question types are predictable, the logic patterns repeat, and once you develop the right analytical framework, your accuracy improves fast. Here's the complete strategic approach.

## The Anatomy of Every CR Argument

Before studying question types, you need to see every CR argument the same way. Every argument has three components:

1. **Conclusion** — The main claim or recommendation the author is making
2. **Premises** — The evidence or facts supporting the conclusion
3. **Gap (Assumption)** — The unstated logical connection between premises and conclusion

**Example:**
> Company X's revenue increased 20% this year. *Therefore,* the company is more profitable than last year.

- **Premise:** Revenue increased 20%
- **Conclusion:** The company is more profitable
- **Gap:** Revenue increase doesn't automatically mean profit increase — costs could have risen 30%

**Every wrong answer in CR exploits the gap.** The gap is where the argument is vulnerable, and understanding it is the key to answering every question type correctly.

### How to Identify the Conclusion

Look for conclusion indicators:
- Therefore, thus, hence, so, consequently
- "This suggests that…" / "It follows that…"
- Recommendations: "should," "must," "needs to"
- Predictions: "will," "is likely to"

If there are no indicator words, ask: "What is the author trying to convince me of?" That's the conclusion. Everything else is support.

## Question Type 1: Weaken

**What it asks:** "Which of the following, if true, most weakens the argument?"

**Strategy:** Identify the gap. The correct answer attacks the gap — it shows that the conclusion doesn't necessarily follow from the premises even if the premises are true.

**Common weakening patterns:**
- **Alternative cause:** The premises describe a correlation, but there's another explanation
- **Breaks the analogy:** The argument compares two things, but they're relevantly different
- **Implementation flaw:** The plan seems good but has a practical obstacle
- **Scope shift:** What's true for the sample isn't true for the population

**Trap answers:**
- Answers that weaken a premise (the argument assumes premises are true)
- Answers that are too extreme ("completely disproves" vs. "casts doubt")
- Answers that are irrelevant to the specific gap

## Question Type 2: Strengthen

**What it asks:** "Which of the following, if true, most strengthens the argument?"

**Strategy:** The exact reverse of weaken. Find the gap and choose the answer that bridges it — making the conclusion more likely to follow from the premises.

**Common strengthening patterns:**
- **Eliminates an alternative cause:** Shows that the stated explanation is the right one
- **Confirms the analogy:** Shows the comparison is valid
- **Addresses a potential objection:** Preemptively blocks a weakener
- **Provides additional supporting evidence**

**Key insight:** The correct answer doesn't need to prove the conclusion. It just needs to make it more likely. "Most strengthens" means "shifts the probability the most," not "makes it certain."

## Question Type 3: Assumption

**What it asks:** "The argument above depends on which of the following assumptions?"

**Strategy:** The assumption IS the gap. It's the unstated belief that must be true for the conclusion to follow. Use the **Negation Test**: negate each answer choice. If negating it destroys the argument, it's a necessary assumption.

**The Negation Test in action:**
- Argument: "Sales fell because of the new competitor."
- Proposed assumption: "No other factors caused the sales decline."
- Negated: "Other factors DID cause the sales decline."
- Does this destroy the argument? Yes → It's a valid assumption.

**Common assumption patterns:**
- No alternative explanation exists
- A comparison is valid (same conditions, similar populations)
- A proposed plan is feasible
- A cited cause precedes the effect
- A sample is representative

**Trap answers:**
- Assumptions that are too strong ("the ONLY cause" when the argument just says "a cause")
- Assumptions that restate the conclusion
- Assumptions that support the argument but aren't required for it

## Question Type 4: Inference

**What it asks:** "Which of the following can be properly inferred from the statements above?"

**Strategy:** Unlike other CR types, inference questions don't have a conclusion to analyze. The passage gives you facts, and you must determine what follows logically. The correct answer will be directly supported — often conservatively phrased.

**Rules for inference questions:**
1. The correct answer is ALWAYS supported by the passage — if you need outside knowledge, it's wrong
2. Extreme language is almost always wrong ("all," "never," "must")
3. Hedged language is often right ("some," "can," "may," "not necessarily")
4. "Most strongly supported" means "most directly follows" — not "most interesting"

**Common trap:** Choosing an answer that's likely true in the real world but isn't supported by the specific passage. Inference questions test reading comprehension of the argument, not general knowledge.

## Question Type 5: Evaluate

**What it asks:** "Which of the following would be most useful to evaluate the argument?"

**Strategy:** Identify the gap, then choose the answer that, depending on its actual answer, would either strengthen or weaken the argument. A good evaluate answer is a question whose "yes" answer strengthens and whose "no" answer weakens (or vice versa).

**Test each answer with the "yes/no" approach:**
- If the answer to the proposed question is "yes" → does it affect the argument?
- If the answer is "no" → does it affect the argument?
- If both answers affect the argument in different directions → it's correct
- If neither or only one affects it → it's wrong

**Example:**
> "The city should build a new highway to reduce commute times."
> 
> "Would the new highway attract additional drivers from other routes?"
> - If yes → commute times might not decrease → weakens
> - If no → the plan is more likely to work → strengthens
> - ✓ This is a valid evaluate answer

## Question Type 6: Boldface / Role

**What it asks:** "The boldface portions play which of the following roles in the argument?"

**Strategy:** These questions test your ability to identify argument structure. Each boldfaced portion is either:
- The main conclusion
- A sub-conclusion (intermediate conclusion that supports the main one)
- A premise (evidence supporting a conclusion)
- A counter-premise (evidence against the author's position)
- Background information

**Approach:**
1. Identify the main conclusion first (regardless of boldface)
2. Determine each boldface portion's relationship to the main conclusion
3. Match to the answer choice that correctly describes both roles

## Universal CR Tips

### Pre-phrase before reading answers

After reading the stimulus, predict what the correct answer should do BEFORE looking at the choices. This prevents the GMAT's attractive wrong answers from pulling you off track.

For weaken: "The correct answer should show that [gap] might not hold."
For strengthen: "The correct answer should show that [gap] is valid."
For assumption: "The argument assumes that [gap]."

### Eliminate confidently

On most CR questions, you can eliminate 2-3 answers quickly:
- **Out of scope:** Addresses something the argument doesn't discuss
- **Wrong direction:** Strengthens when the question asks to weaken (or vice versa)
- **Too extreme:** Uses absolute language that the argument doesn't require

### Watch for scope and degree

The GMAT loves testing whether you notice the difference between:
- "some" vs. "most" vs. "all"
- "can" vs. "will" vs. "must"
- "contributed to" vs. "caused" vs. "was the primary cause of"

An answer might be wrong solely because it says "will always" when the argument only supports "can sometimes."

### Timing

Aim for **2 minutes per CR question.** Spend 60-75 seconds reading and understanding the argument (including identifying the conclusion, premises, and gap). Spend 45-60 seconds evaluating answer choices. If you're torn between two answers after 2.5 minutes, pick the less extreme one and move on.

## Building Your CR Skills

**Week 1:** Learn to identify conclusions, premises, and gaps in every argument you see — not just GMAT problems. News articles, advertisements, and editorials all have logical structures.

**Week 2-3:** Practice by question type. Do batches of 10 weaken questions, then 10 strengthen, then 10 assumption. Build pattern recognition for each type.

**Week 4+:** Mix all question types. Time yourself. Review every error and classify why you got it wrong (misidentified the conclusion? Fell for a scope trap? Missed the gap?).

Critical Reasoning is a learnable skill. The logic is consistent, the patterns repeat, and with deliberate practice, most students see significant improvement within 2-3 weeks.`,
  },
  {
    slug: 'how-ai-is-changing-gmat-prep-2026',
    title: 'How AI is Changing GMAT Prep in 2026',
    description: 'AI tutors, adaptive learning, and voice-based prep are transforming how students prepare for the GMAT. Here\'s what\'s different in 2026.',
    section: 'general',
    tags: ['AI', 'technology', 'study tools', '2026', 'PrepWISE'],
    publishedAt: '2026-02-25',
    readingTime: 8,
    author: 'PrepWISE Team',
    content: `GMAT preparation has looked roughly the same for two decades: buy a book, watch video lessons, do practice problems, take practice tests. That formula still works. But in 2026, artificial intelligence is adding capabilities that fundamentally change what "effective studying" looks like.

## The Old Model vs. The New Model

**Traditional GMAT prep** is one-size-fits-most. Video courses cover every topic in a fixed sequence. Practice sets are organized by chapter. You decide what to study, when to study it, and how long to spend on each topic. If you're disciplined and self-aware, this works. If you're not sure where your weaknesses are (most students), you waste significant time reviewing things you already know.

**AI-powered prep** inverts this. Instead of you deciding what to study, the system identifies your specific weak areas through your performance patterns and directs your attention there. Instead of static explanations, you get responses tailored to your current understanding level. Instead of studying alone, you have a conversational partner available 24/7.

This isn't theoretical — these tools exist now, and students using them are reporting faster score improvements with less total study time.

## What AI Actually Does Better

### 1. Adaptive Difficulty and Topic Selection

The most immediate benefit: AI systems track your performance across every topic and question type, then serve you problems that are optimally challenging — hard enough to push your skills forward but not so hard that you're guessing randomly.

This is what educational researchers call the "zone of proximal development." Too easy and you're bored. Too hard and you're frustrated. The sweet spot is where real learning happens, and AI finds it automatically.

A human tutor does this intuitively with enough hours of interaction. AI does it from question one, improving with every answer.

### 2. Personalized Explanations

When you get a problem wrong in a traditional prep course, you see the same explanation everyone else sees. Maybe it's great. Maybe it explains the concept using an approach that doesn't match how you think.

AI tutors like PrepWISE's Sam can explain the same concept multiple ways. If the algebraic approach didn't click, it tries a visual one. If the formal explanation is confusing, it uses an analogy. It can also ask you questions to identify exactly where your understanding breaks down — something a pre-recorded video can never do.

### 3. Memory Across Sessions

This is where AI prep has the biggest advantage over traditional methods. A good AI tutor remembers everything — not just your scores, but the specific types of errors you make, the concepts you've struggled with, how your performance changes over time, and what explanation styles work best for you.

When you start a new study session, the AI already knows that you tend to miss Data Sufficiency questions involving inequalities, that you understand CR weaken questions well but struggle with assumption questions, and that you've improved your time management but still rush on the last 5 questions.

Try getting that level of personalization from a textbook.

### 4. Voice-Based Learning

One of the most exciting developments in 2026 is voice-based AI tutoring. Instead of reading and typing, you talk through problems conversationally — the way you would with a human tutor.

This matters for several reasons:
- **Active recall is stronger when verbalized.** Explaining your reasoning out loud reinforces learning more than selecting answer choices silently.
- **It catches flawed reasoning in real time.** When you talk through your approach, the AI can identify exactly where your logic goes wrong — not just that you got the wrong answer.
- **It's accessible anywhere.** Commuting, exercising, doing chores — voice-based prep turns dead time into study time.

PrepWISE built its entire platform around this concept: you talk to Sam, your AI tutor, who responds with voice, adapts to your level, and remembers your progress. It's the closest thing to having a private GMAT tutor available 24/7.

## What AI Does NOT Replace

Let's be clear about the limitations:

### Discipline and consistency
AI makes studying more efficient, but it doesn't make you sit down and study. The student who does 2 hours of AI-assisted prep daily will outperform the student who uses AI once a week. Tools amplify effort — they don't replace it.

### Test-taking conditions
AI tutoring is conversational and supportive. The actual GMAT is timed, high-pressure, and alone. You still need full-length practice tests under realistic conditions. AI prep should complement, not replace, simulated test experiences.

### The human element
For some students, the accountability and motivation of a human tutor or study group is irreplaceable. AI doesn't replace the social dimension of learning. It fills a different role — the always-available, endlessly patient, perfectly-remembering knowledge partner.

### High-level strategy decisions
Should you retake the GMAT or apply with your current score? Which schools match your profile? How much does the GMAT score matter versus work experience? These are human judgment calls that AI can inform but shouldn't make.

## How to Use AI Prep Effectively

### 1. Be honest with the AI
The more accurately you describe your understanding (or confusion), the better the AI can help. Don't pretend to understand when you don't. Say "I don't get why Statement 1 is sufficient" and let the AI explain.

### 2. Use voice when possible
Talking through problems develops your reasoning skills faster than clicking through them. If your prep tool supports voice interaction, use it — especially for CR and DS, where verbal reasoning is central.

### 3. Review AI-identified patterns
Most AI prep tools track your error patterns over time. Review these regularly. When the AI tells you that you miss 60% of DS questions involving number properties, believe it and study number properties.

### 4. Don't skip practice tests
AI tutoring is excellent for daily skill building. But you still need 4-6 full-length practice tests during your prep to build stamina, practice time management, and simulate real test conditions.

### 5. Combine with official materials
AI-generated explanations should supplement, not replace, GMAT Official Guide problems. The official problems are the closest to what you'll see on test day. Use AI to help you understand them better.

## The Practical Impact

Students using AI-assisted prep tools are reporting:
- **20-30% less total study time** to reach their target score
- **Faster identification of weak areas** (days instead of weeks)
- **Higher retention** through personalized spaced repetition
- **More engagement** — conversational learning feels less like a chore

These are meaningful improvements. They don't make the GMAT easy — nothing does. But they make the preparation process significantly more efficient.

## Looking Ahead

AI-powered GMAT prep is still in its early stages. The technology will get better at understanding nuanced learning patterns, providing more natural conversational interactions, and integrating with other aspects of the MBA application process.

But the fundamentals won't change: you still need to learn the content, build the skills, and practice under test conditions. AI is the best study partner you've ever had — and the best study partner still needs you to show up.`,
  },
  {
    slug: 'gmat-study-plan-8-weeks-to-700',
    title: 'GMAT Study Plan: 8 Weeks to 700+',
    description: 'A week-by-week GMAT study plan designed to take you from baseline to 700+ in 8 focused weeks. Includes daily schedules and milestones.',
    section: 'strategy',
    tags: ['study plan', '700+', 'schedule', '8 weeks', 'strategy'],
    publishedAt: '2026-03-01',
    readingTime: 10,
    author: 'Sam (AI Tutor)',
    content: `Eight weeks is the sweet spot for most GMAT candidates — long enough to build real skills, short enough to maintain intensity. This plan assumes you can dedicate 15-20 hours per week (about 2-3 hours daily). Adjust the timeline if your availability differs, but keep the structure.

## Before You Start: The Baseline Test

**Day 0:** Take a full-length official GMAT Focus practice test. No preparation. No googling question types. Just sit down and take it under timed conditions.

Your score doesn't matter yet. What matters is the diagnostic data:
- Which section is your weakest?
- Which question types did you miss most?
- How was your time management?
- Where did you feel confused versus where did you make careless errors?

Write down your baseline score and your honest assessment of each section. You'll reference this throughout the 8 weeks.

## Week 1: Foundations

**Goal:** Understand the test format and rebuild core skills.

**Daily schedule (2.5 hours):**
- 60 min: Content review (rotate Quant/Verbal/DI)
- 45 min: Untimed practice problems
- 30 min: Review and error logging
- 15 min: Flashcards (formulas, concepts, vocabulary)

**Quant focus:** Arithmetic fundamentals — fractions, percents, ratios, number properties. No calculator, build mental math speed.

**Verbal focus:** CR argument structure — learn to identify conclusions, premises, and gaps. Read 2-3 CR questions per day, spending 5 minutes dissecting each argument.

**DI focus:** Data Sufficiency framework — learn the AD/BCE method. Practice with easy DS problems until the framework becomes automatic.

**End of week checkpoint:** You should be able to identify the conclusion in any CR argument, solve basic fraction/percent problems quickly, and explain the DS answer choices without referring to notes.

## Week 2: Core Concepts

**Goal:** Fill content gaps and build question-type familiarity.

**Daily schedule (2.5 hours):**
- 60 min: Targeted content study (weakest areas from diagnostic)
- 60 min: Timed practice (mixed topics)
- 30 min: Detailed error review

**Quant focus:** Algebra — equations, inequalities, absolute values, exponents. Practice translating word problems into equations.

**Verbal focus:** RC strategy — practice reading for structure. For each passage: main idea, author's purpose, paragraph roles. Don't memorize details.

**DI focus:** Table Analysis and Graphics Interpretation — practice reading data quickly. Sort tables, read axes, identify trends.

**End of week checkpoint:** Can you solve a two-equation system in under 2 minutes? Can you summarize an RC passage's structure in 30 seconds? Can you sort and analyze a table to answer 3 questions in 5 minutes?

## Week 3: Skill Building

**Goal:** Build speed and accuracy on all question types.

**Daily schedule (3 hours):**
- 45 min: Timed practice set (Quant, 15 questions)
- 45 min: Timed practice set (Verbal, 15 questions)
- 45 min: Timed practice set (DI, 10 questions)
- 30 min: Comprehensive error review
- 15 min: Concept reinforcement

**Quant focus:** Word problems — rate/work, mixture, overlapping sets, probability. Practice setting up the equations, not just solving them.

**Verbal focus:** CR deep dive — practice each question type separately. Do 10 weaken questions, then 10 strengthen, then 10 assumption. Build pattern recognition.

**DI focus:** Multi-Source Reasoning — practice reading multiple tabs efficiently. Time yourself on initial reading (aim for under 3 minutes for all tabs).

**Practice Test 2 (end of Week 3):** Take your second official practice test. Compare to baseline. You should see improvement — if not in score, then in comfort and time management.

## Week 4: Pattern Recognition

**Goal:** See through surface differences to underlying patterns.

**Daily schedule (3 hours):**
- 90 min: Intensive practice (focus on weakest area)
- 60 min: Pattern drilling (question type clusters)
- 30 min: Error review with pattern categorization

This week is about depth over breadth. If your error log shows you miss questions involving number properties, spend 90 minutes doing nothing but number properties problems. If CR assumption questions are your weakness, drill 20 of them.

**Quant patterns to recognize:**
- "What is the remainder when X is divided by Y?" → usually modular arithmetic or pattern recognition
- Problems with variables in answer choices → plug in numbers
- "Which must be true?" → test edge cases (0, negative, fractions)

**Verbal patterns to recognize:**
- CR: correlation ≠ causation arguments appear constantly
- CR: plans/proposals always have an assumption about feasibility
- RC: "according to the passage" means the answer is stated directly

**DI patterns to recognize:**
- DS: "What is the value of X?" needs exactly one answer; "Is X > 0?" needs a definitive yes or no
- TPA: one answer usually constrains the other

## Week 5: Integration and Timing

**Goal:** Practice under timed, mixed-format conditions.

**Daily schedule (3 hours):**
- 90 min: Full-section practice (one section per day, timed)
- 45 min: Review and analysis
- 45 min: Targeted drilling on persistent weak areas

Rotate through sections: Monday = Quant, Tuesday = Verbal, Wednesday = DI, Thursday = Quant, Friday = Verbal, Weekend = mixed sets or rest.

**Time management benchmarks:**
- Quant: 21 questions in 45 minutes (avg 2:08 each)
- Verbal: 23 questions in 45 minutes (avg 1:57 each)
- DI: 20 questions in 45 minutes (avg 2:15 each)

If you're consistently over time, identify the question types that take longest and practice those specifically.

**Practice Test 3 (end of Week 5):** Third official practice test. You should be within 30-40 points of your target. If not, adjust Week 6-7 to focus exclusively on lagging areas.

## Week 6: Refinement

**Goal:** Eliminate recurring errors and optimize strategy.

**Daily schedule (2.5 hours):**
- 60 min: Practice sets targeting top 3 error patterns
- 60 min: Full-section timed practice
- 30 min: Error review (look for NEW patterns — old ones should be shrinking)

By now, your error log should show clear trends. Most students find that 3-4 error types account for 70-80% of their wrong answers. This week is about reducing those specific errors.

**Common Week 6 focus areas:**
- Careless errors in easy Quant problems → slow down on the first 8 questions
- Falling for attractive wrong answers in CR → always pre-phrase before reading choices
- Running out of time in DI → practice MSR tab-reading speed
- Missing inference questions in RC → stick closer to what's explicitly stated

## Week 7: Simulation

**Goal:** Build test-day stamina and routine.

**Daily schedule (2.5 hours, plus practice test):**
- 60 min: Light practice (maintain sharpness, don't overload)
- 45 min: Quick-hit drills (20 problems, timed)
- 30 min: Review
- 15 min: Visualization and strategy notes

**Practice Test 4 (mid-week):** Take under exact test conditions — morning (if your test is in the morning), timed breaks, no phone. This is a dress rehearsal. Practice your section order choice too.

**Section order decision:** By now you know your sections well enough to choose your order:
- Start with your strongest (build confidence and momentum)
- Middle: your weakest (still have energy)
- End: your middle section

After Practice Test 4, make your final section order decision and stick with it.

## Week 8: Taper and Peak

**Goal:** Arrive at test day sharp, confident, and rested.

**Monday-Tuesday:**
- Light practice only (30-60 minutes)
- Focus on your strengths — build confidence
- Review your error log one final time
- Review key formulas and strategies

**Wednesday (4-5 days before test):**
- Practice Test 5 — final practice test
- Take it exactly as you would the real thing
- After finishing, review lightly. Don't deep-dive into errors — that ship has sailed.

**Thursday-Friday:**
- Minimal studying (flashcards only, 20-30 minutes)
- Focus on logistics: test center location, ID, what to bring
- Light exercise, good sleep

**Saturday (day before test):**
- No studying
- Prepare clothes, ID, snacks, water
- Normal routine, early bedtime

**Sunday (test day):**
- Normal wake time (don't oversleep or change your routine)
- Light breakfast
- Arrive 30 minutes early
- Trust your preparation

## Throughout the 8 Weeks: Non-Negotiable Habits

1. **Error log every day.** After every practice session, log what you got wrong and why. This is the single highest-value activity in your prep.

2. **Review before new problems.** Start each session by reviewing yesterday's errors. Spaced repetition beats cramming.

3. **One rest day per week.** Your brain consolidates learning during rest. Studying 7 days a week leads to diminishing returns and burnout.

4. **Sleep 7-8 hours.** This is not optional. Sleep deprivation directly impairs the exact cognitive functions the GMAT tests.

5. **Track your progress.** Keep a simple spreadsheet: date, what you studied, how long, practice scores. Seeing improvement over time is motivating and helps you adjust the plan.

The 8-week plan works because it balances skill building with practice, and intensity with rest. Trust the process, do the work, and you'll be ready.`,
  },
  {
    slug: 'gmat-vs-gre-which-test-should-you-take',
    title: 'GMAT vs GRE: Which Test Should You Take?',
    description: 'GMAT or GRE for business school? A detailed comparison of format, scoring, difficulty, and which test is right for your profile.',
    section: 'general',
    tags: ['GMAT vs GRE', 'business school', 'test choice', 'comparison'],
    publishedAt: '2026-03-08',
    readingTime: 9,
    author: 'PrepWISE Team',
    content: `Most top business schools accept both the GMAT and the GRE. That's great for flexibility, but it means you need to make a choice. Here's a clear-eyed comparison to help you decide.

## The Basic Differences

| Aspect | GMAT Focus Edition | GRE General Test |
|---|---|---|
| **Designed for** | Business school | Graduate school (all fields) |
| **Duration** | 2 hours 15 minutes | ~3 hours 45 minutes |
| **Sections** | Quant, Verbal, Data Insights | Quant, Verbal, Analytical Writing |
| **Score range** | 205-805 (total) | 130-170 per section |
| **Math difficulty** | Higher (no calculator, no geometry) | Moderate (on-screen calculator, includes geometry) |
| **Verbal focus** | Logic and comprehension | Vocabulary and comprehension |
| **Computer adaptive** | Section-adaptive | Section-adaptive |
| **Cost** | $275 | $220 |
| **Test frequency** | Up to 5 times per year | Up to 5 times in 365 days |

## When to Choose the GMAT

### You're targeting top MBA programs

While most schools officially "accept both equally," admissions consultants and former adcom members consistently report that the GMAT carries slightly more weight at top programs. Here's why:

- The GMAT was designed specifically for business school. It signals serious MBA intent.
- The Data Insights section tests business-relevant data analysis skills.
- Schools can benchmark GMAT scores against their historical applicant pool more precisely.
- GMAT scores factor into school rankings (some schools report average GMAT separately from GRE).

If you're applying to M7 schools (Harvard, Stanford, Wharton, Booth, Kellogg, Columbia, MIT Sloan) or other top-20 programs, the GMAT is generally the safer choice.

### You're strong in quantitative reasoning

The GMAT Quant section is harder than the GRE's. But if math is your strength, the GMAT lets you differentiate yourself more clearly. A top Quant score on the GMAT is a strong signal; a top Quant score on the GRE is more common and less distinctive.

### You prefer logic over vocabulary

GMAT Verbal tests Critical Reasoning and Reading Comprehension — no vocabulary-heavy questions, no Sentence Correction (as of the Focus Edition). If you think logically but don't have an enormous English vocabulary, the GMAT Verbal may be easier for you.

### You want a shorter test

At 2 hours 15 minutes, the GMAT Focus Edition is significantly shorter than the GRE. If test fatigue is a concern, the GMAT's compactness is an advantage.

## When to Choose the GRE

### You're applying to multiple types of graduate programs

The GRE's biggest advantage: it's accepted by virtually every graduate program — MBA, law (some JD programs), public policy, engineering MS, and more. If you're considering programs outside of business school, the GRE lets you keep your options open with one test.

### You're stronger in vocabulary and writing

The GRE tests vocabulary directly through Text Completion and Sentence Equivalence questions. If you're a strong reader with a wide vocabulary, you may find GRE Verbal easier than GMAT Verbal. The GRE also includes an Analytical Writing section that some humanities-oriented applicants prefer.

### You prefer having a calculator

The GRE provides an on-screen calculator for the Quant section. The GMAT does not. If mental math isn't your strong suit and you're more comfortable with a calculator available, the GRE removes one source of stress.

### You find geometry intuitive

The GMAT Focus Edition removed geometry. The GRE still includes it. If you're strong in geometry, the GRE lets you leverage that skill — and if you're weak in algebra, the GRE's slightly lower algebraic bar may help.

### You want more attempts

The GRE allows you to take the test up to 5 times within any 365-day period. The GMAT allows 5 attempts per rolling 12-month period. The GRE also offers the ScoreSelect option, letting you choose which scores to send. Both tests now offer score cancellation, but the GRE's flexibility is slightly broader.

## What About "Schools Accept Both Equally"?

This is technically true and practically complicated.

**The official line:** Most business schools, including all M7 programs, state that they accept the GMAT and GRE equally and have no preference.

**The practical reality:**
- Schools have longer historical datasets for GMAT scores, making comparisons easier
- Some scholarship committees still use GMAT cutoffs
- In close admissions decisions, the GMAT may carry marginal weight at business-focused programs
- Submitting a GRE to a program where 90% of applicants submit GMAT scores doesn't hurt, but it means your score is compared less precisely

**The nuanced advice:** If you're only applying to MBA programs, take the GMAT unless you have a specific reason to prefer the GRE. If you're applying to MBA + other programs, the GRE makes sense. If you've taken both and scored comparably, submit the GMAT to MBA programs.

## How the Scoring Compares

Comparing scores between tests is imprecise, but here are rough equivalencies:

| GMAT Focus | GRE (V+Q) | Competitiveness |
|---|---|---|
| 755+ | 335+ | Elite (top 5%) |
| 705 | 328-330 | Very competitive (top 10-15%) |
| 655 | 320-322 | Competitive (top 25-30%) |
| 605 | 312-315 | Moderate |
| 555 | 305-308 | Below average for top programs |

These are approximations. Schools use their own conversion tools (ETS provides a comparison tool, and GMAC publishes concordance tables).

## The Decision Framework

Ask yourself these questions:

**1. Am I only applying to MBA programs?**
- Yes → Lean GMAT
- No → Lean GRE

**2. Am I targeting top-20 MBA programs?**
- Yes → Lean GMAT (stronger signal)
- Not necessarily → Either works

**3. How's my vocabulary?**
- Strong → GRE Verbal may be easier
- Average → GMAT Verbal may be easier (no vocab questions)

**4. How's my mental math?**
- Strong → GMAT Quant rewards this
- Weak → GRE's calculator helps

**5. Have I taken a practice test for both?**
- If you haven't, do this before deciding. Your natural score differential between the two tests is the strongest signal.

## The Practice Test Strategy

Here's the most reliable way to choose:

1. Take a free official GMAT practice test (from mba.com)
2. Take a free official GRE practice test (from ets.org)
3. Convert both scores to the same scale using the ETS or GMAC concordance tool
4. Compare: which converted score is higher?

If one test yields a meaningfully better score (say, the equivalent of 30+ GMAT points), take that test. If they're roughly equal, default to the GMAT for MBA programs.

## The Bottom Line

Both tests measure your ability to succeed in a rigorous academic environment. Neither is inherently "easier." The right choice depends on your strengths, your target programs, and your career plans.

If you're purely MBA-focused and reasonably strong in math, the GMAT is the default choice. If you want flexibility across program types or your verbal strengths lean toward vocabulary, the GRE is the smarter play.

Whatever you choose, commit to it. Splitting your prep between two tests is the worst strategy. Pick one, prepare thoroughly, and go get your score.`,
  },
  {
    slug: 'data-sufficiency-strategies-complete-framework',
    title: 'Data Sufficiency Strategies: The Complete Framework',
    description: 'Master GMAT Data Sufficiency with the AD/BCE decision tree, common traps, and worked examples. The complete strategic framework.',
    section: 'data-insights',
    tags: ['Data Sufficiency', 'Data Insights', 'strategy', 'framework'],
    publishedAt: '2026-03-12',
    readingTime: 10,
    author: 'Sam (AI Tutor)',
    content: `Data Sufficiency is one of the most unusual question types on any standardized test. It doesn't ask you to solve a problem — it asks you whether a problem CAN be solved with given information. This distinction trips up even strong math students. Here's the complete framework for mastering it.

## The Format

Every DS question has the same structure:

**Question stem:** A question about a mathematical relationship (e.g., "What is the value of x?" or "Is y > 0?")

**Statement 1:** A piece of information

**Statement 2:** Another piece of information

**Answer choices (always the same five):**
- **(A)** Statement 1 alone is sufficient, but Statement 2 alone is not
- **(B)** Statement 2 alone is sufficient, but Statement 1 alone is not
- **(C)** Both statements together are sufficient, but neither alone is sufficient
- **(D)** Each statement alone is sufficient
- **(E)** Statements 1 and 2 together are not sufficient

These five answer choices never change. Memorize them until they're automatic — you should never waste time re-reading them during the test.

## The AD/BCE Decision Tree

This is the systematic approach that eliminates guesswork:

### Step 1: Evaluate Statement 1 ALONE (ignore Statement 2 completely)

Pretend Statement 2 doesn't exist. Can you answer the question using only Statement 1?

- **If YES → You're in the AD branch** (Answer is A or D)
- **If NO → You're in the BCE branch** (Answer is B, C, or E)

### Step 2A: If in AD branch → Evaluate Statement 2 ALONE (ignore Statement 1)

Now pretend Statement 1 doesn't exist. Can you answer the question using only Statement 2?

- **If YES → Answer is D** (each statement alone is sufficient)
- **If NO → Answer is A** (only Statement 1 is sufficient)

### Step 2B: If in BCE branch → Evaluate Statement 2 ALONE (ignore Statement 1)

Can you answer the question using only Statement 2?

- **If YES → Answer is B** (only Statement 2 is sufficient)
- **If NO → Go to Step 3**

### Step 3: Evaluate both statements TOGETHER

Combine the information from both statements. Can you answer the question now?

- **If YES → Answer is C** (together but not alone)
- **If NO → Answer is E** (not sufficient even together)

## The Two Types of DS Questions

### "Value" Questions

These ask: "What is the value of X?" Sufficiency requires that you can determine **exactly one value** for X. If a statement gives you two possible values (e.g., x = 3 or x = -3), it's NOT sufficient.

**Example:**
> What is the value of x?
> (1) x² = 9
> (2) x > 0

- Statement 1 alone: x = 3 or x = -3. Two values → NOT sufficient (BCE branch)
- Statement 2 alone: x could be anything positive → NOT sufficient
- Together: x² = 9 AND x > 0 → x = 3. Exactly one value → Answer: **C**

### "Yes/No" Questions

These ask: "Is [something] true?" Sufficiency requires a **definitive answer** — always yes OR always no. A statement is sufficient even if the answer is "no" — as long as it's definitively "no."

A statement is NOT sufficient if sometimes the answer is yes and sometimes no.

**Example:**
> Is x > 5?
> (1) x > 3
> (2) x > 7

- Statement 1 alone: If x = 4, answer is no. If x = 6, answer is yes. Not definitive → NOT sufficient (BCE branch)
- Statement 2 alone: x > 7, so x is always > 5. Definitive yes → sufficient → Answer: **B**

**Critical insight:** For yes/no questions, "always no" IS sufficient. If a statement proves that x is NEVER greater than 5, that's a definitive answer — the statement is sufficient.

## The Five Most Common DS Traps

### Trap 1: Solving When You Should Only Evaluate

You don't need to find the value of x. You need to determine WHETHER you CAN find it. This is the most fundamental DS mistake.

**Signs you're falling into this trap:**
- You're doing extensive calculations
- You're trying to get a numerical answer
- You're spending more than 2.5 minutes on one DS problem

**The fix:** As soon as you know that a unique answer CAN be determined, stop. You don't need to calculate what that answer actually is.

**Example:**
> What is the value of 3x + 5y?
> (1) x + y = 7
> (2) 2x + 4y = 22

You DON'T need to solve this system. You need to determine if 3x + 5y can be uniquely determined. Two independent linear equations with two unknowns? Yes, you can solve for x and y, therefore you can find 3x + 5y. Answer: C. Move on.

### Trap 2: Forgetting Hidden Constraints

The question stem often contains implicit information that affects sufficiency.

**Common hidden constraints:**
- "n is a positive integer" → n ≥ 1, and n is whole
- "the number of students" → positive integer
- "the price of the item" → positive real number
- Geometry context → lengths are positive, angles are between 0° and 180°

**Example:**
> If n is a positive integer, what is the value of n?
> (1) n² < 5

Without the "positive integer" constraint, this gives infinitely many values. WITH it: n = 1 or n = 2. That's two values → not sufficient. But notice how close it is — this is the kind of constraint awareness that separates right from wrong answers.

### Trap 3: Not Testing Multiple Cases

When evaluating sufficiency, test at least 2-3 cases to confirm your conclusion. Pick values that are as different as possible:

**For yes/no questions:**
- Test a case you think gives "yes"
- Test a case you think gives "no"
- If both give the same answer, the statement is likely sufficient
- If they give different answers, the statement is not sufficient

**For value questions:**
- If you get one value from a test case, try to find a different value that also satisfies the statement
- If you can't find a different value, the statement is likely sufficient

### Trap 4: Combining Statements Prematurely

When in the BCE branch, evaluate Statement 2 ALONE before combining. Many students jump from "Statement 1 is insufficient" directly to combining both, skipping the check of Statement 2 alone. This leads to choosing C when the answer is B.

### Trap 5: Redundant Statements

Sometimes the two statements provide identical information in different forms.

**Example:**
> What is the value of x?
> (1) 2x = 10
> (2) x + 3 = 8

Both statements tell you x = 5. Each alone is sufficient → Answer: **D**.

This seems easy, but the GMAT disguises redundancy:
> (1) x - y = 3
> (2) 2x - 2y = 6

Statement 2 is just Statement 1 multiplied by 2. They provide the same information. If Statement 1 alone isn't sufficient, combining them won't help — the answer jumps from the BCE branch to E, not C.

## Number Properties in DS: The Most Tested Topic

A disproportionate number of DS questions test number properties. Know these cold:

### Odd/Even Rules
- Odd + Odd = Even
- Even + Even = Even
- Odd + Even = Odd
- Odd × Odd = Odd
- Even × anything = Even

### Positive/Negative Rules
- Positive × Positive = Positive
- Negative × Negative = Positive
- Positive × Negative = Negative

### Zero
- 0 is even
- 0 is neither positive nor negative
- 0 is a multiple of every integer
- Division by 0 is undefined

### Divisibility
- If a is divisible by b, and b is divisible by c, then a is divisible by c
- If a and b are both divisible by c, then (a + b) and (a - b) are also divisible by c

## DS Practice Protocol

### Week 1: Untimed, process-focused
Do 10 DS problems daily. For each one, explicitly write out:
1. The question type (value or yes/no)
2. Your evaluation of Statement 1 (with test cases)
3. Which branch you're in (AD or BCE)
4. Your evaluation of Statement 2 (with test cases)
5. If needed, your evaluation of both together

### Week 2: Building speed
Do 10 DS problems timed (2.5 minutes each). Still write out the framework, but work faster. Identify where your time is going.

### Week 3+: Mixed with other DI types
Integrate DS into full DI practice sets. By now the framework should be automatic — you shouldn't need to consciously think through AD/BCE; it should be reflex.

### Review Protocol
For every DS problem you miss:
1. Which step in the framework did you go wrong?
2. Did you test enough cases?
3. Did you miss a hidden constraint?
4. Did you solve instead of evaluate?
5. Would drawing a number line or simple diagram have helped?

## The Speed Secret

Experienced DS test-takers often solve problems in under 90 seconds. Their secret isn't fast math — it's fast recognition. They see a question and immediately know:
- What type it is (value vs. yes/no)
- What mathematical concept is being tested
- What kinds of statements would be sufficient

This pattern recognition comes from practice. There are really only 15-20 core DS "scenarios" (number properties, inequalities, systems of equations, divisibility, etc.). Once you've seen 50+ problems of each type, you start recognizing them instantly.

DS is the most learnable question type on the GMAT. The framework works every time. The traps repeat. The math is usually not hard. What's hard is the logic — and logic is a skill you can build.`,
  },
  {
    slug: 'gmat-reading-comprehension-speed-vs-accuracy',
    title: 'Reading Comprehension on GMAT: Speed vs Accuracy',
    description: 'How to read GMAT passages efficiently without sacrificing accuracy. Passage mapping, timing strategies, and question type breakdowns.',
    section: 'verbal',
    tags: ['Reading Comprehension', 'verbal', 'speed reading', 'strategy'],
    publishedAt: '2026-03-18',
    readingTime: 9,
    author: 'Sam (AI Tutor)',
    content: `Reading Comprehension is the backbone of GMAT Verbal. Every test will have 3-4 passages with 3-4 questions each — that's roughly half the section. And here's the tension: you need to read carefully enough to answer accurately but quickly enough to finish on time. Here's how to balance that.

## The Speed vs. Accuracy Tradeoff

Let's start with what doesn't work:

**Reading too fast:** You skim the passage, get a vague sense of the topic, and jump to questions. You then re-read portions of the passage for every question, wasting more time than you saved. Accuracy drops because you miss nuances and structural relationships.

**Reading too slowly:** You read every sentence carefully, take mental notes on details, and feel like you understand everything. Then you realize you've spent 5 minutes on the passage and have 4 questions to answer in 3 minutes. You rush the questions and miss easy ones.

**What works:** Read strategically — focus on structure and purpose during your first read, not on memorizing details. You can always go back for specifics when a question requires them.

## The Passage Mapping Method

When you read a GMAT passage, your goal isn't to remember everything. It's to build a mental map of what information lives where and how the parts relate.

### During your first read (3-4 minutes for a long passage, 2-3 for a short one):

**For each paragraph, note:**
1. **What role does this paragraph play?** (introduces the topic, presents a theory, offers evidence, provides a counterargument, draws a conclusion)
2. **What is the paragraph's main point?** (one phrase — not a full summary)
3. **How does it connect to the previous paragraph?** (continuation, contrast, cause-effect, example)

**Do NOT try to:**
- Memorize specific numbers, dates, or names
- Understand every technical term
- Retain detailed examples or evidence

You can come back for those. What you can't easily reconstruct is the passage's overall structure and argument flow.

### The passage map looks like this (mentally, not written):

> P1: Introduces topic X and conventional view
> P2: Presents new research that challenges conventional view
> P3: Explains methodology of new research
> P4: Discusses implications, author supports new view

This takes 15-20 seconds to construct during reading and saves you 2-3 minutes when answering questions.

## The Four Major Passage Types

GMAT passages fall into predictable categories. Recognizing the type helps you read more efficiently:

### 1. The "New Theory" Passage
**Structure:** Introduces established view → presents new evidence or theory → evaluates the new theory
**Author's role:** Usually sympathetic to the new theory
**Watch for:** Questions about why the old theory is insufficient

### 2. The "Two Views" Passage
**Structure:** Presents Position A → presents Position B → sometimes evaluates both
**Author's role:** May be neutral or may favor one side
**Watch for:** Questions about what each side would agree/disagree on

### 3. The "Phenomenon Explanation" Passage
**Structure:** Describes an observation → explores possible explanations → may settle on one
**Author's role:** Analytical, explaining rather than advocating
**Watch for:** Questions about which explanation is supported by specific evidence

### 4. The "Historical/Business Analysis" Passage
**Structure:** Describes a situation → analyzes causes/effects → draws conclusions
**Author's role:** Informative, sometimes prescriptive
**Watch for:** Questions about the causal chain and the author's conclusion

## Question Types and How to Handle Each

### Main Idea Questions
**Recognizing them:** "The primary purpose of the passage is..." / "Which of the following best describes the main idea?"

**Strategy:** Your passage map should give you this immediately. The main idea is NOT a detail from one paragraph — it's the overarching point that ties all paragraphs together.

**Common traps:**
- An answer that's too narrow (describes only one paragraph)
- An answer that's too broad (could describe many passages)
- An answer that's almost right but includes one wrong word (e.g., "proves" instead of "suggests")

### Detail Questions
**Recognizing them:** "According to the passage..." / "The passage mentions which of the following?"

**Strategy:** These have answers directly stated in the passage. Use your mental map to locate the relevant paragraph, then re-read specifically for the detail. Don't rely on memory — verify.

**Common traps:**
- Answers that are true in the real world but not stated in the passage
- Answers that use words from the passage but change the meaning
- Answers that describe content from the wrong paragraph

### Inference Questions
**Recognizing them:** "It can be inferred that..." / "The author would most likely agree that..." / "The passage implies that..."

**Strategy:** Inferences must be DIRECTLY supported by the passage. A valid GMAT inference is one small logical step from what's stated — not a creative leap. When in doubt, choose the most conservative answer.

**Common traps:**
- Answers that are reasonable but go beyond what the passage supports
- Answers that use extreme language ("always," "never," "all") when the passage is more measured
- Answers that confuse the author's view with a view the author describes but doesn't endorse

### Structure Questions
**Recognizing them:** "The author mentions X primarily in order to..." / "The third paragraph serves mainly to..."

**Strategy:** These test your passage map directly. Why did the author include this? What purpose does it serve in the overall argument?

**Common answers:**
- To provide evidence for a claim
- To illustrate a concept with an example
- To present a counterargument
- To introduce a new perspective
- To qualify or limit a previous statement

### Tone Questions
**Recognizing them:** "The author's attitude toward X is best described as..." / "The tone of the passage is..."

**Strategy:** Note tone words as you read — "surprisingly," "unfortunately," "notably," "however." These signal the author's attitude. GMAT authors are usually measured in their tone — rarely purely positive or negative.

**Common GMAT tone descriptors:**
- Cautiously optimistic
- Skeptical but fair
- Objectively analytical
- Somewhat critical
- Measured enthusiasm

**Answers that are almost always wrong:**
- Completely indifferent (why would they write about it?)
- Angry or hostile (too extreme for academic writing)
- Unqualified enthusiasm (GMAT passages always have nuance)

## Timing Strategy for RC

You have roughly 45 minutes for 23 Verbal questions. Assuming about half are RC (12-13 questions across 3-4 passages), you should budget:

**Short passages (200-250 words, 3 questions):**
- Reading: 2-2.5 minutes
- Questions: 4-5 minutes (1.5 per question)
- Total: 6-7.5 minutes per passage set

**Long passages (300-350 words, 4 questions):**
- Reading: 3-4 minutes
- Questions: 5-6 minutes (1.5 per question)
- Total: 8-10 minutes per passage set

**Time-saving techniques:**
1. **Read the first question before reading the passage.** If it's a detail question, you'll know to pay attention to that detail during your first read.
2. **Don't re-read the entire passage for each question.** Use your map to locate the relevant section, then re-read only that section.
3. **Eliminate first.** It's often faster to eliminate 3-4 wrong answers than to find the right one directly.
4. **If torn between two answers, pick the less extreme one.** GMAT correct answers are measured and precise; they rarely make strong claims.

## Common RC Mistakes

### 1. Reading too passively
Don't let your eyes move across words without engaging. Ask yourself questions as you read: "Why is the author saying this? What's the point? How does this connect to what came before?"

### 2. Bringing outside knowledge
The passage is the only source of truth. If you know about the topic, that's fine — but answer based on what the passage says, not what you know. The GMAT sometimes includes passages with slightly misleading or incomplete representations of topics. Don't "correct" the passage in your mind.

### 3. Confusing the author's view with others' views
Passages frequently present multiple perspectives. The author may describe a scientist's theory without agreeing with it. Watch for language like "Some researchers argue..." (not the author's view) vs. "In fact..." (likely the author's view).

### 4. Overthinking inference questions
GMAT inferences are modest. If an answer choice requires a chain of three logical steps, it's probably wrong. The correct inference is usually one step from what's stated — almost obvious in hindsight.

## Building RC Skills

**Week 1-2:** Read one passage per day, untimed. Practice passage mapping. After reading, write down the structure of each paragraph in one phrase. Then answer questions.

**Week 3-4:** Add timing. Read and answer questions for each passage in the target time (7-10 minutes). Track which question types you miss most.

**Week 5+:** Mixed practice with CR questions. Build stamina for full Verbal sections. Focus on the passages and question types that give you the most trouble.

**Outside GMAT practice:** Read dense, argument-driven articles from publications like The Economist, Harvard Business Review, or Scientific American. Practice identifying the author's thesis, evidence, and tone in real-world writing. This builds the reading muscle that transfers directly to the GMAT.

RC isn't about reading speed. It's about reading strategically — knowing what to focus on, what to skim, and where to find the details when you need them. Master that balance, and the section becomes predictable.`,
  },
]

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug)
}

export function getArticlesBySection(section: BlogArticle['section']): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.section === section)
}

export function getRelatedArticles(slug: string, limit = 3): BlogArticle[] {
  const article = getArticleBySlug(slug)
  if (!article) return []

  return BLOG_ARTICLES
    .filter((a) => a.slug !== slug)
    .map((a) => ({
      article: a,
      score:
        (a.section === article.section ? 2 : 0) +
        a.tags.filter((t) => article.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((a) => a.article)
}

export const SECTION_LABELS: Record<BlogArticle['section'], string> = {
  quant: 'Quantitative',
  verbal: 'Verbal',
  'data-insights': 'Data Insights',
  strategy: 'Strategy',
  general: 'General',
}

export const SECTION_COLORS: Record<BlogArticle['section'], string> = {
  quant: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  verbal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'data-insights': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  strategy: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  general: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

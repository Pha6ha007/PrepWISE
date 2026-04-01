#!/usr/bin/env node
// scripts/gmat/generate_knowledge.ts
// Generate GMAT educational content and index into Pinecone
// Uses OpenRouter (gpt-4o-mini) for generation + embeddings

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import * as path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Config ──────────────────────────────────────────────────

const GENERATION_MODEL = 'openai/gpt-4o-mini'
const EMBEDDING_MODEL = 'openai/text-embedding-3-small'
const BATCH_SIZE = 50
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'confide-knowledge'

// ── Content Plan ────────────────────────────────────────────

interface ContentPlan {
  namespace: string
  topic: string
  prompts: string[]
}

const CONTENT_PLANS: ContentPlan[] = [
  // ── gmat-quant ──
  {
    namespace: 'gmat-quant',
    topic: 'Arithmetic Fundamentals',
    prompts: [
      'Explain GMAT Focus Edition arithmetic: fractions, decimals, percents. Include common traps and shortcuts. Focus on problem-solving approach, not memorization.',
      'GMAT ratios and proportions: setup methods, cross-multiplication, direct/inverse proportion. Include 3 example problems with step-by-step solutions.',
      'Percents on GMAT: percent change, successive percents, percent of percent. Common GMAT traps with percents. 3 practice problems.',
      'Number line, absolute value, order of operations for GMAT. Edge cases that GMAT tests. 2 examples.',
      'Statistics for GMAT: mean, median, mode, range, weighted average. How GMAT tests these concepts. 3 examples.',
      'Standard deviation concepts for GMAT (no calculation, just understanding). What changes SD, what doesnt. Comparison problems.',
    ]
  },
  {
    namespace: 'gmat-quant',
    topic: 'Algebra',
    prompts: [
      'Linear equations and inequalities for GMAT Focus Edition. Solving single variable, two variables, systems. Sign flipping with inequalities. 3 examples.',
      'Quadratic equations on GMAT: factoring, quadratic formula, discriminant. Common patterns GMAC uses. 3 examples.',
      'Exponents and roots for GMAT: rules, fractional exponents, simplification. Common traps. 3 examples.',
      'Functions and coordinate geometry for GMAT: f(x) notation, slope, midpoint, distance. How GMAT tests these. 3 examples.',
      'Absolute value equations and inequalities. The two-case method. GMAT-specific applications. 2 examples.',
      'Algebraic word problem translation: converting English to equations. Rate problems setup. Age problems setup. 3 examples.',
    ]
  },
  {
    namespace: 'gmat-quant',
    topic: 'Number Properties',
    prompts: [
      'Divisibility rules for GMAT: by 2,3,4,5,6,8,9. Factor counting formula. How GMAT tests divisibility. 3 examples.',
      'Prime numbers for GMAT: identification, prime factorization, LCM/GCD using primes. 3 examples.',
      'Odd/even properties on GMAT: addition, subtraction, multiplication rules. What GMAT asks about odd/even. 2 examples.',
      'Remainders on GMAT: remainder arithmetic, pattern recognition, cyclicity. This is a high-frequency 700+ topic. 3 examples.',
      'Consecutive integers: properties, sum formulas, product properties. GMAT patterns. 2 examples.',
    ]
  },
  {
    namespace: 'gmat-quant',
    topic: 'Word Problems',
    prompts: [
      'Rate × Time = Distance problems for GMAT: single trip, round trip, converging/diverging, relative speed. Framework and 3 examples.',
      'Work rate problems: combined work, pipes filling tanks, opposing work. The reciprocal method. 3 examples.',
      'Mixture and solution problems: concentration mixing, alligation method. 2 examples with step-by-step.',
      'Profit, loss, discount, and interest problems for GMAT. Simple vs compound interest. Markup/margin. 3 examples.',
      'Overlapping sets and Venn diagrams: two-set formula, three-set problems. GMAT matrix method. 2 examples.',
      'Combinatorics for GMAT: permutations, combinations, when to use which. Slot method vs formula. 3 examples.',
      'Probability on GMAT: basic probability, complementary counting, independent events, at-least-one problems. 3 examples.',
    ]
  },
  {
    namespace: 'gmat-quant',
    topic: 'Problem Solving Strategies',
    prompts: [
      'GMAT Problem Solving (PS) strategies: backsolving, picking numbers, estimation, strategic guessing. When to use each. 3 examples.',
      'Number picking on GMAT: choosing smart numbers for percent problems, fraction problems, must-be-true questions. Guidelines and 3 examples.',
      'Backsolving strategy: starting from answer choices, working backward. When its faster than algebra. 2 examples.',
      'Time management for GMAT Quant: 2-minute rule, when to guess, flagging strategy. Pacing for 21 questions in 45 minutes.',
    ]
  },

  // ── gmat-di ──
  {
    namespace: 'gmat-di',
    topic: 'Data Sufficiency Framework',
    prompts: [
      'Data Sufficiency (DS) complete framework for GMAT Focus Edition. The 5 answer choices (A-E). Step-by-step decision tree. Why DS moved to Data Insights section.',
      'DS strategy: test Statement 1 alone, then Statement 2 alone, then together. Common traps: assuming you need both, forgetting to test together. 3 examples.',
      'Yes/No DS questions vs Value DS questions. Different approach for each type. How to test sufficiency for yes/no. 3 examples.',
      'Advanced DS: number properties DS (is n even?), inequality DS, algebraic DS. Testing with smart numbers. 3 examples.',
      'DS common traps on GMAT: trap answer C (both needed when one is enough), trap answer E (not sufficient when it is), the constraint trap. 3 trap examples.',
      'DS with combined math concepts: ratios + algebra, percents + inequalities. Multi-step DS reasoning. 2 hard examples.',
    ]
  },
  {
    namespace: 'gmat-di',
    topic: 'Table Analysis',
    prompts: [
      'Table Analysis (TA) on GMAT Focus Edition: format, what to expect, sorting strategy. How to approach multi-column tables efficiently. 2 examples.',
      'TA compound conditions: AND/OR filtering, threshold conditions, ranking by column. Systematic row-by-row checking. 2 examples.',
      'TA with calculations: percentage of total, growth rates from tables, comparing across rows. Watch for units. 2 examples.',
    ]
  },
  {
    namespace: 'gmat-di',
    topic: 'Graphics Interpretation',
    prompts: [
      'Graphics Interpretation (GI) on GMAT: bar charts, line graphs, scatter plots, pie charts. Fill-in-the-blank format. Reading strategy. 2 examples.',
      'GI with trends and comparisons: identifying trends, calculating approximate values from graphs, extrapolation pitfalls. 2 examples.',
      'GI with complex graphics: dual-axis charts, stacked bars, bubble charts. What GMAT actually asks about these. 2 examples.',
    ]
  },
  {
    namespace: 'gmat-di',
    topic: 'Multi-Source Reasoning',
    prompts: [
      'Multi-Source Reasoning (MSR) on GMAT: multiple tabs/sources, synthesis strategy. Read all sources first, note what each uniquely provides. 2 examples.',
      'MSR yes/no questions: testing each statement against all sources. One counterexample = No. Conditional logic in MSR. 2 examples.',
      'MSR with mixed data types: text + table + graph combinations. How to efficiently navigate between sources. 1 detailed example.',
    ]
  },
  {
    namespace: 'gmat-di',
    topic: 'Two-Part Analysis',
    prompts: [
      'Two-Part Analysis (TPA) on GMAT: format (two columns to fill), algebraic TPA, verbal TPA. Strategy: find the constraint. 2 examples.',
      'TPA constraint-matching: using one column to narrow down the other. Algebraic TPA with systems of equations. 2 examples.',
      'Verbal TPA: argument-based two-part analysis, identifying premise and conclusion, strengthening both parts. 1 detailed example.',
    ]
  },

  // ── gmat-errors ──
  {
    namespace: 'gmat-errors',
    topic: 'Common Quant Mistakes',
    prompts: [
      'Top 10 careless math mistakes on GMAT: sign errors, distribution errors, forgetting constraints, unit mismatches. How to catch each one.',
      'GMAT quant traps by topic: the remainder trap, the percent change trap, the average trap, the probability trap. Specific examples of each.',
      'Calculation shortcuts to avoid errors: estimation benchmarks, fraction-decimal conversions to memorize, squaring shortcuts.',
    ]
  },
  {
    namespace: 'gmat-errors',
    topic: 'Common Verbal Mistakes',
    prompts: [
      'Top CR mistakes on GMAT: confusing strengthen with assumption, scope errors, falling for out-of-scope attractive answers. How to avoid each.',
      'RC mistakes: spending too long on passage, answering from memory instead of re-reading, falling for extreme answer choices. Timing strategy.',
      'Argument structure errors: misidentifying the conclusion, missing the gap between premise and conclusion, confusing correlation with causation.',
    ]
  },
  {
    namespace: 'gmat-errors',
    topic: 'Common DI Mistakes',
    prompts: [
      'DS mistakes: not testing statements individually, assuming both are needed, forgetting to check "together", confusing sufficiency with solving. Examples.',
      'Table/Graph interpretation errors: misreading axes, confusing absolute vs relative values, unit errors, extrapolating beyond data. Examples.',
      'Time pressure mistakes on DI: rushing multi-source reasoning, not reading all tabs, miscounting in table analysis. Pacing strategy for DI section.',
    ]
  },
  {
    namespace: 'gmat-errors',
    topic: 'Test Strategy Errors',
    prompts: [
      'GMAT Focus Edition test-taking mistakes: wrong section order, not using the bookmark feature, not previewing score, poor break strategy.',
      'Adaptive test mistakes: getting demoralized by hard questions (means youre doing well), spending too long on one question, not guessing strategically.',
    ]
  },
]

// ── Generation ──────────────────────────────────────────────

async function generateContent(
  client: OpenAI,
  prompt: string,
  topic: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: GENERATION_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert GMAT tutor creating educational content for the GMAT Focus Edition (2024-2026). 
Write clear, actionable study material. Include:
- Key concepts explained simply
- GMAT-specific strategies and shortcuts  
- Common traps and how to avoid them
- Practice examples with step-by-step solutions where requested

Format: flowing prose paragraphs, not bullet lists. Write as if explaining to a motivated student who needs to score 700+.
Topic area: ${topic}
Do NOT include markdown headers or formatting — write plain instructional text.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })
  
  return response.choices[0]?.message?.content || ''
}

async function generateEmbeddings(
  client: OpenAI,
  texts: string[]
): Promise<number[][]> {
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  })
  return response.data.map(d => d.embedding)
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log('🚀 PrepWISE Knowledge Base Generator')
  console.log('====================================\n')

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY required')
  }
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY required')
  }

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://samiwise.app',
      'X-Title': 'PrepWISE',
    },
  })

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const index = pinecone.index(INDEX_NAME)

  const totalPrompts = CONTENT_PLANS.reduce((sum, p) => sum + p.prompts.length, 0)
  let completed = 0
  let totalVectors = 0
  let totalCost = 0

  for (const plan of CONTENT_PLANS) {
    console.log(`\n📚 ${plan.namespace} / ${plan.topic}`)
    console.log(`   ${plan.prompts.length} chunks to generate`)

    const chunks: { text: string; id: string; topic: string }[] = []

    for (let i = 0; i < plan.prompts.length; i++) {
      const prompt = plan.prompts[i]
      completed++
      process.stdout.write(`\r   Generating ${i + 1}/${plan.prompts.length} (${completed}/${totalPrompts} total)`)

      try {
        const content = await generateContent(client, prompt, plan.topic)
        if (content.length > 50) {
          chunks.push({
            text: content,
            id: `gen-${plan.namespace}-${plan.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
            topic: plan.topic,
          })
        }
        
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 200))
      } catch (error: any) {
        console.error(`\n   ⚠️ Error generating chunk ${i}: ${error.message}`)
      }
    }

    console.log(`\n   Generated ${chunks.length} chunks. Embedding & indexing...`)

    // Embed and upsert in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const texts = batch.map(c => c.text)

      try {
        const embeddings = await generateEmbeddings(client, texts)

        const vectors = batch.map((chunk, j) => ({
          id: chunk.id,
          values: embeddings[j],
          metadata: {
            text: chunk.text,
            topic: chunk.topic,
            namespace: plan.namespace,
            source: 'PrepWISE AI Generated',
            generated: new Date().toISOString(),
          },
        }))

        await index.namespace(plan.namespace).upsert(vectors)
        totalVectors += vectors.length
      } catch (error: any) {
        console.error(`   ⚠️ Embedding error: ${error.message}`)
      }
    }

    console.log(`   ✅ ${chunks.length} vectors indexed in ${plan.namespace}`)
  }

  // Also save generated content locally as backup
  const allContent: Record<string, any[]> = {}
  // (content was already indexed, just log summary)

  console.log('\n====================================')
  console.log(`✅ Knowledge base generation complete!`)
  console.log(`   Total chunks generated: ${completed}`)
  console.log(`   Total vectors indexed: ${totalVectors}`)
  console.log(`   Namespaces populated: gmat-quant, gmat-di, gmat-errors`)
}

main().catch(console.error)

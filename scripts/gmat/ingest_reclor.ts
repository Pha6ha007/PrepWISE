#!/usr/bin/env node
// scripts/gmat/ingest_reclor.ts
// SamiWISE — Extract and index CR question type examples from ReClor paper
//
// The ReClor paper (RECLOR: A Reading Comprehension Dataset Requiring Logical Reasoning)
// contains 17 Critical Reasoning question types with full examples.
// Each example is indexed as a separate chunk in gmat-verbal namespace.
//
// Usage:
//   npx ts-node scripts/gmat/ingest_reclor.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'gmat-tutor-prod'

// ── CR Question Types from ReClor ──────────────────────────

// These are the 17 CR question types identified in the ReClor paper.
// Each has a description and teaching context for the GMAT verbal agent.
const CR_QUESTION_TYPES = [
  {
    id: 'strengthen',
    name: 'Strengthen',
    description: 'Which of the following, if true, most strengthens the argument?',
    strategy: 'Find the answer that makes the conclusion MORE likely to be true. Look for answers that fill the gap between premise and conclusion.',
  },
  {
    id: 'weaken',
    name: 'Weaken',
    description: 'Which of the following, if true, most weakens the argument?',
    strategy: 'Find the answer that makes the conclusion LESS likely. Look for alternative explanations, counterexamples, or broken assumptions.',
  },
  {
    id: 'assumption',
    name: 'Necessary Assumption',
    description: 'The argument above relies on which of the following assumptions?',
    strategy: 'Use the Negation Test: negate each answer choice. If negating it destroys the argument, it is a necessary assumption.',
  },
  {
    id: 'sufficient_assumption',
    name: 'Sufficient Assumption',
    description: 'Which of the following, if assumed, allows the conclusion to be properly drawn?',
    strategy: 'Find the answer that, when combined with the premises, GUARANTEES the conclusion. Stronger than necessary assumption.',
  },
  {
    id: 'inference',
    name: 'Must Be True / Inference',
    description: 'Which of the following must be true based on the statements above?',
    strategy: 'The correct answer is provable from the passage. Don\'t add outside knowledge. Look for what MUST follow logically.',
  },
  {
    id: 'cannot_be_true',
    name: 'Cannot Be True',
    description: 'Which of the following cannot be true if the statements above are true?',
    strategy: 'Find the answer that directly contradicts the information given. It must be impossible, not just unlikely.',
  },
  {
    id: 'most_supported',
    name: 'Most Strongly Supported',
    description: 'Which of the following is most strongly supported by the information above?',
    strategy: 'Weaker than "must be true." Find the answer best supported by evidence. Avoid extreme language.',
  },
  {
    id: 'explain_discrepancy',
    name: 'Explain / Resolve the Discrepancy',
    description: 'Which of the following, if true, most helps to explain the discrepancy described above?',
    strategy: 'Two facts seem contradictory. The correct answer explains how both can be true simultaneously.',
  },
  {
    id: 'flaw',
    name: 'Identify the Flaw',
    description: 'The reasoning in the argument is flawed because it:',
    strategy: 'Name the logical error. Common flaws: correlation≠causation, ad hominem, false dichotomy, hasty generalization, equivocation.',
  },
  {
    id: 'parallel_reasoning',
    name: 'Parallel Reasoning',
    description: 'Which of the following is most similar in its reasoning to the argument above?',
    strategy: 'Match the STRUCTURE, not the content. If the original is "All A are B, X is A, therefore X is B," find the same pattern.',
  },
  {
    id: 'parallel_flaw',
    name: 'Parallel Flaw',
    description: 'Which of the following contains a flaw most similar to the one in the argument above?',
    strategy: 'First identify the flaw in the original, then find an answer with the SAME type of flaw.',
  },
  {
    id: 'evaluate',
    name: 'Evaluate the Argument',
    description: 'Which of the following would be most useful to know in order to evaluate the argument?',
    strategy: 'Find the question whose answer would help determine if the argument is strong or weak. It should be relevant to the gap.',
  },
  {
    id: 'complete_argument',
    name: 'Complete the Argument',
    description: 'Which of the following most logically completes the argument?',
    strategy: 'The correct answer follows naturally from the premises. It should feel like the obvious conclusion.',
  },
  {
    id: 'principle',
    name: 'Principle',
    description: 'Which of the following principles, if valid, most helps to justify the reasoning above?',
    strategy: 'Find a general rule that, when applied, makes the specific argument valid. The principle bridges the logical gap.',
  },
  {
    id: 'boldface',
    name: 'Role of Boldface',
    description: 'The two boldface portions of the argument above play which of the following roles?',
    strategy: 'Identify whether each boldface statement is: premise, conclusion, counter-premise, background, or intermediate conclusion.',
  },
  {
    id: 'method_of_reasoning',
    name: 'Method of Reasoning',
    description: 'The argument proceeds by:',
    strategy: 'Describe HOW the argument works, not WHAT it says. Examples: analogy, counterexample, elimination, reductio ad absurdum.',
  },
  {
    id: 'point_at_issue',
    name: 'Point at Issue',
    description: 'The main point at issue between the two speakers is:',
    strategy: 'Find what they DISAGREE about. Both must have expressed an opinion on the topic. Eliminate answers where only one speaker has a view.',
  },
]

// ── Main ───────────────────────────────────────────────────

async function main() {
  console.log('🚀 SamiWISE — ReClor CR Question Types Ingestion')
  console.log('=================================================')

  if (!process.env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY not set')
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const index = pinecone.index(INDEX_NAME)

  // Also try to extract examples from the actual PDF if it exists
  const pdfPath = path.join(__dirname, 'data', 'RECLOR- A READING COMPREHENSION DATASET REQUIRING LOGICAL REASONING.pdf')
  let pdfContent = ''

  if (fs.existsSync(pdfPath)) {
    try {
      const pdfParse = (await import('pdf-parse')).default
      const buffer = fs.readFileSync(pdfPath)
      const data = await pdfParse(buffer)
      pdfContent = data.text
      console.log(`   PDF loaded: ${pdfContent.length} chars`)
    } catch (error: any) {
      console.log(`   PDF parse failed: ${error.message}`)
    }
  }

  // Build chunks from CR type descriptions + PDF content
  const chunks: { text: string; id: string; crType: string }[] = []

  for (const crType of CR_QUESTION_TYPES) {
    // Base chunk: type description + strategy
    let text = [
      `Critical Reasoning Question Type: ${crType.name}`,
      ``,
      `Typical question stem: "${crType.description}"`,
      ``,
      `Strategy: ${crType.strategy}`,
    ].join('\n')

    // Try to find matching example from PDF
    if (pdfContent) {
      const typePatterns = [
        crType.name.toLowerCase(),
        crType.id.replace(/_/g, ' '),
      ]

      for (const pattern of typePatterns) {
        const idx = pdfContent.toLowerCase().indexOf(pattern)
        if (idx >= 0) {
          // Extract ~500 chars around the match as example context
          const start = Math.max(0, idx - 100)
          const end = Math.min(pdfContent.length, idx + 500)
          const excerpt = pdfContent.slice(start, end).trim()
          text += `\n\nExample from ReClor paper:\n${excerpt}`
          break
        }
      }
    }

    chunks.push({
      text,
      id: `reclor-cr-${crType.id}`,
      crType: crType.name,
    })
  }

  console.log(`   Prepared ${chunks.length} CR type chunks`)

  // Embed and upsert
  const texts = chunks.map(c => c.text)
  const embeddings = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  })

  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings.data[i].embedding,
    metadata: {
      text: chunk.text,
      source: 'reclor_paper',
      type: 'CR_example',
      cr_type: chunk.crType,
      section: 'verbal',
      namespace: 'gmat-verbal',
    },
  }))

  await index.namespace('gmat-verbal').upsert(vectors)

  console.log(`   ✅ ${vectors.length} CR type examples indexed to gmat-verbal`)
  console.log('   CR types indexed:')
  for (const crType of CR_QUESTION_TYPES) {
    console.log(`     - ${crType.name}`)
  }
}

main().catch(console.error)

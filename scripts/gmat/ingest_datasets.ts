#!/usr/bin/env node
// scripts/gmat/ingest_datasets.ts
// Prepwise — Download and index free GMAT datasets from HuggingFace
//
// Datasets:
//   1. deepmind/aqua_rat — 97k algebra problems with rationales (Apache 2.0)
//   2. allenai/math_qa — math word problems with formulas (Apache 2.0)
//
// Usage:
//   npx ts-node scripts/gmat/ingest_datasets.ts
//   npx ts-node scripts/gmat/ingest_datasets.ts --dataset aqua_rat
//   npx ts-node scripts/gmat/ingest_datasets.ts --dataset math_qa

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const BATCH_SIZE = 100
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'gmat-tutor-prod'

// ── HuggingFace API ────────────────────────────────────────

const HF_API = 'https://datasets-server.huggingface.co'

interface AquaRatRow {
  question: string
  options: string[] | string
  rationale: string
  correct: string
}

interface MathQaRow {
  Problem: string
  Rationale: string
  options: string
  correct: string
  category: string
}

// ── Fetch dataset rows from HuggingFace API ────────────────

async function fetchHfDataset(
  dataset: string,
  split: string = 'train',
  offset: number = 0,
  length: number = 100
): Promise<any[]> {
  const url = `${HF_API}/rows?dataset=${encodeURIComponent(dataset)}&config=default&split=${split}&offset=${offset}&length=${length}`

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status} for ${dataset}`)
  }

  const data = await response.json()
  return data.rows?.map((r: any) => r.row) || []
}

async function getDatasetSize(dataset: string, split: string = 'train'): Promise<number> {
  const url = `${HF_API}/size?dataset=${encodeURIComponent(dataset)}`
  const response = await fetch(url)
  if (!response.ok) return 0
  const data = await response.json()
  const splitInfo = data.size?.splits?.find((s: any) => s.split === split)
  return splitInfo?.num_rows || 0
}

// ── Embedding ──────────────────────────────────────────────

async function generateEmbeddings(texts: string[], openai: OpenAI): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  })
  return response.data.map(d => d.embedding)
}

// ── AQUA_RAT ingestion ─────────────────────────────────────

async function ingestAquaRat(
  pinecone: Pinecone,
  openai: OpenAI,
  maxRows: number = 5000 // Limit for MVP — full dataset is 97k
) {
  console.log('\n📊 Ingesting deepmind/aqua_rat')
  console.log(`   License: Apache 2.0 (commercial use allowed)`)

  const totalSize = await getDatasetSize('deepmind/aqua_rat')
  const rowsToFetch = Math.min(maxRows, totalSize || maxRows)
  console.log(`   Total dataset size: ${totalSize}`)
  console.log(`   Fetching: ${rowsToFetch} rows`)

  const index = pinecone.index(INDEX_NAME)
  let totalVectors = 0
  const PAGE_SIZE = 100

  for (let offset = 0; offset < rowsToFetch; offset += PAGE_SIZE) {
    const length = Math.min(PAGE_SIZE, rowsToFetch - offset)

    try {
      const rows: AquaRatRow[] = await fetchHfDataset('deepmind/aqua_rat', 'train', offset, length)

      if (rows.length === 0) break

      // Build chunks: question + options + rationale
      const chunks: { text: string; id: string }[] = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const options = Array.isArray(row.options)
          ? row.options.join('\n')
          : (row.options || '')

        const text = [
          `Problem: ${row.question}`,
          `Options:\n${options}`,
          `Correct Answer: ${row.correct}`,
          `Rationale: ${row.rationale}`,
        ].join('\n\n')

        if (text.length < 50) continue

        chunks.push({
          text: text.slice(0, 2000), // Cap at 2000 chars
          id: `aqua-rat-${offset + i}`,
        })
      }

      if (chunks.length === 0) continue

      // Embed and upsert
      const embeddings = await generateEmbeddings(
        chunks.map(c => c.text),
        openai
      )

      const vectors = chunks.map((chunk, j) => ({
        id: chunk.id,
        values: embeddings[j],
        metadata: {
          text: chunk.text,
          source: 'aqua_rat',
          type: 'problem',
          section: 'quant',
          has_rationale: true,
          namespace: 'gmat-quant',
        },
      }))

      await index.namespace('gmat-quant').upsert(vectors)
      totalVectors += vectors.length

      process.stdout.write(`\r   Indexed: ${totalVectors} vectors (${offset + length}/${rowsToFetch} rows)`)

      // Rate limit: small delay between batches
      await new Promise(r => setTimeout(r, 200))
    } catch (error: any) {
      console.error(`\n   Error at offset ${offset}: ${error.message}`)
      if (error.message.includes('429')) {
        console.log('   Rate limited — waiting 30s...')
        await new Promise(r => setTimeout(r, 30000))
      }
    }
  }

  console.log(`\n   ✅ aqua_rat: ${totalVectors} vectors indexed to gmat-quant`)
  return totalVectors
}

// ── MATH_QA ingestion ──────────────────────────────────────

async function ingestMathQa(
  pinecone: Pinecone,
  openai: OpenAI,
  maxRows: number = 5000
) {
  console.log('\n📊 Ingesting allenai/math_qa')
  console.log(`   License: Apache 2.0 (commercial use allowed)`)

  const totalSize = await getDatasetSize('allenai/math_qa')
  const rowsToFetch = Math.min(maxRows, totalSize || maxRows)
  console.log(`   Total dataset size: ${totalSize}`)
  console.log(`   Fetching: ${rowsToFetch} rows`)

  const index = pinecone.index(INDEX_NAME)
  let totalVectors = 0
  const PAGE_SIZE = 100

  for (let offset = 0; offset < rowsToFetch; offset += PAGE_SIZE) {
    const length = Math.min(PAGE_SIZE, rowsToFetch - offset)

    try {
      const rows: MathQaRow[] = await fetchHfDataset('allenai/math_qa', 'train', offset, length)

      if (rows.length === 0) break

      const chunks: { text: string; id: string; category: string }[] = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]

        const text = [
          `Problem: ${row.Problem}`,
          `Options: ${row.options}`,
          `Correct: ${row.correct}`,
          `Rationale: ${row.Rationale}`,
        ].join('\n\n')

        if (text.length < 50) continue

        chunks.push({
          text: text.slice(0, 2000),
          id: `math-qa-${offset + i}`,
          category: row.category || 'general',
        })
      }

      if (chunks.length === 0) continue

      const embeddings = await generateEmbeddings(
        chunks.map(c => c.text),
        openai
      )

      const vectors = chunks.map((chunk, j) => ({
        id: chunk.id,
        values: embeddings[j],
        metadata: {
          text: chunk.text,
          source: 'math_qa',
          type: 'problem',
          section: 'quant',
          category: chunk.category,
          namespace: 'gmat-quant',
        },
      }))

      await index.namespace('gmat-quant').upsert(vectors)
      totalVectors += vectors.length

      process.stdout.write(`\r   Indexed: ${totalVectors} vectors (${offset + length}/${rowsToFetch} rows)`)

      await new Promise(r => setTimeout(r, 200))
    } catch (error: any) {
      console.error(`\n   Error at offset ${offset}: ${error.message}`)
      if (error.message.includes('429')) {
        console.log('   Rate limited — waiting 30s...')
        await new Promise(r => setTimeout(r, 30000))
      }
    }
  }

  console.log(`\n   ✅ math_qa: ${totalVectors} vectors indexed to gmat-quant`)
  return totalVectors
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  console.log('🚀 Prepwise — HuggingFace Dataset Ingestion')
  console.log('============================================')

  if (!process.env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY not set')
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Parse CLI args
  const datasetArg = process.argv.find(a => a.startsWith('--dataset='))?.split('=')[1]
  const maxRows = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] || '5000', 10)

  let totalAqua = 0
  let totalMath = 0

  if (!datasetArg || datasetArg === 'aqua_rat') {
    totalAqua = await ingestAquaRat(pinecone, openai, maxRows)
  }

  if (!datasetArg || datasetArg === 'math_qa') {
    totalMath = await ingestMathQa(pinecone, openai, maxRows)
  }

  console.log('\n============================================')
  console.log('✅ Ingestion complete!')
  console.log(`   aqua_rat: ${totalAqua} vectors`)
  console.log(`   math_qa:  ${totalMath} vectors`)
  console.log(`   Total:    ${totalAqua + totalMath} vectors in gmat-quant`)
}

main().catch(console.error)

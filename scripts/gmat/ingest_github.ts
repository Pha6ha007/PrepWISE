#!/usr/bin/env node
// scripts/gmat/ingest_github.ts
// SamiWISE — Index GMAT question data from GitHub repositories
//
// Sources:
//   1. mister-teddy/gmat-database (MIT license) — GMAT questions in JSON
//   2. danyuchn/GMAT-score-report-analysis — topic taxonomy + IRT data
//
// Usage:
//   npx ts-node scripts/gmat/ingest_github.ts
//   npx ts-node scripts/gmat/ingest_github.ts --source gmat_database
//   npx ts-node scripts/gmat/ingest_github.ts --source score_analysis

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const BATCH_SIZE = 50
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'gmat-tutor-prod'

// ── Embedding helper ───────────────────────────────────────

async function generateEmbeddings(texts: string[], openai: OpenAI): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  })
  return response.data.map(d => d.embedding)
}

// ── mister-teddy/gmat-database ─────────────────────────────

interface GmatDbQuestion {
  id?: string
  type?: string       // DS, PS, SC, CR, RC
  question?: string
  content?: string
  explanation?: string
  answer?: string
  difficulty?: string
  choices?: string[]
  options?: Record<string, string>
}

const GMAT_DB_BASE = 'https://mister-teddy.github.io/gmat-database'

// Map question type → namespace + metadata
function getNamespaceForType(type: string): { namespace: string; section: string } {
  const t = (type || '').toUpperCase()
  if (t === 'DS' || t === 'PS') return { namespace: 'gmat-quant', section: 'quant' }
  if (t === 'SC') return { namespace: 'gmat-verbal', section: 'verbal' }
  if (t === 'CR') return { namespace: 'gmat-verbal', section: 'verbal' }
  if (t === 'RC') return { namespace: 'gmat-verbal', section: 'verbal' }
  return { namespace: 'gmat-quant', section: 'quant' } // default
}

async function ingestGmatDatabase(pinecone: Pinecone, openai: OpenAI): Promise<number> {
  console.log('\n📚 Ingesting mister-teddy/gmat-database')
  console.log(`   License: MIT (commercial use allowed)`)
  console.log(`   Source: ${GMAT_DB_BASE}/index.json`)

  // Fetch index
  let indexData: any
  try {
    const res = await fetch(`${GMAT_DB_BASE}/index.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    indexData = await res.json()
  } catch (error: any) {
    console.error(`   ❌ Failed to fetch index: ${error.message}`)

    // Fallback: try known question type paths
    console.log('   Trying fallback paths...')
    indexData = null
  }

  const index = pinecone.index(INDEX_NAME)
  let totalVectors = 0

  // If we got an index, iterate over it
  if (indexData) {
    // The index could be an array of question IDs or an object with categories
    const questions: GmatDbQuestion[] = Array.isArray(indexData) ? indexData : []

    // If indexData is an object with type keys
    if (!Array.isArray(indexData) && typeof indexData === 'object') {
      for (const [key, value] of Object.entries(indexData)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'object') {
              questions.push({ ...item, type: item.type || key })
            } else if (typeof item === 'string') {
              // It's a question ID — try to fetch the full question
              try {
                const qRes = await fetch(`${GMAT_DB_BASE}/${key}/${item}.json`)
                if (qRes.ok) {
                  const qData = await qRes.json()
                  questions.push({ ...qData, type: key, id: item })
                }
              } catch {
                // Skip individual fetch errors
              }
            }
          }
        }
      }
    }

    console.log(`   Found ${questions.length} questions in index`)

    // Process in batches
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE)
      const chunks: { text: string; id: string; type: string; namespace: string; section: string }[] = []

      for (const q of batch) {
        const questionText = q.question || q.content || ''
        if (!questionText || questionText.length < 20) continue

        const optionsText = q.choices
          ? q.choices.map((c, idx) => `${String.fromCharCode(65 + idx)}) ${c}`).join('\n')
          : q.options
            ? Object.entries(q.options).map(([k, v]) => `${k}) ${v}`).join('\n')
            : ''

        const text = [
          `Question: ${questionText}`,
          optionsText ? `Options:\n${optionsText}` : '',
          q.answer ? `Answer: ${q.answer}` : '',
          q.explanation ? `Explanation: ${q.explanation}` : '',
        ].filter(Boolean).join('\n\n')

        const { namespace, section } = getNamespaceForType(q.type || '')

        chunks.push({
          text: text.slice(0, 2000),
          id: `gmatdb-${q.id || `${q.type}-${i}`}`,
          type: (q.type || 'unknown').toUpperCase(),
          namespace,
          section,
        })
      }

      if (chunks.length === 0) continue

      // Group by namespace
      const byNamespace: Record<string, typeof chunks> = {}
      for (const c of chunks) {
        if (!byNamespace[c.namespace]) byNamespace[c.namespace] = []
        byNamespace[c.namespace].push(c)
      }

      for (const [ns, nsChunks] of Object.entries(byNamespace)) {
        const embeddings = await generateEmbeddings(
          nsChunks.map(c => c.text),
          openai
        )

        const vectors = nsChunks.map((chunk, j) => ({
          id: chunk.id,
          values: embeddings[j],
          metadata: {
            text: chunk.text,
            source: 'gmat_database',
            type: chunk.type,
            section: chunk.section,
            namespace: ns,
          },
        }))

        await index.namespace(ns).upsert(vectors)
        totalVectors += vectors.length
      }

      process.stdout.write(`\r   Indexed: ${totalVectors} vectors (${Math.min(i + BATCH_SIZE, questions.length)}/${questions.length})`)
      await new Promise(r => setTimeout(r, 200))
    }
  }

  console.log(`\n   ✅ gmat-database: ${totalVectors} vectors indexed`)
  return totalVectors
}

// ── danyuchn/GMAT-score-report-analysis ────────────────────

async function ingestScoreAnalysis(pinecone: Pinecone, openai: OpenAI): Promise<number> {
  console.log('\n📊 Ingesting danyuchn/GMAT-score-report-analysis')

  const REPO_API = 'https://api.github.com/repos/danyuchn/GMAT-score-report-analysis'

  let totalVectors = 0

  try {
    // Fetch repo contents
    const res = await fetch(`${REPO_API}/contents`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!res.ok) {
      console.error(`   ❌ GitHub API error: ${res.status}`)
      return 0
    }

    const contents = await res.json()
    const dataFiles = contents.filter((f: any) =>
      f.name.endsWith('.json') || f.name.endsWith('.csv') || f.name.endsWith('.md')
    )

    console.log(`   Found ${dataFiles.length} data files`)

    const index = pinecone.index(INDEX_NAME)

    for (const file of dataFiles) {
      try {
        const fileRes = await fetch(file.download_url)
        if (!fileRes.ok) continue

        const content = await fileRes.text()

        // Try JSON parse
        if (file.name.endsWith('.json')) {
          try {
            const data = JSON.parse(content)

            // Extract any Q&A or taxonomy data
            const chunks: string[] = []

            if (Array.isArray(data)) {
              for (const item of data.slice(0, 200)) {
                const text = typeof item === 'string' ? item
                  : item.question ? `${item.question}\n${item.answer || ''}\n${item.explanation || ''}`
                  : JSON.stringify(item).slice(0, 500)

                if (text.length > 30) chunks.push(text)
              }
            } else if (typeof data === 'object') {
              // Flatten object into descriptive chunks
              for (const [key, value] of Object.entries(data)) {
                const text = `${key}: ${typeof value === 'string' ? value : JSON.stringify(value).slice(0, 500)}`
                if (text.length > 30) chunks.push(text)
              }
            }

            if (chunks.length > 0) {
              const toIndex = chunks.slice(0, 100)
              const embeddings = await generateEmbeddings(toIndex, openai)

              const vectors = toIndex.map((text, j) => ({
                id: `score-analysis-${file.name}-${j}`,
                values: embeddings[j],
                metadata: {
                  text: text.slice(0, 2000),
                  source: 'gmat_score_analysis',
                  type: 'analysis',
                  section: 'strategy',
                  namespace: 'gmat-strategy',
                },
              }))

              await index.namespace('gmat-strategy').upsert(vectors)
              totalVectors += vectors.length
              console.log(`   ${file.name}: ${vectors.length} vectors`)
            }
          } catch {
            // Not valid JSON — skip
          }
        }

        // Process markdown files — index as strategy content
        if (file.name.endsWith('.md') && content.length > 100) {
          const chunks: string[] = []

          // Split by headers
          const sections = content.split(/^#{1,3}\s/m).filter(s => s.trim().length > 50)
          for (const section of sections.slice(0, 20)) {
            chunks.push(section.trim().slice(0, 1500))
          }

          if (chunks.length > 0) {
            const embeddings = await generateEmbeddings(chunks, openai)

            const vectors = chunks.map((text, j) => ({
              id: `score-analysis-md-${file.name}-${j}`,
              values: embeddings[j],
              metadata: {
                text,
                source: 'gmat_score_analysis',
                type: 'strategy',
                section: 'strategy',
                namespace: 'gmat-strategy',
              },
            }))

            await index.namespace('gmat-strategy').upsert(vectors)
            totalVectors += vectors.length
            console.log(`   ${file.name}: ${vectors.length} vectors`)
          }
        }

        await new Promise(r => setTimeout(r, 300))
      } catch (error: any) {
        console.error(`   ⚠️  Error processing ${file.name}: ${error.message}`)
      }
    }
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`)
  }

  console.log(`   ✅ score-analysis: ${totalVectors} vectors indexed to gmat-strategy`)
  return totalVectors
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  console.log('🚀 SamiWISE — GitHub Repository Ingestion')
  console.log('==========================================')

  if (!process.env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY not set')
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const sourceArg = process.argv.find(a => a.startsWith('--source='))?.split('=')[1]

  let totalDb = 0
  let totalAnalysis = 0

  if (!sourceArg || sourceArg === 'gmat_database') {
    totalDb = await ingestGmatDatabase(pinecone, openai)
  }

  if (!sourceArg || sourceArg === 'score_analysis') {
    totalAnalysis = await ingestScoreAnalysis(pinecone, openai)
  }

  console.log('\n==========================================')
  console.log('✅ GitHub ingestion complete!')
  console.log(`   gmat-database:     ${totalDb} vectors`)
  console.log(`   score-analysis:    ${totalAnalysis} vectors`)
  console.log(`   Total:             ${totalDb + totalAnalysis} vectors`)
}

main().catch(console.error)

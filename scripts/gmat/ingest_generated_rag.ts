#!/usr/bin/env node
// scripts/gmat/ingest_generated_rag.ts
// Index AI-generated RAG content from data/rag/*.json into Pinecone
// Uses OpenRouter for embeddings (fallback from OpenAI)
//
// Usage: npx tsx scripts/gmat/ingest_generated_rag.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'confide-knowledge'
const BATCH_SIZE = 50

interface RagChunk {
  topic: string
  section: string
  namespace: string
  content: string
}

async function main() {
  console.log('🚀 Indexing generated RAG content into Pinecone\n')

  if (!process.env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY required')
  
  // Use OpenRouter if available, else OpenAI
  const useOpenRouter = !process.env.OPENAI_API_KEY || !!process.env.OPENROUTER_API_KEY
  const embeddingModel = useOpenRouter ? 'openai/text-embedding-3-small' : 'text-embedding-3-small'
  
  const client = new OpenAI(useOpenRouter ? {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: { 'HTTP-Referer': 'https://samiwise.app', 'X-Title': 'PrepWISE' },
  } : {
    apiKey: process.env.OPENAI_API_KEY,
  })

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const index = pinecone.index(INDEX_NAME)

  // Find RAG files
  const ragDir = path.join(process.cwd(), 'data/rag')
  if (!fs.existsSync(ragDir)) {
    console.log('❌ No data/rag/ directory found')
    return
  }

  const files = fs.readdirSync(ragDir).filter(f => f.endsWith('.json'))
  console.log(`📂 Found ${files.length} RAG files\n`)

  let totalIndexed = 0

  for (const file of files) {
    const filePath = path.join(ragDir, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    
    let chunks: RagChunk[]
    try {
      chunks = JSON.parse(raw)
      if (!Array.isArray(chunks) || chunks.length === 0) {
        console.log(`⏭️  ${file}: empty or not an array, skipping`)
        continue
      }
    } catch (e) {
      console.log(`❌ ${file}: invalid JSON, skipping`)
      continue
    }

    console.log(`📖 ${file}: ${chunks.length} chunks`)

    // Group by namespace
    const byNamespace: Record<string, RagChunk[]> = {}
    for (const chunk of chunks) {
      const ns = chunk.namespace || 'gmat-strategy'
      if (!byNamespace[ns]) byNamespace[ns] = []
      byNamespace[ns].push(chunk)
    }

    for (const [namespace, nsChunks] of Object.entries(byNamespace)) {
      console.log(`   → ${namespace}: ${nsChunks.length} chunks`)

      for (let i = 0; i < nsChunks.length; i += BATCH_SIZE) {
        const batch = nsChunks.slice(i, i + BATCH_SIZE)
        const texts = batch.map(c => c.content)

        try {
          // Generate embeddings
          const embResponse = await client.embeddings.create({
            model: embeddingModel,
            input: texts,
          })

          const vectors = batch.map((chunk, j) => ({
            id: `rag-${file.replace('.json', '')}-${namespace}-${i + j}`,
            values: embResponse.data[j].embedding,
            metadata: {
              text: chunk.content.slice(0, 3000), // Pinecone metadata limit
              topic: chunk.topic,
              section: chunk.section,
              namespace: namespace,
              source: 'PrepWISE AI Generated (Claude)',
              generated: new Date().toISOString(),
            },
          }))

          await index.namespace(namespace).upsert(vectors)
          totalIndexed += vectors.length
          process.stdout.write(`\r   Indexed ${Math.min(i + BATCH_SIZE, nsChunks.length)}/${nsChunks.length}`)
        } catch (error: any) {
          console.error(`\n   ⚠️ Error: ${error.message}`)
        }
      }
      console.log() // newline
    }
  }

  console.log(`\n✅ Done! ${totalIndexed} vectors indexed.`)

  // Print final stats
  const indexInfo = await pinecone.index(INDEX_NAME).describeIndexStats()
  console.log('\nGMAT namespaces:')
  Object.entries(indexInfo.namespaces || {})
    .filter(([ns]) => ns.startsWith('gmat-'))
    .sort()
    .forEach(([ns, info]) => {
      console.log(`  ✅ ${ns}: ${(info as any).vectorCount} vectors`)
    })
}

main().catch(console.error)

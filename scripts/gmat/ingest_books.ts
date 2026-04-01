// scripts/gmat/ingest_books.ts
// SamiWISE — GMAT Knowledge Base Indexing Pipeline
// Reads PDF books from scripts/gmat/data/, chunks them, embeds them,
// and upserts to Pinecone with GMAT-specific metadata.
//
// Usage:
//   npx ts-node scripts/gmat/ingest_books.ts
//
// Prerequisites:
//   1. Place GMAT PDF books in scripts/gmat/data/
//   2. Set PINECONE_API_KEY and OPENAI_API_KEY in .env.local
//   3. Create Pinecone index named PINECONE_INDEX_NAME

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Configuration ──────────────────────────────────────────────

const CHUNK_SIZE = 512        // characters per chunk
const CHUNK_OVERLAP = 64      // overlap between chunks
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536
const BATCH_SIZE = 100        // vectors per upsert batch

const DATA_DIR = path.join(__dirname, 'data')

// ── Pinecone Namespace Mapping ─────────────────────────────────

/**
 * Map filename patterns to Pinecone namespaces.
 * Files in scripts/gmat/data/ should be named descriptively.
 */
// NOTE: AWA removed from GMAT Focus Edition — no gmat-awa namespace
const NAMESPACE_PATTERNS: Record<string, RegExp[]> = {
  'gmat-quant': [
    /quantitative/i,
    /quant/i,
    /math/i,
    /official.*guide/i,
  ],
  'gmat-verbal': [
    /verbal/i,
    /reading/i,
    /critical.*reasoning/i,
    /vocabulary/i,
    /reclor/i,
  ],
  'gmat-di': [
    /data.*insight/i,
    /data.*sufficiency/i,
    /table.*analysis/i,
    /graphics/i,
    /multi.*source/i,
  ],
  'gmat-strategy': [
    /strategy/i,
    /kaplan/i,
    /manhattan/i,
    /prep/i,
    /nutshell/i,
    /turbocharge/i,
    /sentence.*correction/i,
  ],
  'gmat-focus': [
    /focus.*edition/i,
    /gmat.*focus/i,
  ],
  'gmat-errors': [
    /error/i,
    /mistake/i,
    /common.*trap/i,
  ],
}

function detectNamespace(filename: string): string {
  for (const [namespace, patterns] of Object.entries(NAMESPACE_PATTERNS)) {
    if (patterns.some(p => p.test(filename))) {
      return namespace
    }
  }
  // Default: check if filename has section hints
  if (/quant/i.test(filename)) return 'gmat-quant'
  if (/verbal/i.test(filename)) return 'gmat-verbal'
  return 'gmat-quant' // Safe default — most GMAT content is quant
}

// ── PDF Text Extraction ────────────────────────────────────────

async function extractPdfText(filePath: string): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const buffer = fs.readFileSync(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

// ── Text Chunking ──────────────────────────────────────────────

interface TextChunk {
  text: string
  index: number
  metadata: {
    source: string
    chapter: string
    section: string
    namespace: string
  }
}

function chunkText(
  text: string,
  source: string,
  namespace: string
): TextChunk[] {
  const chunks: TextChunk[] = []
  let currentChapter = 'Introduction'
  let index = 0

  // Simple chapter detection
  const lines = text.split('\n')
  let buffer = ''

  for (const line of lines) {
    // Detect chapter/section headers
    const chapterMatch = line.match(/^(?:chapter|section|part)\s+(\d+|[ivxlc]+)/i)
    if (chapterMatch) {
      currentChapter = line.trim().slice(0, 100)
    }

    buffer += line + '\n'

    // When buffer exceeds chunk size, create a chunk
    if (buffer.length >= CHUNK_SIZE) {
      const chunkText = buffer.trim()
      if (chunkText.length > 50) { // Skip very short chunks
        chunks.push({
          text: chunkText,
          index,
          metadata: {
            source,
            chapter: currentChapter,
            section: detectSection(chunkText, namespace),
            namespace,
          },
        })
        index++
      }

      // Keep overlap
      const overlapStart = Math.max(0, buffer.length - CHUNK_OVERLAP)
      buffer = buffer.slice(overlapStart)
    }
  }

  // Don't forget the last chunk
  if (buffer.trim().length > 50) {
    chunks.push({
      text: buffer.trim(),
      index,
      metadata: {
        source,
        chapter: currentChapter,
        section: detectSection(buffer, namespace),
        namespace,
      },
    })
  }

  return chunks
}

function detectSection(text: string, namespace: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('data sufficiency') || lower.includes('problem solving') ||
      lower.includes('algebra') || lower.includes('arithmetic')) {
    return 'quant'
  }
  if (lower.includes('critical reasoning') || lower.includes('reading comprehension')) {
    return 'verbal'
  }
  if (lower.includes('data insights') || lower.includes('table analysis') ||
      lower.includes('graphics interpretation')) {
    return 'data-insights'
  }

  // Fallback to namespace hint
  if (namespace.includes('quant')) return 'quant'
  if (namespace.includes('verbal')) return 'verbal'
  if (namespace.includes('di')) return 'data-insights'
  return 'quant'
}

// ── Embedding Generation ───────────────────────────────────────

async function generateEmbeddings(
  texts: string[],
  openai: OpenAI,
  model: string = EMBEDDING_MODEL
): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model,
    input: texts,
  })
  return response.data.map(d => d.embedding)
}

// ── Main Ingestion Pipeline ────────────────────────────────────

async function ingestGmatBooks() {
  console.log('🚀 SamiWISE GMAT Knowledge Base Ingestion')
  console.log('=========================================\n')

  // Validate environment
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not set. Add it to .env.local')
  }
  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENAI_API_KEY or OPENROUTER_API_KEY is required for embeddings. Add to .env.local')
  }

  const indexName = process.env.PINECONE_INDEX_NAME || 'gmat-tutor-prod'

  // Initialize clients
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  
  // Embedding client: OpenAI direct or via OpenRouter
  let openai: OpenAI
  let embeddingModel = EMBEDDING_MODEL
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  } else if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://samiwise.app',
        'X-Title': 'PrepWISE',
      },
    })
    embeddingModel = 'openai/' + EMBEDDING_MODEL
    console.log('📡 Using OpenRouter for embeddings')
  } else {
    throw new Error('OPENAI_API_KEY or OPENROUTER_API_KEY is required for embeddings')
  }
  const index = pinecone.index(indexName)

  // Find PDF files
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Data directory not found: ${DATA_DIR}`)
    console.error('   Create it and place GMAT PDF books inside.')
    process.exit(1)
  }

  const pdfFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.pdf'))

  if (pdfFiles.length === 0) {
    console.error('❌ No PDF files found in scripts/gmat/data/')
    console.error('   Place GMAT PDF books in that directory.')
    process.exit(1)
  }

  console.log(`📚 Found ${pdfFiles.length} PDF files:\n`)

  let totalChunks = 0
  let totalVectors = 0

  for (const file of pdfFiles) {
    const filePath = path.join(DATA_DIR, file)
    const namespace = detectNamespace(file)
    console.log(`\n📖 Processing: ${file}`)
    console.log(`   Namespace: ${namespace}`)

    try {
      // 1. Extract text from PDF
      console.log('   Extracting text...')
      const text = await extractPdfText(filePath)
      console.log(`   Extracted ${text.length} characters`)

      // 2. Chunk the text
      console.log('   Chunking...')
      const chunks = chunkText(text, file, namespace)
      console.log(`   Created ${chunks.length} chunks`)
      totalChunks += chunks.length

      // 3. Generate embeddings and upsert in batches
      console.log('   Embedding and upserting...')
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE)
        const texts = batch.map(c => c.text)

        // Generate embeddings
        const embeddings = await generateEmbeddings(texts, openai, embeddingModel)

        // Prepare vectors
        const vectors = batch.map((chunk, j) => ({
          id: `${file.replace('.pdf', '')}-chunk-${chunk.index}`,
          values: embeddings[j],
          metadata: {
            text: chunk.text,
            source: chunk.metadata.source,
            chapter: chunk.metadata.chapter,
            section: chunk.metadata.section,
            namespace: chunk.metadata.namespace,
          },
        }))

        // Upsert to Pinecone
        await index.namespace(namespace).upsert(vectors)
        totalVectors += vectors.length

        const progress = Math.min(i + BATCH_SIZE, chunks.length)
        process.stdout.write(`\r   Upserted ${progress}/${chunks.length} vectors`)
      }
      console.log() // newline after progress

      console.log(`   ✅ Done: ${chunks.length} vectors in namespace "${namespace}"`)
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error)
    }
  }

  console.log('\n=========================================')
  console.log(`✅ Ingestion complete!`)
  console.log(`   Total files: ${pdfFiles.length}`)
  console.log(`   Total chunks: ${totalChunks}`)
  console.log(`   Total vectors: ${totalVectors}`)
  console.log('\nNext step: Run test_retrieval.ts to validate quality')
}

// Run
ingestGmatBooks().catch(console.error)

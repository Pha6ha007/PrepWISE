#!/usr/bin/env node
/**
 * Confide — List all books in RAG system
 * Checks both PostgreSQL (knowledge_base table) and Pinecone
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { getPineconeIndex, NAMESPACES } from '../lib/pinecone/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface BookStats {
  sourceTitle: string
  author: string
  namespace: string
  chunks: number
}

/**
 * Get books from PostgreSQL
 */
async function getBooksFromDB(): Promise<BookStats[]> {
  const books = await prisma.knowledgeBase.groupBy({
    by: ['sourceTitle', 'author', 'namespace'],
    _count: {
      id: true,
    },
    orderBy: [
      { namespace: 'asc' },
      { sourceTitle: 'asc' },
    ],
  })

  return books.map((book) => ({
    sourceTitle: book.sourceTitle,
    author: book.author,
    namespace: book.namespace,
    chunks: book._count.id,
  }))
}

/**
 * Get namespace stats from Pinecone
 */
async function getNamespaceStats(): Promise<Record<string, number>> {
  const index = getPineconeIndex()
  const stats: Record<string, number> = {}

  // Get stats for each namespace
  for (const namespace of Object.values(NAMESPACES)) {
    try {
      const namespaceStats = await index.describeIndexStats()
      const vectorCount = namespaceStats.namespaces?.[namespace]?.recordCount || 0
      stats[namespace] = vectorCount
    } catch (error) {
      console.error(`Error getting stats for namespace ${namespace}:`, error)
      stats[namespace] = 0
    }
  }

  return stats
}

/**
 * Main function
 */
async function listKnowledge() {
  console.log('📚 Confide RAG System — Full Inventory\n')
  console.log('=' .repeat(80))
  console.log()

  // 1. Get books from database
  console.log('📊 SOURCE 1: PostgreSQL knowledge_base table\n')
  const books = await getBooksFromDB()

  if (books.length === 0) {
    console.log('   ⚠️  No books found in database\n')
  } else {
    // Group by namespace
    const byNamespace: Record<string, BookStats[]> = {}
    books.forEach((book) => {
      if (!byNamespace[book.namespace]) {
        byNamespace[book.namespace] = []
      }
      byNamespace[book.namespace].push(book)
    })

    let totalChunks = 0

    // Print each namespace
    Object.entries(byNamespace).forEach(([namespace, namespaceBooks]) => {
      const namespaceTotal = namespaceBooks.reduce((sum, b) => sum + b.chunks, 0)
      totalChunks += namespaceTotal

      console.log(`📁 Namespace: ${namespace.toUpperCase()} (${namespaceTotal} chunks)`)
      console.log('─'.repeat(80))

      namespaceBooks.forEach((book, i) => {
        console.log(`${i + 1}. "${book.sourceTitle}"`)
        console.log(`   Author: ${book.author}`)
        console.log(`   Chunks: ${book.chunks}`)
        console.log()
      })
    })

    console.log('=' .repeat(80))
    console.log(`📊 Database Total: ${books.length} books, ${totalChunks} chunks`)
    console.log('=' .repeat(80))
    console.log()
  }

  // 2. Get Pinecone stats
  console.log('☁️  SOURCE 2: Pinecone Vector Database\n')
  console.log('Fetching namespace statistics...\n')

  const namespaceStats = await getNamespaceStats()

  let pineconeTotal = 0
  const namespaceEntries = Object.entries(namespaceStats).filter(([_, count]) => count > 0)

  if (namespaceEntries.length === 0) {
    console.log('   ⚠️  No vectors found in Pinecone\n')
  } else {
    namespaceEntries.forEach(([namespace, count]) => {
      console.log(`📁 ${namespace.toUpperCase().padEnd(15)} → ${count.toLocaleString()} vectors`)
      pineconeTotal += count
    })

    console.log()
    console.log('=' .repeat(80))
    console.log(`☁️  Pinecone Total: ${pineconeTotal.toLocaleString()} vectors`)
    console.log('=' .repeat(80))
    console.log()
  }

  // 3. Compare sources
  console.log('🔍 COMPARISON\n')

  const dbTotal = books.reduce((sum, b) => sum + b.chunks, 0)

  if (dbTotal === pineconeTotal) {
    console.log(`✅ Databases are in sync!`)
    console.log(`   PostgreSQL: ${dbTotal.toLocaleString()} chunks`)
    console.log(`   Pinecone:   ${pineconeTotal.toLocaleString()} vectors`)
  } else {
    console.log(`⚠️  Databases are OUT OF SYNC!`)
    console.log(`   PostgreSQL: ${dbTotal.toLocaleString()} chunks`)
    console.log(`   Pinecone:   ${pineconeTotal.toLocaleString()} vectors`)
    console.log(`   Difference: ${Math.abs(dbTotal - pineconeTotal).toLocaleString()} ${dbTotal > pineconeTotal ? '(DB has more)' : '(Pinecone has more)'}`)
  }

  console.log()

  await prisma.$disconnect()
}

// Run
listKnowledge().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

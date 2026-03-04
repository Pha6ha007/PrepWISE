#!/usr/bin/env node
/**
 * Confide — Analyze duplicate books in RAG system
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface BookInfo {
  sourceTitle: string
  author: string
  namespace: string
  chunks: number
  pineconeIds: string[]
}

async function analyzeDuplicates() {
  console.log('🔍 Analyzing Duplicates in RAG System\n')
  console.log('=' .repeat(80))
  console.log()

  // Books to analyze
  const booksToCheck = [
    { search: 'Attached', namespace: 'family' },
    { search: 'Hold Me Tight', namespace: 'family' },
    { search: 'Feeling Good', namespace: 'anxiety_cbt' },
    { search: 'Self-Compassion', namespace: 'general' },
    { search: 'On Becoming a Person', namespace: 'general' },
    { search: "Man's Search for Meaning", namespace: 'general' },
    { search: 'The Gift of Therapy', namespace: 'general' },
    { search: 'DSM-5', namespace: 'general' },
  ]

  for (const book of booksToCheck) {
    console.log(`📚 Searching: ${book.search} (${book.namespace})`)
    console.log('─'.repeat(80))

    const books = await prisma.knowledgeBase.findMany({
      where: {
        sourceTitle: {
          contains: book.search,
        },
        namespace: book.namespace,
      },
      select: {
        sourceTitle: true,
        author: true,
        namespace: true,
        pineconeId: true,
      },
    })

    if (books.length === 0) {
      console.log('   ⚠️  No books found\n')
      continue
    }

    // Group by title and author
    const grouped: Record<string, BookInfo> = {}

    books.forEach((b) => {
      const key = `${b.sourceTitle}|||${b.author}`
      if (!grouped[key]) {
        grouped[key] = {
          sourceTitle: b.sourceTitle,
          author: b.author,
          namespace: b.namespace,
          chunks: 0,
          pineconeIds: [],
        }
      }
      grouped[key].chunks++
      grouped[key].pineconeIds.push(b.pineconeId)
    })

    const variants = Object.values(grouped)

    if (variants.length === 1) {
      console.log(`   ✅ No duplicates found`)
      console.log(`   "${variants[0].sourceTitle}" by ${variants[0].author}`)
      console.log(`   Chunks: ${variants[0].chunks}`)
      console.log()
    } else {
      console.log(`   ⚠️  Found ${variants.length} variants:\n`)
      variants.forEach((v, i) => {
        console.log(`   ${i + 1}. "${v.sourceTitle}"`)
        console.log(`      Author: ${v.author}`)
        console.log(`      Chunks: ${v.chunks}`)
        console.log(`      Sample ID: ${v.pineconeIds[0]}`)
        console.log()
      })
    }
  }

  await prisma.$disconnect()
}

analyzeDuplicates().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

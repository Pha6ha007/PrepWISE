#!/usr/bin/env node
/**
 * Check chunk quality from database
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { getPineconeIndex } from '../lib/pinecone/client'

const prisma = new PrismaClient()

async function checkChunks() {
  console.log('🔍 Checking chunk quality for "I Don\'t Want to Talk About It"\n')

  // Get first 3 chunks from DB
  const dbChunks = await prisma.knowledgeBase.findMany({
    where: {
      sourceTitle: "I Don't Want to Talk About It",
      author: "Terrence Real",
    },
    take: 3,
    orderBy: {
      chunkIndex: 'asc',
    },
  })

  console.log(`Found ${dbChunks.length} chunks in database\n`)

  // Get actual text from Pinecone
  const index = getPineconeIndex()

  for (const chunk of dbChunks) {
    console.log(`\n━━━ CHUNK ${chunk.chunkIndex} ━━━`)
    console.log(`Pinecone ID: ${chunk.pineconeId}`)

    // Fetch from Pinecone
    const result = await index.namespace('mens').fetch([chunk.pineconeId])
    const vector = result.records[chunk.pineconeId]

    if (vector && vector.metadata) {
      const text = vector.metadata.text as string
      console.log(`\nText (${text.length} characters):`)
      console.log('─'.repeat(80))
      console.log(text.substring(0, 500))
      if (text.length > 500) {
        console.log(`\n... [+${text.length - 500} more characters]`)
      }
    } else {
      console.log('⚠️  Vector not found in Pinecone')
    }
  }

  await prisma.$disconnect()
}

checkChunks().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

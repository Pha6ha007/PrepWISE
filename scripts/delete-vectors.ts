#!/usr/bin/env node
/**
 * Confide — Delete vectors from Pinecone
 *
 * Usage:
 *   npx tsx scripts/delete-vectors.ts \
 *     --namespace="family" \
 *     --title="The Seven Principles for Making Marriage Work" \
 *     --author="John Gottman"
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { getPineconeIndex, type Namespace, NAMESPACES } from '../lib/pinecone/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Args {
  namespace: Namespace
  title: string
  author: string
}

/**
 * Parse command line arguments
 */
function parseArgs(): Args {
  const args = process.argv.slice(2)
  const parsed: any = {}

  args.forEach((arg) => {
    const equalIndex = arg.indexOf('=')
    if (equalIndex === -1) return

    const key = arg.substring(0, equalIndex)
    const value = arg.substring(equalIndex + 1)

    const cleanKey = key.replace(/^-+/, '')

    let cleanValue = value
    if (
      (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
      (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
    ) {
      cleanValue = cleanValue.slice(1, -1)
    }

    parsed[cleanKey] = cleanValue
  })

  if (!parsed.namespace || !parsed.title || !parsed.author) {
    console.error('❌ Missing required arguments')
    console.log('Usage:')
    console.log('  npx tsx scripts/delete-vectors.ts \\')
    console.log('    --namespace="family" \\')
    console.log('    --title="Book Title" \\')
    console.log('    --author="Author Name"')
    console.log('\nAvailable namespaces:', Object.values(NAMESPACES).join(', '))
    process.exit(1)
  }

  if (!Object.values(NAMESPACES).includes(parsed.namespace)) {
    console.error(`❌ Invalid namespace: ${parsed.namespace}`)
    console.log('Available namespaces:', Object.values(NAMESPACES).join(', '))
    process.exit(1)
  }

  return {
    namespace: parsed.namespace,
    title: parsed.title,
    author: parsed.author,
  }
}

/**
 * Delete vectors from Pinecone and database
 */
async function deleteVectors() {
  console.log('🗑️  Confide — Delete Vectors from Pinecone\n')

  const { namespace, title, author } = parseArgs()

  console.log('📚 Title:', title)
  console.log('✍️  Author:', author)
  console.log('🏷️  Namespace:', namespace)
  console.log()

  // 1. Find all chunks in database
  console.log('🔍 Finding vectors in database...')
  const chunks = await prisma.knowledgeBase.findMany({
    where: {
      sourceTitle: title,
      author: author,
      namespace: namespace,
    },
  })

  if (chunks.length === 0) {
    console.log('   ⚠️  No vectors found in database')
    console.log('   This book may not exist or was already deleted')
    await prisma.$disconnect()
    process.exit(0)
  }

  console.log(`   Found ${chunks.length} chunks`)
  console.log()

  // 2. Delete from Pinecone
  console.log('☁️  Deleting from Pinecone...')
  const index = getPineconeIndex()
  const vectorIds = chunks.map((chunk) => chunk.pineconeId)

  // Delete in batches of 100
  const batchSize = 100
  for (let i = 0; i < vectorIds.length; i += batchSize) {
    const batch = vectorIds.slice(i, i + batchSize)
    await index.namespace(namespace).deleteMany(batch)
    console.log(`   Deleted ${Math.min(i + batchSize, vectorIds.length)}/${vectorIds.length} vectors`)
  }

  console.log('   ✓ Pinecone deletion complete')
  console.log()

  // 3. Delete from database
  console.log('💾 Deleting from database...')
  const deleteResult = await prisma.knowledgeBase.deleteMany({
    where: {
      sourceTitle: title,
      author: author,
      namespace: namespace,
    },
  })

  console.log(`   ✓ Deleted ${deleteResult.count} entries`)
  console.log()

  console.log('✅ Deletion complete!')
  console.log(`📊 Summary:`)
  console.log(`   Book: ${title} by ${author}`)
  console.log(`   Namespace: ${namespace}`)
  console.log(`   Vectors deleted: ${chunks.length}`)

  await prisma.$disconnect()
}

// Run
deleteVectors().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Check Pinecone index configuration
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { getPineconeIndex } from '../lib/pinecone/client'
import { Pinecone } from '@pinecone-database/pinecone'

async function checkConfig() {
  console.log('🔍 Checking Pinecone RAG Configuration\n')

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  })

  const indexName = process.env.PINECONE_INDEX_NAME || 'confide-knowledge'

  // Get index description
  const indexDescription = await pinecone.describeIndex(indexName)

  console.log('=' .repeat(80))
  console.log('📊 PINECONE INDEX CONFIGURATION')
  console.log('=' .repeat(80))
  console.log()
  console.log(`Index Name:        ${indexName}`)
  console.log(`Dimension:         ${indexDescription.dimension}`)
  console.log(`Metric:            ${indexDescription.metric}`)
  console.log(`Cloud:             ${indexDescription.cloud}`)
  console.log(`Region:            ${indexDescription.region}`)
  console.log()

  // Get index stats
  const index = getPineconeIndex()
  const stats = await index.describeIndexStats()

  console.log('=' .repeat(80))
  console.log('📈 INDEX STATISTICS')
  console.log('=' .repeat(80))
  console.log()
  console.log(`Total Vectors:     ${stats.totalRecordCount?.toLocaleString() || 'N/A'}`)
  console.log()
  console.log('Vectors by Namespace:')

  if (stats.namespaces) {
    Object.entries(stats.namespaces).forEach(([ns, data]) => {
      console.log(`  ${ns.padEnd(15)} → ${data.recordCount?.toLocaleString() || 0} vectors`)
    })
  }

  console.log()

  // Get sample chunk from "The Body Keeps the Score"
  console.log('=' .repeat(80))
  console.log('📝 SAMPLE CHUNK: The Body Keeps the Score (trauma namespace, chunk #5)')
  console.log('=' .repeat(80))
  console.log()

  const sampleChunkId = 'trauma_The_Body_Keeps_the_Score_chunk_5'

  try {
    const result = await index.namespace('trauma').fetch([sampleChunkId])
    const vector = result.records[sampleChunkId]

    if (vector && vector.metadata) {
      const text = vector.metadata.text as string
      console.log(`Full text length: ${text.length} characters`)
      console.log()
      console.log('First 500 characters:')
      console.log('─'.repeat(80))
      console.log(text.substring(0, 500))
      console.log('─'.repeat(80))
      console.log()
      console.log(`Vector ID:         ${sampleChunkId}`)
      console.log(`Book Title:        ${vector.metadata.book_title}`)
      console.log(`Author:            ${vector.metadata.author}`)
      console.log(`Namespace:         ${vector.metadata.namespace}`)
      console.log(`Chunk Index:       ${vector.metadata.chunk_index}`)
      console.log(`Vector Dimension:  ${vector.values.length}`)
    } else {
      console.log('⚠️  Sample chunk not found')
    }
  } catch (error) {
    console.log('⚠️  Error fetching sample chunk:', error)
  }

  console.log()
}

checkConfig().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

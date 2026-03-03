#!/usr/bin/env node
/**
 * Test single RAG query to debug
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { retrieveContext } from '../lib/pinecone/retrieval'
import { NAMESPACES } from '../lib/pinecone/client'

async function testQuery() {
  const queries = [
    { q: "I have OCD intrusive thoughts", ns: NAMESPACES.ANXIETY_CBT },
    { q: "I struggle with alcohol addiction", ns: NAMESPACES.GENERAL },
    { q: "I have an eating disorder and binge eat", ns: NAMESPACES.GENERAL },
    { q: "I am struggling with grief after losing someone", ns: NAMESPACES.GENERAL },
  ]

  for (const { q, ns } of queries) {
    console.log(`\n🔍 Query: "${q}"`)
    console.log(`📂 Namespace: ${ns}`)
    console.log('─'.repeat(80))

    const chunks = await retrieveContext(q, ns, 3)

    chunks.forEach((chunk, i) => {
      console.log(`\n${i + 1}. Score: ${chunk.score.toFixed(3)}`)
      console.log(`   Book: ${chunk.metadata.book_title}`)
      console.log(`   Author: ${chunk.metadata.author}`)
      console.log(`   Text: ${chunk.text.substring(0, 150)}...`)
    })

    console.log('\n' + '━'.repeat(80))
  }
}

testQuery().catch(console.error)

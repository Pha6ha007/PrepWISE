import OpenAI from 'openai'
import { getPineconeIndex, type Namespace } from './client'
import { NAMESPACES } from './constants'
import { rerankChunks, type RetrievedChunk, type RerankedChunk } from './reranker'

let _openai: OpenAI | null = null

function getOpenAIClient() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  }
  return _openai
}

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EXPANSION_MODEL = 'gpt-4o-mini'

export type { RetrievedChunk, RerankedChunk }

/**
 * Expand a user query into richer search terms for better semantic search.
 */
async function expandQuery(userQuery: string, namespace: Namespace): Promise<string> {
  const openai = getOpenAIClient()

  const namespaceContext: Record<string, string> = {
    'gmat-quant': 'GMAT quantitative: arithmetic, algebra, problem solving, number properties, statistics, probability, word problems',
    'gmat-verbal': 'GMAT verbal: critical reasoning, reading comprehension, argument analysis, logical fallacies',
    'gmat-di': 'GMAT data insights: table analysis, graphics interpretation, multi-source reasoning, two-part analysis, data sufficiency',
    'gmat-strategy': 'GMAT strategy: time management, study planning, test-day preparation, guessing strategy, adaptive scoring',
    'gmat-focus': 'GMAT Focus Edition: format changes, section structure, scoring scale',
    'gmat-errors': 'Common GMAT mistakes: error patterns, careless errors, misread questions',
  }

  const contextHint = namespaceContext[namespace] || 'GMAT test preparation'

  const systemPrompt = `You are a query expansion assistant for a GMAT tutoring RAG system.

Transform the user's query into 50-100 words of relevant GMAT keywords, concepts, and related terms for semantic search.

Focus: ${contextHint}

Rules:
- Include formal GMAT terminology AND casual student language
- Include synonyms and related concepts
- Output ONLY keywords and short phrases, separated by spaces
- NO sentences, NO explanations, NO formatting`

  try {
    const response = await openai.chat.completions.create({
      model: EXPANSION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const expandedQuery = response.choices[0]?.message?.content?.trim() || userQuery
    return expandedQuery.length > 0 ? expandedQuery : userQuery
  } catch (error) {
    console.error('Query expansion failed, using original query:', error)
    return userQuery
  }
}

/**
 * Retrieve relevant context from Pinecone with optional reranking.
 *
 * Flow:
 * 1. Query Expansion → richer search terms
 * 2. Pinecone Retrieval → primary + secondary namespaces in parallel
 * 3. Merge & Deduplicate
 * 4. Cross-Encoder Reranking → top-K results
 */
export async function retrieveContext(
  query: string,
  namespace: Namespace,
  topK: number = 5,
  useReranking: boolean = true,
  secondaryNamespace?: Namespace | null
): Promise<RerankedChunk[]> {
  try {
    const expandedQuery = await expandQuery(query, namespace)

    if (process.env.NODE_ENV === 'development') {
      console.log('[RAG Retrieval]')
      console.log('  Original query:', query)
      console.log('  Expanded query:', expandedQuery)
      console.log('  Primary namespace:', namespace)
      if (secondaryNamespace) console.log('  Secondary namespace:', secondaryNamespace)
    }

    // Create embedding
    const openai = getOpenAIClient()
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: expandedQuery,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Parallel Pinecone queries
    const retrievalTopK = useReranking ? Math.max(topK * 3, 15) : topK
    const index = getPineconeIndex()

    const queries: Promise<{ matches: any[]; source: 'primary' | 'secondary' }>[] = [
      index.namespace(namespace).query({
        vector: queryEmbedding,
        topK: retrievalTopK,
        includeMetadata: true,
      }).then(r => ({ matches: r.matches || [], source: 'primary' as const })),
    ]

    if (secondaryNamespace && secondaryNamespace !== namespace) {
      const secondaryTopK = Math.max(Math.floor(retrievalTopK * 0.6), 8)
      queries.push(
        index.namespace(secondaryNamespace).query({
          vector: queryEmbedding,
          topK: secondaryTopK,
          includeMetadata: true,
        }).then(r => ({ matches: r.matches || [], source: 'secondary' as const }))
      )
    }

    const results = await Promise.all(queries)

    // Merge and deduplicate
    const seenIds = new Set<string>()
    const allChunks: RetrievedChunk[] = []

    for (const { matches } of results) {
      for (const match of matches) {
        if (!match.metadata?.text || seenIds.has(match.id)) continue
        seenIds.add(match.id)

        allChunks.push({
          id: match.id,
          score: match.score || 0,
          text: match.metadata.text as string,
          metadata: {
            book_title: (match.metadata.book_title as string) || (match.metadata.source as string) || 'Unknown',
            author: (match.metadata.author as string) || 'Unknown',
            chapter: match.metadata.chapter as string | undefined,
            namespace: (match.metadata.namespace as string) || namespace,
          },
        })
      }
    }

    if (process.env.NODE_ENV === 'development' && secondaryNamespace) {
      const primaryCount = results[0].matches.length
      const secondaryCount = results[1]?.matches.length || 0
      console.log(`[RAG] Merged: ${primaryCount} primary + ${secondaryCount} secondary → ${allChunks.length} unique`)
    }

    // Rerank
    if (useReranking && allChunks.length > topK) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[RAG] Reranking ${allChunks.length} candidates → top ${topK}`)
      }
      return await rerankChunks(query, allChunks, topK)
    }

    return allChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(chunk => ({ ...chunk, rerankScore: chunk.score * 10 }))
  } catch (error) {
    console.error('Failed to retrieve context from Pinecone:', error)
    return []
  }
}

/**
 * Format retrieved chunks for the system prompt.
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return ''

  const contextParts = chunks.map((chunk, index) => {
    const ns = chunk.metadata.namespace || ''

    if (ns.startsWith('gmat-')) {
      const section = chunk.metadata.chapter || ns.replace('gmat-', '').toUpperCase()
      return `${index + 1}. [GMAT: ${section}]\n${chunk.text}`
    }

    const source = `[From "${chunk.metadata.book_title}" by ${chunk.metadata.author}]`
    return `${index + 1}. ${source}\n${chunk.text}`
  })

  return `## Relevant knowledge:\n\n${contextParts.join('\n\n')}`
}

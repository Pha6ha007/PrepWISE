import OpenAI from 'openai'
import { getPineconeIndex, type Namespace } from './client'

// Lazy initialization - создаём клиент только при первом обращении
let _openai: OpenAI | null = null

function getOpenAIClient() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  }
  return _openai
}

// Модель для embeddings
const EMBEDDING_MODEL = 'text-embedding-3-small'

// Модель для query expansion (быстрая и дешёвая)
const EXPANSION_MODEL = 'gpt-4o-mini'

export interface RetrievedChunk {
  id: string
  score: number
  text: string
  metadata: {
    book_title: string
    author: string
    chapter?: string
    namespace: string
  }
}

/**
 * Расширить запрос пользователя в набор релевантных психологических терминов
 * для улучшения semantic search в RAG базе знаний
 *
 * @param userQuery - Оригинальный запрос пользователя
 * @param namespace - Namespace для контекстно-зависимого расширения
 * @returns Расширенный запрос с ключевыми словами и концепциями
 */
async function expandQuery(userQuery: string, namespace: Namespace): Promise<string> {
  const openai = getOpenAIClient()

  // Контекстно-зависимые подсказки по namespace
  const namespaceContext: Record<Namespace, string> = {
    anxiety_cbt:
      'Focus on anxiety, panic, worry, CBT concepts, cognitive distortions, safety behaviors, exposure therapy',
    family:
      'Focus on family dynamics, attachment styles, communication patterns, boundaries, relationship conflicts',
    trauma:
      'Focus on PTSD, childhood trauma, freeze/fight/flight, body sensations, dissociation, trauma recovery',
    crisis: 'Focus on suicidal ideation, self-harm, crisis intervention, safety planning, emergency resources',
    general:
      'Focus on general mental health, self-esteem, meaning, loneliness, identity, personal growth',
    mens: 'Focus on male depression, masculinity, emotional expression, provider role, hidden suffering, male identity',
    womens:
      'Focus on female experiences, maternal identity, emotional labor, gaslighting, self-care, gender roles',
  }

  const contextHint = namespaceContext[namespace] || 'Focus on general psychological concepts'

  const systemPrompt = `You are a query expansion assistant for a psychology RAG (Retrieval-Augmented Generation) system.

Your task: Transform a user's conversational query into a rich set of psychological keywords, concepts, and related terms that will help semantic search find the most relevant content in our knowledge base.

Guidelines:
- Expand short queries into 50-100 words of relevant search terms
- Include: clinical terms, symptom descriptions, theoretical concepts, treatment approaches, related emotions
- Use both professional terminology AND everyday language
- Include synonyms and related concepts
- ${contextHint}
- Output ONLY keywords and short phrases, separated by spaces
- NO full sentences, NO explanations, NO formatting

Example:
Input: "I'm anxious all the time"
Output: chronic anxiety generalized anxiety disorder GAD persistent worry racing thoughts catastrophizing rumination physical symptoms chest tightness breathing difficulty hyperventilation panic cognitive distortions safety behaviors avoidance anxiety management techniques CBT cognitive behavioral therapy acceptance commitment therapy mindfulness grounding

Input: "My relationship is falling apart"
Output: relationship conflict marriage problems communication breakdown emotional disconnection attachment insecurity criticism contempt defensiveness stonewalling Gottman method couples therapy intimacy trust issues emotional availability vulnerability connection repair attempts love languages`

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

    // Fallback: если модель вернула пустой ответ, использовать оригинальный запрос
    return expandedQuery.length > 0 ? expandedQuery : userQuery
  } catch (error) {
    console.error('Query expansion failed, using original query:', error)
    return userQuery
  }
}

/**
 * Получить релевантный контекст из RAG базы знаний
 *
 * @param query - Запрос пользователя
 * @param namespace - Namespace для поиска (anxiety_cbt, family, trauma, etc)
 * @param topK - Сколько чанков вернуть (по умолчанию 10, увеличено с 5)
 * @returns Массив релевантных чанков с metadata
 */
export async function retrieveContext(
  query: string,
  namespace: Namespace,
  topK: number = 10
): Promise<RetrievedChunk[]> {
  try {
    // 1. Расширить запрос для улучшения semantic search
    const expandedQuery = await expandQuery(query, namespace)

    // Логирование для debugging (только в development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[RAG Retrieval]')
      console.log('  Original query:', query)
      console.log('  Expanded query:', expandedQuery)
      console.log('  Namespace:', namespace)
    }

    // 2. Создать embedding расширенного запроса через OpenAI
    const openai = getOpenAIClient()
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: expandedQuery, // ← Используем расширенный запрос вместо оригинального
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // 3. Поиск в Pinecone по namespace
    const index = getPineconeIndex()
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    })

    // 4. Преобразовать результаты
    const chunks: RetrievedChunk[] = queryResponse.matches
      .filter((match) => match.metadata && match.metadata.text)
      .map((match) => ({
        id: match.id,
        score: match.score || 0,
        text: match.metadata!.text as string,
        metadata: {
          book_title: (match.metadata!.book_title as string) || 'Unknown',
          author: (match.metadata!.author as string) || 'Unknown',
          chapter: match.metadata!.chapter as string | undefined,
          namespace: (match.metadata!.namespace as string) || namespace,
        },
      }))

    return chunks
  } catch (error) {
    console.error('Failed to retrieve context from Pinecone:', error)
    return []
  }
}

/**
 * Форматировать retrieved chunks в строку для system prompt
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return ''
  }

  const contextParts = chunks.map((chunk, index) => {
    const source = `[${chunk.metadata.book_title} by ${chunk.metadata.author}]`
    return `${index + 1}. ${source}\n${chunk.text}`
  })

  return `## Relevant knowledge:\n\n${contextParts.join('\n\n')}`
}

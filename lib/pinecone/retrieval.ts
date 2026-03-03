import OpenAI from 'openai'
import { getPineconeIndex, type Namespace } from './client'

// OpenAI клиент для embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Модель для embeddings
const EMBEDDING_MODEL = 'text-embedding-3-small'

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
 * Получить релевантный контекст из RAG базы знаний
 *
 * @param query - Запрос пользователя
 * @param namespace - Namespace для поиска (anxiety_cbt, family, trauma, etc)
 * @param topK - Сколько чанков вернуть (по умолчанию 5)
 * @returns Массив релевантных чанков с metadata
 */
export async function retrieveContext(
  query: string,
  namespace: Namespace,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  try {
    // 1. Создать embedding запроса через OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // 2. Поиск в Pinecone по namespace
    const index = getPineconeIndex()
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    })

    // 3. Преобразовать результаты
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

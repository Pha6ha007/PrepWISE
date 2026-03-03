import { Pinecone } from '@pinecone-database/pinecone'

// Инициализация Pinecone клиента
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

// Имя индекса из env
export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'confide-knowledge'

// Получить индекс
export function getPineconeIndex() {
  return pinecone.index(INDEX_NAME)
}

// Namespaces для разных типов знаний
export const NAMESPACES = {
  ANXIETY_CBT: 'anxiety_cbt',
  FAMILY: 'family',
  TRAUMA: 'trauma',
  CRISIS: 'crisis',
  GENERAL: 'general',
} as const

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES]

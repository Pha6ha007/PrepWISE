import { Pinecone } from '@pinecone-database/pinecone'

let _pinecone: Pinecone | null = null

function getPineconeClient() {
  if (!_pinecone) {
    _pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    })
  }
  return _pinecone
}

export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'gmat-tutor-prod'

export function getPineconeIndex() {
  const pinecone = getPineconeClient()
  return pinecone.index(INDEX_NAME)
}

// Re-export constants
export { NAMESPACES, type Namespace } from './constants'

// Re-export namespace utilities
export {
  GMAT_AGENT_NAMESPACE_MAP,
  GMAT_AGENT_SECONDARY_MAP,
  getNamespaceForGmatAgent,
  getGmatSecondaryNamespace,
  getAvailableNamespaces,
} from './namespace-mapping'

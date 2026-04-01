/**
 * Pinecone constants — namespaces and configuration
 * SamiWISE GMAT knowledge base namespaces.
 */

export const NAMESPACES = {
  // SamiWISE GMAT namespaces
  GMAT_QUANT: 'gmat-quant',
  GMAT_VERBAL: 'gmat-verbal',
  GMAT_DI: 'gmat-di',
  GMAT_STRATEGY: 'gmat-strategy',
  GMAT_FOCUS: 'gmat-focus',
  GMAT_ERRORS: 'gmat-errors',
} as const

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES]

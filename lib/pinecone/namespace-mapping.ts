// lib/pinecone/namespace-mapping.ts
// Mapping: GMAT AgentType → Pinecone Namespace

import { NAMESPACES, type Namespace } from './constants'
import type { GmatAgentType } from '@/agents/gmat/orchestrator'

/**
 * Maps each GMAT specialist agent to its primary Pinecone namespace.
 */
export const GMAT_AGENT_NAMESPACE_MAP: Record<GmatAgentType, Namespace> = {
  quantitative: NAMESPACES.GMAT_QUANT,
  verbal: NAMESPACES.GMAT_VERBAL,
  data_insights: NAMESPACES.GMAT_DI,
  strategy: NAMESPACES.GMAT_STRATEGY,
}

/**
 * Secondary namespaces for GMAT agents.
 * Error patterns supplement content agents. Strategy supplements writing.
 */
export const GMAT_AGENT_SECONDARY_MAP: Partial<Record<GmatAgentType, Namespace>> = {
  quantitative: NAMESPACES.GMAT_ERRORS,
  verbal: NAMESPACES.GMAT_ERRORS,
  data_insights: NAMESPACES.GMAT_ERRORS,
  strategy: NAMESPACES.GMAT_FOCUS,
}

/**
 * Get the Pinecone namespace for a given GMAT agent type
 */
export function getNamespaceForGmatAgent(agentType: GmatAgentType): Namespace {
  return GMAT_AGENT_NAMESPACE_MAP[agentType] || NAMESPACES.GMAT_QUANT
}

/**
 * Get the secondary namespace for a given GMAT agent type.
 */
export function getGmatSecondaryNamespace(agentType: GmatAgentType): Namespace | null {
  return GMAT_AGENT_SECONDARY_MAP[agentType] || null
}

/**
 * Get all available namespaces
 */
export function getAvailableNamespaces(): Namespace[] {
  return Object.values(NAMESPACES)
}

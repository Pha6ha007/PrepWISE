// lib/pinecone/namespace-mapping.ts
// Centralized mapping: AgentType → Pinecone Namespace

import { AgentType } from '@/types'
import { NAMESPACES, type Namespace } from './constants'

/**
 * Maps each specialist agent to its corresponding Pinecone namespace
 *
 * This determines which knowledge base the agent retrieves context from.
 *
 * Examples:
 * - anxiety agent → anxiety_cbt namespace (CBT/ACT/DBT books)
 * - trauma agent → trauma namespace (van der Kolk, Herman, PTSD resources)
 * - relationships agent → family namespace (Gottman, attachment theory)
 */
export const AGENT_NAMESPACE_MAP: Record<AgentType, Namespace> = {
  anxiety: NAMESPACES.ANXIETY_CBT,
  family: NAMESPACES.FAMILY,
  trauma: NAMESPACES.TRAUMA,
  relationships: NAMESPACES.FAMILY, // Uses family namespace - attachment/relationship content overlaps
  mens: NAMESPACES.MENS,
  womens: NAMESPACES.WOMENS,
  general: NAMESPACES.GENERAL,
}

/**
 * Agents that get counseling_qa as a secondary namespace.
 * Crisis is excluded — crisis protocol is hardcoded and isolated.
 */
const AGENTS_WITH_COUNSELING_QA: Set<AgentType> = new Set([
  'anxiety', 'family', 'trauma', 'relationships', 'mens', 'womens', 'general',
])

/**
 * Get the Pinecone namespace for a given agent type
 *
 * @param agentType - The specialist agent type
 * @returns The corresponding Pinecone namespace
 */
export function getNamespaceForAgent(agentType: AgentType): Namespace {
  return AGENT_NAMESPACE_MAP[agentType] || NAMESPACES.GENERAL
}

/**
 * Get the secondary namespace for a given agent type.
 * Returns counseling_qa for all specialist agents (real therapist Q&A),
 * or null for crisis (stays isolated).
 *
 * @param agentType - The specialist agent type
 * @returns counseling_qa namespace or null
 */
export function getSecondaryNamespace(agentType: AgentType): Namespace | null {
  return AGENTS_WITH_COUNSELING_QA.has(agentType) ? NAMESPACES.COUNSELING_QA : null
}

/**
 * Get all available namespaces for RAG ingestion reference
 */
export function getAvailableNamespaces(): Namespace[] {
  return Object.values(NAMESPACES)
}

/**
 * Check if a namespace has content (based on mapping)
 */
export function isNamespaceActive(namespace: Namespace): boolean {
  // All mapped namespaces are active
  return Object.values(AGENT_NAMESPACE_MAP).includes(namespace)
}

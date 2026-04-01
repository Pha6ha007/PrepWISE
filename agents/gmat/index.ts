// agents/gmat/index.ts
// SamiWISE — GMAT Agent Prompts Central Export

// Orchestrator
export { GMAT_ORCHESTRATOR_PROMPT, routeToGmatAgent } from './orchestrator'
export type { GmatAgentType, GmatRoutingDecision } from './orchestrator'

// Specialist Agent Prompts
export { QUANTITATIVE_AGENT_PROMPT, buildQuantitativePrompt } from './quantitative'
export { VERBAL_AGENT_PROMPT, buildVerbalPrompt } from './verbal'
export { DATA_INSIGHTS_AGENT_PROMPT, buildDataInsightsPrompt } from './data_insights'
export { STRATEGY_AGENT_PROMPT, buildStrategyPrompt } from './strategy'

// Memory Agent
export { buildGmatMemoryPrompt, mergeGmatProfile } from './memory'
export type {
  GmatLearnerProfile,
  GmatMemoryExtractionResult,
} from './memory'

// Shared types
export type { GmatAgentPromptParams } from './quantitative'

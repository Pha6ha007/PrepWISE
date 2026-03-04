// agents/prompts/index.ts
// Confide Platform — Agent Prompts Central Export

// Orchestrator
export { ORCHESTRATOR_PROMPT } from './orchestrator';

// Agent Prompts (raw templates)
export { ANXIETY_AGENT_PROMPT } from './anxiety';
export { FAMILY_AGENT_PROMPT } from './family';
export { TRAUMA_AGENT_PROMPT } from './trauma';
export { RELATIONSHIPS_AGENT_PROMPT } from './relationships';
export { MENS_AGENT_PROMPT } from './mens';
export { WOMENS_AGENT_PROMPT } from './womens';

// Builder Functions (with user context)
export { buildAnxietyPrompt } from './anxiety';
export { buildFamilyPrompt } from './family';
export { buildTraumaPrompt } from './trauma';
export { buildRelationshipsPrompt } from './relationships';
export { buildMensPrompt } from './mens';
export { buildWomensPrompt } from './womens';

// Types
export type { AgentPromptParams } from './anxiety';

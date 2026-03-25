import OpenAI from 'openai'

/**
 * Prepwise AI Clients
 *
 * Three separate clients for different tasks:
 *
 * 1. `agentClient` — For Sam (tutoring agent). Priority:
 *    - OPENROUTER_API_KEY → OpenRouter (Claude, GPT-4o, etc.)
 *    - ANTHROPIC_API_KEY → Anthropic direct
 *    - OPENAI_API_KEY → OpenAI direct
 *
 * 2. `routerClient` — For orchestrator (fast routing). Priority:
 *    - GROQ_API_KEY → Groq (free, fast)
 *    - Falls back to agentClient
 *
 * 3. `embeddingClient` — For embeddings (RAG). Always OpenAI:
 *    - OPENAI_API_KEY → text-embedding-3-small
 */

// ── Agent Client (Sam) ─────────────────────────────────────

let _agentClient: OpenAI | null = null
let _agentProvider: 'openrouter' | 'anthropic' | 'openai' | 'none' = 'none'

function getAgentClient(): OpenAI {
  if (_agentClient) return _agentClient

  if (process.env.OPENROUTER_API_KEY) {
    _agentProvider = 'openrouter'
    _agentClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://prepwise.app',
        'X-Title': 'PrepWISE',
      },
    })
  } else if (process.env.ANTHROPIC_API_KEY) {
    // Anthropic via OpenAI-compatible endpoint (not native SDK)
    _agentProvider = 'anthropic'
    _agentClient = new OpenAI({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: 'https://api.anthropic.com/v1/',
    })
  } else if (process.env.OPENAI_API_KEY) {
    _agentProvider = 'openai'
    _agentClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } else {
    _agentProvider = 'none'
    _agentClient = new OpenAI({ apiKey: 'dummy' })
  }

  return _agentClient
}

// ── Router Client (Orchestrator) ────────────────────────────

let _routerClient: OpenAI | null = null
let _useGroq = false

function getRouterClient(): OpenAI {
  if (_routerClient) return _routerClient

  if (process.env.GROQ_API_KEY) {
    _useGroq = true
    _routerClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  } else {
    // Fall back to agent client for routing too
    _useGroq = false
    _routerClient = getAgentClient()
  }

  return _routerClient
}

// ── Embedding Client (RAG) ──────────────────────────────────

let _embeddingClient: OpenAI | null = null

function getEmbeddingClient(): OpenAI {
  if (_embeddingClient) return _embeddingClient

  // Priority: OpenAI direct → OpenRouter → dummy
  if (process.env.OPENAI_API_KEY) {
    _embeddingClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } else if (process.env.OPENROUTER_API_KEY) {
    // OpenRouter supports OpenAI embedding models
    _embeddingClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://prepwise.app',
        'X-Title': 'PrepWISE',
      },
    })
  } else {
    _embeddingClient = new OpenAI({ apiKey: 'dummy' })
  }

  return _embeddingClient
}

// ── Lazy Proxies ────────────────────────────────────────────

/** Agent client — for Sam tutoring responses */
export const agentClient = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getAgentClient() as any)[prop]
  },
})

/** Router client — for orchestrator routing decisions */
export const routerClient = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getRouterClient() as any)[prop]
  },
})

/** Embedding client — always OpenAI for text-embedding-3-small */
export const embeddingClient = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getEmbeddingClient() as any)[prop]
  },
})

// ── Legacy export (backward compat) ────────────────────────

/** @deprecated Use agentClient, routerClient, or embeddingClient instead */
export const openai = agentClient

// ── Model Selection ─────────────────────────────────────────

/** Get the model for agent (Sam) responses */
export function getAgentModel(): string {
  switch (_agentProvider) {
    case 'openrouter':
      return process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4'
    case 'anthropic':
      return 'claude-sonnet-4-20250514'
    case 'openai':
      return 'gpt-4o'
    default:
      return 'gpt-4o'
  }
}

/** Get the model for routing decisions */
export function getRouterModel(): string {
  if (_useGroq) {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  }
  return getAgentModel()
}

/** Get the embedding model — OpenAI via direct or OpenRouter */
export function getEmbeddingModel(): string {
  if (process.env.OPENAI_API_KEY) {
    return 'text-embedding-3-small'
  }
  // OpenRouter requires the provider prefix
  return 'openai/text-embedding-3-small'
}

/** @deprecated Use getAgentModel() instead */
export function getModel(): string {
  return getAgentModel()
}

// ── Provider Info ───────────────────────────────────────────

export function getProviderInfo() {
  // Trigger lazy init
  getAgentClient()
  getRouterClient()

  return {
    agent: { provider: _agentProvider, model: getAgentModel() },
    router: { provider: _useGroq ? 'groq' : _agentProvider, model: getRouterModel() },
    embedding: { provider: 'openai', model: getEmbeddingModel() },
  }
}

// agents/server.ts
// SamiWISE — Railway Agent Backend Server
// Runs on Railway as a persistent container for GMAT AI agents.
// Handles long-running voice sessions, WebSocket connections, and RAG retrieval.

import http from 'http'

const PORT = parseInt(process.env.PORT || '3001', 10)

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'prepwise-gmat-agents',
      timestamp: new Date().toISOString(),
      agents: ['quantitative', 'verbal', 'data_insights', 'strategy', 'memory'],
    }))
    return
  }

  // Agent chat endpoint
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const { userId, message, agentType, sessionMessages } = JSON.parse(body)

        // Verify auth (simple bearer token for Railway-to-Vercel communication)
        const authHeader = req.headers.authorization
        const expectedSecret = process.env.RAILWAY_AGENT_SECRET
        if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }

        // Import and use the GMAT agent system
        // In production, this would:
        // 1. Route via orchestrator
        // 2. Load learner profile from DB
        // 3. Retrieve RAG context from Pinecone
        // 4. Generate response via Claude/Groq
        // 5. If voice mode: generate TTS via ElevenLabs
        // 6. Return response + audio URL

        const { routeToGmatAgent } = await import('./gmat/orchestrator')
        const routing = routeToGmatAgent(message)

        // TODO: Implement full agent pipeline with LLM calls
        // For now, return routing decision + placeholder
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          message: `[${routing.route}] I'd help you with this ${routing.detectedTopic} question. (Full agent pipeline pending integration.)`,
          agentType: routing.route,
          routing: {
            confidence: routing.confidence,
            reasoning: routing.reasoning,
            difficulty: routing.difficulty,
          },
        }))
      } catch (error) {
        console.error('Agent chat error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    })
    return
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`🚀 SamiWISE GMAT Agent Server running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Chat:   POST http://localhost:${PORT}/api/chat`)
  console.log('')
  console.log('   Agents loaded:')
  console.log('     - Quantitative (PS)')
  console.log('     - Verbal (CR + RC)')
  console.log('     - Data Insights (TPA + MSR + GI + TA + DS)')
  console.log('     - Strategy (timing, planning)')
  console.log('     - Memory (post-session profile updates)')
})

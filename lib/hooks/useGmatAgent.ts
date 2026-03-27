// lib/hooks/useGmatAgent.ts
// React hook for streaming GMAT agent responses via SSE.

'use client'

import { useState, useCallback, useRef } from 'react'
import type { GmatAgentType } from '@/agents/gmat/orchestrator'

interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentType?: GmatAgentType
}

interface RoutingInfo {
  agentType: GmatAgentType
  confidence: number
  topic: string
}

interface UseGmatAgentOptions {
  sessionId?: string | null
  onRouting?: (info: RoutingInfo) => void
  onError?: (error: string) => void
}

export function useGmatAgent(options: UseGmatAgentOptions = {}) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<GmatAgentType>('quantitative')
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (
    content: string,
    agentType?: GmatAgentType
  ) => {
    if (!content.trim() || isStreaming) return

    // Add user message
    const userMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    // Create assistant message placeholder
    const assistantId = crypto.randomUUID()

    try {
      abortRef.current = new AbortController()

      const response = await fetch('/api/agents/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          sessionId: options.sessionId,
          agentType,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        // Fallback to non-streaming endpoint
        const fallbackRes = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content.trim(),
            agentType,
          }),
        })

        if (fallbackRes.ok) {
          const data = await fallbackRes.json()
          setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
            agentType: data.agentType,
          }])
          if (data.agentType) setCurrentAgent(data.agentType)
        } else {
          options.onError?.('Failed to get response from tutor')
        }
        return
      }

      // Read SSE stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''
      let receivedAgent: GmatAgentType | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (!data) continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'routing') {
              receivedAgent = parsed.agentType
              setCurrentAgent(parsed.agentType)
              options.onRouting?.(parsed)
            }

            if (parsed.type === 'token') {
              fullContent += parsed.content
              setStreamingContent(fullContent)
            }

            if (parsed.type === 'done') {
              setMessages(prev => [...prev, {
                id: assistantId,
                role: 'assistant',
                content: fullContent,
                timestamp: new Date(),
                agentType: receivedAgent,
              }])
            }

            if (parsed.type === 'error') {
              options.onError?.(parsed.message)
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        options.onError?.(error.message || 'Connection failed')
      }
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
      abortRef.current = null
    }
  }, [isStreaming, options])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setStreamingContent('')
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isStreaming,
    streamingContent,
    currentAgent,
    sendMessage,
    stopStreaming,
    clearMessages,
    setMessages,
  }
}

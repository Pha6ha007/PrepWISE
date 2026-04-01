'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { BookOpen, BarChart3, Clock, Brain, Send, Square, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AutoCheckout } from '@/components/billing/AutoCheckout'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { AudioPlayer } from '@/components/voice/AudioPlayer'
import { useAudioQueue } from '@/components/voice/AudioQueue'
import { AgentStatus } from '@/components/session/AgentStatus'
import { WeeklyReview } from '@/components/dashboard/WeeklyReview'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentType?: AgentType
}

type AgentType = 'quantitative' | 'verbal' | 'data_insights' | 'strategy'
type SessionStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

const AGENT_LABELS: Record<AgentType, { label: string; icon: string; color: string }> = {
  quantitative: { label: 'Quantitative', icon: '📐', color: 'text-blue-400' },
  verbal: { label: 'Verbal', icon: '📝', color: 'text-green-400' },
  data_insights: { label: 'Data Insights', icon: '📊', color: 'text-purple-400' },
  strategy: { label: 'Strategy', icon: '🎯', color: 'text-yellow-400' },
}

function SessionPageInner() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle')
  const [currentAgent, setCurrentAgent] = useState<AgentType>('quantitative')
  const [sessionDuration, setSessionDuration] = useState(0)
  const [questionsCount, setQuestionsCount] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [autoPlayTTS, setAutoPlayTTS] = useState(true)

  // Sentence-level TTS streaming
  const sentenceBufferRef = useRef('')
  const { addToQueue: addAudioToQueue, clear: clearAudioQueue, isPlaying: isAudioPlaying } = useAudioQueue({
    onPlayStart: () => setSessionStatus('speaking'),
    onAllComplete: () => setSessionStatus('idle'),
  })

  // Request TTS for a sentence and add to audio queue
  const queueSentenceTTS = useCallback(async (sentence: string) => {
    if (!autoPlayTTS || sentence.trim().length < 5) return
    try {
      const res = await fetch('/api/tts/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence }),
      })
      if (res.ok && res.body) {
        const reader = res.body.getReader()
        const chunks: Uint8Array[] = []
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
        const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
        addAudioToQueue(blob)
      }
    } catch { /* TTS unavailable — text only */ }
  }, [autoPlayTTS, addAudioToQueue])
  const [lastAssistantMsgId, setLastAssistantMsgId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Session timer
  useEffect(() => {
    if (sessionStarted) {
      timerRef.current = setInterval(() => setSessionDuration(prev => prev + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessionStarted])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // ── Start session ──────────────────────────────────────────

  const startSession = useCallback(async () => {
    setSessionStarted(true)
    setSessionDuration(0)

    // Fetch personalized greeting from Sam based on learner profile
    let greeting =
      "Hey, I'm Sam — your GMAT tutor. What would you like to work on today? We can tackle Quant, Verbal, Data Insights, or talk strategy. What's on your mind?"
    try {
      const res = await fetch('/api/agents/session-start')
      if (res.ok) {
        const data = await res.json()
        if (data.greeting) greeting = data.greeting
      }
    } catch { /* use default */ }

    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }])
  }, [])

  // ── Send message with streaming ────────────────────────────

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim()
    if (!messageText || sessionStatus === 'thinking') return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setSessionStatus('thinking')
    setQuestionsCount(prev => prev + 1)
    setStreamingContent('')

    const assistantId = crypto.randomUUID()

    try {
      abortRef.current = new AbortController()

      // Try streaming endpoint first
      const response = await fetch('/api/agents/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          agentType: currentAgent,
        }),
        signal: abortRef.current.signal,
      })

      if (response.ok && response.body) {
        // SSE streaming
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        let detectedAgent: AgentType | undefined

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const parsed = JSON.parse(line.slice(6))

              if (parsed.type === 'routing') {
                detectedAgent = parsed.agentType
                setCurrentAgent(parsed.agentType)
              }
              if (parsed.type === 'token') {
                fullContent += parsed.content
                setStreamingContent(fullContent)
                // Buffer tokens into sentences for TTS
                if (autoPlayTTS) {
                  sentenceBufferRef.current += parsed.content
                  const parts = sentenceBufferRef.current.split(/(?<=[.!?])\s+/)
                  if (parts.length > 1) {
                    // Complete sentence(s) found — queue TTS
                    for (let i = 0; i < parts.length - 1; i++) {
                      queueSentenceTTS(parts[i])
                    }
                    sentenceBufferRef.current = parts[parts.length - 1]
                  }
                }
              }
              if (parsed.type === 'done') {
                // Flush remaining sentence buffer to TTS
                if (autoPlayTTS && sentenceBufferRef.current.trim().length > 5) {
                  queueSentenceTTS(sentenceBufferRef.current.trim())
                }
                sentenceBufferRef.current = ''

                const assistantMsg: Message = {
                  id: assistantId,
                  role: 'assistant',
                  content: fullContent,
                  timestamp: new Date(),
                  agentType: detectedAgent,
                }
                setMessages(prev => [...prev, assistantMsg])
                setStreamingContent('')
                setLastAssistantMsgId(assistantId)
                // If TTS is playing, status will be set by AudioQueue callbacks
                if (!autoPlayTTS) setSessionStatus('idle')
              }
            } catch { /* skip malformed */ }
          }
        }
      } else {
        // Fallback to non-streaming
        const fallbackRes = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, agentType: currentAgent }),
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
          if (data.sessionId) setSessionId(data.sessionId)
          setLastAssistantMsgId(assistantId)
        } else {
          setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: "I couldn't process that right now. The backend might not be connected. Try again in a moment.",
            timestamp: new Date(),
          }])
        }
        setSessionStatus('idle')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, {
          id: assistantId,
          role: 'assistant',
          content: "Connection issue — check that the backend is running.",
          timestamp: new Date(),
        }])
      }
      setSessionStatus('idle')
    } finally {
      setStreamingContent('')
      setSessionStatus(prev => prev === 'thinking' ? 'idle' : prev)
      abortRef.current = null
    }
  }, [inputText, currentAgent, sessionId, sessionStatus, autoPlayTTS])

  // ── Voice transcription callback ───────────────────────────

  const handleVoiceTranscription = useCallback((text: string) => {
    sendMessage(text)
  }, [sendMessage])

  // ── Stop streaming ─────────────────────────────────────────

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setSessionStatus('idle')
    setStreamingContent('')
  }, [])

  // ── Keyboard handler ───────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Pre-session screen ─────────────────────────────────────

  if (!sessionStarted) {
    return (
      <div className="min-h-full bg-[#0B1120] flex items-center justify-center py-16">
        <Suspense fallback={null}><AutoCheckout /></Suspense>
        <div className="text-center max-w-lg px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-400 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Ready for your GMAT session?</h1>
          <p className="text-slate-400 mb-8 text-lg">
            Sam is ready to help. Your progress is saved between sessions.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {(Object.keys(AGENT_LABELS) as AgentType[]).map(agent => (
              <button
                key={agent}
                onClick={() => setCurrentAgent(agent)}
                className={`p-3 rounded-xl border transition-all ${
                  currentAgent === agent
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-[#283244] bg-[#1E293B]/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-xl">{AGENT_LABELS[agent].icon}</span>
                <span className="ml-2 text-sm font-medium">{AGENT_LABELS[agent].label}</span>
              </button>
            ))}
          </div>
          <Button
            onClick={startSession}
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white px-8 py-3 text-lg rounded-xl"
          >
            Start Session
          </Button>
        </div>
      </div>
    )
  }

  // ── Active session ─────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-[#0B1120]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AgentStatus status={sessionStatus} agentName="Sam" currentTopic={AGENT_LABELS[currentAgent].label} />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{formatTime(sessionDuration)}</span></div>
          <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /><span>{questionsCount}Q</span></div>
          <button
            onClick={() => setAutoPlayTTS(p => !p)}
            className={`p-1 rounded ${autoPlayTTS ? 'text-cyan-400' : 'text-slate-600'}`}
            title={autoPlayTTS ? 'Voice on — click to mute' : 'Voice off — click to enable'}
          >
            {autoPlayTTS ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Weekly Review Widget */}
      <WeeklyReview />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-cyan-600 text-white rounded-br-md'
                : 'bg-[#1E293B] text-slate-200 rounded-bl-md'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-medium">Sam</span>
                  {/* TTS play button on assistant messages */}
                  <AudioPlayer
                    text={msg.content}
                    autoPlay={autoPlayTTS && msg.id === lastAssistantMsgId}
                    onPlayStart={() => setSessionStatus('speaking')}
                    onPlayEnd={() => setSessionStatus('idle')}
                  />
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <div className="text-[10px] mt-1 opacity-40">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] md:max-w-[75%] bg-[#1E293B] text-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="text-xs text-slate-400 mb-1 font-medium">Sam</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingContent}<span className="animate-pulse">▊</span></p>
            </div>
          </div>
        )}

        {/* Thinking dots (before streaming starts) */}
        {sessionStatus === 'thinking' && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-[#1E293B] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="text-xs text-slate-400 mb-1 font-medium">Sam</div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 md:px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          {/* Voice recorder */}
          <VoiceRecorder
            onTranscriptionComplete={handleVoiceTranscription}
            disabled={sessionStatus === 'thinking'}
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Sam anything about GMAT..."
              className="w-full bg-[#1E293B] text-white border border-[#283244] rounded-xl px-4 py-3 pr-20 resize-none text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 placeholder:text-slate-500"
              rows={1}
              disabled={sessionStatus === 'thinking'}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {sessionStatus === 'thinking' && streamingContent ? (
                <button
                  onClick={stopStreaming}
                  className="bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all"
                >
                  <Square className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim() || sessionStatus === 'thinking'}
                  className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SessionPage() {
  return <SessionPageInner />
}

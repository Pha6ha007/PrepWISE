'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Mic, Keyboard, Volume2, VolumeX, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { SourcesPanel } from './SourcesPanel'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { AudioPlayer } from '@/components/voice/AudioPlayer'
import { Message } from '@/types'

interface ChatWindowProps {
  sessionId?: string
  onSessionCreated?: (sessionId: string) => void
}

export function ChatWindow({ sessionId, onSessionCreated }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const [sources, setSources] = useState<any[]>([])
  const [memoryUpdated, setMemoryUpdated] = useState(false)
  const [companionName, setCompanionName] = useState('Alex')
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false)
  const [greetingLoaded, setGreetingLoaded] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false) // Voice input
  const [agentVoiceEnabled, setAgentVoiceEnabled] = useState(false) // Voice output
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<Date>(new Date())

  // Derived states
  const isVoiceAvailable = userPlan === 'pro' || userPlan === 'premium'
  const isPremium = userPlan === 'premium'

  // Загрузить данные пользователя при монтировании
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setCompanionName(data.companionName || 'Alex')
          setUserPlan(data.plan || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [])

  // Загрузить приветственное сообщение если чат пустой
  useEffect(() => {
    const loadGreeting = async () => {
      // Не загружать если:
      // - уже есть сообщения
      // - уже загружается
      // - уже загружено
      if (messages.length > 0 || isLoadingGreeting || greetingLoaded) {
        return
      }

      setIsLoadingGreeting(true)

      // Показать typing indicator 800ms
      await new Promise((resolve) => setTimeout(resolve, 800))

      try {
        const response = await fetch('/api/chat/greeting')
        if (!response.ok) {
          throw new Error('Failed to load greeting')
        }

        const data = await response.json()

        // Добавить приветственное сообщение
        const greetingMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          createdAt: new Date().toISOString(),
        }

        setMessages([greetingMessage])
        setGreetingLoaded(true)
      } catch (error) {
        console.error('Failed to load greeting:', error)
        // Fallback greeting если API недоступен
        const fallbackMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hi! I'm ${companionName}, and I'm here to listen. What's on your mind?`,
          createdAt: new Date().toISOString(),
        }
        setMessages([fallbackMessage])
        setGreetingLoaded(true)
      } finally {
        setIsLoadingGreeting(false)
      }
    }

    loadGreeting()
  }, [messages.length, companionName, isLoadingGreeting, greetingLoaded])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Update memory after session (idle timeout or page unload)
  const updateMemory = async () => {
    if (!currentSessionId || memoryUpdated || messages.length < 2) {
      return
    }

    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
        }),
      })

      if (response.ok) {
        setMemoryUpdated(true)
        console.log('Memory updated successfully')
      }
    } catch (error) {
      console.error('Failed to update memory:', error)
    }
  }

  // Reset idle timer on user activity
  const resetIdleTimer = () => {
    lastActivityRef.current = new Date()

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    // Update memory after 5 minutes of inactivity
    idleTimerRef.current = setTimeout(() => {
      updateMemory()
    }, 5 * 60 * 1000) // 5 minutes
  }

  // Handle page unload - update memory before leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSessionId && !memoryUpdated && messages.length >= 2) {
        // Use sendBeacon for reliable background request
        const data = JSON.stringify({ sessionId: currentSessionId })
        navigator.sendBeacon('/api/memory', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [currentSessionId, memoryUpdated, messages.length])

  // Start idle timer when session starts
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      resetIdleTimer()
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [currentSessionId, messages.length])

  const handleSubmit = async (e?: React.FormEvent, transcribedText?: string) => {
    if (e) {
      e.preventDefault()
    }

    const userMessage = transcribedText || input.trim()

    if (!userMessage || isLoading) return

    setInput('')

    // Reset idle timer on user activity
    resetIdleTimer()

    // Add user message immediately
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
          enableVoiceResponse: agentVoiceEnabled, // Передаём флаг голосового ответа
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Update session ID if new session was created
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId)
        onSessionCreated?.(data.sessionId)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: data.messageId || crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        audioUrl: data.audioUrl, // Аудио URL если сгенерировано
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update sources if provided
      if (data.sources) {
        setSources(data.sources)
      }

      // Auto-play audio если пришёл audioUrl и голос включён
      if (data.audioUrl && agentVoiceEnabled) {
        try {
          const audio = new Audio(data.audioUrl)
          audio.play().catch((error) => {
            console.error('Failed to auto-play audio:', error)
          })
        } catch (error) {
          console.error('Failed to create audio element:', error)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error. Please try again in a moment.',
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceTranscription = (text: string) => {
    handleSubmit(undefined, text)
  }

  const toggleVoiceInput = () => {
    if (!isVoiceAvailable) {
      // Заблокировано для FREE — tooltip покажет подсказку
      return
    }
    setIsVoiceMode(!isVoiceMode)
  }

  const toggleAgentVoice = () => {
    if (!isVoiceAvailable) {
      return
    }
    setAgentVoiceEnabled(!agentVoiceEnabled)
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            enableVoice={isVoiceAvailable}
          />
        ))}

        {/* Show typing indicator when loading greeting or response */}
        {(isLoading || isLoadingGreeting) && <TypingIndicator companionName={companionName} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Sources Panel */}
      {sources.length > 0 && (
        <div className="px-6">
          <SourcesPanel sources={sources} />
        </div>
      )}

      {/* Input Area */}
      <div className="glass border-t border-white/20 p-6 shadow-large">
        <div className="space-y-4">
          {/* Voice Controls — только для PRO/PREMIUM */}
          {isVoiceAvailable && (
            <div className="flex items-center justify-between px-4 py-3 glass-button border border-white/20 rounded-xl shadow-card">
              {/* Agent Voice Toggle */}
              <div className="flex items-center space-x-3">
                <Switch
                  checked={agentVoiceEnabled}
                  onCheckedChange={toggleAgentVoice}
                />
                <div className="flex items-center space-x-2">
                  {agentVoiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-primary" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Agent replies with voice
                  </span>
                  {/* Premium Badge */}
                  {isPremium && (
                    <Badge variant="premium" className="ml-2">
                      <Crown className="w-3 h-3 mr-1" />
                      Custom Voice
                    </Badge>
                  )}
                </div>
              </div>

              {/* Voice Input Toggle */}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={toggleVoiceInput}
                className="text-xs transition-smooth hover:bg-white/30 backdrop-blur-sm"
              >
                {isVoiceMode ? (
                  <>
                    <Keyboard className="w-4 h-4 mr-1" />
                    Text Input
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Text or Voice Input */}
          {isVoiceMode && isVoiceAvailable ? (
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceTranscription}
              disabled={isLoading}
            />
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] resize-none rounded-xl glass-button border border-white/20 focus:ring-2 focus:ring-primary transition-smooth backdrop-blur-md"
                disabled={isLoading}
              />
              <div className="flex flex-col space-y-2">
                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 h-auto rounded-xl transition-smooth hover:scale-105 shadow-card hover:shadow-large relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#EC4899] opacity-0 group-hover:opacity-20 transition-opacity" />
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <Send className="w-5 h-5 relative z-10" />
                  )}
                </Button>

                {/* Voice Button для FREE — заблокирован с tooltip */}
                {!isVoiceAvailable && (
                  <Tooltip content="Upgrade to Pro for voice features" side="left">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      className="px-3 py-2 opacity-50 cursor-not-allowed rounded-xl"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          This is AI support, not medical advice. In crisis, contact emergency
          services.
        </p>
      </div>
    </div>
  )
}

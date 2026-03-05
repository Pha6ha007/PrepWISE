'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar'

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  // Restore active session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('confide_active_session')
    if (savedSessionId) {
      setActiveSessionId(savedSessionId)
    }
  }, [])

  // Save active session to localStorage when it changes
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('confide_active_session', activeSessionId)
    } else {
      localStorage.removeItem('confide_active_session')
    }
  }, [activeSessionId])

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      setSidebarVisible(false)
    }
  }

  const handleNewConversation = () => {
    setActiveSessionId(null)
    // Close sidebar on mobile after action
    if (window.innerWidth < 1024) {
      setSidebarVisible(false)
    }
  }

  const handleSessionChange = (sessionId: string | null) => {
    setActiveSessionId(sessionId)
  }

  return (
    <div className="h-full flex relative">
      {/* Backdrop for mobile sidebar */}
      {sidebarVisible && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 h-full transition-transform duration-300 ease-in-out`}
      >
        <ChatHistorySidebar
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 h-full relative">
        {/* Toggle Button (Mobile) - inside chat window */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute top-4 left-4 z-10 lg:hidden glass-button border border-white/20 shadow-lg"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>

        <ChatWindow
          activeSessionId={activeSessionId}
          onSessionChange={handleSessionChange}
        />
      </div>
    </div>
  )
}

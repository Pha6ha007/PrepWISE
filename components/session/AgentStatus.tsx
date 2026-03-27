'use client'

import { Brain, Headphones, Mic, Pause } from 'lucide-react'

type AgentStatusType = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AgentStatusProps {
  status: AgentStatusType
  agentName?: string
  currentTopic?: string
}

const STATUS_CONFIG: Record<
  AgentStatusType,
  { label: string; color: string; bgColor: string; icon: React.ComponentType<any> }
> = {
  idle: {
    label: 'Ready',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    icon: Pause,
  },
  listening: {
    label: 'Listening',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    icon: Mic,
  },
  thinking: {
    label: 'Thinking',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    icon: Brain,
  },
  speaking: {
    label: 'Speaking',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    icon: Headphones,
  },
}

/**
 * Displays the current state of the AI agent (Sam).
 * Shows: listening, thinking, speaking, or idle states
 * with animated indicators.
 */
export function AgentStatus({ status, agentName = 'Sam', currentTopic }: AgentStatusProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      {/* Animated status dot */}
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'idle'
              ? 'bg-green-500'
              : status === 'listening'
                ? 'bg-red-500'
                : status === 'thinking'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
          }`}
        />
        {status !== 'idle' && (
          <div
            className={`absolute inset-0 w-2 h-2 rounded-full animate-ping ${
              status === 'listening'
                ? 'bg-red-500'
                : status === 'thinking'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
            }`}
          />
        )}
      </div>

      {/* Icon */}
      <Icon className={`w-3.5 h-3.5 ${config.color} ${status === 'thinking' ? 'animate-pulse' : ''}`} />

      {/* Label */}
      <span className={`text-xs font-medium ${config.color}`}>
        {agentName} · {config.label}
      </span>

      {/* Current topic badge */}
      {currentTopic && (
        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          {currentTopic}
        </span>
      )}
    </div>
  )
}

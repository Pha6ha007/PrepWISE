'use client'

import { useState } from 'react'
import { Pause, Play, Square, RotateCcw, Settings } from 'lucide-react'

interface SessionControlsProps {
  isActive: boolean
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onEnd: () => void
  onRestart: () => void
  sessionDuration: number
}

/**
 * Session control bar: pause, resume, end session, restart.
 * Shows session duration and provides control buttons.
 */
export function SessionControls({
  isActive,
  isPaused,
  onPause,
  onResume,
  onEnd,
  onRestart,
  sessionDuration,
}: SessionControlsProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!isActive) return null

  return (
    <div className="flex items-center gap-3">
      {/* Duration */}
      <span className="text-sm font-mono text-slate-400 min-w-[48px]">
        {formatDuration(sessionDuration)}
      </span>

      {/* Pause/Resume */}
      <button
        onClick={isPaused ? onResume : onPause}
        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
      </button>

      {/* End session */}
      {showEndConfirm ? (
        <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full">
          <span className="text-xs text-red-400">End session?</span>
          <button
            onClick={() => { onEnd(); setShowEndConfirm(false) }}
            className="text-xs text-red-400 font-medium hover:text-red-300"
          >
            Yes
          </button>
          <button
            onClick={() => setShowEndConfirm(false)}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowEndConfirm(true)}
          className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
          title="End session"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Restart */}
      <button
        onClick={onRestart}
        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
        title="Restart session"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

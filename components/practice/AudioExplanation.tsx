'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Volume2, Loader2, Pause, RotateCcw, VolumeX } from 'lucide-react'

interface AudioExplanationProps {
  explanationText: string
}

/**
 * "Listen to Sam's explanation" button for the ExplanationPanel.
 *
 * - Calls /api/tts to generate audio
 * - Gracefully hides if TTS is unavailable (403/500)
 * - Does NOT auto-play — user must click
 */
export function AudioExplanation({ explanationText }: AudioExplanationProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'done' | 'hidden'>('idle')
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
    }
  }, [])

  const fetchAndPlay = useCallback(async () => {
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: explanationText, stream: false }),
      })

      if (res.status === 403 || res.status === 401) {
        // TTS not available for this user (free plan or no API key)
        setState('hidden')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data.error || `TTS failed (${res.status})`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio

      audio.onplay = () => setState('playing')
      audio.onpause = () => {
        if (audio.ended) return
        setState('paused')
      }
      audio.onended = () => setState('done')
      audio.onerror = () => {
        setError('Playback failed')
        setState('idle')
      }

      await audio.play()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate audio'
      // If ElevenLabs not configured, hide button
      if (msg.includes('not configured') || msg.includes('API key')) {
        setState('hidden')
        return
      }
      setError(msg)
      setState('idle')
    }
  }, [explanationText])

  const handleClick = useCallback(async () => {
    switch (state) {
      case 'idle':
        await fetchAndPlay()
        break
      case 'playing':
        audioRef.current?.pause()
        break
      case 'paused':
        audioRef.current?.play()
        break
      case 'done':
        // Replay
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
        } else {
          await fetchAndPlay()
        }
        break
    }
  }, [state, fetchAndPlay])

  // Don't render if TTS is unavailable
  if (state === 'hidden') return null

  const labelMap = {
    idle: "Listen to Sam's explanation",
    loading: 'Generating audio…',
    playing: 'Pause',
    paused: 'Resume',
    done: 'Replay',
    hidden: '',
  }

  const iconMap = {
    idle: <Volume2 className="w-4 h-4" />,
    loading: <Loader2 className="w-4 h-4 animate-spin" />,
    playing: <Pause className="w-4 h-4" />,
    paused: <Volume2 className="w-4 h-4" />,
    done: <RotateCcw className="w-4 h-4" />,
    hidden: null,
  }

  return (
    <div className="flex items-center gap-3 mt-3">
      <button
        onClick={handleClick}
        disabled={state === 'loading'}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          transition-all
          ${state === 'playing'
            ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
            : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }
          ${state === 'loading' ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        {iconMap[state]}
        <span>{labelMap[state]}</span>
      </button>

      {error && (
        <span className="text-xs text-red-400 flex items-center gap-1">
          <VolumeX className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  )
}

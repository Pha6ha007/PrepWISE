'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Loader2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface AudioPlayerProps {
  text: string
  autoPlay?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

export function AudioPlayer({
  text,
  autoPlay = false,
  onPlayStart,
  onPlayEnd,
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay) {
      handlePlay()
    }
  }, [autoPlay])

  const fetchAudio = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      return url
    } catch (err) {
      console.error('Audio generation error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to generate audio'
      )
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = async () => {
    try {
      // Fetch audio if not already loaded
      let url = audioUrl
      if (!url) {
        url = await fetchAudio()
        if (!url) return
      }

      // Create audio element if doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio(url)

        audioRef.current.onplay = () => {
          setIsPlaying(true)
          onPlayStart?.()
        }

        audioRef.current.onended = () => {
          setIsPlaying(false)
          onPlayEnd?.()
        }

        audioRef.current.onerror = (err) => {
          console.error('Audio playback error:', err)
          setError('Failed to play audio')
          setIsPlaying(false)
        }
      }

      // Play or pause
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Playback error:', err)
      setError('Failed to play audio')
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={isLoading}
        onClick={handlePlay}
        className="relative"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : error ? (
          <VolumeX className="w-4 h-4 text-red-500" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}

        {/* Sound wave animation when playing */}
        {isPlaying && (
          <div className="absolute -right-1 -top-1 flex items-end space-x-[2px] h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-primary rounded-full"
                initial={{ height: '4px' }}
                animate={{
                  height: ['4px', '12px', '4px'],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </Button>

      {error && (
        <span className="text-xs text-red-500">Audio unavailable</span>
      )}
    </div>
  )
}

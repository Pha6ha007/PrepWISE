'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * AudioQueue — plays audio blobs in sequence.
 * Used for sentence-by-sentence TTS playback during streaming responses.
 *
 * Usage:
 *   const { addToQueue, clear, isPlaying } = useAudioQueue({ onPlayStart, onAllComplete })
 *   addToQueue(audioBlob) // call as each sentence's TTS completes
 */
interface UseAudioQueueOptions {
  onPlayStart?: () => void
  onPlayEnd?: () => void
  onAllComplete?: () => void
}

export function useAudioQueue(options: UseAudioQueueOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [queueLength, setQueueLength] = useState(0)
  const queueRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playingRef = useRef(false)
  const urlsRef = useRef<string[]>([]) // track for cleanup

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url))
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      playingRef.current = false
      setIsPlaying(false)
      setQueueLength(0)
      options.onAllComplete?.()
      return
    }

    const blob = queueRef.current.shift()!
    setQueueLength(queueRef.current.length)

    const url = URL.createObjectURL(blob)
    urlsRef.current.push(url)

    const audio = new Audio(url)
    audioRef.current = audio

    audio.onplay = () => {
      if (!playingRef.current) {
        playingRef.current = true
        setIsPlaying(true)
        options.onPlayStart?.()
      }
    }

    audio.onended = () => {
      URL.revokeObjectURL(url)
      options.onPlayEnd?.()
      playNext() // play next in queue
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      playNext() // skip errored audio
    }

    audio.play().catch(() => playNext())
  }, [options])

  const addToQueue = useCallback((blob: Blob) => {
    queueRef.current.push(blob)
    setQueueLength(queueRef.current.length)

    // If not currently playing, start
    if (!playingRef.current) {
      playNext()
    }
  }, [playNext])

  const clear = useCallback(() => {
    queueRef.current = []
    setQueueLength(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    playingRef.current = false
    setIsPlaying(false)
    urlsRef.current.forEach(url => URL.revokeObjectURL(url))
    urlsRef.current = []
  }, [])

  return { addToQueue, clear, isPlaying, queueLength }
}

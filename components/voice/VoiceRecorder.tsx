'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  disabled?: boolean
}

export function VoiceRecorder({
  onTranscriptionComplete,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      audioChunksRef.current = []
      setRecordingDuration(0)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await handleRecordingStop()
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleRecordingStop = async () => {
    setIsTranscribing(true)

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || 'audio/webm',
      })

      // Check file size (max 25MB)
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error('Recording too large. Please keep it under 25MB.')
      }

      // Send to transcription API
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const data = await response.json()

      if (data.text && data.text.trim().length > 0) {
        onTranscriptionComplete(data.text)
      } else {
        throw new Error('No speech detected. Please try again.')
      }
    } catch (err) {
      console.error('Transcription error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to transcribe audio'
      )
    } finally {
      setIsTranscribing(false)
      setRecordingDuration(0)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Hold-to-Record Button */}
      <div className="relative">
        <Button
          type="button"
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          disabled={disabled || isTranscribing}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={() => {
            if (isRecording) stopRecording()
          }}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className="w-16 h-16 rounded-full relative"
        >
          {isTranscribing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        {/* Recording pulse animation */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: 1.5,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: 1.5,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.5,
                }}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Status Text */}
      <div className="text-center min-h-[40px]">
        {isTranscribing ? (
          <p className="text-sm text-muted-foreground">Transcribing...</p>
        ) : isRecording ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">Recording...</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(recordingDuration)}
            </p>
            <p className="text-xs text-muted-foreground">
              Release to send
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hold to record
          </p>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-600 text-center max-w-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

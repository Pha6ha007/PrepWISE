'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, Loader2, Pause } from 'lucide-react'

interface VoicePreviewProps {
  voiceKey: string
  companionName?: string
  label?: string
}

/**
 * Компонент кнопки "Послушать" для превью голосов
 *
 * Использование:
 * <VoicePreview voiceKey="male_warm_mature" companionName="Alex" />
 */
export function VoicePreview({
  voiceKey,
  companionName,
  label = 'Listen',
}: VoicePreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = async () => {
    try {
      // Если уже играет — остановить
      if (isPlaying && audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
        return
      }

      setIsLoading(true)

      // Запрос на API для генерации превью
      const response = await fetch('/api/voice/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceKey,
          companionName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate voice preview')
      }

      // Получить аудио blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Создать audio элемент
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // Обработчики событий
      audio.onplay = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl) // Очистить память
      }

      audio.onerror = () => {
        setIsLoading(false)
        setIsPlaying(false)
        alert('Failed to play audio preview')
      }

      // Воспроизвести
      await audio.play()
    } catch (error) {
      console.error('Voice preview error:', error)
      setIsLoading(false)
      setIsPlaying(false)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handlePlay}
      disabled={isLoading}
      className="min-w-[90px]"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading
        </>
      ) : isPlaying ? (
        <>
          <Pause className="w-4 h-4 mr-2" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}

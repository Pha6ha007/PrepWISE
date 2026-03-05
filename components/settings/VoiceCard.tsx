'use client'

import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoicePreview } from '@/components/onboarding/VoicePreview'
import { getVoiceKeyById } from '@/lib/voices/config'
import { VOICE_CONFIGS } from '@/lib/voices/config'

interface VoiceCardProps {
  companionName: string
  companionGender: 'male' | 'female'
  voiceId: string | null
}

/**
 * Voice Card для настроек — показывает текущий голос компаньона
 *
 * Отображает:
 * - Имя компаньона
 * - Пол и тип голоса (Warm & Mature, Calm & Gentle)
 * - Кнопку превью
 * - Кнопку изменения голоса (пока placeholder)
 */
export function VoiceCard({ companionName, companionGender, voiceId }: VoiceCardProps) {
  // Найти конфиг голоса по voiceId
  const voiceKey = voiceId ? getVoiceKeyById(voiceId) : null
  const voiceConfig = voiceKey ? VOICE_CONFIGS[voiceKey] : null

  // Если нет voiceId — использовать дефолтный
  const displayVoiceLabel = voiceConfig?.label || 'Default Voice'
  const displayVoiceKey = voiceKey || (companionGender === 'male' ? 'male_warm_mature' : 'female_warm_mature')

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-warm/20 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-warm/20 rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-warm" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground text-xl">
              {companionName}'s Voice
            </h3>
            <p className="text-sm text-gray-600 mt-1 capitalize">
              {companionGender} · {displayVoiceLabel}
            </p>
          </div>
        </div>
      </div>

      {voiceConfig && (
        <p className="text-sm text-gray-600 mb-4">{voiceConfig.description}</p>
      )}

      <div className="flex items-center space-x-3">
        <VoicePreview
          voiceKey={displayVoiceKey}
          companionName={companionName}
          label="Preview"
        />
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-gray-500"
        >
          Change Voice (Coming Soon)
        </Button>
      </div>
    </div>
  )
}

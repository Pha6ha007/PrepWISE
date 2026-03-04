'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Users, MessageCircle, Volume2 } from 'lucide-react'
import { VoicePreview } from './VoicePreview'
import {
  VoiceGender,
  getVoicesForGender,
  SUGGESTED_NAMES,
  VoiceConfig,
} from '@/lib/voices/config'

interface VoiceQuizProps {
  onComplete: (data: {
    companionGender: VoiceGender
    companionName: string
    voiceKey: string
    voiceId: string
  }) => void
  onBack: () => void
}

/**
 * Voice Design Quiz для PRO/PREMIUM пользователей
 *
 * Шаг 1: Выбор пола собеседника (мужской / женский)
 * Шаг 2: Выбор имени собеседника (предложенные + своё)
 * Шаг 3: Выбор голоса (2 варианта для каждого пола с превью)
 */
export function VoiceQuiz({ onComplete, onBack }: VoiceQuizProps) {
  const [step, setStep] = useState(1)

  // Шаг 1 — пол
  const [companionGender, setCompanionGender] = useState<VoiceGender | null>(null)

  // Шаг 2 — имя
  const [companionName, setCompanionName] = useState('')
  const [customName, setCustomName] = useState('')

  // Шаг 3 — голос
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig | null>(null)

  // Получить доступные голоса для выбранного пола
  const availableVoices = companionGender
    ? getVoicesForGender(companionGender)
    : []

  // Получить предложенные имена для выбранного пола
  const suggestedNames = companionGender ? SUGGESTED_NAMES[companionGender] : []

  const handleGenderSelect = (gender: VoiceGender) => {
    setCompanionGender(gender)
    setStep(2)
  }

  const handleNameSelect = (name: string) => {
    if (name === 'custom') {
      setCompanionName('')
      setCustomName('')
      return
    }
    setCompanionName(name)
  }

  const handleNameSubmit = () => {
    const finalName = customName.trim() || companionName
    if (!finalName) return

    setCompanionName(finalName)
    setStep(3)
  }

  const handleVoiceSelect = (voice: VoiceConfig) => {
    setSelectedVoice(voice)
  }

  const handleFinish = () => {
    if (!companionGender || !companionName || !selectedVoice) return

    // Ключ голоса для сохранения в БД
    const voiceKey = Object.keys(require('@/lib/voices/config').VOICE_CONFIGS).find(
      (key) => require('@/lib/voices/config').VOICE_CONFIGS[key].id === selectedVoice.id
    )

    onComplete({
      companionGender,
      companionName,
      voiceKey: voiceKey || '',
      voiceId: selectedVoice.id,
    })
  }

  return (
    <div>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6 space-x-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step
                ? 'w-8 bg-amber-600'
                : s < step
                ? 'w-2 bg-amber-400'
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Шаг 1 — Пол собеседника */}
      {step === 1 && (
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Choose your companion's gender</CardTitle>
            <CardDescription className="text-base mt-2">
              This helps us personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => handleGenderSelect('male')}
              className="w-full p-6 border-2 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-amber-600">
                    Male Companion
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Supportive, calm, and understanding
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
              </div>
            </button>

            <button
              onClick={() => handleGenderSelect('female')}
              className="w-full p-6 border-2 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-amber-600">
                    Female Companion
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Warm, compassionate, and empathetic
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
              </div>
            </button>

            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full mt-4"
            >
              ← Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Шаг 2 — Имя собеседника */}
      {step === 2 && (
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Choose your companion's name</CardTitle>
            <CardDescription className="text-base mt-2">
              Pick a name that feels right for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Предложенные имена */}
            <div className="grid grid-cols-2 gap-3">
              {suggestedNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handleNameSelect(name)}
                  className={`p-4 border-2 rounded-lg font-medium transition-all ${
                    companionName === name && !customName
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-amber-300 text-gray-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Или своё имя */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                Or enter your own
              </p>
              <Input
                type="text"
                placeholder="Custom name"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value)
                  setCompanionName('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="text-center h-12"
                maxLength={20}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleNameSubmit}
                disabled={!companionName && !customName.trim()}
                className="w-full h-12 text-base"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full"
              >
                ← Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Шаг 3 — Выбор голоса */}
      {step === 3 && (
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Choose {companionName}'s voice</CardTitle>
            <CardDescription className="text-base mt-2">
              Listen to each voice and pick your favorite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableVoices.map((voice) => {
              const voiceKey = Object.keys(
                require('@/lib/voices/config').VOICE_CONFIGS
              ).find(
                (key) =>
                  require('@/lib/voices/config').VOICE_CONFIGS[key].id === voice.id
              )

              return (
                <div
                  key={voice.id}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedVoice?.id === voice.id
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{voice.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{voice.description}</p>
                    </div>
                    <VoicePreview
                      voiceKey={voiceKey || ''}
                      companionName={companionName}
                    />
                  </div>
                  <Button
                    variant={selectedVoice?.id === voice.id ? 'default' : 'outline'}
                    onClick={() => handleVoiceSelect(voice)}
                    className="w-full mt-3"
                    size="sm"
                  >
                    {selectedVoice?.id === voice.id ? 'Selected' : 'Select this voice'}
                  </Button>
                </div>
              )
            })}

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleFinish}
                disabled={!selectedVoice}
                className="w-full h-12 text-base"
                size="lg"
              >
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                className="w-full"
              >
                ← Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Target, Clock, BookOpen, ArrowRight, Check } from 'lucide-react'

type Step = 'welcome' | 'profile' | 'diagnostic' | 'plan' | 'ready'

const GMAT_SECTIONS = ['Quantitative', 'Verbal', 'Data Insights'] as const
const TARGET_RANGES = [
  { label: '600–650', description: 'Competitive for many programs' },
  { label: '650–700', description: 'Top 20 MBA programs' },
  { label: '700–750', description: 'Top 10 MBA programs' },
  { label: '750+', description: 'Harvard, Stanford, Wharton' },
] as const

const STUDY_TIMELINES = [
  { label: '2–4 weeks', value: '1month' },
  { label: '1–2 months', value: '2months' },
  { label: '3–6 months', value: '6months' },
  { label: 'No date set', value: 'flexible' },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profile data
  const [preferredName, setPreferredName] = useState('')
  const [targetScore, setTargetScore] = useState('')
  const [timeline, setTimeline] = useState('')
  const [weakSections, setWeakSections] = useState<string[]>([])
  const [previousScore, setPreviousScore] = useState('')
  const [studyHours, setStudyHours] = useState('')

  const toggleWeakSection = (section: string) => {
    setWeakSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleSubmit = async () => {
    if (!preferredName.trim()) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredName: preferredName.trim(),
          companionName: 'Sam',
          targetScore: targetScore || null,
          timeline: timeline || null,
          weakSections,
          previousScore: previousScore || null,
          studyHours: studyHours || null,
        }),
      })

      if (response.ok) {
        localStorage.setItem('prepwise_onboarding_complete', 'true')
        router.push('/dashboard/session')
        return
      }

      // API failed (no Supabase etc.) — still navigate, save to localStorage
      console.warn('Onboarding API returned', response.status, '— saving locally')
      localStorage.setItem('prepwise_onboarding_complete', 'true')
      localStorage.setItem('prepwise_preferred_name', preferredName.trim())
      localStorage.setItem('prepwise_target_score', targetScore || '')
      window.location.href = '/dashboard/session'
    } catch (error) {
      console.error('Onboarding error:', error)
      // Even on network error — let user proceed
      localStorage.setItem('prepwise_onboarding_complete', 'true')
      localStorage.setItem('prepwise_preferred_name', preferredName.trim())
      window.location.href = '/dashboard/session'
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-400 flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome to SamiWISE</h1>
            <p className="text-slate-400 text-lg mb-8">
              I'm Sam, your AI GMAT tutor. Let me learn a bit about you so I can
              personalize your study experience.
            </p>
            <Button
              onClick={() => setStep('profile')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 text-lg rounded-xl"
            >
              Let's get started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-slate-500 mt-6">
              Sam is an AI tutor — not a human instructor. Your progress is saved and remembered across sessions.
            </p>
          </div>
        )}

        {/* Step: Profile */}
        {step === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">About you</h2>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What should I call you?
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={e => setPreferredName(e.target.value)}
                placeholder="Your first name"
                className="w-full bg-[#1E293B] border border-[#283244] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            {/* Previous score */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Have you taken the GMAT before?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreviousScore('no')}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    previousScore === 'no'
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-[#283244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  No, first time
                </button>
                <button
                  onClick={() => setPreviousScore('yes')}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    previousScore === 'yes'
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-[#283244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  Yes, retaking
                </button>
              </div>
            </div>

            {/* Target score */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Target score range
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TARGET_RANGES.map(range => (
                  <button
                    key={range.label}
                    onClick={() => setTargetScore(range.label)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetScore === range.label
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-[#283244] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{range.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{range.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep('diagnostic')}
              disabled={!preferredName.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step: Diagnostic — weak areas + timeline */}
        {step === 'diagnostic' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your study plan</h2>

            {/* Weak sections */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Which sections do you find hardest? (select all that apply)
              </label>
              <div className="space-y-2">
                {GMAT_SECTIONS.map(section => (
                  <button
                    key={section}
                    onClick={() => toggleWeakSection(section)}
                    className={`w-full p-3 rounded-xl border text-left text-sm flex items-center justify-between transition-all ${
                      weakSections.includes(section)
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-[#283244] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>{section}</span>
                    {weakSections.includes(section) && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
                <button
                  onClick={() => setWeakSections([])}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                    weakSections.length === 0
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-[#283244] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  Not sure yet — let Sam assess me
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                When is your GMAT?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {STUDY_TIMELINES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTimeline(t.value)}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      timeline === t.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-[#283244] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Study hours */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hours per week you can study
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['5', '10', '15', '20+'].map(h => (
                  <button
                    key={h}
                    onClick={() => setStudyHours(h)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      studyHours === h
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-[#283244] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('profile')}
                className="flex-1 border-[#283244] text-slate-300 hover:bg-[#1E293B] py-3 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('ready')}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Ready */}
        {step === 'ready' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              You're all set, {preferredName || 'there'}!
            </h2>
            <p className="text-slate-400 mb-8">
              Sam will personalize your sessions based on what you've shared.
              {targetScore && ` Target: ${targetScore}.`}
              {weakSections.length > 0 && ` Focus areas: ${weakSections.join(', ')}.`}
              {timeline && timeline !== 'flexible' && ` Timeline: ${STUDY_TIMELINES.find(t => t.value === timeline)?.label}.`}
            </p>

            <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-4 mb-8 text-left">
              <h3 className="text-sm font-medium text-slate-300 mb-2">What happens next:</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-cyan-400">1</span>
                  </div>
                  Start a voice or text session with Sam
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-cyan-400">2</span>
                  </div>
                  Sam assesses your level and adapts in real-time
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-cyan-400">3</span>
                  </div>
                  Track your progress across all GMAT sections
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('diagnostic')}
                className="flex-1 border-[#283244] text-slate-300 hover:bg-[#1E293B] py-3 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !preferredName.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white py-3 rounded-xl"
              >
                {isSubmitting ? 'Setting up...' : 'Start my first session'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

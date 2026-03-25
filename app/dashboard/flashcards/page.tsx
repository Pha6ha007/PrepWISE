'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  BookOpen,
  Layers,
  Check,
  Flame,
  Frown,
} from 'lucide-react'

import { FLASHCARD_DECKS, type FlashcardDeck, type Flashcard } from '@/lib/gmat/flashcards'

// ── Types ──────────────────────────────────────────────────

type Rating = 'easy' | 'good' | 'hard'
type View = 'decks' | 'study' | 'summary'

interface CardProgress {
  rating: Rating
  reviewedAt: number
}

type ProgressMap = Record<string, CardProgress>

// ── Color mapping ──────────────────────────────────────────

const sectionColors: Record<string, { bg: string; border: string; text: string; accent: string; glow: string }> = {
  quant: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    accent: 'from-cyan-500 to-cyan-600',
    glow: 'shadow-cyan-500/20',
  },
  verbal: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    accent: 'from-emerald-500 to-emerald-600',
    glow: 'shadow-emerald-500/20',
  },
  'data-insights': {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    accent: 'from-violet-500 to-violet-600',
    glow: 'shadow-violet-500/20',
  },
}

// ── Helpers ─────────────────────────────────────────────────

function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('flashcard-progress')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress: ProgressMap) {
  try {
    localStorage.setItem('flashcard-progress', JSON.stringify(progress))
  } catch {
    // storage full / unavailable
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getMastery(progress: ProgressMap, cards: Flashcard[]): { easy: number; good: number; hard: number; unreviewed: number } {
  let easy = 0, good = 0, hard = 0, unreviewed = 0
  for (const card of cards) {
    const p = progress[card.id]
    if (!p) unreviewed++
    else if (p.rating === 'easy') easy++
    else if (p.rating === 'good') good++
    else hard++
  }
  return { easy, good, hard, unreviewed }
}

// ── Deck Selection Grid ────────────────────────────────────

function DeckGrid({ onSelect, progress }: { onSelect: (deck: FlashcardDeck) => void; progress: ProgressMap }) {
  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Layers className="w-6 h-6 text-cyan-400" />
          Flashcards
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {FLASHCARD_DECKS.reduce((s, d) => s + d.cardCount, 0)} cards across {FLASHCARD_DECKS.length} decks — tap to study
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FLASHCARD_DECKS.map(deck => {
          const colors = sectionColors[deck.section] ?? sectionColors.quant
          const mastery = getMastery(progress, deck.cards)
          const reviewed = mastery.easy + mastery.good + mastery.hard
          const pct = deck.cardCount > 0 ? Math.round((reviewed / deck.cardCount) * 100) : 0

          return (
            <button
              key={deck.id}
              onClick={() => onSelect(deck)}
              className={`group relative rounded-2xl border ${colors.border} bg-white/[0.02] p-5 text-left
                hover:bg-white/[0.05] hover:shadow-lg ${colors.glow} transition-all duration-200`}
            >
              {/* Section badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-3`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.accent}`} />
                {deck.section === 'data-insights' ? 'Data Insights' : deck.section.charAt(0).toUpperCase() + deck.section.slice(1)}
              </span>

              <h3 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {deck.name}
              </h3>
              <p className="text-sm text-slate-500">{deck.cardCount} cards</p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>{reviewed} reviewed</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.accent} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Study Mode ─────────────────────────────────────────────

function StudyMode({
  deck,
  progress,
  onRate,
  onBack,
  onFinish,
}: {
  deck: FlashcardDeck
  progress: ProgressMap
  onRate: (cardId: string, rating: Rating) => void
  onBack: () => void
  onFinish: () => void
}) {
  const [cards, setCards] = useState<Flashcard[]>(deck.cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState(false)

  const card = cards[index]
  const colors = sectionColors[deck.section] ?? sectionColors.quant
  const isLast = index === cards.length - 1

  const handleFlip = useCallback(() => setFlipped(f => !f), [])

  const handleRate = useCallback((rating: Rating) => {
    if (!card) return
    onRate(card.id, rating)
    setRated(true)
    setTimeout(() => {
      setRated(false)
      setFlipped(false)
      if (isLast) {
        onFinish()
      } else {
        setIndex(i => i + 1)
      }
    }, 300)
  }, [card, isLast, onRate, onFinish])

  const handleShuffle = useCallback(() => {
    setCards(shuffleArray(deck.cards))
    setIndex(0)
    setFlipped(false)
    setRated(false)
  }, [deck.cards])

  const handlePrev = useCallback(() => {
    if (index > 0) {
      setIndex(i => i - 1)
      setFlipped(false)
      setRated(false)
    }
  }, [index])

  const handleNext = useCallback(() => {
    if (!isLast) {
      setIndex(i => i + 1)
      setFlipped(false)
      setRated(false)
    }
  }, [isLast])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!flipped) handleFlip()
      }
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') {
        if (flipped) handleNext()
        else handleFlip()
      }
      if (flipped && !rated) {
        if (e.key === '1') handleRate('hard')
        if (e.key === '2') handleRate('good')
        if (e.key === '3') handleRate('easy')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, rated, handleFlip, handlePrev, handleNext, handleRate])

  if (!card) return null

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All decks
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Shuffle cards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <span className={`text-sm font-medium ${colors.text}`}>
            Card {index + 1} of {cards.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/[0.06] mb-8 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colors.accent}`}
          initial={false}
          animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="w-full max-w-xl cursor-pointer"
          style={{ perspective: '1200px' }}
          onClick={!rated ? handleFlip : undefined}
        >
          <motion.div
            className="relative w-full"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Front */}
            <div
              className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-8 sm:p-10 min-h-[280px] flex flex-col items-center justify-center text-center
                shadow-lg ${colors.glow}`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-5`}>
                {card.topic} · {card.difficulty}
              </span>
              <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                {card.front}
              </p>
              <p className="text-xs text-slate-600 mt-6">Tap to flip · Space / Enter</p>
            </div>

            {/* Back */}
            <div
              className={`absolute inset-0 rounded-2xl border ${colors.border} bg-[#0D1220] p-8 sm:p-10 min-h-[280px] flex flex-col items-center justify-center text-center
                shadow-lg ${colors.glow}`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-5`}>
                Answer
              </span>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed whitespace-pre-line">
                {card.back}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Rating buttons */}
        <AnimatePresence>
          {flipped && !rated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mt-8"
            >
              <button
                onClick={() => handleRate('hard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                <Frown className="w-4 h-4" />
                Hard
                <kbd className="ml-1 text-[10px] opacity-50">1</kbd>
              </button>
              <button
                onClick={() => handleRate('good')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <Check className="w-4 h-4" />
                Good
                <kbd className="ml-1 text-[10px] opacity-50">2</kbd>
              </button>
              <button
                onClick={() => handleRate('easy')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                <Flame className="w-4 h-4" />
                Easy
                <kbd className="ml-1 text-[10px] opacity-50">3</kbd>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={isLast}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────

function Summary({
  deck,
  progress,
  onBack,
  onRestart,
}: {
  deck: FlashcardDeck
  progress: ProgressMap
  onBack: () => void
  onRestart: () => void
}) {
  const mastery = getMastery(progress, deck.cards)
  const colors = sectionColors[deck.section] ?? sectionColors.quant
  const reviewed = mastery.easy + mastery.good + mastery.hard
  const pct = deck.cardCount > 0 ? Math.round((mastery.easy / deck.cardCount) * 100) : 0

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl border ${colors.border} bg-white/[0.02] p-8 sm:p-10 w-full shadow-lg ${colors.glow}`}
      >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.accent} flex items-center justify-center mx-auto mb-5`}>
          <BookOpen className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Deck Complete!</h2>
        <p className="text-slate-400 mb-8">{deck.name}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <div className="text-2xl font-bold text-emerald-400">{mastery.easy}</div>
            <div className="text-xs text-emerald-400/70 mt-1">Easy</div>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="text-2xl font-bold text-amber-400">{mastery.good}</div>
            <div className="text-xs text-amber-400/70 mt-1">Good</div>
          </div>
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
            <div className="text-2xl font-bold text-red-400">{mastery.hard}</div>
            <div className="text-xs text-red-400/70 mt-1">Hard</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>{reviewed} / {deck.cardCount} reviewed</span>
            <span>Mastery: {pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colors.accent}`}
              style={{ width: `${Math.round((reviewed / deck.cardCount) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] text-white hover:bg-white/[0.10] border border-white/[0.06] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Study Again
          </button>
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r ${colors.accent} text-white hover:brightness-110 transition-all`}
          >
            <Layers className="w-4 h-4" />
            All Decks
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [view, setView] = useState<View>('decks')
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null)
  const [progress, setProgress] = useState<ProgressMap>({})

  // Load progress from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  const handleSelectDeck = useCallback((deck: FlashcardDeck) => {
    setActiveDeck(deck)
    setView('study')
  }, [])

  const handleRate = useCallback((cardId: string, rating: Rating) => {
    setProgress(prev => {
      const next = { ...prev, [cardId]: { rating, reviewedAt: Date.now() } }
      saveProgress(next)
      return next
    })
  }, [])

  const handleBack = useCallback(() => {
    setView('decks')
    setActiveDeck(null)
  }, [])

  const handleFinish = useCallback(() => {
    setView('summary')
  }, [])

  const handleRestart = useCallback(() => {
    setView('study')
  }, [])

  return (
    <AnimatePresence mode="wait">
      {view === 'decks' && (
        <motion.div
          key="decks"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DeckGrid onSelect={handleSelectDeck} progress={progress} />
        </motion.div>
      )}

      {view === 'study' && activeDeck && (
        <motion.div
          key="study"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          <StudyMode
            deck={activeDeck}
            progress={progress}
            onRate={handleRate}
            onBack={handleBack}
            onFinish={handleFinish}
          />
        </motion.div>
      )}

      {view === 'summary' && activeDeck && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Summary
            deck={activeDeck}
            progress={progress}
            onBack={handleBack}
            onRestart={handleRestart}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

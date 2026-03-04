/**
 * Wellness Exercises Data & Types
 * 13 evidence-based breathing, grounding, meditation, and body exercises
 */

export type ExerciseCategory = 'breathing' | 'grounding' | 'meditation' | 'body'

export type PhaseAction = 'inhale' | 'exhale' | 'hold' | 'tense' | 'release' | 'tap' | 'rest'

export interface ExercisePhase {
  name: string // "Breathe In", "Hold", "Breathe Out", "Tense", "Release", "Tap Left", etc.
  duration: number // seconds
  action: PhaseAction
}

export interface SensoryPrompt {
  sense: string // "SEE", "TOUCH", "HEAR", "SMELL", "TASTE"
  count: number // 5, 4, 3, 2, 1
  prompt: string // "Name 5 things you can see around you right now"
  emoji: string // 👁, ✋, 👂, 👃, 👅
}

export interface Exercise {
  id: string // "box-breathing", "4-7-8", etc.
  name: string // "Box Breathing"
  category: ExerciseCategory
  phases: ExercisePhase[]
  cycles: number // how many times to repeat the phases
  color: string // hex color theme
  gradient: [string, string] // gradient colors for UI
  icon: string // emoji
  bestFor: string // "Anxiety, focus"
  difficulty: 'Beginner' | 'Intermediate'
  description: string // longer description for detail view
  sensoryPrompts?: SensoryPrompt[] // only for 5-4-3-2-1
  guidedPrompts?: string[] // text prompts for each cycle
}

// =========================
// BREATHING EXERCISES (4)
// =========================

export const boxBreathing: Exercise = {
  id: 'box-breathing',
  name: 'Box Breathing',
  category: 'breathing',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Hold', duration: 4, action: 'hold' },
    { name: 'Breathe Out', duration: 4, action: 'exhale' },
    { name: 'Hold', duration: 4, action: 'hold' },
  ],
  cycles: 4,
  color: '#6366F1',
  gradient: ['#6366F1', '#818CF8'],
  icon: '◻',
  bestFor: 'Anxiety, focus',
  difficulty: 'Beginner',
  description:
    'A foundational breathing technique used by Navy SEALs to stay calm under pressure. Equal counts of inhale, hold, exhale, hold create a rhythmic pattern that soothes the nervous system.',
}

export const breathing478: Exercise = {
  id: '4-7-8',
  name: '4-7-8 Breathing',
  category: 'breathing',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Hold', duration: 7, action: 'hold' },
    { name: 'Breathe Out', duration: 8, action: 'exhale' },
  ],
  cycles: 4,
  color: '#10B981',
  gradient: ['#10B981', '#34D399'],
  icon: '☾',
  bestFor: 'Sleep, relaxation',
  difficulty: 'Beginner',
  description:
    'Dr. Andrew Weil\'s natural tranquilizer for the nervous system. The extended exhale activates your parasympathetic nervous system, perfect for winding down before sleep.',
}

export const calmingBreath: Exercise = {
  id: 'calming-breath',
  name: 'Calming Breath',
  category: 'breathing',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Breathe Out', duration: 6, action: 'exhale' },
  ],
  cycles: 6,
  color: '#F59E0B',
  gradient: ['#F59E0B', '#FBBF24'],
  icon: '○',
  bestFor: 'Beginners, quick calm',
  difficulty: 'Beginner',
  description:
    'The simplest and most accessible breathing exercise. Longer exhales than inhales signal safety to your nervous system, creating an immediate sense of calm.',
}

export const energizingBreath: Exercise = {
  id: 'energizing-breath',
  name: 'Energizing Breath',
  category: 'breathing',
  phases: [
    { name: 'Sharp Inhale', duration: 2, action: 'inhale' },
    { name: 'Sharp Exhale', duration: 2, action: 'exhale' },
    { name: 'Deep Inhale', duration: 2, action: 'inhale' },
    { name: 'Long Exhale', duration: 4, action: 'exhale' },
  ],
  cycles: 5,
  color: '#EF4444',
  gradient: ['#EF4444', '#F87171'],
  icon: '⚡',
  bestFor: 'Energy, morning',
  difficulty: 'Intermediate',
  description:
    'A dynamic breathing pattern that wakes up your system without the jitters of caffeine. Quick breaths followed by a long exhale balance alertness with calm focus.',
}

// =========================
// GROUNDING EXERCISES (3)
// =========================

export const senses54321: Exercise = {
  id: '5-4-3-2-1',
  name: '5-4-3-2-1 Senses',
  category: 'grounding',
  phases: [
    { name: 'Breathe In', duration: 5, action: 'inhale' },
    { name: 'Breathe Out', duration: 5, action: 'exhale' },
  ],
  cycles: 5,
  color: '#EC4899',
  gradient: ['#EC4899', '#F472B6'],
  icon: '✦',
  bestFor: 'Panic, dissociation',
  difficulty: 'Beginner',
  description:
    'A powerful grounding technique that brings you back to the present moment through your five senses. Especially helpful during panic attacks or when feeling disconnected from reality.',
  sensoryPrompts: [
    {
      sense: 'SEE',
      count: 5,
      prompt: 'Name 5 things you can see around you right now',
      emoji: '👁',
    },
    {
      sense: 'TOUCH',
      count: 4,
      prompt: 'Name 4 things you can physically feel (your clothes, the chair, the ground)',
      emoji: '✋',
    },
    {
      sense: 'HEAR',
      count: 3,
      prompt: 'Name 3 sounds you can hear in this moment',
      emoji: '👂',
    },
    {
      sense: 'SMELL',
      count: 2,
      prompt: 'Name 2 things you can smell (or 2 smells you like)',
      emoji: '👃',
    },
    {
      sense: 'TASTE',
      count: 1,
      prompt: 'Name 1 thing you can taste (or one thing you\'re grateful for)',
      emoji: '👅',
    },
  ],
}

export const safePlace: Exercise = {
  id: 'safe-place',
  name: 'Safe Place',
  category: 'grounding',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Breathe Out', duration: 6, action: 'exhale' },
  ],
  cycles: 6,
  color: '#06B6D4',
  gradient: ['#06B6D4', '#22D3EE'],
  icon: '🏡',
  bestFor: 'PTSD, overwhelm',
  difficulty: 'Beginner',
  description:
    'A visualization technique used in trauma therapy. By imagining a place where you feel completely safe and calm, you can activate the same sense of peace in your body right now.',
  guidedPrompts: [
    'Picture a place where you feel completely safe... It could be real or imagined.',
    'Notice the details: What do you see? What colors surround you?',
    'What sounds are present in your safe place? Birds? Water? Silence?',
    'Feel the temperature. The comfort of this space.',
    'Know that you can return to this place anytime you need.',
    'Take one more breath, carrying this feeling of safety with you.',
  ],
}

export const bodyAnchor: Exercise = {
  id: 'body-anchor',
  name: 'Body Anchor',
  category: 'grounding',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Breathe Out', duration: 6, action: 'exhale' },
  ],
  cycles: 4,
  color: '#78716C',
  gradient: ['#78716C', '#A8A29E'],
  icon: '⚓',
  bestFor: 'Dissociation',
  difficulty: 'Beginner',
  description:
    'Use physical sensations as an anchor to the present moment. This technique helps when you feel disconnected or "floaty" by reconnecting you to your body.',
  guidedPrompts: [
    'Feel your feet on the ground. Press them down. Notice the connection.',
    'Feel your back against the chair (or your body against the surface beneath you).',
    'Clench your fists gently. Feel your fingernails against your palms.',
    'Roll your shoulders. Feel the movement. You are here, in this body, in this moment.',
  ],
}

// =========================
// MEDITATION EXERCISES (4)
// =========================

export const lovingKindness: Exercise = {
  id: 'loving-kindness',
  name: 'Loving Kindness',
  category: 'meditation',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Breathe Out', duration: 6, action: 'exhale' },
  ],
  cycles: 5,
  color: '#F472B6',
  gradient: ['#F472B6', '#FB7185'],
  icon: '💗',
  bestFor: 'Self-criticism',
  difficulty: 'Beginner',
  description:
    'A traditional Buddhist meditation adapted for modern times. Directing compassion toward yourself first can soften harsh self-judgment and build emotional resilience.',
  guidedPrompts: [
    'May I be safe.',
    'May I be peaceful.',
    'May I be healthy.',
    'May I live with ease.',
    'Extend this same kindness to someone you love... May they be safe, peaceful, healthy.',
  ],
}

export const bodyScan: Exercise = {
  id: 'body-scan',
  name: 'Body Scan',
  category: 'meditation',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Breathe Out', duration: 6, action: 'exhale' },
  ],
  cycles: 7,
  color: '#8B5CF6',
  gradient: ['#8B5CF6', '#A78BFA'],
  icon: '🫧',
  bestFor: 'Tension, awareness',
  difficulty: 'Intermediate',
  description:
    'A mindfulness practice that builds awareness of where you hold tension in your body. By noticing without judgment, you create space for natural release.',
  guidedPrompts: [
    'Bring awareness to your feet. Notice any sensations — warmth, coolness, tingling, or nothing at all.',
    'Move up to your calves and knees. Are they tense? Relaxed? Just notice.',
    'Feel your thighs, hips, and lower back. Observe without trying to change anything.',
    'Notice your belly rising and falling with your breath. Your chest. Your shoulders.',
    'Scan your arms, hands, and fingers. What sensations are present?',
    'Bring attention to your neck, jaw, and face. Many of us hold tension here.',
    'Finally, notice your whole body as one. Breathe into this awareness.',
  ],
}

export const leavesOnStream: Exercise = {
  id: 'leaves-on-stream',
  name: 'Leaves on a Stream',
  category: 'meditation',
  phases: [
    { name: 'Breathe In', duration: 4, action: 'inhale' },
    { name: 'Breathe Out', duration: 6, action: 'exhale' },
  ],
  cycles: 5,
  color: '#059669',
  gradient: ['#059669', '#10B981'],
  icon: '🍃',
  bestFor: 'Rumination',
  difficulty: 'Intermediate',
  description:
    'An ACT (Acceptance and Commitment Therapy) technique for defusing from repetitive thoughts. By placing thoughts on leaves and watching them float away, you create distance from mental loops.',
  guidedPrompts: [
    'Imagine a gentle stream. Leaves floating on the water, drifting by.',
    'Notice a thought. Any thought. Place it on a leaf and watch it float downstream.',
    'Another thought appears. Place it on a leaf. Let it drift away.',
    'Thoughts will keep coming — that\'s okay. Each one goes on a leaf, floating gently past you.',
    'You are not your thoughts. You are the observer, watching the stream.',
  ],
}

export const mountainMeditation: Exercise = {
  id: 'mountain-meditation',
  name: 'Mountain Meditation',
  category: 'meditation',
  phases: [
    { name: 'Breathe In', duration: 5, action: 'inhale' },
    { name: 'Breathe Out', duration: 5, action: 'exhale' },
  ],
  cycles: 5,
  color: '#6B7280',
  gradient: ['#6B7280', '#9CA3AF'],
  icon: '🏔',
  bestFor: 'Emotional storms',
  difficulty: 'Intermediate',
  description:
    'A visualization from mindfulness meditation. Like a mountain standing firm through all seasons and weather, you can remain grounded even as emotions and circumstances change around you.',
  guidedPrompts: [
    'Picture a mountain. Strong, stable, unchanging at its core.',
    'The weather changes around it — storms, sunshine, snow — but the mountain remains.',
    'You are like this mountain. Emotions may come and go like weather.',
    'But deep within, you remain grounded and steady.',
    'Breathe into this sense of inner stability.',
  ],
}

// =========================
// BODY EXERCISES (2)
// =========================

export const progressiveRelaxation: Exercise = {
  id: 'progressive-relaxation',
  name: 'Progressive Relaxation',
  category: 'body',
  phases: [
    { name: 'Tense', duration: 5, action: 'tense' },
    { name: 'Release', duration: 5, action: 'release' },
  ],
  cycles: 6,
  color: '#D946EF',
  gradient: ['#D946EF', '#E879F9'],
  icon: '💪',
  bestFor: 'Tension, insomnia',
  difficulty: 'Beginner',
  description:
    'A classic technique from the 1930s that\'s still used today. By intentionally tensing and then releasing muscle groups, you teach your body the difference between tension and relaxation.',
  guidedPrompts: [
    'Clench your fists tight. Hold... Now release. Feel the difference.',
    'Tense your arms and shoulders. Squeeze... Let go completely.',
    'Scrunch your face — forehead, eyes, jaw. Hold... Release and soften.',
    'Tighten your stomach muscles. Hold... Breathe out and let go.',
    'Press your thighs and calves together. Hold... Release.',
    'Curl your toes. Hold... Let them relax completely.',
  ],
}

export const butterflyHug: Exercise = {
  id: 'butterfly-hug',
  name: 'Butterfly Hug',
  category: 'body',
  phases: [
    { name: 'Tap Left', duration: 2, action: 'tap' },
    { name: 'Tap Right', duration: 2, action: 'tap' },
  ],
  cycles: 8,
  color: '#EC4899',
  gradient: ['#EC4899', '#F472B6'],
  icon: '🦋',
  bestFor: 'Trauma, self-soothing',
  difficulty: 'Beginner',
  description:
    'A bilateral stimulation technique from EMDR therapy, adapted for self-use. The alternating tapping activates both sides of your brain, promoting calm and emotional integration. Especially helpful after a triggering experience.',
  guidedPrompts: [
    'Cross your arms over your chest, hands on opposite shoulders, like giving yourself a hug.',
    'Gently tap your shoulders, alternating left and right, like butterfly wings.',
    'Continue the rhythm. Left, right, left, right. Slow and steady.',
    'Notice your breath. Notice any feelings. Just keep tapping gently.',
    'You are safe. You are here. You are taking care of yourself.',
    'Slow the tapping now. When you\'re ready, let your arms rest.',
    'Take a deep breath. Notice how you feel.',
    'You can return to this anytime you need comfort.',
  ],
}

// =========================
// ALL EXERCISES ARRAY
// =========================

export const ALL_EXERCISES: Exercise[] = [
  // Breathing
  boxBreathing,
  breathing478,
  calmingBreath,
  energizingBreath,
  // Grounding
  senses54321,
  safePlace,
  bodyAnchor,
  // Meditation
  lovingKindness,
  bodyScan,
  leavesOnStream,
  mountainMeditation,
  // Body
  progressiveRelaxation,
  butterflyHug,
]

// =========================
// HELPER FUNCTIONS
// =========================

export function getExerciseById(id: string): Exercise | undefined {
  return ALL_EXERCISES.find((ex) => ex.id === id)
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return ALL_EXERCISES.filter((ex) => ex.category === category)
}

export function getCategoryCount(category: ExerciseCategory): number {
  return getExercisesByCategory(category).length
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  breathing: 'Breathing',
  grounding: 'Grounding',
  meditation: 'Meditation',
  body: 'Body',
}

export const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  breathing: '🫁',
  grounding: '🌍',
  meditation: '🧘',
  body: '💪',
}

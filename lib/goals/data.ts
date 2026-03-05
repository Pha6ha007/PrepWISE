// Goal Categories Data
// Used across Goals system for consistent categorization

export interface GoalCategory {
  id: string
  label: string
  emoji: string
  color: string
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  { id: 'anxiety', label: 'Manage Anxiety', emoji: '🧘', color: '#6366F1' },
  { id: 'relationships', label: 'Better Relationships', emoji: '💕', color: '#EC4899' },
  { id: 'selfesteem', label: 'Self-Esteem', emoji: '💪', color: '#F59E0B' },
  { id: 'sleep', label: 'Sleep Better', emoji: '🌙', color: '#8B5CF6' },
  { id: 'stress', label: 'Stress Management', emoji: '🌿', color: '#10B981' },
  { id: 'communication', label: 'Communication', emoji: '💬', color: '#06B6D4' },
  { id: 'boundaries', label: 'Set Boundaries', emoji: '🛡', color: '#EF4444' },
  { id: 'grief', label: 'Process Grief', emoji: '🕊', color: '#6B7280' },
]

export function getCategoryById(id: string): GoalCategory {
  const category = GOAL_CATEGORIES.find((cat) => cat.id === id)
  // Fallback to a default category if not found
  return category || { id: 'general', label: 'General', emoji: '🎯', color: '#6366F1' }
}

export function getCategoryColor(categoryId: string): string {
  const category = getCategoryById(categoryId)
  return category.color
}

export function getCategoryEmoji(categoryId: string): string {
  const category = getCategoryById(categoryId)
  return category.emoji
}

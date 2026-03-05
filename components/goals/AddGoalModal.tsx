'use client'

// AddGoalModal — Modal for creating a new goal

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { GOAL_CATEGORIES } from '@/lib/goals/data'
import { Button } from '@/components/ui/button'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    category: string
    title: string
    description: string
    milestones: string[]
  }) => Promise<void>
}

export default function AddGoalModal({ isOpen, onClose, onSubmit }: AddGoalModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [milestones, setMilestones] = useState<string[]>([''])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !title) return

    setSubmitting(true)
    try {
      // Filter out empty milestones
      const validMilestones = milestones.filter((m) => m.trim().length > 0)

      await onSubmit({
        category: selectedCategory,
        title,
        description,
        milestones: validMilestones,
      })

      // Reset form
      setSelectedCategory(null)
      setTitle('')
      setDescription('')
      setMilestones([''])
      onClose()
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const addMilestone = () => {
    setMilestones([...milestones, ''])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, value: string) => {
    const updated = [...milestones]
    updated[index] = value
    setMilestones(updated)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Create New Goal
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-smooth"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Choose a category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {GOAL_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedCategory === category.id
                          ? 'border-opacity-100 shadow-card'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor:
                          selectedCategory === category.id ? category.color : undefined,
                        backgroundColor:
                          selectedCategory === category.id ? `${category.color}10` : undefined,
                      }}
                    >
                      <div className="text-3xl mb-2">{category.emoji}</div>
                      <div className="text-xs font-medium text-foreground text-center">
                        {category.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Goal title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Reduce daily anxiety"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-smooth"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to achieve..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-smooth resize-none"
                />
              </div>

              {/* Milestones */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Milestones (optional)
                </label>
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={milestone}
                        onChange={(e) => updateMilestone(index, e.target.value)}
                        placeholder={`Milestone ${index + 1}`}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-smooth"
                      />
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-smooth"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMilestone}
                  className="mt-3 flex items-center gap-2 text-sm text-[#6366F1] hover:text-[#4F46E5] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add milestone
                </button>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedCategory || !title || submitting}
                  className="bg-[#6366F1] hover:bg-[#4F46E5]"
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

'use client'

// GoalsTab — Main Goals tab with sub-tabs and content

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, BookOpen, Cloud, Plus, TrendingUp, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import GoalCard from './GoalCard'
import GoalDetail from './GoalDetail'
import HomeworkCard from './HomeworkCard'
import WordCloud from './WordCloud'
import AddGoalModal from './AddGoalModal'
import type { Goal, Milestone, Homework } from '@prisma/client'

type SubTab = 'goals' | 'homework' | 'topics'

interface GoalWithMilestones extends Goal {
  milestones: Milestone[]
  sessionCount?: number
}

export default function GoalsTab() {
  const [subTab, setSubTab] = useState<SubTab>('goals')
  const [goals, setGoals] = useState<GoalWithMilestones[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [wordCloud, setWordCloud] = useState<{ word: string; count: number }[]>([])
  const [selectedGoal, setSelectedGoal] = useState<GoalWithMilestones | null>(null)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch data on mount
  useEffect(() => {
    fetchGoals()
    fetchHomework()
    fetchWordCloud()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHomework = async () => {
    try {
      const response = await fetch('/api/homework')
      if (response.ok) {
        const data = await response.json()
        setHomework(data.homework || [])
      }
    } catch (error) {
      console.error('Failed to fetch homework:', error)
    }
  }

  const fetchWordCloud = async () => {
    try {
      const response = await fetch('/api/wordcloud?limit=15')
      if (response.ok) {
        const data = await response.json()
        setWordCloud(data.words || [])
      }
    } catch (error) {
      console.error('Failed to fetch word cloud:', error)
    }
  }

  const handleCreateGoal = async (data: {
    category: string
    title: string
    description: string
    milestones: string[]
  }) => {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      await fetchGoals()
    }
  }

  const handleMilestoneToggle = async (goalId: string, milestoneId: string, done: boolean) => {
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, milestoneDone: done }),
    })

    if (response.ok) {
      const data = await response.json()
      // Update selected goal
      setSelectedGoal(data.goal)
      // Update goals list
      setGoals((prev) => prev.map((g) => (g.id === goalId ? data.goal : g)))
    }
  }

  const handleHomeworkToggle = async (id: string, done: boolean) => {
    const response = await fetch(`/api/homework/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })

    if (response.ok) {
      await fetchHomework()
    }
  }

  // Calculate stats
  const activeGoals = goals.filter((g) => g.isActive).length
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0)
  const completedMilestones = goals.reduce(
    (sum, g) => sum + g.milestones.filter((m) => m.done).length,
    0
  )
  const totalSessions = goals.reduce((sum, g) => sum + (g.sessionCount || 0), 0)

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Active Goals</p>
              <Target className="w-5 h-5 text-[#6366F1]" />
            </div>
            <p className="text-3xl font-bold text-foreground">{activeGoals}</p>
          </CardContent>
        </Card>

        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Milestones Hit</p>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {completedMilestones}/{totalMilestones}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Sessions</p>
              <Calendar className="w-5 h-5 text-[#6366F1]" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalSessions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
        <CardContent className="p-8">
          {/* Tab headers */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSubTab('goals')
                  setSelectedGoal(null)
                }}
                className={`pb-4 px-4 font-medium transition-smooth border-b-2 ${
                  subTab === 'goals'
                    ? 'border-[#6366F1] text-[#6366F1]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Goals</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSubTab('homework')
                  setSelectedGoal(null)
                }}
                className={`pb-4 px-4 font-medium transition-smooth border-b-2 ${
                  subTab === 'homework'
                    ? 'border-[#6366F1] text-[#6366F1]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Homework</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSubTab('topics')
                  setSelectedGoal(null)
                }}
                className={`pb-4 px-4 font-medium transition-smooth border-b-2 ${
                  subTab === 'topics'
                    ? 'border-[#6366F1] text-[#6366F1]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>Top Topics</span>
                </div>
              </button>
            </div>

            {/* Add Goal button - only show on Goals tab */}
            {subTab === 'goals' && !selectedGoal && (
              <Button
                onClick={() => setShowAddGoalModal(true)}
                className="bg-[#6366F1] text-white hover:bg-[#4F46E5] rounded-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add goal
              </Button>
            )}
          </div>

          {/* Tab content */}
          <div className="min-h-[400px]">
            {/* Goals Tab */}
            {subTab === 'goals' && (
              <>
                {selectedGoal ? (
                  <GoalDetail
                    goal={selectedGoal}
                    onBack={() => setSelectedGoal(null)}
                    onMilestoneToggle={(milestoneId, done) =>
                      handleMilestoneToggle(selectedGoal.id, milestoneId, done)
                    }
                  />
                ) : (
                  <div>
                    {loading ? (
                      <p className="text-center text-muted-foreground py-16">Loading goals...</p>
                    ) : goals.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <Target className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                          Set your first goal
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Track your progress with goals and milestones
                        </p>
                        <Button
                          onClick={() => setShowAddGoalModal(true)}
                          className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white font-semibold hover:shadow-lg transition-all px-8 py-6 text-lg"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create a goal
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map((goal) => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            onClick={() => setSelectedGoal(goal)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Homework Tab */}
            {subTab === 'homework' && (
              <div>
                {homework.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                      No homework yet
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Alex will suggest exercises and tasks during your sessions
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {homework.map((hw) => (
                      <HomeworkCard
                        key={hw.id}
                        homework={hw}
                        onToggle={handleHomeworkToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Topics Tab */}
            {subTab === 'topics' && <WordCloud words={wordCloud} />}
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  )
}

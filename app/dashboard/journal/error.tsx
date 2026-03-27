'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="h-full flex items-center justify-center bg-[#0A0F1E]">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6 text-sm">
          {error.message || 'An unexpected error occurred. Your progress is safe.'}
        </p>
        <Button
          onClick={reset}
          className="bg-cyan-600 hover:bg-cyan-400 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  )
}

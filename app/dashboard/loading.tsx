import { Brain } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-[#0A0F1E]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-cyan-400" />
        </div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  )
}

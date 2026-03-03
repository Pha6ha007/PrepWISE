import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md">
        <CardHeader>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle>Chat Coming Soon</CardTitle>
          <CardDescription>
            Your AI companion will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Phase 1 — Week 1-2:</strong> Auth flow complete ✅
          </p>
          <p>
            <strong>Next up — Week 3-4:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>OpenAI/Groq AI integration</li>
            <li>RAG system (Pinecone)</li>
            <li>First agent: Anxiety Agent (CBT/ACT/DBT)</li>
            <li>Real-time chat interface</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

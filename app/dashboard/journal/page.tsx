import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Sparkles } from 'lucide-react'

export default function JournalPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md glass-button border border-white/20 shadow-large rounded-2xl hover-lift animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="font-serif text-3xl font-semibold text-foreground mb-2">
            Journal Coming Soon
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Your personal insights journal will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 bg-white/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-sm text-foreground">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>AI-generated insights from your conversations</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground">
              <Sparkles className="w-4 h-4 text-[#EC4899]" />
              <span>Track patterns and emotional growth</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span>Monthly PDF diary exports</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

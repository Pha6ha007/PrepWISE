import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Shield, Heart, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Confide</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI Emotional Support — Not Medical Service</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Someone who truly listens
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Confide is your AI companion for emotional support. Share your thoughts, explore your feelings, and grow — in a safe, judgment-free space.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6">
                  Start for free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Sign in
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Always Available</h3>
                <p className="text-gray-600 text-sm">
                  24/7 companion who remembers your story and adapts to your communication style.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Evidence-Based</h3>
                <p className="text-gray-600 text-sm">
                  Grounded in CBT, ACT, and DBT methodologies from real psychological literature.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Private & Secure</h3>
                <p className="text-gray-600 text-sm">
                  Your conversations are encrypted and never used for training. Your privacy matters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                <strong>Important:</strong> Confide is an AI companion for emotional support, not a medical service or replacement for professional therapy.
              </p>
              <p>
                © 2026 Confide. Built with Claude Code & Cursor.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

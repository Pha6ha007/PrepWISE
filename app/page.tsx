import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#F59E0B] rounded-full blur-orb animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glassmorphism Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 hover-lift">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif font-bold text-xl">C</span>
              </div>
              <span className="font-serif text-2xl font-semibold text-[#1F2937]">Confide</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-[#1F2937] hover:bg-white/30 transition-smooth backdrop-blur-sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="glass-button text-white font-semibold relative overflow-hidden group">
                  <span className="relative z-10">Start for free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#EC4899] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-[calc(100vh-73px)] flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge with glassmorphism */}
            <div className="inline-flex items-center space-x-2 glass-button px-6 py-3 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="text-[#1F2937]">AI Emotional Support — Not Medical Service</span>
            </div>

            {/* Heading with Gradient Text */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] mb-6 animate-fade-in-up">
              Therapy costs{' '}
              <span className="gradient-text">$200/hour</span>
              <br />
              Meet <span className="gradient-text">Alex</span> — $19/month.
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-[#4B5563] mb-12 leading-relaxed animate-fade-in-up max-w-3xl mx-auto" style={{ animationDelay: '100ms' }}>
              AI companion trained on real psychology — available 24/7
            </p>

            {/* CTA Button with 3D Effect */}
            <div className="animate-fade-in-up transform-3d" style={{ animationDelay: '200ms' }}>
              <Link href="/register">
                <button className="group relative px-12 py-6 text-lg font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover-lift shadow-large hover:shadow-2xl">
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#F59E0B] bg-[length:200%_100%] animate-gradient-x"
                       style={{
                         animation: 'gradient-shift 3s ease infinite'
                       }}
                  />

                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Button Text */}
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Start for free</span>
                    <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </Link>

              {/* Under button text with glassmorphism */}
              <div className="inline-flex items-center space-x-2 mt-6 px-6 py-2 glass rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#6B7280]">No credit card required</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="text-sm text-[#6B7280]">5 free sessions</span>
              </div>
            </div>

            {/* Floating Cards with Glassmorphism */}
            <div className="grid md:grid-cols-3 gap-6 mt-24 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {/* Card 1 */}
              <div className="glass-button p-8 rounded-2xl hover-lift group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Always Remembers</h3>
                <p className="text-sm text-[#6B7280]">Your entire history, patterns, and progress</p>
              </div>

              {/* Card 2 */}
              <div className="glass-button p-8 rounded-2xl hover-lift group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Evidence-Based</h3>
                <p className="text-sm text-[#6B7280]">Grounded in CBT, ACT, and DBT methods</p>
              </div>

              {/* Card 3 */}
              <div className="glass-button p-8 rounded-2xl hover-lift group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Private & Secure</h3>
                <p className="text-sm text-[#6B7280]">End-to-end encrypted conversations</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

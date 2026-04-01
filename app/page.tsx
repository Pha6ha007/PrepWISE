'use client'

import Link from 'next/link'
import { Brain, Mic, BarChart3, BookOpen, Clock, Target, ArrowRight, Check, Zap, Shield } from 'lucide-react'
import { PaddleCheckout } from '@/components/billing/PaddleCheckout'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] backdrop-blur-sm sticky top-0 z-50 bg-[#0A0F1E]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-[#0A0F1E]" />
            </div>
            <span className="text-lg font-bold tracking-tight">Prepwise</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Blog
            </Link>
            <Link href="/resources" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Resources
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-sm !px-5 !py-2.5 inline-flex items-center gap-1.5">
              Try 7 days free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-powered GMAT preparation
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            Your AI <span className="gradient-text">GMAT tutor</span>
            <br />
            that remembers
            <br />
            <span className="gradient-text-amber">everything</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Talk to Sam — an AI tutor who knows every GMAT topic, remembers
            your weak spots, and adapts every session to help you score 700+.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">
              Try 7 days free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base">
              Log in
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-cyan-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-cyan-500" /> 7-day free trial</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-cyan-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why students choose <span className="gradient-text">Prepwise</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            The only GMAT tutor that combines voice, memory, and real test content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Mic className="w-5 h-5" />}
            title="Voice conversations"
            description="Talk to Sam like a real tutor. Ask questions, work through problems, and get instant feedback — all by voice."
            gradient="from-cyan-500/20 to-cyan-500/5"
          />
          <FeatureCard
            icon={<Brain className="w-5 h-5" />}
            title="Long-term memory"
            description="Sam remembers your weak topics, learning style, and past mistakes. Every session builds on the last."
            gradient="from-violet-500/20 to-violet-500/5"
          />
          <FeatureCard
            icon={<BookOpen className="w-5 h-5" />}
            title="Official GMAT content"
            description="Powered by RAG over official GMAT guides. Every explanation is grounded in real test material."
            gradient="from-amber-500/20 to-amber-500/5"
          />
          <FeatureCard
            icon={<Target className="w-5 h-5" />}
            title="All 5 sections"
            description="Quant, Verbal, Data Insights, Analytical Writing, and Strategy — one tutor covers everything."
            gradient="from-emerald-500/20 to-emerald-500/5"
          />
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Progress tracking"
            description="See your accuracy by topic, track mastery levels, and identify exactly where to focus."
            gradient="from-rose-500/20 to-rose-500/5"
          />
          <FeatureCard
            icon={<Clock className="w-5 h-5" />}
            title="Available 24/7"
            description="No scheduling, no $200/hr fees. Practice at 2am or during lunch. Sam is always ready."
            gradient="from-sky-500/20 to-sky-500/5"
          />
        </div>
      </section>

      {/* Sam in action — живые сценарии */}
      <section className="border-t border-white/[0.06] bg-[#0D1220]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm font-medium mb-6">
              <Brain className="w-3.5 h-3.5" />
              Sam thinks like a real tutor
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Not a chatbot.{' '}
              <span className="gradient-text-amber">A tutor who remembers you.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every other GMAT tool treats you like a stranger on every visit.
              Sam carries your entire learning history into every session.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            <SamScenario
              tag="Before each question"
              tagColor="cyan"
              samLine="You've missed the last 4 DS questions by combining statements too early. This one — test Statement 1 alone first."
              caption="Sam spots your pattern before you repeat the mistake."
            />
            <SamScenario
              tag="After a wrong answer"
              tagColor="violet"
              samLine="You picked C. Walk me through your thinking — where did the logic go?"
              caption="Sam finds the exact moment your reasoning broke down, not just the wrong answer."
            />
            <SamScenario
              tag="Weekly check-in"
              tagColor="cyan"
              samLine="Your DS accuracy went from 47% to 68% this week — that's real. RC timing is still your biggest drag: 2:40/question vs 1:57 target. That's where we focus next."
              caption="Honest, specific, actionable — not a dashboard screenshot."
            />
            <SamScenario
              tag="5 days before your exam"
              tagColor="amber"
              samLine="Stop. You don't need to relearn everything. Your DS process works when you follow it — 85% when you do. Today: 30 min on RC pacing, then rest."
              caption="Pre-exam mode kicks in automatically when your test date is near."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/[0.06] bg-[#0D1220]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How it <span className="gradient-text">works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Tell Sam your goals"
              description="Share your target score, test date, and weak areas. Sam creates a personalized study plan."
            />
            <StepCard
              number="02"
              title="Practice by voice or text"
              description="Work through GMAT problems with real-time explanations. Sam adapts difficulty as you improve."
            />
            <StepCard
              number="03"
              title="Track and improve"
              description="Watch your accuracy climb across all sections. Sam focuses each session on your biggest gaps."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pricing</h2>
          <p className="text-slate-400 text-lg">5–10× cheaper than a human GMAT tutor</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Starter */}
          <PricingCard
            name="Starter"
            price={39}
            trial="7-day free trial"
            features={['20 voice sessions/month', 'Quant + Verbal practice', 'Progress tracking', 'Session memory', '5,600+ practice questions']}
            productId={process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STARTER || ''}
          />

          {/* Pro — highlighted */}
          <PricingCard
            name="Pro"
            price={79}
            trial="7-day free trial"
            popular
            features={['Unlimited voice sessions', 'All 3 GMAT sections', 'Adaptive mock tests', 'Smart review (spaced repetition)', 'Detailed analytics & error analysis', 'Data Insights + DS coverage']}
            productId={process.env.NEXT_PUBLIC_PADDLE_PRODUCT_PRO || ''}
          />

          {/* Intensive */}
          <PricingCard
            name="Intensive"
            price={149}
            trial="7-day free trial"
            features={['Everything in Pro', 'Personalized study plan', 'Full mock tests with score reports', 'Score prediction & percentile', 'Priority support', 'Audio explanations by Sam']}
            productId={process.env.NEXT_PUBLIC_PADDLE_PRODUCT_INTENSIVE || ''}
          />
        </div>

        {/* Score Guarantee link */}
        <div className="text-center mt-8">
          <Link
            href="/guarantee"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <Check className="w-4 h-4" />
            +70 Point Score Guarantee
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-[#0D1220]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">score 700+</span>?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Start your free trial today. No credit card required.
          </p>
          <Link href="/register" className="btn-primary text-lg inline-flex items-center gap-2">
            Try 7 days free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[#0A0F1E]" />
              </div>
              <span className="font-semibold">Prepwise</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
              <Link href="/resources" className="hover:text-slate-300 transition-colors">Resources</Link>
              <Link href="/guarantee" className="hover:text-slate-300 transition-colors">Guarantee</Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund</Link>
            </div>
            <p className="text-xs text-slate-600">
              © 2026 SamiWISE. AI-Powered GMAT Tutor.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Components ──────────────────────────────────────────────

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode; title: string; description: string; gradient: string
}) {
  return (
    <div className="glass-card glow-border p-6 group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-cyan-400`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: {
  number: string; title: string; description: string
}) {
  return (
    <div className="text-center md:text-left">
      <div className="text-5xl font-bold gradient-text mb-4 opacity-60">{number}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

function SamScenario({ tag, tagColor, samLine, caption }: {
  tag: string
  tagColor: 'cyan' | 'violet' | 'amber'
  samLine: string
  caption: string
}) {
  const tagStyles: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }
  const dotStyles: Record<string, string> = {
    cyan: 'bg-cyan-400',
    violet: 'bg-violet-400',
    amber: 'bg-amber-400',
  }
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      {/* Tag */}
      <span className={`self-start text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${tagStyles[tagColor]}`}>
        {tag}
      </span>

      {/* Sam's message bubble */}
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${dotStyles[tagColor]} bg-opacity-20 border border-current`}>
          <Brain className="w-3.5 h-3.5" />
        </div>
        <div className="bg-[#0F1A2E] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
          <p className="text-xs text-slate-500 font-medium mb-1">Sam</p>
          <p className="text-sm text-slate-200 leading-relaxed italic">&ldquo;{samLine}&rdquo;</p>
        </div>
      </div>

      {/* Caption */}
      <p className="text-xs text-slate-500 leading-relaxed pl-10">{caption}</p>
    </div>
  )
}
function PricingCard({ name, price, trial, features, popular, productId }: {
  name: string; price: number; trial: string; features: string[]
  popular?: boolean; productId: string
}) {
  return (
    <div className={`glass-card p-7 relative ${
      popular ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/10' : ''
    }`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0A0F1E] text-xs px-3 py-1 rounded-full font-semibold">
          Most popular
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <div className="text-4xl font-bold mb-1">
        ${price}<span className="text-lg font-normal text-slate-500">/mo</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">{trial}</p>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <PaddleCheckout
        productId={productId}
        planName={name}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          popular
            ? 'btn-primary !px-0'
            : 'bg-[#1E293B] hover:bg-[#283244] text-white border border-[#283244]'
        }`}
      >
        Start free trial
      </PaddleCheckout>
    </div>
  )
}

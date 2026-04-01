import Link from 'next/link'
import {
  Brain,
  ArrowRight,
  Check,
  Shield,
  Clock,
  BookOpen,
  Target,
  FileText,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

// ── FAQ Data ───────────────────────────────────────────────

const faqs = [
  {
    q: 'What counts as a practice session?',
    a: 'Any session where you complete at least 10 practice questions in a single sitting. Sessions are automatically tracked in your PrepWISE dashboard.',
  },
  {
    q: 'What if I already scored high?',
    a: 'The guarantee is based on improvement from your initial PrepWISE diagnostic score. If your diagnostic is above 735, the guarantee becomes +30 points (since there\'s less room to improve at the top).',
  },
  {
    q: 'How do I submit my scores?',
    a: 'Email support@samiwise.app with a screenshot of your official GMAT score report (before and after). We verify with GMAC\'s score reporting service.',
  },
  {
    q: 'What if I don\'t take the GMAT within 3 months?',
    a: 'The guarantee requires taking the official GMAT within 3 months of your PrepWISE start date. If you need more time, contact us — we evaluate extensions on a case-by-case basis.',
  },
  {
    q: 'Does the guarantee apply to all plans?',
    a: 'Yes, the +70 point guarantee applies to all paid plans (Starter, Pro, and Intensive). Free trial users must convert to a paid plan to be eligible.',
  },
  {
    q: 'How long does the refund take?',
    a: 'Refunds are processed within 10 business days of score verification. You\'ll receive the full amount paid for your subscription.',
  },
]

// ── Components ─────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-white/[0.06] last:border-0">
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-left">
        <span className="text-sm sm:text-base font-medium text-white group-open:text-cyan-400 transition-colors">
          {q}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="text-sm text-slate-400 leading-relaxed pb-5 pr-8">
        {a}
      </p>
    </details>
  )
}

// ── Conditions ─────────────────────────────────────────────

const conditions = [
  { icon: Target, text: 'Complete the initial diagnostic test' },
  { icon: Clock, text: 'Follow the study plan for at least 4 weeks' },
  { icon: BookOpen, text: 'Complete 20+ practice sessions (minimum 200 questions)' },
  { icon: FileText, text: 'Take 3+ full mock tests' },
  { icon: Clock, text: 'Study for at least 30 hours total' },
  { icon: Target, text: 'Take the official GMAT within 3 months of starting PrepWISE' },
  { icon: FileText, text: 'Share your before/after official GMAT scores' },
]

// ── Page ───────────────────────────────────────────────────

export default function GuaranteePage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] backdrop-blur-sm sticky top-0 z-50 bg-[#0A0F1E]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#0A0F1E]" />
            </div>
            <span className="text-lg font-bold tracking-tight">SamiWISE</span>
          </Link>
          <div className="flex items-center gap-3">
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
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/3 w-80 h-80 bg-emerald-500/8 rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium mb-8">
            <Shield className="w-3.5 h-3.5" />
            Score Guarantee
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              +70 Points
            </span>
            <br />
            or Your Money Back
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            We&apos;re so confident in PrepWISE that we guarantee your GMAT score improves
            by at least 70 points — or we refund your subscription in full.
          </p>

          <Link
            href="/register"
            className="btn-primary text-base inline-flex items-center gap-2"
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-white/[0.06] bg-[#0D1220]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How the <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">guarantee</span> works
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Follow the study program, take the test, and if your score
              doesn&apos;t improve by 70+ points, you get a full refund.
            </p>
          </div>

          {/* Conditions */}
          <div className="space-y-3 max-w-2xl mx-auto">
            {conditions.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Step {i + 1}</span>
                  <p className="text-sm text-slate-200 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Promise */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 sm:p-10 text-center">
            <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              The PrepWISE Promise
            </h3>
            <p className="text-slate-300 leading-relaxed max-w-xl mx-auto mb-6">
              If your GMAT score doesn&apos;t improve by at least 70 points after completing
              the program requirements above, we&apos;ll refund your subscription in full.
              No questions asked, no fine print.
            </p>
            <p className="text-sm text-slate-500">
              Applies to all paid plans · Refund processed within 10 business days
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.06] bg-[#0D1220]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-slate-400 mb-4">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Common questions</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 divide-white/[0.06]">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">guarantee</span> your score?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Start your 7-day free trial. No credit card required.
          </p>
          <Link
            href="/register"
            className="btn-primary text-lg inline-flex items-center gap-2"
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
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
              <span className="font-semibold">SamiWISE</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
              <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund</Link>
            </div>
            <p className="text-xs text-slate-600">
              © 2026 SamiWISE. AI GMAT Tutor.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

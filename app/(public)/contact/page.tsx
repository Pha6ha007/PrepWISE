'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'

type InvestmentRange = '<$50K' | '$50-200K' | '$200K-1M' | '$1M+'
type PartnershipType = 'Content' | 'Technology' | 'Marketing' | 'Distribution' | 'Other'

export default function ContactPage() {
  // Investor Form
  const [investorForm, setInvestorForm] = useState({
    name: '',
    email: '',
    company: '',
    investmentRange: '' as InvestmentRange | '',
    message: '',
  })
  const [investorLoading, setInvestorLoading] = useState(false)

  // Partner Form
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    company: '',
    partnershipType: '' as PartnershipType | '',
    message: '',
  })
  const [partnerLoading, setPartnerLoading] = useState(false)

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInvestorLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...investorForm,
          type: 'investor',
        }),
      })

      if (!res.ok) throw new Error('Failed to send inquiry')

      toast.success('Investment inquiry sent! We\'ll respond within 48 hours.')
      setInvestorForm({ name: '', email: '', company: '', investmentRange: '', message: '' })
    } catch {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      setTimeout(() => setInvestorLoading(false), 5000)
    }
  }

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPartnerLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...partnerForm,
          type: 'partnership',
        }),
      })

      if (!res.ok) throw new Error('Failed to send inquiry')

      toast.success('Partnership inquiry sent! We\'ll review and respond within 48 hours.')
      setPartnerForm({ name: '', email: '', company: '', partnershipType: '', message: '' })
    } catch {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      setTimeout(() => setPartnerLoading(false), 5000)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50'
  const labelCls = 'text-sm font-medium text-slate-300 mb-1.5 block'
  const selectCls = `${inputCls} appearance-none cursor-pointer`

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">🧠 PrepWISE</Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/register"
              className="text-sm bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start for free
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Interested in investing or partnering with PrepWISE? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Support note */}
        <div className="flex items-center justify-center gap-2 mb-14 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 max-w-xl mx-auto">
          <MessageCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <p className="text-sm text-slate-400">
            For product support, use the chat widget in the bottom-right corner of any page.
          </p>
        </div>

        {/* Two-column forms */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Investor Form */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8">
            <div className="mb-6">
              <span className="inline-block text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3">
                For Investors
              </span>
              <h2 className="text-xl font-bold text-white mb-1">Investment Inquiry</h2>
              <p className="text-sm text-slate-500">Interested in investing in the future of AI-powered education?</p>
            </div>

            <form onSubmit={handleInvestorSubmit} className="space-y-4">
              <div>
                <label htmlFor="inv-name" className={labelCls}>Name</label>
                <input
                  id="inv-name"
                  type="text"
                  required
                  value={investorForm.name}
                  onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="inv-email" className={labelCls}>Email</label>
                <input
                  id="inv-email"
                  type="email"
                  required
                  value={investorForm.email}
                  onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })}
                  placeholder="you@fund.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="inv-company" className={labelCls}>Company / Fund</label>
                <input
                  id="inv-company"
                  type="text"
                  required
                  value={investorForm.company}
                  onChange={(e) => setInvestorForm({ ...investorForm, company: e.target.value })}
                  placeholder="Your firm or fund"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="inv-range" className={labelCls}>Investment Range</label>
                <select
                  id="inv-range"
                  required
                  value={investorForm.investmentRange}
                  onChange={(e) => setInvestorForm({ ...investorForm, investmentRange: e.target.value as InvestmentRange })}
                  className={selectCls}
                >
                  <option value="" disabled>Select range</option>
                  <option value="<$50K">&lt;$50K</option>
                  <option value="$50-200K">$50–200K</option>
                  <option value="$200K-1M">$200K–1M</option>
                  <option value="$1M+">$1M+</option>
                </select>
              </div>

              <div>
                <label htmlFor="inv-message" className={labelCls}>Message</label>
                <textarea
                  id="inv-message"
                  required
                  rows={4}
                  value={investorForm.message}
                  onChange={(e) => setInvestorForm({ ...investorForm, message: e.target.value })}
                  placeholder="Tell us about your interest..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={investorLoading}
                className="w-full px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {investorLoading ? 'Sending...' : 'Submit Investment Inquiry'}
              </button>
            </form>
          </div>

          {/* Partner Form */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8">
            <div className="mb-6">
              <span className="inline-block text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full mb-3">
                For Partners
              </span>
              <h2 className="text-xl font-bold text-white mb-1">Partnership &amp; Collaboration</h2>
              <p className="text-sm text-slate-500">Let&apos;s build something great together.</p>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              <div>
                <label htmlFor="ptr-name" className={labelCls}>Name</label>
                <input
                  id="ptr-name"
                  type="text"
                  required
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="ptr-email" className={labelCls}>Email</label>
                <input
                  id="ptr-email"
                  type="email"
                  required
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                  placeholder="you@company.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="ptr-company" className={labelCls}>Company / Organization</label>
                <input
                  id="ptr-company"
                  type="text"
                  required
                  value={partnerForm.company}
                  onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                  placeholder="Acme Inc."
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="ptr-type" className={labelCls}>Partnership Type</label>
                <select
                  id="ptr-type"
                  required
                  value={partnerForm.partnershipType}
                  onChange={(e) => setPartnerForm({ ...partnerForm, partnershipType: e.target.value as PartnershipType })}
                  className={selectCls}
                >
                  <option value="" disabled>Select type</option>
                  <option value="Content">Content</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="ptr-message" className={labelCls}>Message</label>
                <textarea
                  id="ptr-message"
                  required
                  rows={4}
                  value={partnerForm.message}
                  onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                  placeholder="What would you like to collaborate on?"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={partnerLoading}
                className="w-full px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {partnerLoading ? 'Sending...' : 'Submit Partnership Inquiry'}
              </button>
            </form>
          </div>
        </div>

        {/* Direct email fallback */}
        <p className="text-center text-sm text-slate-600 mt-8">
          Prefer email? Reach us at{' '}
          <a href="mailto:hello@samiwise.app" className="text-cyan-400 hover:underline">
            hello@samiwise.app
          </a>
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 SamiWISE. AI-Powered GMAT Tutor.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <Link href="/resources" className="hover:text-slate-300 transition-colors">Resources</Link>
            <Link href="/guarantee" className="hover:text-slate-300 transition-colors">Guarantee</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

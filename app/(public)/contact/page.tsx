'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ContactPage() {
  // General Contact Form
  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [generalLoading, setGeneralLoading] = useState(false)

  // Partnership Form
  const [partnershipForm, setPartnershipForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    partnershipType: 'corporate' as 'corporate' | 'research' | 'other',
    message: '',
  })
  const [partnershipLoading, setPartnershipLoading] = useState(false)

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generalForm,
          type: 'general',
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setGeneralForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      // Anti-spam: disable button for 5 seconds
      setTimeout(() => setGeneralLoading(false), 5000)
    }
  }

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPartnershipLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...partnershipForm,
          type: 'partnership',
        }),
      })

      if (!res.ok) throw new Error('Failed to send inquiry')

      toast.success('Partnership inquiry sent! We\'ll review and respond within 48 hours.')
      setPartnershipForm({
        name: '',
        email: '',
        company: '',
        role: '',
        partnershipType: 'corporate',
        message: '',
      })
    } catch {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      // Anti-spam: disable button for 5 seconds
      setTimeout(() => setPartnershipLoading(false), 5000)
    }
  }

  const partnershipTypes = [
    { value: 'corporate' as const, label: 'Corporate License', icon: '🏢' },
    { value: 'research' as const, label: 'Research Collaboration', icon: '🔬' },
    { value: 'other' as const, label: 'Other', icon: '👥' },
  ]

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
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Have questions? Want to collaborate? We&apos;d love to hear from you.
          </p>
        </div>

        {/* General Contact Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {/* Left: Contact Info */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
              <a href="mailto:hello@prepwise.app" className="text-cyan-400 hover:underline text-sm">
                hello@prepwise.app
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Response Time</h3>
              <p className="text-slate-400 text-sm">Within 24 hours</p>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-sm text-slate-500">
                We read every message personally. Whether you have a question, feedback, or just want to say hi — we&apos;re here.
              </p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-2 bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8">
            <form onSubmit={handleGeneralSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-slate-300 mb-1.5 block">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-300 mb-1.5 block">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Subject (Optional)
                </label>
                <input
                  id="subject"
                  type="text"
                  value={generalForm.subject}
                  onChange={(e) => setGeneralForm({ ...generalForm, subject: e.target.value })}
                  placeholder="What is this about?"
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={generalForm.message}
                  onChange={(e) => setGeneralForm({ ...generalForm, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={generalLoading}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {generalLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Partnership Section */}
        <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full mb-3">
              For Organizations
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Partnership &amp; Collaboration
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Interested in bringing PrepWISE to your organization or collaborating on research?
            </p>
          </div>

          <form onSubmit={handlePartnershipSubmit} className="space-y-5 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="p-name" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Name
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  value={partnershipForm.name}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label htmlFor="p-email" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Email
                </label>
                <input
                  id="p-email"
                  type="email"
                  required
                  value={partnershipForm.email}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="company" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Company / Organization
                </label>
                <input
                  id="company"
                  type="text"
                  required
                  value={partnershipForm.company}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label htmlFor="role" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Your Role
                </label>
                <input
                  id="role"
                  type="text"
                  required
                  value={partnershipForm.role}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, role: e.target.value })}
                  placeholder="CEO, HR Manager, etc."
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">Partnership Type</label>
              <div className="grid md:grid-cols-3 gap-3">
                {partnershipTypes.map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPartnershipForm({ ...partnershipForm, partnershipType: value })}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      partnershipForm.partnershipType === value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/[0.06] bg-[#0A0F1C] hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{icon}</span>
                    <span className={`text-sm font-medium ${
                      partnershipForm.partnershipType === value ? 'text-cyan-400' : 'text-slate-300'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="p-message" className="text-sm font-medium text-slate-300 mb-1.5 block">
                Tell us about your inquiry
              </label>
              <textarea
                id="p-message"
                required
                rows={5}
                value={partnershipForm.message}
                onChange={(e) => setPartnershipForm({ ...partnershipForm, message: e.target.value })}
                placeholder="What would you like to collaborate on?"
                className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-white/[0.06] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={partnershipLoading}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {partnershipLoading ? 'Submitting...' : 'Submit Partnership Inquiry'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 PrepWISE. AI-Powered GMAT Tutor.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

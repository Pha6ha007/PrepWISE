import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — SamiWISE',
  description: 'Refund policy for SamiWISE subscriptions.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">🧠 SamiWISE</Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to home</Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Refund Policy</h1>
          <p className="text-sm text-slate-500 mt-2">Last updated: April 17, 2026</p>
        </div>

        <div className="space-y-8">
          {/* Money-back guarantee */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you are not satisfied with your SamiWISE subscription for any reason, you may request a full refund within <strong className="text-white">30 days of your purchase</strong>. No questions asked.
            </p>
            <p className="text-slate-300 leading-relaxed">
              To request a refund, email us at{' '}
              <a href="mailto:hello@samiwise.app" className="text-cyan-400 hover:underline">
                hello@samiwise.app
              </a>{' '}
              with the subject line &quot;Refund Request&quot; and include your account email address. We will process your request promptly.
            </p>
          </div>

          {/* Paddle */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-4">Payment Processing</h2>
            <p className="text-slate-300 leading-relaxed">
              All payments and refunds are securely handled by <strong className="text-white">Paddle</strong>, our Merchant of Record. Once your refund is approved, Paddle will return the funds to your original payment method. Processing times depend on your bank or payment provider.
            </p>
          </div>

          {/* Cancellations */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-4">Cancellations</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              You can cancel your subscription at any time from your <strong className="text-white">Account Settings</strong>. When you cancel:
            </p>
            <ul className="space-y-1.5 text-slate-300 ml-2">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>You will retain access until the end of your current billing period</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Your subscription will not renew automatically</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>No cancellation fees — ever</span>
              </li>
            </ul>
          </div>

          {/* Contact CTA */}
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 text-center">
            <h3 className="font-semibold text-white mb-2">Questions About Refunds?</h3>
            <p className="text-slate-400 text-sm mb-4">
              We&apos;re here to help. Reach out and we&apos;ll respond within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 SamiWISE. AI-Powered GMAT Tutor.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

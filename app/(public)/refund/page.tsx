import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — SamiWISE',
  description: 'Fair, transparent, and hassle-free refund policy for SamiWISE subscriptions.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">🧠 PrepWISE</Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to home</Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Refund Policy</h1>
          <p className="text-slate-400">Fair, transparent, and hassle-free</p>
          <p className="text-sm text-slate-500 mt-2">Last updated: March 2026</p>
        </div>

        {/* Intro */}
        <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8 mb-8">
          <p className="text-slate-300 leading-relaxed">
            We want you to feel confident trying PrepWISE. All paid plans include a <strong className="text-white">7-day free trial</strong>, so you can explore the full experience before being charged. Beyond that, we offer a straightforward 14-day money-back guarantee on your first payment. If PrepWISE isn&apos;t right for you, we&apos;ll make it right — no questions asked.
          </p>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-semibold text-white mb-2">14-Day Money-Back Guarantee</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Try any paid PrepWISE plan risk-free for 14 days after your first charge. If you&apos;re not satisfied for any reason, we&apos;ll issue a full refund.
            </p>
          </div>

          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-semibold text-white mb-2">Processed by Dodo Payments</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              All payments and refunds are securely handled by Dodo Payments, our Merchant of Record. You&apos;ll receive your refund directly from them.
            </p>
          </div>
        </div>

        {/* Detailed Policy */}
        <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-8">How It Works</h2>

          <div className="space-y-8">
            {/* Eligible */}
            <div>
              <h3 className="font-semibold text-white mb-3">Eligible for Refunds</h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                You can request a full refund within <strong className="text-white">14 days of your first payment</strong> for:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 text-slate-300">
                <li>Starter plan ($39/month)</li>
                <li>Pro plan ($79/month)</li>
                <li>Intensive plan ($149/month)</li>
              </ul>
              <p className="text-slate-400 text-sm mt-3">
                <strong className="text-slate-300">Note:</strong> The 14-day guarantee applies to your first payment only. Renewal payments are not eligible for refunds unless there was a billing error.
              </p>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Processing */}
            <div>
              <h3 className="font-semibold text-white mb-3">Processing Time</h3>
              <p className="text-slate-300 leading-relaxed">
                Once approved, refunds are processed by Dodo Payments within <strong className="text-white">5–10 business days</strong>. The exact timing depends on your payment method and bank.
              </p>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Not Eligible */}
            <div>
              <h3 className="font-semibold text-white mb-3">Not Eligible for Refunds</h3>
              <ul className="space-y-2 text-slate-300 ml-2">
                <li className="flex items-start">
                  <span className="text-slate-500 mr-2">•</span>
                  <span><strong className="text-white">Partial refunds:</strong> We don&apos;t offer prorated refunds for partial use of a billing period. If you cancel mid-month, you&apos;ll retain access until the end of your billing cycle.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-500 mr-2">•</span>
                  <span><strong className="text-white">Free trial period:</strong> Since all plans include a 7-day free trial, you can evaluate the product before any charge is made.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-500 mr-2">•</span>
                  <span><strong className="text-white">Terms violations:</strong> Accounts suspended for violating our Terms of Service are not eligible for refunds.</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* How to */}
            <div>
              <h3 className="font-semibold text-white mb-3">How to Request a Refund</h3>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-slate-300">
                <li>
                  Email us at{' '}
                  <a href="mailto:hello@samiwise.app" className="text-cyan-400 hover:underline">
                    hello@samiwise.app
                  </a>{' '}
                  with the subject line &quot;Refund Request&quot;
                </li>
                <li>Include your account email address</li>
                <li>We&apos;ll process your request within 24 hours</li>
                <li>Dodo Payments will handle the refund to your original payment method</li>
              </ol>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Cancellations */}
            <div>
              <h3 className="font-semibold text-white mb-3">Cancellations</h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                You can cancel your subscription anytime from your <strong className="text-white">Account Settings</strong>. When you cancel:
              </p>
              <ul className="space-y-1.5 text-slate-300 ml-2">
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span>You&apos;ll retain access until the end of your current billing period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span>Your subscription won&apos;t renew automatically</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span>No cancellation fees — ever</span>
                </li>
              </ul>
            </div>
          </div>
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

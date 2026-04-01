import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — PrepWISE',
  description: 'How PrepWISE collects, uses, stores, and protects your personal information.',
}

export default function PrivacyPage() {
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: March 4, 2026</p>
        </div>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Introduction</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              <span className="font-semibold text-white">PrepWISE</span> is an AI-powered GMAT preparation platform. Sam is an AI tutor — not a human instructor. We take your privacy seriously and are committed to protecting your personal information.
            </p>
            <p className="text-slate-300 leading-relaxed">
              This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform.
            </p>
          </section>

          {/* What we collect */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">What Data We Collect</h2>
            <div className="space-y-3">
              {[
                { title: 'Account Information', desc: 'Your email address and account preferences' },
                { title: 'Conversation Data', desc: 'All your conversations with Sam (AI tutor), including text and voice recordings' },
                { title: 'Usage Analytics', desc: 'Practice scores, session frequency, and interaction patterns to improve your experience' },
                { title: 'Payment Information', desc: 'Processed securely by Dodo Payments (our payment processor) — we never store your credit card details' },
              ].map((item) => (
                <div key={item.title} className="bg-[#0D1220] border border-white/[0.06] rounded-lg p-4">
                  <h3 className="font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How we store data */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Store Your Data</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              Your data is stored securely using industry-standard encryption:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span><strong className="text-white">Supabase (PostgreSQL):</strong> Your account, conversations, and user profile</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span><strong className="text-white">Pinecone (Vector Database):</strong> Encrypted embeddings of your conversations for AI memory</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span><strong className="text-white">End-to-end encryption:</strong> Your conversations are encrypted in transit and at rest</span>
              </li>
            </ul>
          </section>

          {/* What we DON'T do */}
          <section>
            <div className="bg-[#0D1220] border border-emerald-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">What We DON&apos;T Do</h2>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2 font-bold">✗</span>
                  <span>We <strong className="text-white">never</strong> sell your data to third parties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2 font-bold">✗</span>
                  <span>We <strong className="text-white">never</strong> use your conversations to train AI models (ours or third-party)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2 font-bold">✗</span>
                  <span>We <strong className="text-white">never</strong> share your conversations with anyone (except in legal emergencies)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2 font-bold">✗</span>
                  <span>We <strong className="text-white">never</strong> show you targeted ads based on your conversations</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Third-party services */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We use the following trusted third-party services to operate our platform:
            </p>
            <div className="space-y-3">
              {[
                { name: 'OpenAI', desc: 'Powers Sam (AI tutor). Your conversations are processed but not stored or used for training by OpenAI per our agreement.' },
                { name: 'ElevenLabs', desc: 'Generates voice responses. Audio is processed transiently and not stored by ElevenLabs.' },
                { name: 'PostHog', desc: 'Anonymous usage analytics (page views, clicks) to improve the platform — no conversation content.' },
                { name: 'Dodo Payments', desc: 'Payment processing. They handle billing, taxes, and subscriptions securely as our Merchant of Record.' },
              ].map((item) => (
                <div key={item.name} className="bg-[#0D1220] border border-white/[0.06] rounded-lg p-4">
                  <h3 className="font-medium text-white mb-1">{item.name}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Protection & Security */}
          <section>
            <div className="bg-[#0D1220] border border-amber-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-3">Data Protection &amp; Security</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                We protect your study data and personal information with industry-standard security measures:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">1.</span>
                  <span>All data encrypted in transit and at rest</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">2.</span>
                  <span>Log the event metadata (timestamp, user ID) <strong className="text-white">without storing the conversation content</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">3.</span>
                  <span>In extreme cases, we may contact emergency services if legally required</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Cookies &amp; Tracking</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              We use <strong className="text-white">only essential cookies</strong> required for the platform to function:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span><strong className="text-white">Authentication cookies:</strong> To keep you logged in securely</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>We <strong className="text-white">do not</strong> use advertising or tracking cookies</span>
              </li>
            </ul>
          </section>

          {/* Your rights */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Your Rights (GDPR Compliant)</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You have full control over your data:
            </p>
            <div className="space-y-3">
              {[
                { title: 'Right to Access', desc: 'Request a copy of all your data (conversations, profile, analytics)' },
                { title: 'Right to Deletion', desc: 'Delete your account and all associated data permanently at any time' },
                { title: 'Right to Portability', desc: 'Export your conversations in JSON or PDF format' },
                { title: 'Right to Correction', desc: 'Update or correct any personal information in your profile' },
              ].map((item) => (
                <div key={item.title} className="bg-[#0D1220] border border-white/[0.06] rounded-lg p-4">
                  <h3 className="font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data retention */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Retention</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Active accounts: Data stored indefinitely while you use the platform</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Deleted accounts: All data permanently deleted within 30 days</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Backups: Removed from backups within 90 days of deletion</span>
              </li>
            </ul>
          </section>

          {/* Children's privacy */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Children&apos;s Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              PrepWISE is <strong className="text-white">not intended for users under 18 years old</strong>. We do not knowingly collect data from minors. If you are a parent and believe your child has created an account, please contact us immediately at{' '}
              <a href="mailto:support@samiwise.app" className="text-cyan-400 hover:underline">support@samiwise.app</a>.
            </p>
          </section>

          {/* International users */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">International Users</h2>
            <p className="text-slate-300 leading-relaxed">
              PrepWISE is available globally. Your data is stored on secure servers in the United States and European Union (Supabase regions). By using our platform, you consent to this data transfer. We comply with GDPR (EU), CCPA (California), and other international privacy laws.
            </p>
          </section>

          {/* Changes to policy */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Significant changes will be communicated via email. Continued use of PrepWISE after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Questions about your privacy or this policy? We&apos;re here to help:
            </p>
            <div className="bg-[#0D1220] border border-white/[0.06] rounded-lg p-6">
              <p className="text-white font-medium mb-1">Privacy Team</p>
              <p className="text-slate-400">
                Email: <a href="mailto:support@samiwise.app" className="text-cyan-400 hover:underline">support@samiwise.app</a>
              </p>
            </div>
          </section>
        </div>

        {/* Back to home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#0D1220] border border-white/[0.06] rounded-lg text-white font-medium hover:bg-[#131a2e] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 PrepWISE. AI-Powered GMAT Tutor.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="text-cyan-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

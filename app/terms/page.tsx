import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — SamiWISE',
  description: 'Terms of Service for the SamiWISE AI-powered GMAT preparation platform.',
}


export default function TermsPage() {
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: April 17, 2026</p>
        </div>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <p className="text-slate-300 leading-relaxed mb-3">
              Welcome to <span className="font-semibold text-white">SamiWISE</span>, operated by <span className="font-semibold text-white">Pavel Haivaronski</span> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using our platform, you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
            </p>
            <p className="text-slate-300 leading-relaxed">
              If you do not agree to these Terms, you may not use SamiWISE.
            </p>
          </section>

          {/* Important Disclaimer */}
          <section>
            <div className="bg-[#0D1220] border border-amber-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-amber-400 mb-3">
                Important Disclaimer — Not a Substitute for Professional Tutoring
              </h2>
              <div className="space-y-3 text-slate-300">
                <p className="leading-relaxed">
                  <strong className="text-white">SamiWISE is an AI-powered GMAT preparation platform. Sam is an AI tutor — not a human instructor, not a licensed educator, and not a substitute for professional test preparation courses.</strong>
                </p>
                <p className="leading-relaxed">
                  Sam is an AI-powered GMAT tutoring agent designed to help you prepare for the GMAT Focus Edition exam. Sam is not a human tutor and cannot guarantee specific score improvements.
                </p>
                <p className="leading-relaxed font-semibold text-white">
                  SamiWISE does NOT:
                </p>
                <ul className="space-y-1.5 ml-4 text-slate-300">
                  <li className="flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    <span>Guarantee specific GMAT scores or admission outcomes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    <span>Replace professional tutoring, test preparation courses, or academic advising</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    <span>Provide medical, psychological, or clinical advice of any kind</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    <span>Act as a substitute for official GMAT preparation from GMAC</span>
                  </li>
                </ul>
                <p className="leading-relaxed text-sm text-slate-400">
                  For official GMAT preparation resources, visit{' '}
                  <a href="https://www.mba.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    mba.com
                  </a>{' '}
                  for official information from GMAC.
                </p>
              </div>
            </div>
          </section>

          {/* 1. Nature of Service */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Nature of Service</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              SamiWISE is a <strong className="text-white">software-as-a-service (SaaS) product</strong> that provides AI-powered GMAT preparation tools including practice questions, adaptive learning, voice tutoring sessions, and progress tracking.
            </p>
            <p className="text-slate-300 leading-relaxed mb-3">
              The service falls under the category of <strong className="text-white">educational technology and test preparation software</strong>. It uses artificial intelligence to facilitate practice questions, topic review, adaptive difficulty, spaced repetition, and AI-guided explanations.
            </p>
            <p className="text-slate-300 leading-relaxed">
              SamiWISE is comparable to products such as Magoosh, Manhattan Prep, and Target Test Prep. It is an educational software product, not a substitute for professional academic advising.
            </p>
          </section>

          {/* 2. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              You must be <strong className="text-white">at least 18 years old</strong> to use SamiWISE.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By creating an account, you represent that you are 18 or older and have the legal capacity to enter into these Terms.
            </p>
          </section>

          {/* 3. Your Account */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Your Account</h2>
            <p className="text-slate-300 leading-relaxed mb-3">You are responsible for:</p>
            <ul className="space-y-1.5 text-slate-300 ml-2">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Maintaining the confidentiality of your account credentials</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>All activities that occur under your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Notifying us immediately of any unauthorized access</span>
              </li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              You agree <strong className="text-white">NOT</strong> to use SamiWISE to:
            </p>
            <ul className="space-y-1.5 text-slate-300 ml-2">
              {[
                'Violate any laws or regulations',
                'Harass, abuse, or harm others',
                'Attempt to reverse-engineer, hack, or compromise our systems',
                'Use automated tools (bots, scrapers) without permission',
                'Share your account with others',
                'Upload malicious content (viruses, malware, etc.)',
              ].map((item) => (
                <li key={item} className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Subscriptions & Payments */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Subscriptions &amp; Payments</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-2">Plans</h3>
                <p className="text-slate-300 leading-relaxed mb-2">
                  SamiWISE offers three paid plans, each with a 7-day free trial:
                </p>
                <ul className="space-y-1.5 text-slate-300 ml-2">
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span><strong className="text-white">Starter ($39/month):</strong> Core practice questions, AI explanations, progress tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span><strong className="text-white">Pro ($79/month):</strong> Unlimited sessions, voice tutoring, all AI features, advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span><strong className="text-white">Intensive ($149/month):</strong> Pro features + priority support, personalized study plans, score prediction</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">Billing</h3>
                <p className="text-slate-300 leading-relaxed">
                  All payments are processed securely by <strong className="text-white">Paddle</strong> (our Merchant of Record). Subscriptions renew automatically unless canceled. You will be billed at the start of each billing cycle (monthly or annually).
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">Cancellation &amp; Refunds</h3>
                <ul className="space-y-1.5 text-slate-300 ml-2">
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span>You may cancel your subscription at any time via your account settings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span>Cancellations take effect at the end of your current billing period</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span><strong className="text-white">Refunds:</strong> We offer a 14-day money-back guarantee on your first payment. See our <Link href="/refund" className="text-cyan-400 hover:underline">Refund Policy</Link> for details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-500 mr-2">•</span>
                    <span>No refunds for partial months or mid-cycle cancellations</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">Price Changes</h3>
                <p className="text-slate-300 leading-relaxed">
                  We may change our pricing from time to time. Existing subscribers will be notified 30 days in advance of any price increase and may cancel before the new price takes effect.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              <strong className="text-white">Your Content:</strong> You retain ownership of your conversations and personal data. By using SamiWISE, you grant us a limited license to process your content to provide the service (e.g., AI responses, analytics).
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Our Content:</strong> All text, graphics, logos, software, and AI models on SamiWISE are owned by us or our licensors. You may not copy, reproduce, or distribute our content without permission.
            </p>
          </section>

          {/* 7. Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
            <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6">
              <p className="text-xs uppercase font-semibold text-slate-400 mb-3">Important Legal Notice</p>
              <p className="text-slate-300 leading-relaxed mb-3">
                SamiWISE is provided <strong className="text-white">&quot;AS IS&quot;</strong> and <strong className="text-white">&quot;AS AVAILABLE&quot;</strong> without warranties of any kind, either express or implied, including but not limited to:
              </p>
              <ul className="space-y-1.5 text-slate-300 ml-2">
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span>Accuracy, reliability, or quality of AI responses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span>Uninterrupted or error-free service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span>Results or outcomes from using the platform</span>
                </li>
              </ul>
              <p className="text-slate-400 text-sm leading-relaxed mt-3">
                <strong className="text-slate-300">AI-generated content may be inaccurate, incomplete, or inappropriate.</strong> Always verify critical information with official GMAT resources or a qualified professional.
              </p>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              To the maximum extent permitted by law, <strong className="text-white">SamiWISE and its affiliates shall not be liable</strong> for:
            </p>
            <ul className="space-y-1.5 text-slate-300 ml-2">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Any indirect, incidental, consequential, or punitive damages</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Loss of profits, data, or business opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Harm resulting from reliance on AI-generated advice</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Unauthorized access to your account or data breaches</span>
              </li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-3">
              <strong className="text-white">Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months before the claim (or $100, whichever is greater).</strong>
            </p>
          </section>

          {/* 9. Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Indemnification</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              You agree to indemnify and hold harmless SamiWISE from any claims, damages, or expenses (including legal fees) arising from:
            </p>
            <ul className="space-y-1.5 text-slate-300 ml-2">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Your use or misuse of the platform</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Your violation of these Terms</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                <span>Your violation of any third-party rights</span>
              </li>
            </ul>
          </section>

          {/* 10. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              <strong className="text-white">You may terminate your account at any time</strong> by deleting it in your account settings. All your data will be permanently deleted within 30 days.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">We may suspend or terminate your account</strong> if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms are governed by the laws of <strong className="text-white">Delaware, United States</strong>, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Delaware.
            </p>
          </section>

          {/* 12. Changes */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to These Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these Terms from time to time. Significant changes will be communicated via email or in-app notification. Continued use of SamiWISE after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Questions about these Terms? Contact us:
            </p>
            <div className="bg-[#0D1220] border border-white/[0.06] rounded-lg p-6">
              <p className="text-white font-medium mb-1">Pavel Haivaronski</p>
              <p className="text-slate-400 mb-1">SamiWISE</p>
              <p className="text-slate-400">
                Email: <a href="mailto:support@samiwise.app" className="text-cyan-400 hover:underline">support@samiwise.app</a>
              </p>
            </div>
          </section>

          {/* Final notice */}
          <section>
            <div className="bg-[#0D1220] border border-cyan-500/20 rounded-xl p-6">
              <p className="text-slate-300 leading-relaxed">
                By using SamiWISE, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our{' '}
                <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
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
          <p className="text-sm text-slate-500">© 2026 SamiWISE. AI-Powered GMAT Tutor.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-cyan-400">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

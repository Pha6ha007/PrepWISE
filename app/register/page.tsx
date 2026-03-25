'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2, Brain, CheckCircle, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const callbackUrl = plan
        ? `${window.location.origin}/auth/callback?plan=${plan}`
        : `${window.location.origin}/auth/callback`

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError('This email is already registered. Please sign in instead.')
        } else {
          setError(signUpError.message)
        }
        setIsLoading(false)
        return
      }

      setSuccessMessage(`We sent a confirmation email to ${email}. Check your inbox and click the link to verify.`)
      setIsLoading(false)
    } catch {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const PLAN_LABELS: Record<string, string> = {
    starter: 'Starter — $39/mo',
    pro: 'Pro — $79/mo',
    intensive: 'Intensive — $149/mo',
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center relative py-12">
      {/* Subtle gradient glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/[0.07] rounded-full blur-[120px]" />
      </div>

      {/* Back to home */}
      <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors z-50">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to home</span>
      </Link>

      {/* Register Card */}
      <div className="w-full max-w-md px-6 animate-fade-in">
        <div className="glass-card rounded-2xl p-8 lg:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Plan banner */}
          {plan && PLAN_LABELS[plan] && (
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              <p className="text-sm text-cyan-300">
                Selected: <strong>{PLAN_LABELS[plan]}</strong>. Create an account to continue.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {plan ? 'Create your account' : 'Start your GMAT prep'}
            </h1>
            <p className="text-slate-400 text-sm">
              {plan ? 'Your plan activates after verification' : 'Create an account — 14-day free trial'}
            </p>
          </div>

          {/* Success */}
          {successMessage && (
            <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">Check your email!</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{successMessage}</p>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300">{error}</p>
                {error.includes('already registered') && (
                  <Link href="/login" className="text-sm text-cyan-400 font-medium hover:text-cyan-300 mt-1 inline-block">
                    Go to sign in →
                  </Link>
                )}
              </div>
            </div>
          )}

          {!successMessage && (
            <>
              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#151C2C] border border-white/[0.06] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#151C2C] border border-white/[0.06] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#151C2C] border border-white/[0.06] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-relaxed">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                    </span>
                  ) : 'Create account'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-white/[0.06]" />
                <span className="px-4 text-xs text-slate-600">or</span>
                <div className="flex-1 border-t border-white/[0.06]" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient()
                  const oauthCallback = plan
                    ? `${window.location.origin}/auth/callback?plan=${plan}`
                    : `${window.location.origin}/auth/callback`
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: oauthCallback },
                  })
                }}
                className="w-full py-3.5 rounded-xl font-medium border border-white/[0.06] bg-[#151C2C] hover:bg-[#1E293B] text-slate-300 transition-all flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Sign in link */}
              <p className="text-center mt-8 text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-400 font-medium hover:text-cyan-300">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

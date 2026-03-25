/**
 * Free Trial utilities for PrepWISE
 *
 * 7-day trial, no credit card required.
 * Trial is independent of the Paddle subscription system —
 * it applies only to users with plan === 'free' and no active subscription.
 */

const TRIAL_DURATION_DAYS = 7

type TrialUser = {
  trialStartDate?: Date | null
  trialEndDate?: Date | null
  plan?: string | null
}

/**
 * Whether the user's free trial is currently active.
 * Returns false if:
 *  - trial dates aren't set
 *  - trial has expired
 *  - user has an active paid plan (trial is irrelevant)
 */
export function isTrialActive(user: TrialUser): boolean {
  if (!user.trialStartDate || !user.trialEndDate) return false
  if (user.plan && user.plan !== 'free') return false
  return new Date() < new Date(user.trialEndDate)
}

/**
 * Number of full days remaining in the trial.
 * Returns 0 if trial is not set or already expired.
 */
export function getTrialDaysRemaining(user: { trialEndDate?: Date | null }): number {
  if (!user.trialEndDate) return 0
  const diff = new Date(user.trialEndDate).getTime() - Date.now()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Overall trial status for display purposes.
 *
 *  - 'subscribed' — user has a paid plan, trial is irrelevant
 *  - 'active'     — trial is running
 *  - 'expired'    — trial ended and user hasn't subscribed
 *  - 'none'       — trial was never started (shouldn't happen post-onboarding)
 */
export function getTrialStatus(
  user: TrialUser
): 'active' | 'expired' | 'subscribed' | 'none' {
  if (user.plan && user.plan !== 'free') return 'subscribed'
  if (!user.trialStartDate || !user.trialEndDate) return 'none'
  return new Date() < new Date(user.trialEndDate) ? 'active' : 'expired'
}

/**
 * Compute trialStartDate and trialEndDate for a new user.
 */
export function createTrialDates(): { trialStartDate: Date; trialEndDate: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + TRIAL_DURATION_DAYS)
  return { trialStartDate: now, trialEndDate: end }
}

export { TRIAL_DURATION_DAYS }

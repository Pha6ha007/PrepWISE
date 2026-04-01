import { Resend } from 'resend'

// Lazy initialization — don't crash at build time if RESEND_API_KEY isn't set
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'dummy')
  }
  return _resend
}

// Backward compat — lazy proxy
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as any)[prop]
  },
})

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'sam@samiwise.app'

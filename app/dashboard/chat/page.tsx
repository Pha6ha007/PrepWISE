import { redirect } from 'next/navigation'

/**
 * Redirect to GMAT session page.
 */
export default function ChatPage() {
  redirect('/dashboard/session')
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth | Confide',
  description: 'Sign in or create your Confide account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Confide</span>
        </div>
      </div>

      {children}
    </div>
  )
}

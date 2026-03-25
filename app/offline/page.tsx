'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
      <div className="text-center px-6">
        {/* Logo */}
        <div className="text-4xl mb-6">🧠</div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">
          You&apos;re offline
        </h1>
        <p className="text-slate-400 mb-6 max-w-md">
          PrepWISE needs an internet connection to work with Sam.
          Check your connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

import BottomNav from './BottomNav'
import AccountMenu from './AccountMenu'
import OfflineBanner from './OfflineBanner'
import InstallPrompt from './InstallPrompt'

/** DueWell wordmark used in the header. */
export function Wordmark({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5 L10 17.5 L19 6.5"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-ink-900">
        Due<span className="text-brand-700">Well</span>
      </span>
    </div>
  )
}

export default function AppShell({ children, header }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-ink-50">
      {header ?? (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-ink-50/80 px-4 pb-3 pt-safe-t backdrop-blur-xl">
          <div className="pt-3">
            <Wordmark />
          </div>
          <div className="pt-3">
            <AccountMenu />
          </div>
        </header>
      )}
      <OfflineBanner />
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </div>
  )
}

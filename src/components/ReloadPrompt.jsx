import { useRegisterSW } from 'virtual:pwa-register/react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import { EASE } from '../lib/motion'

// While the app stays open we poll for a fresh deploy every hour. iOS
// home-screen PWAs only re-check on launch, so we also re-check whenever the
// app returns to the foreground.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

// Shows a "new version available" toast when a waiting service worker is
// detected. Tapping Reload activates the new worker and reloads the page.
export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      const check = () => registration.update()
      setInterval(check, UPDATE_CHECK_INTERVAL)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    },
  })

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-[60] flex flex-col items-center px-4">
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            key="reload-prompt"
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-card-hover"
          >
            <RefreshCw className="h-5 w-5 shrink-0 text-brand-300" />
            <span className="flex-1">A new version is available.</span>
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="shrink-0 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-400"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-white/60 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

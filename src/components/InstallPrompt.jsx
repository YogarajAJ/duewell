import { AnimatePresence, motion } from 'framer-motion'
import { Download, Share, Plus, X } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { EASE, tap } from '../lib/motion'

/**
 * Branded "Add to Home Screen" prompt. Uses the native install prompt where
 * available; on iOS Safari it shows the manual Share → Add to Home Screen steps.
 */
export default function InstallPrompt() {
  const { canShow, ios, hasNativePrompt, promptInstall, dismiss } =
    useInstallPrompt()

  return (
    <AnimatePresence>
      {canShow && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-30 mx-auto max-w-md px-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-4 text-white shadow-card-hover">
            <button
              onClick={dismiss}
              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/90"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Download className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold">Install DueWell</p>
                {hasNativePrompt ? (
                  <p className="mt-0.5 text-sm text-brand-100">
                    Add it to your home screen for one-tap access and offline use.
                  </p>
                ) : ios ? (
                  <p className="mt-1 text-sm text-brand-100">
                    Tap{' '}
                    <Share className="inline h-4 w-4 -translate-y-0.5" /> Share,
                    then{' '}
                    <span className="font-semibold">
                      Add to Home Screen{' '}
                      <Plus className="inline h-3.5 w-3.5 -translate-y-0.5" />
                    </span>
                    .
                  </p>
                ) : null}
              </div>
            </div>

            {hasNativePrompt && (
              <motion.button
                whileTap={tap}
                onClick={promptInstall}
                className="btn mt-3 w-full bg-white py-2.5 text-brand-800 hover:bg-brand-50"
              >
                <Download className="h-4 w-4" />
                Add to Home Screen
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

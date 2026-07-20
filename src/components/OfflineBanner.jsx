import { AnimatePresence, motion } from 'framer-motion'
import { CloudOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { EASE } from '../lib/motion'

/** Slim banner shown under the header while offline. */
export default function OfflineBanner() {
  const online = useOnlineStatus()
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="overflow-hidden bg-ink-900 text-white"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium">
            <CloudOff className="h-4 w-4" />
            You’re offline — showing your last synced data.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

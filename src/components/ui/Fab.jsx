import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { EASE } from '../../lib/motion'

/** Floating action button, anchored above the bottom nav. */
export default function Fab({ onClick, label = 'Add bill' }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3, ease: EASE }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+76px)] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-fab"
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </motion.button>
  )
}

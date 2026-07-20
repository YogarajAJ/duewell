import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { sheetBackdrop, sheetPanel } from '../../lib/motion'

/**
 * Reusable bottom sheet: backdrop, draggable panel with a grab handle,
 * and an optional title header. Drag down past a threshold to dismiss.
 */
export default function BottomSheet({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40"
          variants={sheetBackdrop}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={sheetPanel}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_e, info) => info.offset.y > 120 && onClose?.()}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] max-w-md overflow-y-auto rounded-t-3xl bg-white pb-safe-b shadow-sheet"
          >
            <div className="sticky top-0 z-10 bg-white">
              <div className="flex justify-center pt-3">
                <span className="h-1.5 w-10 rounded-full bg-ink-200" />
              </div>
              {title != null && (
                <div className="flex items-center justify-between px-5 pb-2 pt-3">
                  <h2 className="text-xl font-bold text-ink-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-500"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

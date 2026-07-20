import { motion } from 'framer-motion'

/** Branded loading screen shown while the session is being restored. */
export default function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-950">
      <motion.span
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-800 shadow-fab"
      >
        <motion.svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M6 12.5 L10.5 17 L18 8"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.15 }}
          />
        </motion.svg>
      </motion.span>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg font-bold tracking-tight text-white"
      >
        Due<span className="text-brand-300">Well</span>
      </motion.p>
    </div>
  )
}

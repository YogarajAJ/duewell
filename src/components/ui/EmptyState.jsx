import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'

/**
 * Friendly illustrated empty state. The illustration is an inline SVG
 * (a calendar with a relaxed check) so it stays crisp and needs no assets.
 */
export default function EmptyState({
  title = 'All clear',
  message = 'Nothing due right now.',
  action = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="relative mb-6">
        <motion.div
          aria-hidden
          className="absolute -inset-6 rounded-full bg-brand-100/60 blur-xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg
          width="132"
          height="132"
          viewBox="0 0 132 132"
          fill="none"
          className="relative"
          role="img"
          aria-label="Empty calendar"
        >
          <rect x="22" y="30" width="88" height="80" rx="16" fill="#effcf9" />
          <rect x="22" y="30" width="88" height="24" rx="12" fill="#0f766e" />
          <rect x="42" y="20" width="9" height="22" rx="4.5" fill="#0d8074" />
          <rect x="81" y="20" width="9" height="22" rx="4.5" fill="#0d8074" />
          <path
            d="M50 82 L61 93 L84 68"
            stroke="#159e8f"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-500">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

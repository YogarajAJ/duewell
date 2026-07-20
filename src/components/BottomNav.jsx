import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, ListChecks, BarChart3 } from 'lucide-react'
import { cn } from '../lib/cn'

const TABS = [
  { to: '/', label: 'Home', Icon: LayoutDashboard, end: true },
  { to: '/bills', label: 'Bills', Icon: ListChecks },
  { to: '/insights', label: 'Insights', Icon: BarChart3 },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/85 pb-safe-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -top-px h-0.5 w-8 rounded-full bg-brand-700"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-brand-700' : 'text-ink-400',
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={cn(
                    'text-[11px] font-medium transition-colors',
                    isActive ? 'text-brand-700' : 'text-ink-400',
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

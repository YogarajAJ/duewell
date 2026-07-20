import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarClock, Wallet } from 'lucide-react'
import { Skeleton } from '../components/ui/Skeleton'
import StatusPill from '../components/ui/StatusPill'
import { useBills } from '../context/BillsContext'
import { billStatus, formatCurrency, dueLabel } from '../lib/format'
import { EASE, listContainer, listItem } from '../lib/motion'

export default function Dashboard() {
  const { bills, loading } = useBills()

  const { totalDue, overdueCount, upcoming } = useMemo(() => {
    const pending = bills
      .map((b) => ({ ...b, _status: billStatus(b) }))
      .filter((b) => b._status !== 'paid')
    return {
      totalDue: pending.reduce((s, b) => s + Number(b.amount), 0),
      overdueCount: pending.filter((b) => b._status === 'overdue').length,
      upcoming: pending
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 3),
    }
  }, [bills])

  return (
    <div className="space-y-6">
      {/* Hero summary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white shadow-card"
      >
        <div className="flex items-center gap-2 text-brand-100">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-medium">Total due this month</span>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-10 w-48 bg-white/20" />
        ) : (
          <motion.p
            key={totalDue}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="tnum mt-2 text-4xl font-extrabold tracking-tight"
          >
            {formatCurrency(totalDue)}
          </motion.p>
        )}
        <div className="mt-4 flex items-center gap-2">
          {overdueCount > 0 ? (
            <StatusPill status="overdue" />
          ) : (
            <StatusPill status="pending" />
          )}
          <span className="text-sm text-brand-100">
            {overdueCount > 0
              ? `${overdueCount} overdue — needs attention`
              : 'Nothing overdue. You’re on track.'}
          </span>
        </div>
      </motion.section>

      {/* Upcoming */}
      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <CalendarClock className="h-4.5 w-4.5 text-brand-700" />
            Due soon
          </h2>
          <Link
            to="/bills"
            className="flex items-center gap-0.5 text-sm font-medium text-brand-700"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card flex items-center gap-3 p-4 text-sm text-ink-500">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paid-light text-paid-dark">
              <CalendarClock className="h-5 w-5" />
            </span>
            {bills.length === 0
              ? 'No bills yet — add your first from the Bills tab.'
              : 'Nothing due right now. You’re all caught up.'}
          </div>
        ) : (
          <motion.div
            variants={listContainer}
            initial="initial"
            animate="enter"
            className="space-y-3"
          >
            {upcoming.map((b) => (
              <motion.div
                key={b.id}
                variants={listItem}
                className="card flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-semibold text-ink-900">{b.name}</p>
                  <p
                    className={
                      b._status === 'overdue'
                        ? 'text-sm text-overdue-dark'
                        : 'text-sm text-ink-500'
                    }
                  >
                    {dueLabel(b.due_date)}
                  </p>
                </div>
                <p className="tnum text-lg font-bold text-ink-900">
                  {formatCurrency(b.amount)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}

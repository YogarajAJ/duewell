import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, PieChart } from 'lucide-react'
import { useBills } from '../context/BillsContext'
import { useToast } from '../context/ToastContext'
import { Skeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { categoryMeta } from '../lib/categoryMeta'
import { formatCurrency } from '../lib/format'
import {
  buildSeries,
  categoryBreakdown,
  periodDelta,
  compactCurrency,
  RANGE_CONFIG,
} from '../lib/analytics'
import { EASE, listContainer, listItem } from '../lib/motion'
import { cn } from '../lib/cn'

const RANGES = Object.keys(RANGE_CONFIG)

export default function Insights() {
  const { listAllPayments } = useBills()
  const toast = useToast()
  const [range, setRange] = useState('Month')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    listAllPayments()
      .then((rows) => active && setPayments(rows))
      .catch(() => {
        if (!active) return
        setPayments([])
        toast('Could not load your spending.', 'error')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [listAllPayments, toast])

  const { gran, count, currentLabel, windowLabel } = RANGE_CONFIG[range]

  const { series, windowTotal, current, delta, breakdown } = useMemo(() => {
    const series = buildSeries(payments, gran, count)
    const windowTotal = series.reduce((s, b) => s + b.amount, 0)
    const last = series[series.length - 1]
    return {
      series,
      windowTotal,
      current: last.amount,
      delta: periodDelta(series),
      breakdown: categoryBreakdown(payments, series[0].start, last.end),
    }
  }, [payments, gran, count])

  const hasData = payments.length > 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Insights</h1>

      {/* Range switcher */}
      <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="relative flex-1 rounded-lg py-2 text-sm font-semibold"
          >
            {range === r && (
              <motion.span
                layoutId="range-active"
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className={cn('relative', range === r ? 'text-ink-900' : 'text-ink-500')}>
              {r}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </>
      ) : !hasData ? (
        <EmptyState
          title="No spending yet"
          message="Once you mark bills as paid, your weekly, monthly and yearly trends will show up here."
        />
      ) : (
        <>
          {/* Summary + trend */}
          <section className="card p-5">
            <p className="text-sm font-medium text-ink-500">{windowLabel}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="tnum text-3xl font-extrabold tracking-tight text-ink-900">
                {formatCurrency(windowTotal)}
              </p>
              <DeltaPill delta={delta} currentLabel={currentLabel} />
            </div>
            <p className="mt-1 text-sm text-ink-400">
              {currentLabel}:{' '}
              <span className="font-semibold text-ink-600">
                {formatCurrency(current)}
              </span>
            </p>

            <motion.div
              key={range}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-5 h-52"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b82b5', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    width={44}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9daed3', fontSize: 11 }}
                    tickFormatter={compactCurrency}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(15,118,110,0.06)' }}
                    formatter={(v) => [formatCurrency(v), 'Spent']}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 8px 24px -8px rgba(11,18,32,0.25)',
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 8, 8]} isAnimationActive={false}>
                    {series.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === series.length - 1 ? '#0f766e' : '#96e9db'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </section>

          {/* Category breakdown */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
              <PieChart className="h-4.5 w-4.5 text-brand-700" />
              Where it goes
            </h2>
            <p className="mt-0.5 text-sm text-ink-400">{windowLabel}</p>

            {breakdown.length === 0 ? (
              <p className="mt-6 text-center text-sm text-ink-400">
                No payments in this range yet.
              </p>
            ) : (
              <motion.ul
                variants={listContainer}
                initial="initial"
                animate="enter"
                className="mt-4 space-y-3"
              >
                {breakdown.map(({ category, amount }) => {
                  const { Icon, tint } = categoryMeta(category)
                  const share = windowTotal ? (amount / windowTotal) * 100 : 0
                  return (
                    <motion.li key={category} variants={listItem}>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                            tint,
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-medium text-ink-800">{category}</span>
                            <span className="tnum text-sm font-semibold text-ink-900">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                            <motion.div
                              className="h-full rounded-full bg-brand-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${share}%` }}
                              transition={{ duration: 0.6, ease: EASE }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </motion.ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function DeltaPill({ delta, currentLabel }) {
  if (delta == null) return null
  const up = delta > 0
  const flat = delta === 0
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
  // For expenses: spending more = red, less = green.
  const cls = flat
    ? 'bg-ink-100 text-ink-500'
    : up
      ? 'bg-overdue-light text-overdue-dark'
      : 'bg-paid-light text-paid-dark'
  return (
    <span
      className={cn('pill', cls)}
      title={`${currentLabel} vs previous`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {flat ? 'No change' : `${up ? '+' : ''}${delta}%`}
    </span>
  )
}

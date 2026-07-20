import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import { formatCurrency } from '../lib/format'
import { cn } from '../lib/cn'

// Placeholder spend data — replaced by Supabase payment history in Phase 6.
const MONTHLY = [
  { label: 'Feb', amount: 58200 },
  { label: 'Mar', amount: 61400 },
  { label: 'Apr', amount: 55900 },
  { label: 'May', amount: 63750 },
  { label: 'Jun', amount: 60100 },
  { label: 'Jul', amount: 61668 },
]

const RANGES = ['Week', 'Month', 'Year']

export default function Insights() {
  const [range, setRange] = useState('Month')
  const total = MONTHLY.reduce((s, m) => s + m.amount, 0)

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
            <span
              className={cn(
                'relative',
                range === r ? 'text-ink-900' : 'text-ink-500',
              )}
            >
              {r}
            </span>
          </button>
        ))}
      </div>

      <section className="card p-5">
        <p className="text-sm font-medium text-ink-500">Spending trend</p>
        <p className="tnum mt-1 text-3xl font-extrabold tracking-tight text-ink-900">
          {formatCurrency(total)}
        </p>
        <p className="mt-0.5 text-sm text-ink-400">Last 6 months · sample data</p>

        <div className="mt-5 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b82b5', fontSize: 12 }}
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
              <Bar dataKey="amount" radius={[8, 8, 8, 8]} animationDuration={700}>
                {MONTHLY.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === MONTHLY.length - 1 ? '#0f766e' : '#96e9db'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="px-1 text-center text-sm text-ink-400">
        Full weekly / monthly / yearly breakdowns arrive in Phase 6.
      </p>
    </div>
  )
}

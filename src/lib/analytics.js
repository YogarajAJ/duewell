// Aggregation helpers for the expense dashboard. All date math is done on
// local calendar dates to avoid timezone drift from yyyy-mm-dd strings.

/** Parse a 'yyyy-mm-dd' string into a local Date at midnight. */
export function parseYMD(s) {
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Start of the period containing `date`, for the given granularity. */
export function periodStart(date, gran) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  if (gran === 'week') {
    const dow = (d.getDay() + 6) % 7 // Monday = 0
    d.setDate(d.getDate() - dow)
  } else if (gran === 'month') {
    d.setDate(1)
  } else {
    d.setMonth(0, 1) // year
  }
  return d
}

/** Shift a period start by `n` periods (can be negative). */
export function addPeriods(date, gran, n) {
  const d = new Date(date)
  if (gran === 'week') d.setDate(d.getDate() + 7 * n)
  else if (gran === 'month') d.setMonth(d.getMonth() + n)
  else d.setFullYear(d.getFullYear() + n)
  return d
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function bucketLabel(start, gran) {
  if (gran === 'week') return `${start.getDate()} ${MONTHS[start.getMonth()]}`
  if (gran === 'month') return MONTHS[start.getMonth()]
  return String(start.getFullYear())
}

/**
 * Build a trend series of the last `count` periods ending with the current one.
 * Returns [{ label, start, end, amount }] oldest → newest.
 */
export function buildSeries(payments, gran, count, now = new Date()) {
  const currentStart = periodStart(now, gran)
  const buckets = []
  for (let i = count - 1; i >= 0; i--) {
    const start = addPeriods(currentStart, gran, -i)
    const end = addPeriods(start, gran, 1)
    buckets.push({ start, end, amount: 0, label: bucketLabel(start, gran) })
  }
  for (const p of payments) {
    const t = parseYMD(p.paid_date)
    if (t < buckets[0].start || t >= buckets[buckets.length - 1].end) continue
    for (const b of buckets) {
      if (t >= b.start && t < b.end) {
        b.amount += Number(p.amount_paid)
        break
      }
    }
  }
  return buckets
}

/** Category totals for payments falling in [from, to). */
export function categoryBreakdown(payments, from, to) {
  const map = new Map()
  for (const p of payments) {
    const t = parseYMD(p.paid_date)
    if (t < from || t >= to) continue
    const cat = p.bills?.category ?? 'Other'
    map.set(cat, (map.get(cat) ?? 0) + Number(p.amount_paid))
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

/** Percent change of the latest period vs the previous one (null if n/a). */
export function periodDelta(series) {
  if (series.length < 2) return null
  const cur = series[series.length - 1].amount
  const prev = series[series.length - 2].amount
  if (prev === 0) return cur === 0 ? 0 : null
  return Math.round(((cur - prev) / prev) * 100)
}

/** Compact currency for axis ticks, e.g. 58200 → "₹58k". */
export function compactCurrency(n) {
  const abs = Math.abs(n)
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  if (abs >= 1e3) return `₹${Math.round(n / 1e3)}k`
  return `₹${n}`
}

export const RANGE_CONFIG = {
  Week: { gran: 'week', count: 8, currentLabel: 'This week', windowLabel: 'Last 8 weeks' },
  Month: { gran: 'month', count: 6, currentLabel: 'This month', windowLabel: 'Last 6 months' },
  Year: { gran: 'year', count: 4, currentLabel: 'This year', windowLabel: 'Last 4 years' },
}

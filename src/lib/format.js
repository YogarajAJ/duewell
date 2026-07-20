// Formatting helpers. Default currency is INR — change `CURRENCY`/`LOCALE`
// here if you bill in another currency.
export const LOCALE = 'en-IN'
export const CURRENCY = 'INR'

const currencyFmt = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

const currencyFmtCents = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format an amount as currency. Whole numbers drop the decimals for a cleaner look. */
export function formatCurrency(amount, { cents = false } = {}) {
  const n = Number(amount) || 0
  return (cents || n % 1 !== 0 ? currencyFmtCents : currencyFmt).format(n)
}

const dayFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const fullFmt = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(date, { full = false } = {}) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return (full ? fullFmt : dayFmt).format(d)
}

/** Whole-day difference between a due date and now (negative = overdue). */
export function daysUntil(date, now = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((a - b) / 86400000)
}

/** Derive the display status: 'paid' | 'overdue' | 'pending'. */
export function billStatus(bill, now = new Date()) {
  if (bill.status === 'paid') return 'paid'
  return daysUntil(bill.due_date, now) < 0 ? 'overdue' : 'pending'
}

// A bill can be marked paid when it's overdue, due today, or due within this
// many days. This stops a recurring bill (which rolls its due date forward on
// payment) from being pre-paid for future months over and over.
export const PAYABLE_GRACE_DAYS = 7

export function isPayable(bill, now = new Date()) {
  if (bill.status === 'paid') return false
  return daysUntil(bill.due_date, now) <= PAYABLE_GRACE_DAYS
}

/** Human relative label for a due date, e.g. "Due today", "3 days left", "5 days overdue". */
export function dueLabel(date, now = new Date()) {
  const n = daysUntil(date, now)
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  if (n === -1) return '1 day overdue'
  if (n < 0) return `${Math.abs(n)} days overdue`
  return `${n} days left`
}

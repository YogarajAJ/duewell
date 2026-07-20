// Due-date reminders via the Notifications API.
//
// Honest scope: iOS/iPadOS only allow web notifications for an *installed*
// PWA, and these fire while DueWell is open (on load) — not as background
// push. A daily summary is shown at most once per calendar day.
import { billStatus, daysUntil, formatCurrency } from './format'

const ENABLED_KEY = 'duewell:reminders-enabled'
const LAST_KEY = 'duewell:reminders-last-shown'

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permission() {
  return notificationsSupported() ? Notification.permission : 'denied'
}

export function remindersEnabled() {
  return localStorage.getItem(ENABLED_KEY) === '1' && permission() === 'granted'
}

export async function enableReminders() {
  if (!notificationsSupported()) return 'unsupported'
  let perm = Notification.permission
  if (perm === 'default') perm = await Notification.requestPermission()
  if (perm === 'granted') {
    localStorage.setItem(ENABLED_KEY, '1')
    return 'granted'
  }
  return perm // 'denied'
}

export function disableReminders() {
  localStorage.setItem(ENABLED_KEY, '0')
}

/** Show a once-per-day summary of overdue / due-today bills, if enabled. */
export function maybeNotifyDue(bills) {
  if (!remindersEnabled()) return
  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LAST_KEY) === today) return

  const pending = bills.filter((b) => billStatus(b) !== 'paid')
  const overdue = pending.filter((b) => billStatus(b) === 'overdue')
  const dueToday = pending.filter((b) => daysUntil(b.due_date) === 0)
  if (overdue.length === 0 && dueToday.length === 0) return

  const parts = []
  if (overdue.length) parts.push(`${overdue.length} overdue`)
  if (dueToday.length) parts.push(`${dueToday.length} due today`)
  const amount = [...overdue, ...dueToday].reduce((s, b) => s + Number(b.amount), 0)
  const body = `${parts.join(' · ')} — ${formatCurrency(amount)} to pay.`

  try {
    new Notification('DueWell', {
      body,
      icon: '/icons/pwa-192x192.png',
      badge: '/icons/pwa-192x192.png',
      tag: 'duewell-due-summary',
    })
    localStorage.setItem(LAST_KEY, today)
  } catch {
    /* some browsers require notifications via the SW registration; ignore */
  }
}

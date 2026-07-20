import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Pencil, Trash2, History, RefreshCw } from 'lucide-react'
import BottomSheet from './ui/BottomSheet'
import StatusPill from './ui/StatusPill'
import { Skeleton } from './ui/Skeleton'
import { useBills } from '../context/BillsContext'
import { categoryMeta } from '../lib/categoryMeta'
import { formatCurrency, formatDate, dueLabel, billStatus, isPayable } from '../lib/format'
import { cn } from '../lib/cn'
import { tap, listContainer, listItem } from '../lib/motion'

/**
 * Read-only detail + full payment history for one bill, with actions to
 * mark paid / edit / delete. History is fetched from Supabase on open.
 */
export default function BillDetailSheet({
  open,
  bill,
  onClose,
  onEdit,
  onDelete,
  onMarkPaid,
}) {
  const { listPayments } = useBills()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !bill) return
    let active = true
    setLoading(true)
    listPayments(bill.id)
      .then((rows) => active && setPayments(rows))
      .catch(() => active && setPayments([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // Refetch when reopening, switching bills, or after a new payment.
  }, [open, bill, listPayments])

  if (!bill) return <BottomSheet open={open} title={null} onClose={onClose} />

  const status = billStatus(bill)
  const { Icon, tint } = categoryMeta(bill.category)
  const lifetime = payments.reduce((s, p) => s + Number(p.amount_paid), 0)

  return (
    <BottomSheet open={open} title={bill.name} onClose={onClose}>
      <div className="px-5 pb-6 pt-1">
        {/* Hero */}
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              tint,
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-ink-500">
              {bill.category} ·{' '}
              <span className="inline-flex items-center gap-1 capitalize">
                {bill.recurrence === 'monthly' && (
                  <RefreshCw className="h-3 w-3" />
                )}
                {bill.recurrence}
              </span>
            </p>
            <StatusPill status={status} className="mt-1" />
          </div>
          <div className="text-right">
            <p className="tnum text-2xl font-extrabold text-ink-900">
              {formatCurrency(bill.amount)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-ink-50 px-4 py-3 text-sm">
          {status === 'paid' ? (
            <span className="text-ink-500">
              Last cycle paid · was due {formatDate(bill.due_date, { full: true })}
            </span>
          ) : (
            <span
              className={
                status === 'overdue' ? 'text-overdue-dark' : 'text-ink-600'
              }
            >
              Next due {formatDate(bill.due_date, { full: true })} ·{' '}
              {dueLabel(bill.due_date)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {isPayable(bill) ? (
            <motion.button
              whileTap={tap}
              onClick={() => onMarkPaid?.(bill)}
              className="btn-primary col-span-3 py-3"
            >
              <CheckCircle2 className="h-5 w-5" />
              Mark as paid
            </motion.button>
          ) : status !== 'paid' ? (
            <div className="col-span-3 flex items-center justify-center gap-2 rounded-xl bg-paid-light/60 py-3 text-sm font-medium text-paid-dark">
              <CheckCircle2 className="h-4 w-4" />
              Paid up — nothing due until {formatDate(bill.due_date, { full: true })}
            </div>
          ) : null}
          <motion.button
            whileTap={tap}
            onClick={() => onEdit?.(bill)}
            className="btn-ghost py-3 col-span-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </motion.button>
          <motion.button
            whileTap={tap}
            onClick={() => onDelete?.(bill)}
            className="btn py-3 bg-overdue-light text-overdue-dark hover:bg-overdue-light/70"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </motion.button>
        </div>

        {/* Payment history */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
              <History className="h-4 w-4" />
              Payment history
            </h3>
            {!loading && payments.length > 0 && (
              <span className="text-sm text-ink-400">
                {payments.length} · {formatCurrency(lifetime)} total
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-400">
              No payments recorded yet.
              <br />
              Mark this bill as paid to start building history.
            </div>
          ) : (
            <motion.ul
              variants={listContainer}
              initial="initial"
              animate="enter"
              className="space-y-2.5"
            >
              {payments.map((p) => (
                <motion.li
                  key={p.id}
                  variants={listItem}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paid-light text-paid-dark">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">
                        {formatDate(p.paid_date, { full: true })}
                      </p>
                      <p className="text-xs text-ink-400">Paid</p>
                    </div>
                  </div>
                  <p className="tnum font-bold text-ink-900">
                    {formatCurrency(p.amount_paid)}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import BottomSheet from './ui/BottomSheet'
import { tap } from '../lib/motion'
import { formatCurrency, formatDate } from '../lib/format'

function addMonth(dateStr) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Confirm a payment before recording it — lets the user adjust the amount
 * actually paid and the date. Calls onConfirm({ amount, paidOn }).
 */
export default function PaymentSheet({ open, bill, onClose, onConfirm }) {
  const [amount, setAmount] = useState('')
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open && bill) {
      setAmount(String(bill.amount ?? ''))
      setPaidOn(new Date().toISOString().slice(0, 10))
      setBusy(false)
    }
  }, [open, bill])

  const submit = async (e) => {
    e.preventDefault()
    if (!amount) return
    setBusy(true)
    try {
      await onConfirm?.({ amount: Number(amount), paidOn })
    } catch {
      setBusy(false) // keep sheet open on failure so the user can retry
    }
  }

  return (
    <BottomSheet open={open} title="Record payment" onClose={onClose}>
      {bill && (
        <form onSubmit={submit} className="space-y-4 px-5 pb-6 pt-2">
          <div className="rounded-2xl bg-ink-50 p-4">
            <p className="text-sm text-ink-500">Marking as paid</p>
            <p className="text-lg font-bold text-ink-900">{bill.name}</p>
            <p className="mt-0.5 text-sm text-ink-400">
              Due {formatDate(bill.due_date, { full: true })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="pay-amount">Amount paid</label>
              <input
                id="pay-amount"
                type="number"
                inputMode="decimal"
                className="input tnum"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="pay-date">Paid on</label>
              <input
                id="pay-date"
                type="date"
                className="input"
                value={paidOn}
                onChange={(e) => setPaidOn(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
            {bill.recurrence === 'monthly' ? (
              <span>
                This monthly bill will roll forward — next due{' '}
                <span className="font-semibold">
                  {formatDate(addMonth(bill.due_date), { full: true })}
                </span>
                . Your payment is saved to history.
              </span>
            ) : (
              <span>This one-time bill will be marked paid and moved to history.</span>
            )}
          </div>

          <motion.button
            whileTap={tap}
            type="submit"
            disabled={busy}
            className="btn-primary w-full py-3.5 text-base"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            {busy ? 'Recording…' : `Confirm ${formatCurrency(Number(amount) || 0)}`}
          </motion.button>
        </form>
      )}
    </BottomSheet>
  )
}

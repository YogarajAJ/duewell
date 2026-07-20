import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BottomSheet from './ui/BottomSheet'
import { tap } from '../lib/motion'
import { CATEGORIES } from '../lib/categories'
import { cn } from '../lib/cn'

const BLANK = {
  name: '',
  amount: '',
  due_date: new Date().toISOString().slice(0, 10),
  category: 'Utilities',
  recurrence: 'monthly',
}

/**
 * Bottom-sheet form for adding / editing a bill. `bill` prefills for edit.
 */
export default function BillSheet({ open, bill, onClose, onSave }) {
  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    if (open) setForm(bill ? { ...BLANK, ...bill } : BLANK)
  }, [open, bill])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.amount) return
    onSave?.({ ...form, amount: Number(form.amount) })
  }

  return (
    <BottomSheet open={open} title={bill ? 'Edit bill' : 'Add a bill'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 px-5 pb-6 pt-2">
        <div>
          <label className="label" htmlFor="name">Bill name</label>
          <input
            id="name"
            className="input"
            placeholder="e.g. Electricity Bill"
            value={form.name}
            onChange={set('name')}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              className="input tnum"
              placeholder="0"
              value={form.amount}
              onChange={set('amount')}
            />
          </div>
          <div>
            <label className="label" htmlFor="due">Due date</label>
            <input
              id="due"
              type="date"
              className="input"
              value={form.due_date}
              onChange={set('due_date')}
            />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: c }))}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  form.category === c
                    ? 'bg-brand-700 text-white'
                    : 'bg-ink-100 text-ink-600',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Recurrence</label>
          <div className="grid grid-cols-2 gap-2">
            {['monthly', 'one-time'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, recurrence: r }))}
                className={cn(
                  'rounded-xl border py-2.5 text-sm font-semibold capitalize transition-colors',
                  form.recurrence === r
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-ink-200 bg-white text-ink-500',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={tap}
          type="submit"
          className="btn-primary mt-2 w-full py-3.5 text-base"
        >
          {bill ? 'Save changes' : 'Add bill'}
        </motion.button>
      </form>
    </BottomSheet>
  )
}

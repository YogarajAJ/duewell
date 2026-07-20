import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { sheetBackdrop, sheetPanel, tap } from '../lib/motion'
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
 * Bottom-sheet form for adding / editing a bill. Slides up from the bottom
 * with a draggable handle — feels native on mobile. `bill` prefills for edit.
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
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40"
          variants={sheetBackdrop}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={sheetPanel}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_e, info) => info.offset.y > 120 && onClose?.()}
            className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-3xl bg-white pb-safe-b shadow-sheet"
          >
            <div className="flex justify-center pt-3">
              <span className="h-1.5 w-10 rounded-full bg-ink-200" />
            </div>

            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <h2 className="text-xl font-bold text-ink-900">
                {bill ? 'Edit bill' : 'Add a bill'}
              </h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

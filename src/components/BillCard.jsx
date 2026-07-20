import { useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import {
  Pencil,
  Trash2,
  Check,
  Home,
  Zap,
  Wifi,
  CreditCard,
  Car,
  ShoppingCart,
  HeartPulse,
  Landmark,
  Receipt,
} from 'lucide-react'
import StatusPill from './ui/StatusPill'
import { cn } from '../lib/cn'
import { formatCurrency, formatDate, dueLabel, billStatus } from '../lib/format'
import { listItem, tap } from '../lib/motion'

// Category → icon + tint. Falls back to a generic receipt.
const CATEGORY = {
  Housing: { Icon: Home, tint: 'bg-indigo-100 text-indigo-700' },
  Utilities: { Icon: Zap, tint: 'bg-amber-100 text-amber-700' },
  Internet: { Icon: Wifi, tint: 'bg-sky-100 text-sky-700' },
  Loan: { Icon: Landmark, tint: 'bg-rose-100 text-rose-700' },
  Card: { Icon: CreditCard, tint: 'bg-violet-100 text-violet-700' },
  Transport: { Icon: Car, tint: 'bg-cyan-100 text-cyan-700' },
  Shopping: { Icon: ShoppingCart, tint: 'bg-pink-100 text-pink-700' },
  Health: { Icon: HeartPulse, tint: 'bg-emerald-100 text-emerald-700' },
  Subscription: { Icon: Receipt, tint: 'bg-teal-100 text-teal-700' },
}

const REVEAL = 152 // px of action tray revealed on swipe

export default function BillCard({ bill, onEdit, onDelete, onTogglePaid }) {
  const status = billStatus(bill)
  const { Icon, tint } = CATEGORY[bill.category] ?? {
    Icon: Receipt,
    tint: 'bg-ink-100 text-ink-600',
  }
  const x = useMotionValue(0)
  const [open, setOpen] = useState(false)

  const settle = (to) => {
    animate(x, to, { type: 'spring', stiffness: 500, damping: 40 })
    setOpen(to !== 0)
  }

  const handleDragEnd = (_e, info) => {
    const shouldOpen = info.offset.x < -REVEAL / 2 || info.velocity.x < -400
    settle(shouldOpen ? -REVEAL : 0)
  }

  const isPaid = status === 'paid'

  return (
    <motion.li
      layout
      variants={listItem}
      initial="initial"
      animate="enter"
      exit="exit"
      className="relative mb-3 list-none overflow-hidden rounded-2xl"
    >
      {/* Action tray revealed underneath on swipe */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={() => {
            settle(0)
            onEdit?.(bill)
          }}
          className="flex w-[74px] flex-col items-center justify-center gap-1 bg-ink-700 text-white"
          aria-label="Edit"
        >
          <Pencil className="h-5 w-5" />
          <span className="text-xs font-medium">Edit</span>
        </button>
        <button
          onClick={() => {
            settle(0)
            onDelete?.(bill)
          }}
          className="flex w-[78px] flex-col items-center justify-center gap-1 rounded-r-2xl bg-overdue text-white"
          aria-label="Delete"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs font-medium">Delete</span>
        </button>
      </div>

      {/* Swipeable card face */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -REVEAL, right: 0 }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onClick={() => open && settle(0)}
        className={cn(
          'relative flex items-center gap-3.5 bg-white p-4 shadow-card',
          'cursor-grab touch-pan-y active:cursor-grabbing',
        )}
      >
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            tint,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'truncate font-semibold text-ink-900',
                isPaid && 'text-ink-400 line-through',
              )}
            >
              {bill.name}
            </p>
          </div>
          <p className="mt-0.5 text-sm text-ink-500">
            {isPaid ? (
              <>Paid · {formatDate(bill.due_date)}</>
            ) : (
              <span
                className={cn(
                  status === 'overdue' ? 'text-overdue-dark' : 'text-ink-500',
                )}
              >
                {dueLabel(bill.due_date)}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <p className="tnum text-lg font-bold text-ink-900">
            {formatCurrency(bill.amount)}
          </p>
          <StatusPill status={status} />
        </div>
      </motion.div>

      {/* Quick "mark paid" affordance for pending items */}
      {!isPaid && !open && (
        <motion.button
          whileTap={tap}
          onClick={() => onTogglePaid?.(bill)}
          className="absolute left-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink-200 bg-white/0 text-transparent transition-colors hover:border-paid hover:bg-paid hover:text-white"
          aria-label="Mark as paid"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.button>
      )}
    </motion.li>
  )
}

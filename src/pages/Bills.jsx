import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BillCard from '../components/BillCard'
import BillSheet from '../components/BillSheet'
import Fab from '../components/ui/Fab'
import EmptyState from '../components/ui/EmptyState'
import { BillCardSkeleton } from '../components/ui/Skeleton'
import { useBills } from '../context/BillsContext'
import { billStatus } from '../lib/format'
import { listContainer } from '../lib/motion'

export default function Bills() {
  const { bills, loading, addBill, updateBill, deleteBill, markPaid } = useBills()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { pending, paid } = useMemo(() => {
    const withStatus = bills.map((b) => ({ ...b, _status: billStatus(b) }))
    return {
      pending: withStatus
        .filter((b) => b._status !== 'paid')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)),
      paid: withStatus
        .filter((b) => b._status === 'paid')
        .sort((a, b) => new Date(b.due_date) - new Date(a.due_date)),
    }
  }, [bills])

  const openAdd = () => {
    setEditing(null)
    setSheetOpen(true)
  }
  const openEdit = (bill) => {
    setEditing(bill)
    setSheetOpen(true)
  }

  const handleSave = async (data) => {
    setSheetOpen(false)
    try {
      if (editing) await updateBill(editing.id, data)
      else await addBill(data)
    } catch {
      /* toast + rollback handled in context */
    }
  }

  return (
    <>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Bills</h1>
        {!loading && (
          <span className="text-sm text-ink-400">{pending.length} pending</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <BillCardSkeleton key={i} />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          title="No bills yet"
          message="Add your first bill or loan and DueWell will keep every due date in view."
        />
      ) : (
        <>
          {pending.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              message="No pending bills right now. Nice work staying on top of it."
            />
          ) : (
            <motion.ul variants={listContainer} initial="initial" animate="enter">
              <AnimatePresence initial={false}>
                {pending.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onEdit={openEdit}
                    onDelete={(b) => deleteBill(b.id)}
                    onTogglePaid={(b) => markPaid(b)}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}

          {paid.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-400">
                Recently paid
              </h2>
              <motion.ul initial="initial" animate="enter">
                <AnimatePresence initial={false}>
                  {paid.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      onEdit={openEdit}
                      onDelete={(b) => deleteBill(b.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>
          )}
        </>
      )}

      <Fab onClick={openAdd} />
      <BillSheet
        open={sheetOpen}
        bill={editing}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}

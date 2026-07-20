import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BillCard from '../components/BillCard'
import BillSheet from '../components/BillSheet'
import PaymentSheet from '../components/PaymentSheet'
import BillDetailSheet from '../components/BillDetailSheet'
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
  const [detailId, setDetailId] = useState(null)
  const [payingId, setPayingId] = useState(null)

  // Derive live bills by id so open sheets reflect the latest data.
  const detailBill = useMemo(
    () => bills.find((b) => b.id === detailId) ?? null,
    [bills, detailId],
  )
  const payingBill = useMemo(
    () => bills.find((b) => b.id === payingId) ?? null,
    [bills, payingId],
  )

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
    setDetailId(null)
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

  const handleDelete = (bill) => {
    setDetailId(null)
    deleteBill(bill.id)
  }

  const handleConfirmPayment = async ({ amount, paidOn }) => {
    if (!payingBill) return
    await markPaid(payingBill, { amount, paidOn }) // throws → PaymentSheet stays open
    setPayingId(null)
  }

  const startPayment = (bill) => {
    setDetailId(null)
    setPayingId(bill.id)
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
                    onOpen={(b) => setDetailId(b.id)}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onTogglePaid={startPayment}
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
                      onOpen={(b) => setDetailId(b.id)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
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

      <BillDetailSheet
        open={!!detailBill}
        bill={detailBill}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onMarkPaid={startPayment}
      />

      <PaymentSheet
        open={!!payingBill}
        bill={payingBill}
        onClose={() => setPayingId(null)}
        onConfirm={handleConfirmPayment}
      />
    </>
  )
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { maybeNotifyDue } from '../lib/reminders'

const BillsContext = createContext(null)

// Columns we persist. user_id is filled by the DB default (auth.uid()).
const COLS = ['name', 'amount', 'due_date', 'category', 'recurrence', 'status']
const pick = (obj) =>
  Object.fromEntries(COLS.filter((k) => k in obj).map((k) => [k, obj[k]]))

/** Add one calendar month to a yyyy-mm-dd string (mirrors mark_bill_paid). */
function addMonth(dateStr) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

export function BillsProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('due_date', { ascending: true })
    if (error) {
      setError(error)
      toast('Could not load your bills.', 'error')
    } else {
      setBills(data ?? [])
      maybeNotifyDue(data ?? []) // once-per-day due summary, if enabled
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    if (user) load()
    else {
      setBills([])
      setLoading(false)
    }
  }, [user, load])

  // ---- Create -------------------------------------------------------------
  const addBill = useCallback(
    async (input) => {
      const tempId = `temp-${Date.now()}`
      const optimistic = {
        id: tempId,
        user_id: user?.id,
        status: 'pending',
        ...pick(input),
      }
      setBills((prev) => [optimistic, ...prev])

      const { data, error } = await supabase
        .from('bills')
        .insert(pick(input))
        .select()
        .single()

      if (error) {
        setBills((prev) => prev.filter((b) => b.id !== tempId))
        toast('Could not add the bill.', 'error')
        throw error
      }
      // Swap the temp row for the persisted one.
      setBills((prev) => prev.map((b) => (b.id === tempId ? data : b)))
      toast('Bill added.', 'success')
      return data
    },
    [user, toast],
  )

  // ---- Update -------------------------------------------------------------
  const updateBill = useCallback(
    async (id, patch) => {
      const prevBills = bills
      setBills((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...pick(patch) } : b)),
      )

      const { data, error } = await supabase
        .from('bills')
        .update(pick(patch))
        .eq('id', id)
        .select()
        .single()

      if (error) {
        setBills(prevBills) // rollback
        toast('Could not save changes.', 'error')
        throw error
      }
      setBills((prev) => prev.map((b) => (b.id === id ? data : b)))
      toast('Changes saved.', 'success')
      return data
    },
    [bills, toast],
  )

  // ---- Delete -------------------------------------------------------------
  const deleteBill = useCallback(
    async (id) => {
      const prevBills = bills
      setBills((prev) => prev.filter((b) => b.id !== id))

      const { error } = await supabase.from('bills').delete().eq('id', id)
      if (error) {
        setBills(prevBills) // rollback
        toast('Could not delete the bill.', 'error')
        throw error
      }
      toast('Bill deleted.', 'success')
    },
    [bills, toast],
  )

  // ---- Mark paid (records a payment via RPC) ------------------------------
  const markPaid = useCallback(
    async (bill, { amount, paidOn } = {}) => {
      const prevBills = bills
      // Optimistically mirror what mark_bill_paid() will do server-side.
      setBills((prev) =>
        prev.map((b) => {
          if (b.id !== bill.id) return b
          return bill.recurrence === 'monthly'
            ? { ...b, due_date: addMonth(b.due_date), status: 'pending' }
            : { ...b, status: 'paid' }
        }),
      )

      const { data, error } = await supabase.rpc('mark_bill_paid', {
        p_bill_id: bill.id,
        p_amount: amount ?? null,
        p_paid_on: paidOn ?? new Date().toISOString().slice(0, 10),
      })

      if (error) {
        setBills(prevBills) // rollback
        toast('Could not record the payment.', 'error')
        throw error
      }
      const row = Array.isArray(data) ? data[0] : data
      if (row) setBills((prev) => prev.map((b) => (b.id === bill.id ? row : b)))
      toast('Marked as paid.', 'success')
      return row
    },
    [bills, toast],
  )

  // ---- Payment history for a single bill ---------------------------------
  const listPayments = useCallback(async (billId) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('bill_id', billId)
      .order('paid_date', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])

  // ---- All payments (with each payment's bill category) for analytics -----
  const listAllPayments = useCallback(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('id, amount_paid, paid_date, bill_id, bills(category, name)')
      .order('paid_date', { ascending: true })
    if (error) throw error
    return data ?? []
  }, [])

  const value = {
    bills,
    loading,
    error,
    reload: load,
    addBill,
    updateBill,
    deleteBill,
    markPaid,
    listPayments,
    listAllPayments,
  }

  return <BillsContext.Provider value={value}>{children}</BillsContext.Provider>
}

export function useBills() {
  const ctx = useContext(BillsContext)
  if (!ctx) throw new Error('useBills must be used within a BillsProvider')
  return ctx
}

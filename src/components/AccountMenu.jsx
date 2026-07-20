import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Switch from './ui/Switch'
import {
  notificationsSupported,
  remindersEnabled,
  enableReminders,
  disableReminders,
} from '../lib/reminders'
import { EASE } from '../lib/motion'

export default function AccountMenu() {
  const { user, signOut } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reminders, setReminders] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setReminders(remindersEnabled())
  }, [open])

  const toggleReminders = async (next) => {
    if (!next) {
      disableReminders()
      setReminders(false)
      return
    }
    const result = await enableReminders()
    if (result === 'granted') {
      setReminders(true)
      toast('Reminders on. We’ll flag due bills when you open DueWell.', 'success')
    } else if (result === 'denied') {
      toast('Notifications are blocked in your browser settings.', 'error')
    } else {
      toast('Notifications aren’t supported here.', 'error')
    }
  }

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onClick)
    return () => document.removeEventListener('pointerdown', onClick)
  }, [])

  const initial = (user?.email?.[0] ?? '?').toUpperCase()

  const handleSignOut = async () => {
    setBusy(true)
    try {
      await signOut()
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="absolute right-0 top-11 z-40 w-60 origin-top-right overflow-hidden rounded-2xl bg-white shadow-card-hover ring-1 ring-ink-100"
          >
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-ink-400">Signed in as</p>
                <p className="truncate text-sm font-medium text-ink-900">
                  {user?.email}
                </p>
              </div>
            </div>

            {notificationsSupported() && (
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4.5 w-4.5 text-ink-400" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Reminders</p>
                    <p className="text-xs text-ink-400">Flag due bills on open</p>
                  </div>
                </div>
                <Switch checked={reminders} onChange={toggleReminders} />
              </div>
            )}

            <button
              onClick={handleSignOut}
              disabled={busy}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-overdue-dark transition-colors hover:bg-overdue-light/50 disabled:opacity-50"
            >
              <LogOut className="h-4.5 w-4.5" />
              {busy ? 'Signing out…' : 'Sign out'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

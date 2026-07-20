import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Wordmark } from '../components/AppShell'
import { cn } from '../lib/cn'
import { EASE, tap } from '../lib/motion'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('') // set when email confirmation is required

  const isLogin = mode === 'login'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      if (isLogin) {
        await signIn({ email, password })
        // Session change is picked up by AuthProvider → app renders.
      } else {
        const { needsConfirmation } = await signUp({ email, password })
        if (needsConfirmation) setSentTo(email)
      }
    } catch (err) {
      setError(prettyError(err))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setError('')
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ink-950">
      {/* Ambient brand gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -right-16 top-40 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
      </div>

      {/* Brand header */}
      <div className="relative px-6 pt-safe-t">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mx-auto flex max-w-md flex-col items-center pt-16 text-center"
        >
          <BrandBadge />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
            Due<span className="text-brand-300">Well</span>
          </h1>
          <p className="mt-1.5 text-brand-100/80">Stay on top of every due date.</p>
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
        className="relative mx-auto mt-8 w-full max-w-md flex-1 rounded-t-3xl bg-white px-6 pb-safe-b pt-7 shadow-sheet"
      >
        <AnimatePresence mode="wait">
          {sentTo ? (
            <ConfirmSent key="sent" email={sentTo} onBack={() => setSentTo('')} />
          ) : (
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <h2 className="text-xl font-bold text-ink-900">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                {isLogin
                  ? 'Log in to see what’s due.'
                  : 'Start tracking your bills in seconds.'}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      className="input pr-12"
                      placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-400"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl bg-overdue-light px-3.5 py-2.5 text-sm font-medium text-overdue-dark"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={tap}
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLogin ? 'Log in' : 'Create account'}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-500">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={switchMode}
                  className="font-semibold text-brand-700"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function BrandBadge() {
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-800 shadow-fab">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="5" width="16" height="15" rx="3.2" fill="white" fillOpacity="0.16" />
        <rect x="4" y="5" width="16" height="4.5" rx="2" fill="white" fillOpacity="0.35" />
        <path
          d="M8 13.5 L11 16.5 L16.5 10"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function ConfirmSent({ email, onBack }) {
  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="py-4 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
        <MailCheck className="h-8 w-8 text-brand-700" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-ink-900">Check your inbox</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-ink-500">
        We sent a confirmation link to{' '}
        <span className="font-semibold text-ink-700">{email}</span>. Tap it to
        activate your account, then come back and log in.
      </p>
      <button onClick={onBack} className="btn-ghost mt-6 w-full py-3">
        <Mail className="h-4 w-4" />
        Back to login
      </button>
    </motion.div>
  )
}

function prettyError(err) {
  const msg = err?.message || 'Something went wrong. Please try again.'
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.'
  if (/user already registered/i.test(msg)) return 'That email is already registered. Try logging in.'
  if (/email.*invalid|invalid.*email/i.test(msg)) return 'Please enter a valid email address.'
  return msg
}

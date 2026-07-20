import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/AppShell'
import Splash from './components/Splash'
import Dashboard from './pages/Dashboard'
import Bills from './pages/Bills'
import Auth from './pages/Auth'
import { useAuth } from './context/AuthContext'
import { BillsProvider } from './context/BillsContext'
import { pageVariants } from './lib/motion'

// Charts are heavy — only load the Insights bundle when that tab is opened.
const Insights = lazy(() => import('./pages/Insights'))

function Page({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Restoring the session — show the branded splash to avoid an auth flash.
  if (loading) return <Splash />

  // Signed out — the whole app is the auth screen.
  if (!session) return <Auth />

  return (
    <BillsProvider>
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Dashboard /></Page>} />
            <Route path="/bills" element={<Page><Bills /></Page>} />
            <Route
              path="/insights"
              element={
                <Page>
                  <Suspense fallback={<div className="h-40" />}>
                    <Insights />
                  </Suspense>
                </Page>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </BillsProvider>
  )
}

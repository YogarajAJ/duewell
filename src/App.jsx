import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/AppShell'
import ErrorBoundary from './components/ErrorBoundary'
import Splash from './components/Splash'
import Dashboard from './pages/Dashboard'
import Bills from './pages/Bills'
import Insights from './pages/Insights'
import Auth from './pages/Auth'
import { useAuth } from './context/AuthContext'
import { BillsProvider } from './context/BillsContext'
import { pageVariants } from './lib/motion'

// Note: Insights is imported eagerly (not React.lazy). A lazy/Suspense child
// inside <AnimatePresence mode="wait"> can leave the view blank after
// navigating back. Recharts is still isolated in its own `charts` chunk via
// manualChunks, so we keep the caching benefit without the animation glitch.

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
        <ErrorBoundary resetKey={location.pathname}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Page><Dashboard /></Page>} />
              <Route path="/bills" element={<Page><Bills /></Page>} />
              <Route path="/insights" element={<Page><Insights /></Page>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </AppShell>
    </BillsProvider>
  )
}

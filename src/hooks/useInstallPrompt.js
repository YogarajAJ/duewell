import { useEffect, useState } from 'react'

const DISMISS_KEY = 'duewell:install-dismissed'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

/**
 * Manages "Add to Home Screen":
 *  - Android/desktop Chromium: captures beforeinstallprompt for a real prompt.
 *  - iOS Safari: no programmatic API, so we surface manual instructions.
 * Respects a persisted dismissal.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  )
  const [installed, setInstalled] = useState(() => isStandalone())

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const ios = isIos()
  // Show when: not installed, not dismissed, and either we have a deferred
  // prompt (Android/desktop) or we're on iOS Safari (manual instructions).
  const canShow = !installed && !dismissed && (!!deferred || (ios && !isStandalone()))

  const promptInstall = async () => {
    if (!deferred) return null
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    if (outcome === 'accepted') setInstalled(true)
    return outcome
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return { canShow, ios, hasNativePrompt: !!deferred, promptInstall, dismiss }
}

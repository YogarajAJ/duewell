import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * Catches render errors so a crash shows a recoverable message instead of a
 * blank screen. Resets its error state whenever `resetKey` changes (e.g. on
 * route change), so navigating to another tab clears the error.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('DueWell caught an error:', error, info)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-overdue-light text-overdue-dark">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink-900">
            Something went wrong
          </h2>
          <p className="mt-1.5 max-w-xs text-sm text-ink-500">
            That view hit an error. Try another tab, or reload the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-6"
          >
            <RotateCcw className="h-4 w-4" />
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

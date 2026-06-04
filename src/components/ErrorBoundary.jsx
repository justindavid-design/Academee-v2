import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('Application error boundary caught an error', { error, info })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const errorMessage = this.state.error?.message || 'Something went wrong while loading Academee.'

    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-6">
        <div className="theme-card max-w-lg rounded-2xl p-8 text-center shadow-card">
          <p className="text-sm font-semibold tracking-wide text-muted">Application error</p>
          <h1 className="mt-2 text-2xl font-bold text-main">Academee could not finish loading</h1>
          <p className="mt-2 text-muted">{errorMessage}</p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary-token px-4 py-2 font-semibold text-white transition hover:bg-primary-hover"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}

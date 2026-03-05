import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

// Global error handlers to surface runtime errors during development
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    // keep default logging, but surface to console for now
    console.error('Global error:', e.error || e.message || e)
  })
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

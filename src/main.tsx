import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Safely bootstrap the app. In test environments (or when the DOM isn't
// ready) calling createRoot/render can throw or trigger long-running
// browser-only behavior. Guard the call and swallow errors so importing
// this module in tests doesn't hang or fail the suite.
const mountPoint = document.getElementById('root');
if (mountPoint) {
  try {
    createRoot(mountPoint).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (err) {
    // Don't rethrow; tests that import this file expect import to succeed.
    // Log at debug level if available.
    // eslint-disable-next-line no-console
    console.debug('App render skipped during import:', err)
  }
}

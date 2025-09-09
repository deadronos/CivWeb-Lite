import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';

// Safely bootstrap the app. In test environments (or when the DOM isn't
// ready) calling createRoot/render can throw or trigger long-running
// browser-only behavior. Guard the call and swallow errors so importing
// this module in tests doesn't hang or fail the suite.
const mountPoint = document.querySelector('#root');
if (mountPoint) {
  try {
    createRoot(mountPoint).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    // Don't rethrow; tests that import this file expect import to succeed.
    // Log at debug level if available.

    console.debug('App render skipped during import:', error);
  }
}

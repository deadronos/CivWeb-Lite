import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export default function LazySpinner({ corner = 'bottom-right' }: { corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const base: React.CSSProperties = {
    position: 'fixed',
    zIndex: 100,
    opacity: 0.9,
    color: 'var(--color-fg)',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid var(--panel-border)',
    borderRadius: 8,
    padding: 6,
  };
  const pos: Record<string, React.CSSProperties> = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };
  const spin: React.CSSProperties = { animation: 'cwl-spin 0.9s linear infinite' };
  return (
    <div style={{ ...base, ...pos[corner] }} aria-label="loading">
      <FiRefreshCw style={spin} />
      <style>
        {`@keyframes cwl-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}
      </style>
    </div>
  );
}

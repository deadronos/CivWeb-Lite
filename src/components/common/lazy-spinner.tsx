import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export default function LazySpinner({
  corner = 'bottom-right',
}: {
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const posClass = corner.replace('-', ' ');
  return (
    <div className={`lazy-spinner ${posClass}`} aria-label="loading">
      <FiRefreshCw className="icon" />
    </div>
  );
}

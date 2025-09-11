import React from 'react';

export type ResourceBadgeProps = {
  name: string;
  value: number;
  delta?: number;
};

export default function ResourceBadge({ name, value, delta }: ResourceBadgeProps) {
  const sign = typeof delta === 'number' && delta !== 0 ? (delta > 0 ? '+' : '−') : '';
  const deltaText =
    typeof delta === 'number' && delta !== 0 ? `${sign}${Math.abs(delta)}` : undefined;
  const isPositive = typeof delta === 'number' && delta > 0;
  return (
    <div
      className="resource-badge"
      role="status"
      aria-label={`resource ${name}`}
      title={`${name}: ${value}${deltaText ? ` (${deltaText})` : ''}`}
    >
      <span className="res-name">{name}</span>
      <span className="res-value">{value}</span>
      {deltaText && <span className={`res-delta ${isPositive ? 'up' : 'down'}`}>{deltaText}</span>}
    </div>
  );
}

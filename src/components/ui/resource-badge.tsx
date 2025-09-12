import React from 'react';

/**
 * @file This file contains the ResourceBadge component, which displays a resource and its value.
 */

/**
 * Represents the properties for the ResourceBadge component.
 * @property name - The name of the resource.
 * @property value - The value of the resource.
 * @property delta - The change in the resource value.
 */
export type ResourceBadgeProps = {
  name: string;
  value: number;
  delta?: number;
};

/**
 * A component that displays a resource and its value.
 * @param props - The component properties.
 * @returns The rendered component.
 */
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

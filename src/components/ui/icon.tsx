import React from 'react';
import type { IconType } from 'react-icons';

/**
 * @file This file contains the Icon component, which is a wrapper around the react-icons library.
 */

/**
 * Represents the properties for the Icon component.
 * @property icon - The icon component from react-icons.
 * @property size - The size of the icon.
 * @property title - The title of the icon, for accessibility.
 * @property className - The CSS class name for the icon.
 * @property color - The color of the icon.
 * @property ariaHidden - Whether the icon should be hidden from screen readers.
 */
type IconProperties = {
  icon: IconType;
  size?: number | string;
  title?: string;
  className?: string;
  color?: string;
  ariaHidden?: boolean;
};

/**
 * A wrapper component for the react-icons library.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export default function Icon({
  icon: IconComp,
  size = 16,
  title,
  className,
  color,
  ariaHidden,
}: IconProperties) {
  const ariaProperties = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': ariaHidden ?? true };
  return (
    <span
      className={className}
      title={title ?? undefined}
      style={{ display: 'inline-flex', lineHeight: 0 }}
    >
      <IconComp size={size} color={color} {...(ariaProperties as any)} />
    </span>
  );
}

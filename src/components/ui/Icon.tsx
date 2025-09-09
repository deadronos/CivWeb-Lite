import React from 'react';
import type { IconType } from 'react-icons';

type IconProperties = {
  icon: IconType;
  size?: number | string;
  title?: string;
  className?: string;
  color?: string;
  ariaHidden?: boolean;
};

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

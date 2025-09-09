import React from 'react';
import type { IconType } from 'react-icons';

type IconProps = {
  icon: IconType;
  size?: number | string;
  title?: string;
  className?: string;
  color?: string;
  ariaHidden?: boolean;
};

export default function Icon({ icon: IconComp, size = 16, title, className, color, ariaHidden }: IconProps) {
  const ariaProps = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': ariaHidden ?? true };
  return (
    <span className={className} title={title ?? undefined} style={{ display: 'inline-flex', lineHeight: 0 }}>
      <IconComp size={size} color={color} {...(ariaProps as any)} />
    </span>
  );
}

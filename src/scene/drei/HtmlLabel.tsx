import React from 'react';
import { Html } from '@react-three/drei';

type Properties = React.ComponentProps<typeof Html> & {
  className?: string;
};

export default function HtmlLabel({ children, className = 'label', ...rest }: Properties) {
  return (
    <Html center {...rest}>
      <div className={className}>{children}</div>
    </Html>
  );
}

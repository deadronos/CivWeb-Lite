import React from 'react';
import { Html } from '@react-three/drei';

type Props = React.ComponentProps<typeof Html> & {
  className?: string;
};

export default function HtmlLabel({ children, className = 'label', ...rest }: Props) {
  return (
    <Html center {...rest}>
      <div className={className}>{children}</div>
    </Html>
  );
}

import React from 'react';
import { Html } from '@react-three/drei';

type Properties = React.ComponentProps<typeof Html> & {
  className?: string;
  // allow optional test ids and ARIA attributes which we will apply to inner div
  'data-testid'?: string;
  testid?: string;
} & React.AriaAttributes;

export default function HtmlLabel({ children, className: cssClass = 'label', 'data-testid': dataTestId, testid, ...rest }: Properties) {
  // Properties that belong to the DOM child should not be forwarded into the Drei Html
  // component because applyProps will attempt to apply them to three/fiber objects and
  // can throw (see runtime applyProps errors). We therefore only forward the remaining
  // props to <Html /> and apply DOM-only props to the inner <div>.

  // Whitelist of allowed props for Drei Html
  const htmlProperties = {
    center: rest.center,
    position: rest.position,
    style: rest.style,
    occlude: rest.occlude,
  };

  // Filter out DOM-only props
  const domProperties = {
    'data-testid': dataTestId ?? testid,
    className: cssClass,
  };

  return (
    <Html {...htmlProperties}>
      <div {...domProperties}>
        {children}
      </div>
    </Html>
  );
}

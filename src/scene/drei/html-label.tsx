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

  // Robustly sanitize props: move any DOM-like props to the inner DOM node and
  // forward only cleaned props into the Drei <Html /> component. This avoids
  // forwarding data-/aria-/id/role/className/testid props into three/fiber
  // where applyProps will try to set them on non-DOM targets and throw.

  // Collect DOM-like keys and cleaned props
  const domLikePrefixes = ['data-', 'aria-'];
  const domLikeKeys = new Set(['id', 'role', 'className', 'tabIndex', 'testid', 'testId', 'testID', 'data-testid']);

  const cleanedProperties: Record<string, unknown> = {};
  const domPropertiesFromRest: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(rest)) {
    if (domLikeKeys.has(k) || domLikePrefixes.some(p => k.startsWith(p))) {
      domPropertiesFromRest[k] = v;
    } else {
      cleanedProperties[k] = v;
    }
  }

  // htmlProperties are the cleaned props we forward to <Html />. We still
  // explicitly allow common Drei/Html props such as center/position/style/occlude
  // by picking them from cleanedProps so we don't accidentally forward event
  // handlers or other app-level props.
  const htmlProperties = {
    center: (cleanedProperties as any).center,
    position: (cleanedProperties as any).position,
    style: (cleanedProperties as any).style,
    occlude: (cleanedProperties as any).occlude,
  };

  // Compose DOM properties to apply to the inner <div>
  const domProperties = {
    'data-testid': dataTestId ?? testid ?? (domPropertiesFromRest['data-testid'] as string | undefined) ?? (domPropertiesFromRest['dataTestId'] as string | undefined),
    className: cssClass,
    // Spread any other DOM-like props we captured (id, role, aria-*, etc.)
    ...domPropertiesFromRest,
  };

  // In development, log incoming keys so we can discover any unexpected prop
  // names that still reach this wrapper at runtime (e.g., testid variants).
  if (globalThis.window !== undefined && process.env.NODE_ENV === 'development') {
    // Use a microtask to avoid logging during render in React strict mode twice
    Promise.resolve().then(() => {
      console.log('HtmlLabel received props:', Object.keys(rest));
      console.log('HtmlLabel dom-like keys captured:', Object.keys(domPropertiesFromRest));
    });
  }

  return (
    <Html {...htmlProperties}>
      <div {...domProperties}>
        {children}
      </div>
    </Html>
  );
}

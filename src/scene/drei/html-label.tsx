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

  const cleanedProps: Record<string, unknown> = {};
  const domPropsFromRest: Record<string, unknown> = {};

  Object.entries(rest).forEach(([k, v]) => {
    if (domLikeKeys.has(k) || domLikePrefixes.some(p => k.startsWith(p))) {
      domPropsFromRest[k] = v;
    } else {
      cleanedProps[k] = v;
    }
  });

  // htmlProperties are the cleaned props we forward to <Html />. We still
  // explicitly allow common Drei/Html props such as center/position/style/occlude
  // by picking them from cleanedProps so we don't accidentally forward event
  // handlers or other app-level props.
  const htmlProperties = {
    center: (cleanedProps as any).center,
    position: (cleanedProps as any).position,
    style: (cleanedProps as any).style,
    occlude: (cleanedProps as any).occlude,
  };

  // Compose DOM properties to apply to the inner <div>
  const domProperties = {
    'data-testid': dataTestId ?? testid ?? (domPropsFromRest['data-testid'] as string | undefined) ?? (domPropsFromRest['dataTestId'] as string | undefined),
    className: cssClass,
    // Spread any other DOM-like props we captured (id, role, aria-*, etc.)
    ...domPropsFromRest,
  };

  // In development, log incoming keys so we can discover any unexpected prop
  // names that still reach this wrapper at runtime (e.g., testid variants).
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Use a microtask to avoid logging during render in React strict mode twice
    Promise.resolve().then(() => {
      // eslint-disable-next-line no-console
      console.log('HtmlLabel received props:', Object.keys(rest));
      // eslint-disable-next-line no-console
      console.log('HtmlLabel dom-like keys captured:', Object.keys(domPropsFromRest));
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

import React from 'react';

// Runtime-only draggable manager for HUD panels. Does not persist positions.
export default function DraggableManager() {
  // NOTE: This component is intentionally runtime-only. It attaches pointer
  // handlers to HUD DOM nodes to allow users to drag panels during a session.
  // Positions are not persisted across reloads. For tests we simulate pointer
  // events against a dummy DOM node and assert that inline left/top styles
  // are updated correctly. Keep the implementation simple to avoid side
  // effects in SSR or test environments.
  React.useEffect(() => {
    const selectors = [
      '.hud-context',
      '.ui-rightpanel',
      '.ui-leftpanel',
      '.ui-log-list-container',
      '.game-hud',
      '.hud-minimap',
      '.hud-nextturn',
      '.hud-cam-status',
      '.app-error-alert',
    ];

    const elements: HTMLElement[] = [];
    for (const selector of selectors) {
      const nodeList = document.querySelectorAll<HTMLElement>(selector);
      for (let index = 0; index < nodeList.length; index++) {
        const element = nodeList.item(index)!;
        // Skip top menu explicitly in case of broad selectors
        if (element.closest('.ui-topmenu')) continue;
        elements.push(element);
      }
    }

    // Handler factories
    const onPointerDown = (element: HTMLElement) => (event: PointerEvent) => {
      // Only left button
      if ((event as PointerEvent).button && (event as PointerEvent).button !== 0) return;
      const target = element;
      // make sure element is positioned to allow movement
      const style = getComputedStyle(target);
      if (style.position !== 'fixed' && style.position !== 'absolute') {
        target.style.position = 'fixed';
      }

      // Compute initial offsets
      const rect = target.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const offsetX = startX - rect.left;
  const offsetY = startY - rect.top;

      // Clear conflicting anchors so left/top work predictably
      target.style.right = 'auto';
      target.style.bottom = 'auto';

      // Apply visual affordance
      target.style.cursor = 'grabbing';
      target.style.touchAction = 'none';

      const onMove = (eventMove: PointerEvent) => {
        eventMove.preventDefault();
        const x = eventMove.clientX - offsetX;
        const y = eventMove.clientY - offsetY;
        target.style.left = `${Math.max(8, x)}px`;
        target.style.top = `${Math.max(8, y)}px`;
      };

      const onUp = (eventUp: PointerEvent) => {
        try { (target as HTMLElement).releasePointerCapture(eventUp.pointerId); } catch {}
        target.style.cursor = 'grab';
        globalThis.removeEventListener('pointermove', onMove);
        globalThis.removeEventListener('pointerup', onUp);
      };

      try { target.setPointerCapture((event as PointerEvent).pointerId); } catch {}
      globalThis.addEventListener('pointermove', onMove);
      globalThis.addEventListener('pointerup', onUp);
    };

    const cleanupFns: Array<() => void> = [];
    for (const element of elements) {
      // add affordance and handler
      element.style.cursor = 'grab';
      const handler = onPointerDown(element);
      element.addEventListener('pointerdown', handler as EventListener);
      cleanupFns.push(() => element.removeEventListener('pointerdown', handler as EventListener));
    }

    return () => {
      for (const function_ of cleanupFns) function_();
    };
  }, []);
  return <></>;
}


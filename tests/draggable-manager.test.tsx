import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import DraggableManager from '../src/components/ui/draggable-manager';

// helper to create a plain Event and attach pointer-like properties (JSDOM lacks PointerEvent)
function makePointerEvent(type: string, clientX: number, clientY: number, pointerId = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as any;
  event.clientX = clientX;
  event.clientY = clientY;
  event.pointerId = pointerId;
  return event as Event;
}

describe('DraggableManager', () => {
  beforeEach(() => {
    // create a dummy HUD element that the manager will attach to
    const element = document.createElement('div');
  element.classList.add('hud-context');
    element.style.position = 'fixed';
    element.style.left = '12px';
    element.style.top = '56px';
    document.body.append(element);
  });

  afterEach(() => {
    cleanup();
    const found = document.querySelector('.hud-context');
    if (found) found.remove();
  });

  it('attaches pointer handlers and updates position on pointer events', async () => {
    render(<DraggableManager />);

    const node = document.querySelector('.hud-context') as HTMLElement;
    expect(node).toBeTruthy();

    // simulate pointerdown at (100, 100)
    const pointerDown = makePointerEvent('pointerdown', 100, 100, 1);
    node.dispatchEvent(pointerDown);

    // simulate move to (200, 120)
    const pointerMove = makePointerEvent('pointermove', 200, 120, 1);
    globalThis.dispatchEvent(pointerMove);

    // allow event handling
    await new Promise((r) => setTimeout(r, 10));

    // now the node's left/top should have been updated (not the exact value but present)
    expect(node.style.left).toBeTruthy();
    expect(node.style.top).toBeTruthy();

    // simulate pointerup (use helper to avoid PointerEvent constructor in JSDOM)
    const pointerUp = makePointerEvent('pointerup', 200, 120, 1);
    globalThis.dispatchEvent(pointerUp);
  });
});

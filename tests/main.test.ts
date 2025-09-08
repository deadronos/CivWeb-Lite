import { describe, it, expect, vi } from 'vitest';

// mock react-dom/client before importing main so it doesn't attempt real DOM render
vi.mock('react-dom/client', () => ({ createRoot: () => ({ render: () => null }) }));

describe('main bootstrap', () => {
  it('can import main without throwing', async () => {
    // create a fake root element so main.tsx findElement
    const d = document.createElement('div');
    d.id = 'root';
    document.body.appendChild(d);
    // dynamic import so mock applies
    await import('../src/main');
    document.body.removeChild(d);
    expect(true).toBe(true);
  }, 20000);
});

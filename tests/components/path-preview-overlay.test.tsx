import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useGame } from '../../src/hooks/use-game';
import { PathPreviewOverlay } from '../../src/components/game/path-preview-overlay';

vi.mock('../../src/hooks/use-game', () => ({
  useGame: vi.fn(),
}));

describe('PathPreviewOverlay', () => {
  const mockUseGame = useGame as vi.MockedFunction<typeof useGame>;

  it('renders arrows for preview path', () => {
    mockUseGame.mockReturnValue({
      state: {
        ui: { previewPath: ['t1', 't2'] },
        contentExt: { units: { 'unit1': {} }, tiles: { t1: { q: 0, r: 0 }, t2: { q: 1, r: 0 } } },
      },
      dispatch: vi.fn(),
    });
    render(<PathPreviewOverlay selectedUnitId="unit1" />);
    expect(screen.getByTestId('path-preview-overlay')).toBeInTheDocument();
  });

  it('does not render without path', () => {
    mockUseGame.mockReturnValue({
      state: { ui: { previewPath: [] } },
      dispatch: vi.fn(),
    });
    const { container } = render(<PathPreviewOverlay selectedUnitId="unit1" />);
    expect(container.firstChild).toBeNull();
  });
});

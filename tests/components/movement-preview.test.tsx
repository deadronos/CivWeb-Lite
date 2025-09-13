import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovementPreview } from '../../src/scene/movement-preview';
import { useGame } from '../../src/hooks/use-game';
import { axialToWorld, DEFAULT_HEX_SIZE } from '../../src/scene/utils/coords';

vi.mock('../../src/hooks/use-game', () => ({
  useGame: vi.fn(),
}));

describe('MovementPreview', () => {
  const mockUseGame = useGame as any;

  it('renders ghost when previewPath exists', () => {
    mockUseGame.mockReturnValue({
      state: {
        ui: { previewPath: ['tileA', 'tileB'] },
        contentExt: { tiles: { tileB: { q: 0, r: 1 } } },
      },
      dispatch: vi.fn(),
    } as any);

    render(<MovementPreview selectedUnitId={'u1'} />);
  const element = screen.getByTestId('movement-preview') as HTMLElement;
  expect(element).toBeInTheDocument();

  const [x, z] = axialToWorld(0, 1, DEFAULT_HEX_SIZE);
  expect(element.dataset.x).toBe(x.toFixed(4));
  expect(element.dataset.z).toBe(z.toFixed(4));
  });

  it('does not render without selectedUnit or path', () => {
    // Case: no selectedUnitId
    mockUseGame.mockReturnValue({ state: { ui: { previewPath: ['t1'] } }, dispatch: vi.fn() } as any);
    const { container } = render(<MovementPreview /> as any);
    expect(container.firstChild).toBeNull();

    // Case: empty path
    mockUseGame.mockReturnValue({ state: { ui: { previewPath: [] } }, dispatch: vi.fn() } as any);
    const { container: c2 } = render(<MovementPreview selectedUnitId={'u1'} /> as any);
    expect(c2.firstChild).toBeNull();
  });
});

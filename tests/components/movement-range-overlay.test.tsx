import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useGame } from '../../src/hooks/use-game';
import { MovementRangeOverlay } from '../../src/components/game/movement-range-overlay';

vi.mock('../../src/hooks/use-game', () => ({
  useGame: vi.fn(),
}));

describe('MovementRangeOverlay', () => {
  const mockUseGame = useGame as vi.MockedFunction<typeof useGame>;

  beforeEach(() => {
    mockUseGame.mockReturnValue({
      state: {
        contentExt: { units: { 'test-unit': { activeStates: new Set() } }, tiles: {} },
        map: { width: 10, height: 10 },
      },
      dispatch: vi.fn(),
    });
  });

  it('renders overlay for selectable unit', () => {
    render(<MovementRangeOverlay selectedUnitId="test-unit" />);
    expect(screen.getByTestId('movement-range-overlay')).toBeInTheDocument();
  });

  it('does not render for moved unit', () => {
    mockUseGame.mockReturnValue({
      state: {
        contentExt: { units: { 'moved-unit': { activeStates: new Set(['moved']) } } },
        map: { width: 10, height: 10 },
      },
      dispatch: vi.fn(),
    });
    render(<MovementRangeOverlay selectedUnitId="moved-unit" />);
    expect(screen.queryByTestId('movement-range-overlay')).not.toBeInTheDocument();
  });
});

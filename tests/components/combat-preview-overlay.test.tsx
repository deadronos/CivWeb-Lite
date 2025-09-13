import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useGame } from '../../src/hooks/use-game';
import { CombatPreviewOverlay } from '../../src/components/game/combat-preview-overlay';

vi.mock('../../src/hooks/use-game', () => ({
  useGame: vi.fn(),
}));

describe('CombatPreviewOverlay', () => {
  const mockUseGame = useGame as vi.MockedFunction<typeof useGame>;

  beforeEach(() => {
    mockUseGame.mockReturnValue({
      state: {
        ui: {
          previewCombat: { attackerStrength: 10, defenderStrength: 8, outcome: 'Win' },
        },
      },
      dispatch: vi.fn(),
    });
  });

  it('renders combat info', () => {
    render(<CombatPreviewOverlay selectedUnitId="attacker" />);
    expect(screen.getByText('Combat Preview')).toBeInTheDocument();
  });

  it('handles confirm button click', () => {
    const mockDispatch = vi.fn();
    mockUseGame.mockReturnValue({
      state: { ui: { previewCombat: { attackerStrength: 10, defenderStrength: 8, outcome: 'Win' } } },
      dispatch: mockDispatch,
    });
    render(<CombatPreviewOverlay selectedUnitId="attacker" />);
    fireEvent.click(screen.getByText('Confirm Attack'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});

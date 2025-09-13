import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '../src/contexts/game-provider';
import TopBarContainer from '../src/components/ui/top-bar-container';
import { useGame } from '../src/hooks/use-game';

describe('TopBarContainer', () => {
  it('renders turn and resource badges from provider', () => {
    render(
      <GameProvider>
        <TopBarContainer />
      </GameProvider>
    );
    expect(screen.getByLabelText('turn').textContent).toContain('0');
    // science/culture badges present even if initial points are 0
    expect(screen.getByLabelText('resource science')).toBeInTheDocument();
    expect(screen.getByLabelText('resource culture')).toBeInTheDocument();
  });

  it('opens research panel when research button clicked', () => {
    function Wrapper() {
      const { state } = useGame();
      return (
        <>
          <TopBarContainer />
          <div data-testid="research-open">{String(state.ui.openPanels.researchPanel)}</div>
        </>
      );
    }

    render(
      <GameProvider>
        <Wrapper />
      </GameProvider>
    );

    fireEvent.click(screen.getByLabelText('topbar research'));
    expect(screen.getByTestId('research-open').textContent).toBe('true');
  });
});

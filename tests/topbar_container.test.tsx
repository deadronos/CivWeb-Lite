import { render, screen } from '@testing-library/react';
import { GameProvider } from '../src/contexts/GameProvider';
import TopBarContainer from '../src/components/ui/TopBarContainer';

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
});


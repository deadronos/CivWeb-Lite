import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '../src/contexts/GameProvider';
import TopBarContainer from '../src/components/ui/TopBarContainer';
import NextTurnControlContainer from '../src/components/ui/NextTurnControlContainer';

describe('NextTurnControl integration', () => {
  it('advances turn via container + provider', () => {
    render(
      <GameProvider>
        <TopBarContainer />
        <NextTurnControlContainer />
      </GameProvider>
    );
    // initial turn 0
    expect(screen.getByLabelText('turn').textContent).toContain('0');
    fireEvent.click(screen.getByRole('button', { name: 'end turn' }));
    expect(screen.getByLabelText('turn').textContent).toContain('1');
    // keyboard
    fireEvent.keyDown(screen.getByRole('button', { name: 'end turn' }), { key: 'Enter' });
    expect(screen.getByLabelText('turn').textContent).toContain('2');
  });
});

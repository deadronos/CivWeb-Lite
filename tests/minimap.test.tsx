import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '../src/contexts/GameProvider';
import { CameraProvider } from '../src/hooks/useCamera';
import MinimapContainer from '../src/components/ui/MinimapContainer';

describe('Minimap', () => {
  it('calls camera.centerOn when clicked', () => {
    const centerOn = vi.fn();
    render(
      <GameProvider>
        <CameraProvider api={{ centerOn }}>
          <MinimapContainer />
        </CameraProvider>
      </GameProvider>
    );
    const mini = screen.getByLabelText('minimap');
    // simulate click roughly at center
    fireEvent.click(mini, { clientX: 10, clientY: 10 });
    expect(centerOn).toHaveBeenCalled();
  });
});


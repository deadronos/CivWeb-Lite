import { render, screen, fireEvent } from '@testing-library/react';
import ContextPanel from "../src/components/ui/context-panel";

describe('ContextPanel', () => {
  it('renders details and handles actions', () => {
    const onDo = vi.fn();
    render(
      <ContextPanel
        title="Tile"
        details={<div>Grassland</div>}
        actions={[{ id: 'a1', label: 'Do Thing', onClick: onDo }]} />

    );
    expect(screen.getByText('Grassland')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Do Thing' }));
    expect(onDo).toHaveBeenCalled();
  });
});
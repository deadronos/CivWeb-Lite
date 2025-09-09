import { render, screen, fireEvent } from '@testing-library/react';
import LeftPanel from '../src/components/ui/LeftPanel';

describe('LeftPanel', () => {
  it('lists techs and allows selecting', () => {
    const onSelect = vi.fn();
    render(
      <LeftPanel
        techs={[
          { id: 't1', name: 'Pottery', cost: 10 },
          { id: 't2', name: 'Bronze Working', cost: 25 },
        ]}
        currentTechId={null}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /select tech pottery/i }));
    expect(onSelect).toHaveBeenCalledWith('t1');
  });
});


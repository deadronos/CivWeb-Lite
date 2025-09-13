import { render, screen, fireEvent } from '@testing-library/react';
import TopBar from '../src/components/ui/top-bar';
import { vi } from 'vitest';

describe('TopBar', () => {
  it('renders turn and resources', () => {
    render(<TopBar turn={3} resources={{ science: { value: 5, delta: +1 }, culture: 2 }} />);
    expect(screen.getByLabelText('turn').textContent).toContain('3');
    expect(screen.getByLabelText('resource science')).toBeInTheDocument();
    expect(screen.getByLabelText('resource culture')).toBeInTheDocument();
  });

  it('calls onOpenResearch when research button clicked', () => {
    const spy = vi.fn();
    render(
      <TopBar
        turn={0}
        resources={{ science: 0, culture: 0 }}
        onOpenResearch={spy}
      />
    );
    fireEvent.click(screen.getByLabelText('topbar research'));
    expect(spy).toHaveBeenCalled();
  });
});

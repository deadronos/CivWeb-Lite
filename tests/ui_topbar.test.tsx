import { render, screen } from '@testing-library/react';
import TopBar from '../src/components/ui/TopBar';

describe('TopBar', () => {
  it('renders turn and resources', () => {
    render(<TopBar turn={3} resources={{ science: { value: 5, delta: +1 }, culture: 2 }} />);
    expect(screen.getByLabelText('turn').textContent).toContain('3');
    expect(screen.getByLabelText('resource science')).toBeInTheDocument();
    expect(screen.getByLabelText('resource culture')).toBeInTheDocument();
  });
});


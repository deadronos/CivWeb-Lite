import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnitSelectionOverlay } from '../src/components/ui/UnitSelectionOverlay';

describe('UnitSelectionOverlay scaffold', () => {
  it('renders when a unit is selected', () => {
    render(
      <UnitSelectionOverlay
        selectedUnitId="u1"
        computedRangeTiles={['t1', 't2']}
        computedPath={['t1', 't2']}
        onPreviewPath={() => {}}
        onIssueMove={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByTestId('unit-selection-overlay')).toBeTruthy();
  });
});

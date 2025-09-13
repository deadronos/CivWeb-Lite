import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CityPanel } from '../src/components/ui/city-panel';

describe('CityPanel', () => {
  it('prompts for target tile when selecting improvement', () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('tile-42');
    const onChoose = vi.fn();
    render(
      <CityPanel
        cityId="c1"
        productionQueue={[]}
        availableItems={[{ id: 'farm', type: 'improvement', label: 'Farm' }]}
        productionPerTurn={2}
        onChooseItem={onChoose}
        onReorderQueue={() => {}}
        onCancelOrder={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Farm'));
    expect(promptSpy).toHaveBeenCalled();
    expect(onChoose).toHaveBeenCalledWith({ type: 'improvement', item: 'farm', targetTileId: 'tile-42' });
    promptSpy.mockRestore();
  });
});

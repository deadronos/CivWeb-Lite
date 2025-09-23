import React from 'react';
import ContextPanel, { ContextAction } from './context-panel';
import { useSelection } from '../../contexts/selection-context';
import { useGame } from '../../hooks/use-game';
import * as rules from '../../game/content/rules';

export default function ContextPanelContainer() {
  const { selectedUnitId, selectedTileId, selectedCityId, setSelectedUnitId, setSelectedTileId, setSelectedCityId } = useSelection();
  const { state, dispatch } = useGame();
  const extension = state.contentExt;

  if (!extension) {
    return <ContextPanel details={<div>No game extension loaded</div>} />;
  }

  // Tile-selected view
  if (selectedTileId) {
    const tile = extension.tiles?.[selectedTileId];
    if (!tile) return <ContextPanel title="Tile" details={<div>Tile not found</div>} />;

    const occupantUnit = tile.occupantUnitId ? extension.units?.[tile.occupantUnitId] : undefined;
    const occupantCity = tile.occupantCityId ? extension.cities?.[tile.occupantCityId] : undefined;

      let yieldsArray: string[] = [];
    try {
      const y = rules.getTileYield(tile);
        yieldsArray = Object.entries(y).map(([k, v]) => `${k}: ${v}`);
    } catch {
      // ignore
    }

    const details = (
      <div>
        <div><b>Tile:</b> {tile.id}</div>
        <div><b>Biome:</b> {tile.biome}</div>
  <div><b>Yields:</b> {yieldsArray.join(', ')}</div>
        {occupantUnit && <div><b>Unit:</b> {occupantUnit.type} ({occupantUnit.id})</div>}
        {occupantCity && <div><b>City:</b> {occupantCity.id}</div>}
      </div>
    );

    const actions: ContextAction[] = [
      { id: 'deselect_tile', label: 'Deselect', onClick: () => setSelectedTileId(undefined) },
      {
        id: 'move_unit_here',
        label: 'Move selected unit here',
        onClick: () => {
          const selectedUnit = state.ui.selectedUnitId;
          if (selectedUnit) {
            dispatch({ type: 'PREVIEW_PATH', payload: { unitId: selectedUnit, targetTileId: selectedTileId } } as any);
          }
        }
      }
    ];

    return <ContextPanel title={`Tile ${tile.id}`} details={details} actions={actions} />;
  }

  // City-selected view
  if (selectedCityId) {
    const city = extension.cities?.[selectedCityId];
    if (!city) return <ContextPanel title="City" details={<div>City not found</div>} />;

      let yieldsArray: string[] = [];
    try {
      const y = rules.getCityYield(extension, city);
        yieldsArray = Object.entries(y).map(([k, v]) => `${k}: ${v}`);
    } catch {
      // ignore
    }

    const details = (
      <div>
        <div><b>City:</b> {city.id}</div>
        <div><b>Owner:</b> {city.ownerId}</div>
        <div><b>Location:</b> {city.location}</div>
  <div><b>Yields:</b> {yieldsArray.join(', ')}</div>
        <div><b>Production Queue:</b> {city.productionQueue?.length ?? 0}</div>
      </div>
    );

    const actions: ContextAction[] = [
      { id: 'deselect_city', label: 'Deselect', onClick: () => setSelectedCityId(undefined) },
      { id: 'open_city_panel', label: 'Open City Panel', onClick: () => dispatch({ type: 'OPEN_CITY_PANEL', payload: { cityId: city.id } } as any) }
    ];

    return <ContextPanel title={`City ${city.id}`} details={details} actions={actions} />;
  }

  // Unit-selected view (fallback)
  if (!selectedUnitId) {
    return <ContextPanel details={<div>No selection</div>} />;
  }

  const unit = extension.units[selectedUnitId];
  if (!unit) return <ContextPanel details={<div>Selected unit not found</div>} />;

  const details = (
    <div>
      <div><b>Unit:</b> {unit.id}</div>
      <div><b>Type:</b> {unit.type}</div>
      <div><b>Owner:</b> {unit.ownerId}</div>
      <div><b>Location:</b> {String(unit.location)}</div>
    </div>
  );

  const actions: ContextAction[] = [];
  if (unit.type === 'settler') {
    actions.push({ id: 'found_city', label: 'Found City', onClick: () => dispatch({ type: 'EXT_FOUND_CITY', payload: { unitId: unit.id } } as any) });
  }
  actions.push({ id: 'deselect', label: 'Deselect', onClick: () => setSelectedUnitId(undefined) });

  return <ContextPanel title="Unit" details={details} actions={actions} />;
}

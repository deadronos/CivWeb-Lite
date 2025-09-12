import React from 'react';
import type { CityPanelProps as CityPanelProperties, ProductionOrder } from '../../game/types/ui';

/**
 * @file This file contains the CityPanel component, which displays information about a city.
 */

/**
 * A component that displays information about a city, including its production queue and available production items.
 * @param props - The component properties.
 * @param props.cityId - The ID of the city.
 * @param props.productionQueue - The production queue of the city.
 * @param props.availableItems - An array of items that can be produced.
 * @param props.productionPerTurn - The production per turn of the city.
 * @param props.onChooseItem - A callback function to choose an item to produce.
 * @param props.onReorderQueue - A callback function to reorder the production queue.
 * @param props.onCancelOrder - A callback function to cancel a production order.
 * @returns The rendered component.
 */
export function CityPanel({
  cityId,
  productionQueue,
  availableItems,
  productionPerTurn,
  onChooseItem,
  onReorderQueue,
  onCancelOrder,
}: CityPanelProperties) {
  const choose = (itemId: string, type: ProductionOrder['type']) => {
    onChooseItem({ type, itemId });
  };
  return (
    <div data-testid="city-panel">
      <h3>City: {cityId}</h3>
      <div>Production/turn: {productionPerTurn}</div>
      <ul>
        {availableItems.map((it) => (
          <li key={it.id}>
            <button onClick={() => choose(it.id, it.type)}>{it.label}</button>
          </li>
        ))}
      </ul>
      <ol>
        {productionQueue.map((q, index) => (
          <li key={index}>
            {q.type}:{q.itemId} {q.targetTileId ? `@${q.targetTileId}` : ''}
            <button onClick={() => onCancelOrder(index)}>X</button>
          </li>
        ))}
      </ol>
      <button onClick={() => onReorderQueue([...productionQueue])} style={{ display: 'none' }}>
        reorder
      </button>
    </div>
  );
}

export default CityPanel;

import React from 'react';
import type { CityPanelProps, ProductionOrder } from '../../game/types/ui';

export function CityPanel({
  cityId,
  productionQueue,
  availableItems,
  productionPerTurn,
  onChooseItem,
  onReorderQueue,
  onCancelOrder,
}: CityPanelProps) {
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
        {productionQueue.map((q, i) => (
          <li key={i}>
            {q.type}:{q.itemId} {q.targetTileId ? `@${q.targetTileId}` : ''}
            <button onClick={() => onCancelOrder(i)}>X</button>
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

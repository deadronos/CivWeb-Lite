import React from 'react';
import type { CityPanelProperties, ProductionOrder } from '../../game/types/ui';

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
    if (type === 'improvement') {
      const targetTileId = globalThis.window === undefined ? undefined : globalThis.prompt('Target tile id?') || undefined;
      onChooseItem({ type, item: itemId, targetTileId });
    } else {
      onChooseItem({ type, item: itemId });
    }
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
            {q.type}:{q.item} {q.targetTileId ? `@${q.targetTileId}` : ''}
            <button onClick={() => onCancelOrder(index)}>X</button>
          </li>
        ))}
      </ol>
      <button onClick={() => onReorderQueue([...productionQueue])} className="hidden">
        reorder
      </button>
    </div>
  );
}

export default CityPanel;

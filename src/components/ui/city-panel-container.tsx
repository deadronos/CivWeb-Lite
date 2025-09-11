import React, { useMemo } from 'react';
import { useGame } from '../../hooks/use-game';
import { CityPanel } from './city-panel';
import { ProductionOrder } from '../../game/types/ui';

export function CityPanelContainer({ cityId }: { cityId: string }) {
  const { state, dispatch } = useGame();
  const extension = state.contentExt;
  
  const city = extension?.cities[cityId];
  if (!city) return null;

  // Convert internal production queue to UI format
  const productionQueue: ProductionOrder[] = city.productionQueue.map(order => ({
    type: order.type,
    itemId: order.item,
    // TODO: Store targetTileId in internal format when implementing improvement targeting
  }));

  // Mock available items for now - in a real implementation this would come from tech tree
  const availableItems = useMemo(() => [
    { id: 'warrior', type: 'unit' as const, label: 'Warrior', cost: 40 },
    { id: 'settler', type: 'unit' as const, label: 'Settler', cost: 80 },
    { id: 'farm', type: 'improvement' as const, label: 'Farm', cost: 20 },
    { id: 'mine', type: 'improvement' as const, label: 'Mine', cost: 30 },
    { id: 'granary', type: 'building' as const, label: 'Granary', cost: 60 },
  ], []);

  // Calculate production per turn - simplified for now
  const productionPerTurn = city.population * 2;

  return (
    <CityPanel
      cityId={cityId}
      productionQueue={productionQueue}
      availableItems={availableItems}
      productionPerTurn={productionPerTurn}
      onChooseItem={(order) => {
        dispatch({ type: 'CHOOSE_PRODUCTION_ITEM', payload: { cityId, order } });
      }}
      onReorderQueue={(newQueue) => {
        dispatch({ type: 'REORDER_PRODUCTION_QUEUE', payload: { cityId, newQueue } });
      }}
      onCancelOrder={(orderIndex) => {
        dispatch({ type: 'CANCEL_ORDER', payload: { cityId, orderIndex } });
      }}
    />
  );
}

export default CityPanelContainer;
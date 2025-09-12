import React, { useMemo } from 'react';
import type { CityProductionOrder } from '../../game/content/types';
import { getCityYield } from '../../game/content/rules';
import type { GameStateExtension } from '../../game/content/types';

interface ProductionQueueProperties {
  cityId: string;
  state: GameStateExtension;
}

export function ProductionQueue({ cityId, state }: ProductionQueueProperties) {
  const city = state.cities[cityId];
  if (!city) return null;

  const queueWithProgress = useMemo(() => 
    city.productionQueue.map(order => ({
      ...order,
      estimatedCompletion: order.turnsRemaining * (getCityYield(state, city).production || 1)
    }))
  , [city.productionQueue.length, cityId]); // Dep on length; recompute only on queue changes

  return (
    <ul>
      {queueWithProgress.map((item, index) => (
        <li key={index}>
          {item.item} ({item.turnsRemaining} turns)
        </li>
      ))}
    </ul>
  );
}

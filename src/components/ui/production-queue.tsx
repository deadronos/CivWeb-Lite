import React, { useMemo } from 'react';
import type { CityProductionOrder } from '../../game/content/types';
import { getCityYield } from '../../game/content/rules';
import type { GameStateExtension } from '../../game/content/types';

/**
 * @file This file contains the ProductionQueue component, which displays the production queue for a city.
 */

/**
 * Represents the properties for the ProductionQueue component.
 * @property cityId - The ID of the city.
 * @property state - The game state extension.
 */
interface ProductionQueueProps {
  cityId: string;
  state: GameStateExtension;
}

/**
 * A component that displays the production queue for a city.
 * @param props - The component properties.
 * @returns The rendered component, or null if the city is not found.
 */
export function ProductionQueue({ cityId, state }: ProductionQueueProps) {
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

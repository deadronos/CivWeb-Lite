import React, { useMemo } from 'react';
import { useGame } from '../../hooks/use-game';
import { CityPanel } from './city-panel';
import { ProductionOrder } from '../../game/types/ui';

/**
 * @file This file contains the CityPanelContainer component, which is a container for the CityPanel component.
 */

/**
 * A container component for the CityPanel component.
 * It fetches the city data from the game state and passes it to the CityPanel component.
 * @param props - The component properties.
 * @param props.cityId - The ID of the city to display.
 * @returns The rendered component, or null if the city is not found.
 */
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

  const player = state.players.find(p => p.ownerId === city.ownerId); // Assume ownerId on city
  if (!player) return null;

  // Memoized available production items (units, improvements, buildings unlocked by techs)
  const availableProduction = useMemo(() => {
    const { researchedTechIds } = player;
    const allUnits = Object.values(UNIT_TYPES).filter(u => 
      researchedTechIds.includes(u.requires) || u.requires === null // Assume 'requires' field
    );
    const allImprovements = Object.values(IMPROVEMENTS).filter(i => 
      researchedTechIds.includes(i.requires) || i.requires === null
    );
    const allBuildings = Object.values(BUILDINGS).filter(b => 
      researchedTechIds.includes(b.requires) || b.requires === null
    );
    return { units: allUnits, improvements: allImprovements, buildings: allBuildings };
  }, [player.researchedTechIds.length]); // Optimize dep on length; full array if needed for specifics

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
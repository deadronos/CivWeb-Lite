/**
 * @file This file contains type definitions for the UI components.
 */

/**
 * Represents the payload for a unit move action.
 * @property unitId - The ID of the unit to move.
 * @property path - An array of tile IDs representing the path to move along.
 * @property confirmCombat - Whether to confirm combat if the move results in an attack.
 */
export interface UnitMovePayload {
  unitId: string;
  path: string[];
  confirmCombat?: boolean;
}

/**
 * Represents the type of a production order.
 */
export type ProductionOrderType = 'unit' | 'improvement' | 'building';

/**
 * Represents a production order in a city.
 * @property type - The type of item being produced.
 * @property itemId - The ID of the item being produced.
 * @property targetTileId - The ID of the tile to build the improvement on, if applicable.
 */
export interface ProductionOrder {
  type: ProductionOrderType;
  itemId: string;
  targetTileId?: string;
}

/**
 * Represents a research order.
 * @property techId - The ID of the technology to research.
 */
export interface ResearchOrder {
  techId: string;
}

/**
 * Represents the properties for the unit selection overlay component.
 * @property selectedUnitId - The ID of the currently selected unit.
 * @property computedRangeTiles - An array of tile IDs that the unit can move to.
 * @property computedPath - An array of tile IDs representing the path preview for the unit.
 * @property onPreviewPath - A callback function to preview a path.
 * @property onIssueMove - A callback function to issue a move order.
 * @property onCancel - A callback function to cancel the selection.
 */
export interface UnitSelectionOverlayProperties {
  selectedUnitId: string | null;
  computedRangeTiles: string[];
  computedPath?: string[];
  onPreviewPath: (targetTileId: string) => void;
  onIssueMove: (payload: UnitMovePayload) => void;
  onCancel: () => void;
}

/**
 * Represents the properties for the city panel component.
 * @property cityId - The ID of the city.
 * @property productionQueue - The production queue of the city.
 * @property availableItems - An array of items that can be produced.
 * @property productionPerTurn - The production per turn of the city.
 * @property onChooseItem - A callback function to choose an item to produce.
 * @property onReorderQueue - A callback function to reorder the production queue.
 * @property onCancelOrder - A callback function to cancel a production order.
 */
export interface CityPanelProperties {
  cityId: string;
  productionQueue: ProductionOrder[];
  availableItems: { id: string; type: ProductionOrderType; label: string; cost?: number }[];
  productionPerTurn: number;
  onChooseItem: (order: ProductionOrder) => void;
  onReorderQueue: (newQueue: ProductionOrder[]) => void;
  onCancelOrder: (index: number) => void;
}

/**
 * Represents the properties for the research panel component.
 * @property playerId - The ID of the player.
 * @property currentResearch - The technology the player is currently researching.
 * @property queue - The research queue of the player.
 * @property availableTechs - An array of technologies that can be researched.
 * @property onStartResearch - A callback function to start researching a technology.
 * @property onQueueResearch - A callback function to queue a technology for research.
 * @property onAutoRecommend - A callback function to automatically recommend a technology to research.
 */
export interface ResearchPanelProperties {
  playerId: string;
  currentResearch: { techId: string; progress: number } | null;
  queue: string[];
  availableTechs: { id: string; label: string; cost: number; prerequisites?: string[] }[];
  onStartResearch: (techId: string) => void;
  onQueueResearch: (techId: string) => void;
  onAutoRecommend?: () => void;
}

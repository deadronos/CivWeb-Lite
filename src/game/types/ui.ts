export interface UnitMovePayload {
  unitId: string;
  path: string[];
  confirmCombat?: boolean;
}

export type ProductionOrderType = 'unit' | 'improvement' | 'building';

export interface ProductionOrder {
  type: ProductionOrderType;
  itemId: string;
  targetTileId?: string;
}

export interface ResearchOrder {
  techId: string;
}

// UI component prop helpers (optional convenience types)
export interface UnitSelectionOverlayProps {
  selectedUnitId: string | null;
  computedRangeTiles: string[];
  computedPath?: string[];
  onPreviewPath: (targetTileId: string) => void;
  onIssueMove: (payload: UnitMovePayload) => void;
  onCancel: () => void;
}

export interface CityPanelProps {
  cityId: string;
  productionQueue: ProductionOrder[];
  availableItems: { id: string; type: ProductionOrderType; label: string; cost?: number }[];
  productionPerTurn: number;
  onChooseItem: (order: ProductionOrder) => void;
  onReorderQueue: (newQueue: ProductionOrder[]) => void;
  onCancelOrder: (index: number) => void;
}

export interface ResearchPanelProps {
  playerId: string;
  currentResearch: { techId: string; progress: number } | null;
  queue: string[];
  availableTechs: { id: string; label: string; cost: number; prerequisites?: string[] }[];
  onStartResearch: (techId: string) => void;
  onQueueResearch: (techId: string) => void;
  onAutoRecommend?: () => void;
}
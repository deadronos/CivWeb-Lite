export type ProductionOrderType = 'unit' | 'improvement' | 'building';

export type ProductionOrder = {
  type: ProductionOrderType;
  item: string;
  // canonical engine field
  turnsRemaining?: number;
  // legacy / UI convenience
  turns?: number;
  targetTileId?: string;
};

export default ProductionOrder;

import { UNIT_TYPES, IMPROVEMENTS, BUILDINGS } from '../content/registry';

// Helper to get item cost for production calculation
export function getItemCost(type: string, itemId: string): number {
  switch (type) {
    case 'unit':
      return UNIT_TYPES[itemId]?.cost || 40;
    case 'improvement':
      return IMPROVEMENTS[itemId]?.buildTime || 20;
    case 'building':
      return BUILDINGS[itemId]?.cost || 60;
    default:
      return 10; // fallback
  }
}

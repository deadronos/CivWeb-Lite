import type { Draft } from 'immer';
import { GameAction, ProductionOrder } from '../actions';
import { GameState } from '../types';
import { globalGameBus } from '../events';
import { findPlayer } from '../utils/player';
import { getItemCost } from '../utils/cost';
import type { CityProductionOrder } from '../content/types';
import { getCityYield } from '../content/rules';

export function playerReducer(draft: Draft<GameState>, action: GameAction): void {
  switch (action.type) {
    case 'SET_RESEARCH': {
      const playerId = (action as any).playerId as string;
      const techId = (action as any).payload?.techId as string | undefined;
      if (!playerId || !techId) break;
      const player = findPlayer(draft.players, playerId);
      const tech = draft.techCatalog.find((t) => t.id === techId);
      if (!player || !tech) break;
      const hasPrereqs = (tech.prerequisites || []).every((p: string) =>
        player.researchedTechIds?.includes(p)
      );
      if (!hasPrereqs) break;
      player.researching = { techId, progress: 0 } as any;
      break;
    }
    case 'ADVANCE_RESEARCH': {
      const playerId = (action as any).playerId as string;
      const pts = (action as any).payload?.points as number | undefined;
      if (!playerId) break;
      const player = findPlayer(draft.players, playerId);
      if (!player || !player.researching) break;
      const tech = draft.techCatalog.find((t) => t.id === player.researching!.techId);
      if (!tech) break;
      const add = typeof pts === 'number' ? pts : (player.sciencePoints ?? 0);
      player.researching.progress = (player.researching.progress ?? 0) + add;
  if (player.researching.progress >= tech.cost) {
  if (!player.researchedTechIds) player.researchedTechIds = [] as any;
  player.researchedTechIds.push(tech.id);
  player.researching = null;
        globalGameBus.emit('tech:unlocked', { playerId: player.id, techId: tech.id });
        // Auto-advance from queue
        if (player.researchQueue && player.researchQueue.length > 0) {
          const nextId = player.researchQueue.shift()!;
          const nextTech = draft.techCatalog.find((t) => t.id === nextId);
          if (nextTech && nextTech.prerequisites.every((p) => player.researchedTechIds.includes(p))) {
            player.researching = { techId: nextId, progress: 0 };
            globalGameBus.emit('researchStarted', { playerId, techId: nextId });
          }
        }
      }
      break;
    }
    case 'QUEUE_RESEARCH': {
      const { playerId, techId } = action.payload;
      const player = findPlayer(draft.players, playerId);
      if (player && techId) {
        if (!player.researchQueue) player.researchQueue = [];
        if (!player.researchQueue.includes(techId)) {
          player.researchQueue.push(techId);
          globalGameBus.emit('researchQueued', { playerId, techId });
        }
      }
      break;
    }
    case 'CHOOSE_PRODUCTION_ITEM': {
      if (draft.contentExt) {
        const extension = draft.contentExt;
        const { cityId, order } = action.payload;
        const city = extension.cities[cityId];
        if (city) {
          // Compute turnsRemaining if not provided
          const maybeTurns = (order as ProductionOrder).turnsRemaining;
          let resolvedTurnsRemaining: number;
          if (typeof maybeTurns === 'number' && maybeTurns > 0) {
            resolvedTurnsRemaining = maybeTurns;
          } else {
            const cost = getItemCost(order.type, order.item);
            const yieldPerTurn = getCityYield(extension, city) || 1;
            resolvedTurnsRemaining = Math.max(1, Math.ceil(cost / Number(yieldPerTurn)));
          }

          const fullOrder: CityProductionOrder = { type: order.type, item: order.item, turnsRemaining: resolvedTurnsRemaining };

          // Replace existing top order if same type
          const top = city.productionQueue[0];
          if (top && top.type === fullOrder.type) {
            top.item = fullOrder.item;
            top.turnsRemaining = fullOrder.turnsRemaining;
          } else {
            city.productionQueue.unshift(fullOrder);
          }
          globalGameBus.emit('productionQueued', { cityId, order: fullOrder });
        }
      }
      break;
    }
    case 'SET_PLAYER_SCORES': {
      const { players } = action.payload;
      for (const p of players) {
        const player = findPlayer(draft.players, p.id);
        if (player) {
          player.sciencePoints = p.sciencePoints;
          player.culturePoints = p.culturePoints;
        }
      }
      break;
    }
  }
}

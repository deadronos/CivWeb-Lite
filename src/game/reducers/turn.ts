import type { Draft } from 'immer';
import { GameAction, ProductionOrder } from '../actions';
import { GameState } from '../types';
import { globalGameBus } from '../events';
import { endTurn as contentEndTurn, getCityYield } from '../content/rules';
import { generateAIDecisions } from '../ai';
import { getItemCost } from '../utils/cost';

export function turnReducer(draft: Draft<GameState>, action: GameAction): void {
  switch (action.type) {
    case 'END_TURN': {
      // Advance research for all players
      for (const player of draft.players) {
        if (player.researching) {
          const tech = draft.techCatalog.find((t) => t.id === player.researching!.techId);
          if (tech) {
            const points = tech.tree === 'science' ? player.sciencePoints : player.culturePoints;
            player.researching.progress += points;
            if (player.researching.progress >= tech.cost) {
              if (!player.researchedTechIds) player.researchedTechIds = [];
              player.researchedTechIds.push(tech.id);
              player.researching = null;
              globalGameBus.emit('tech:unlocked', { playerId: player.id, techId: tech.id });
              // Auto-advance from queue
              if (player.researchQueue && player.researchQueue.length > 0) {
                const nextId = player.researchQueue.shift()!;
                const nextTech = draft.techCatalog.find((t) => t.id === nextId);
                if (nextTech && (nextTech.prerequisites || []).every((p) => player.researchedTechIds?.includes(p))) {
                  player.researching = { techId: nextId, progress: 0 };
                  globalGameBus.emit('researchStarted', { playerId: player.id, techId: nextId });
                }
              }
            }
          }
        }
      }

      // Drive content extension
      if (draft.contentExt) {
        const extension = draft.contentExt;
        extension.playerState.science = Object.keys(extension.cities).length;
        contentEndTurn(extension);
      }

      // AI phase: For non-human players, generate and apply decisions
      for (const player of draft.players) {
        if (player.isHuman) continue;

        globalGameBus.emit('ai:turnStart', { playerId: player.id, turn: draft.turn });

        const aiActions = generateAIDecisions(draft as GameState, player.id);

        // Apply sub-actions directly to draft
        for (const subAction of aiActions) {
          switch (subAction.type) {
            case 'QUEUE_RESEARCH': {
              const { playerId: subPlayerId, techId } = subAction.payload;
              if (subPlayerId === player.id && techId) {
                if (!player.researchQueue) player.researchQueue = [];
                if (!player.researchQueue.includes(techId)) {
                  player.researchQueue.push(techId);
                  globalGameBus.emit('researchQueued', { playerId: subPlayerId, techId });
                }
              }
              break;
            }
            case 'CHOOSE_PRODUCTION_ITEM': {
              const { cityId, order } = subAction.payload;
              if (draft.contentExt) {
                const city = draft.contentExt.cities[cityId];
                if (city && city.ownerId === player.id) {
                  // Compute turnsRemaining if not provided (using getItemCost)
                  const cost = getItemCost(order.type, order.item) || 1;
                  const yieldPerTurn = getCityYield(draft.contentExt, city) || 1;
                  const resolvedTurns = Math.max(1, Math.ceil(cost / Number(yieldPerTurn)));

                  // Create an engine-friendly order with numeric turnsRemaining
                  const engineOrder = { ...order, turnsRemaining: resolvedTurns } as ProductionOrder & { turnsRemaining: number };

                  // Replace or add to queue using the resolved numeric value
                  const top = city.productionQueue[0];
                  if (top && top.type === engineOrder.type && top.item === engineOrder.item) {
                    top.turnsRemaining = engineOrder.turnsRemaining as any;
                  } else {
                    city.productionQueue.unshift(engineOrder as any);
                  }
                  globalGameBus.emit('productionQueued', { cityId, order: engineOrder });
                }
              }
              break;
            }
            case 'SET_UNIT_LOCATION': {
              const { unitId, tileId } = subAction.payload;
              if (draft.contentExt) {
                const unit = draft.contentExt.units[unitId];
                if (unit && unit.ownerId === player.id && draft.contentExt.tiles[tileId]) {
                  const oldTileId = unit.location;
                  unit.location = tileId;
                  // Update occupant on old and new tiles. Normalize keys if coordinates are used.
                  const oldIdKey = typeof oldTileId === 'string' ? oldTileId : `${(oldTileId as any).q},${(oldTileId as any).r}`;
                  if (draft.contentExt.tiles && draft.contentExt.tiles[oldIdKey]) {
                    draft.contentExt.tiles[oldIdKey].occupantUnitId = null; // Simplified, assume single occupant
                  }
                  if (draft.contentExt.tiles && draft.contentExt.tiles[tileId]) {
                    draft.contentExt.tiles[tileId].occupantUnitId = unitId;
                  }
                }
              }
              break;
            }
            case 'RECORD_AI_PERF': {
              if (!draft.aiPerf) draft.aiPerf = { total: 0, count: 0 };
              draft.aiPerf.total += subAction.payload.duration;
              draft.aiPerf.count += 1;
              break;
            }
            // Ignore other actions for now
            default: {
              console.warn(`AI sub-action not handled: ${subAction.type}`);
            }
          }
        }

        globalGameBus.emit('ai:turnEnd', { playerId: player.id, turn: draft.turn });
      }

      draft.turn += 1;
      globalGameBus.emit('turn:end', { turn: draft.turn });
      break;
    }

    case 'AI_PERFORM_ACTIONS': {
      // No-op: Integrated directly into END_TURN for non-human players
      break;
    }

    case 'RECORD_AI_PERF': {
      if (!draft.aiPerf) draft.aiPerf = { total: 0, count: 0 };
      const dur = (action as any).payload?.duration ?? 0;
      draft.aiPerf.total = (draft.aiPerf.total ?? 0) + dur;
      draft.aiPerf.count = (draft.aiPerf.count ?? 0) + 1;
      break;
    }
  }
}

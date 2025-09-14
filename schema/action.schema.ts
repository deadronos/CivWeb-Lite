import { z } from 'zod';
import { UnitState } from '../src/types/unit';
const UnitStateSchema = z.nativeEnum(UnitState);
const ProductionOrderSchema = z.object({
  type: z.enum(['unit', 'improvement', 'building']),
  item: z.string(),
  turnsRemaining: z.number().optional(),
  turns: z.number().optional(),
  targetTileId: z.string().optional(),
});

export const MoveActionSchema = z.object({ type: z.literal('move'), unitId: z.string(), path: z.array(z.string()) });
export const AttackActionSchema = z.object({
  type: z.literal('attack'),
  unitId: z.string(),
  targetUnitId: z.string(),
  confirm: z.boolean().optional(),
});
export const BuildActionSchema = z.object({
  type: z.literal('build'),
  cityId: z.string(),
  itemId: z.string(),
  targetTileId: z.string().optional(),
});
export const ResearchActionSchema = z.object({ type: z.literal('research'), playerId: z.string(), techId: z.string() });
export const EndTurnActionSchema = z.object({ type: z.literal('endTurn') });

// Canonical uppercase action schemas
export const NewGameActionSchema = z.object({
  type: z.literal('NEW_GAME'),
  payload: z.object({
    seed: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    totalPlayers: z.number(),
    humanPlayers: z.number().optional(),
    selectedLeaders: z.array(z.union([z.string(), z.literal('random')]).optional()).optional(),
  }),
});

export const SetResearchActionSchema = z.object({
  type: z.literal('SET_RESEARCH'),
  playerId: z.string(),
  payload: z.object({ techId: z.string() }),
});

// project canonical actions (uppercase) - permissive payloads where shape may vary
export const InitActionSchema = z.object({ type: z.literal('INIT'), payload: z.any().optional() });
export const EndTurnUpperSchema = z.object({ type: z.literal('END_TURN') });
export const LogEventSchema = z.object({ type: z.literal('LOG_EVENT'), payload: z.any().optional() });
export const RecordAIPerfSchema = z.object({ type: z.literal('RECORD_AI_PERF'), payload: z.object({ duration: z.number() }).optional() });

export const AddUnitStateActionSchema = z.object({
  type: z.literal('ADD_UNIT_STATE'),
  payload: z.object({ unitId: z.string(), state: UnitStateSchema }),
});

export const RemoveUnitStateActionSchema = z.object({
  type: z.literal('REMOVE_UNIT_STATE'),
  payload: z.object({ unitId: z.string(), state: UnitStateSchema }),
});

export const IssueMoveActionSchema = z.object({
  type: z.literal('ISSUE_MOVE'),
  payload: z.object({
    unitId: z.string(),
    path: z.array(z.string()),
    confirmCombat: z.boolean().optional(),
  }),
});

export const MoveUnitUpperSchema = z.object({
  type: z.literal('MOVE_UNIT'),
  payload: z.object({ unitId: z.string(), toTileId: z.string() }),
});

export const ExtMoveUnitSchema = z.object({
  type: z.literal('EXT_MOVE_UNIT'),
  payload: z.object({ unitId: z.string(), toTileId: z.string() }),
});

export const ExtIssueMovePathSchema = z.object({
  type: z.literal('EXT_ISSUE_MOVE_PATH'),
  payload: z.object({ unitId: z.string(), path: z.array(z.string()), confirmCombat: z.boolean().optional() }),
});

export const ReorderProductionQueueActionSchema = z.object({
  type: z.literal('REORDER_PRODUCTION_QUEUE'),
  payload: z.object({
    cityId: z.string(),
    reorderedQueue: z.array(ProductionOrderSchema),
  }),
});

export const CancelProductionOrderActionSchema = z.object({
  type: z.literal('CANCEL_PRODUCTION_ORDER'),
  payload: z.object({
    cityId: z.string(),
    orderIndex: z.number(),
  }),
});

export const SwitchResearchPolicyActionSchema = z.object({
  type: z.literal('SWITCH_RESEARCH_POLICY'),
  payload: z.object({
    playerId: z.string(),
    policy: z.enum(['preserveProgress', 'discardProgress']),
  }),
});

// Additional strict canonical action schemas (prioritized)
export const AdvanceResearchActionSchema = z.object({
  type: z.literal('ADVANCE_RESEARCH'),
  playerId: z.string(),
  payload: z.object({ points: z.number().optional() }).optional(),
});

export const AutoSimToggleActionSchema = z.object({
  type: z.literal('AUTO_SIM_TOGGLE'),
  payload: z.object({ enabled: z.boolean().optional() }).optional(),
});

export const SelectUnitActionSchema = z.object({
  type: z.literal('SELECT_UNIT'),
  payload: z.object({ unitId: z.string() }),
});

export const PreviewPathActionSchema = z.object({
  type: z.literal('PREVIEW_PATH'),
  payload: z.object({ targetTileId: z.string(), unitId: z.string().optional() }),
});

export const CancelSelectionActionSchema = z.object({
  type: z.literal('CANCEL_SELECTION'),
  payload: z.object({ unitId: z.string().optional() }).optional(),
});

export const OpenCityPanelActionSchema = z.object({
  type: z.literal('OPEN_CITY_PANEL'),
  payload: z.object({ cityId: z.string() }),
});

export const CloseCityPanelActionSchema = z.object({
  type: z.literal('CLOSE_CITY_PANEL'),
  payload: z.object({ cityId: z.string().optional() }).optional(),
});

export const ChooseProductionItemActionSchema = z.object({
  type: z.literal('CHOOSE_PRODUCTION_ITEM'),
  payload: z.object({ cityId: z.string(), order: ProductionOrderSchema }),
});

export const StartResearchActionSchema = z.object({
  type: z.literal('START_RESEARCH'),
  payload: z.object({ playerId: z.string(), techId: z.string() }),
});

export const QueueResearchActionSchema = z.object({
  type: z.literal('QUEUE_RESEARCH'),
  payload: z.object({ playerId: z.string(), techId: z.string() }),
});

export const BeginTurnActionSchema = z.object({
  type: z.literal('BEGIN_TURN'),
  payload: z.object({ playerId: z.string() }),
});

export const EndPlayerPhaseActionSchema = z.object({
  type: z.literal('END_PLAYER_PHASE'),
  payload: z.object({ playerId: z.string() }),
});

export const FortifyUnitActionSchema = z.object({
  type: z.literal('FORTIFY_UNIT'),
  payload: z.object({ unitId: z.string() }),
});

// Remaining uppercase canonical schemas reported missing by the strict sync test
export const AiPerformActionsSchema = z.object({
  type: z.literal('AI_PERFORM_ACTIONS'),
  payload: z.object({ playerId: z.string() }),
});

export const OpenDevPanelActionSchema = z.object({ type: z.literal('OPEN_DEV_PANEL') });
export const CloseDevPanelActionSchema = z.object({ type: z.literal('CLOSE_DEV_PANEL') });

export const OpenSpecPanelActionSchema = z.object({ type: z.literal('OPEN_SPEC_PANEL') });
export const CloseSpecPanelActionSchema = z.object({ type: z.literal('CLOSE_SPEC_PANEL') });

export const OpenResearchPanelActionSchema = z.object({ type: z.literal('OPEN_RESEARCH_PANEL'), payload: z.object({}).optional() });
export const CloseResearchPanelActionSchema = z.object({ type: z.literal('CLOSE_RESEARCH_PANEL'), payload: z.object({}).optional() });

export const LoadStateActionSchema = z.object({ type: z.literal('LOAD_STATE'), payload: z.any() });

export const ExtAddTileActionSchema = z.object({
  type: z.literal('EXT_ADD_TILE'),
  payload: z.object({ tile: z.object({ id: z.string(), q: z.number(), r: z.number(), biome: z.string() }) }),
});

export const ExtAddCityActionSchema = z.object({
  type: z.literal('EXT_ADD_CITY'),
  payload: z.object({ cityId: z.string(), name: z.string(), ownerId: z.string(), tileId: z.string() }),
});

export const ExtAddUnitActionSchema = z.object({
  type: z.literal('EXT_ADD_UNIT'),
  payload: z.object({ unitId: z.string(), type: z.string(), ownerId: z.string(), tileId: z.string() }),
});

export const ExtBeginResearchActionSchema = z.object({ type: z.literal('EXT_BEGIN_RESEARCH'), payload: z.object({ techId: z.string() }) });
export const ExtBeginCultureResearchActionSchema = z.object({ type: z.literal('EXT_BEGIN_CULTURE_RESEARCH'), payload: z.object({ civicId: z.string() }) });

export const ExtFoundCityActionSchema = z.object({
  type: z.literal('EXT_FOUND_CITY'),
  payload: z.object({ unitId: z.string(), tileId: z.string().optional(), cityId: z.string().optional(), name: z.string().optional(), requestId: z.string().optional() }),
});

export const ExtQueueProductionActionSchema = z.object({
  type: z.literal('EXT_QUEUE_PRODUCTION'),
  payload: z.object({ cityId: z.string(), order: ProductionOrderSchema }),
});

export const RemoveTileImprovementActionSchema = z.object({
  type: z.literal('REMOVE_TILE_IMPROVEMENT'),
  payload: z.object({ tileId: z.string(), improvementId: z.string() }),
});

export const SetTileImprovementActionSchema = z.object({
  type: z.literal('SET_TILE_IMPROVEMENT'),
  payload: z.object({ tileId: z.string(), improvementId: z.string() }),
});

export const SetCityTileActionSchema = z.object({
  type: z.literal('SET_CITY_TILE'),
  payload: z.object({ cityId: z.string(), tileId: z.string() }),
});

export const SetUnitLocationActionSchema = z.object({
  type: z.literal('SET_UNIT_LOCATION'),
  payload: z.object({ unitId: z.string(), tileId: z.string() }),
});

export const SetPlayerScoresActionSchema = z.object({
  type: z.literal('SET_PLAYER_SCORES'),
  payload: z.object({ players: z.array(z.object({ id: z.string(), sciencePoints: z.number(), culturePoints: z.number() })) }),
});

export const GameActionSchema = z.discriminatedUnion('type', [
  MoveActionSchema,
  AttackActionSchema,
  BuildActionSchema,
  ResearchActionSchema,
  EndTurnActionSchema,
  // permissive upper-case variants used in lower-level reducer wiring
  InitActionSchema,
  EndTurnUpperSchema,
  LogEventSchema,
  RecordAIPerfSchema,
  NewGameActionSchema,
  SetResearchActionSchema,
  AddUnitStateActionSchema,
  RemoveUnitStateActionSchema,
  IssueMoveActionSchema,
  MoveUnitUpperSchema,
  ExtMoveUnitSchema,
  ExtIssueMovePathSchema,
  ReorderProductionQueueActionSchema,
  CancelProductionOrderActionSchema,
  SwitchResearchPolicyActionSchema,
  // newly added strict canonical schemas
  AdvanceResearchActionSchema,
  AutoSimToggleActionSchema,
  SelectUnitActionSchema,
  PreviewPathActionSchema,
  CancelSelectionActionSchema,
  OpenCityPanelActionSchema,
  CloseCityPanelActionSchema,
  ChooseProductionItemActionSchema,
  StartResearchActionSchema,
  QueueResearchActionSchema,
  BeginTurnActionSchema,
  EndPlayerPhaseActionSchema,
  FortifyUnitActionSchema,
  AiPerformActionsSchema,
  OpenDevPanelActionSchema,
  CloseDevPanelActionSchema,
  OpenSpecPanelActionSchema,
  CloseSpecPanelActionSchema,
  OpenResearchPanelActionSchema,
  CloseResearchPanelActionSchema,
  LoadStateActionSchema,
  ExtAddTileActionSchema,
  ExtAddCityActionSchema,
  ExtAddUnitActionSchema,
  ExtBeginResearchActionSchema,
  ExtBeginCultureResearchActionSchema,
  ExtFoundCityActionSchema,
  ExtQueueProductionActionSchema,
  RemoveTileImprovementActionSchema,
  SetTileImprovementActionSchema,
  SetCityTileActionSchema,
  SetUnitLocationActionSchema,
  SetPlayerScoresActionSchema,
]);

// permissive catch-all for runtime events that are not strict game actions
export const AnyActionSchema = z.object({ type: z.string(), payload: z.any().optional() }).catchall(z.any());

export type GameAction = z.infer<typeof GameActionSchema> | z.infer<typeof AnyActionSchema>;

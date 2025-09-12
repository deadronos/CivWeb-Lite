import { z } from 'zod';
import { UnitState } from '../src/types/unit';
const UnitStateSchema = z.nativeEnum(UnitState);

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
  AddUnitStateActionSchema,
  RemoveUnitStateActionSchema,
]);

// permissive catch-all for runtime events that are not strict game actions
export const AnyActionSchema = z.object({ type: z.string(), payload: z.any().optional() }).catchall(z.any());

export type GameAction = z.infer<typeof GameActionSchema> | z.infer<typeof AnyActionSchema>;

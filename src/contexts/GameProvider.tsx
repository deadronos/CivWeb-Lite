export * from './game-provider';
import React, { createContext, useReducer, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { RNGState } from '../game/rng';
import { globalGameBus } from '../game/events';
import { GameState, Tile, PlayerState } from '../game/types';
// Compatibility shim: re-export canonical kebab-case implementation
export * from './game-provider';
export { default } from './game-provider';
import React from 'react';
import { axialToWorld } from '../scene/utils/coords';
import { useGame } from '../hooks/useGame';

export type HoverState = {
  hoverIndex: number | null;
  setHoverIndex: (index: number | null) => void;
};

const HoverContext = React.createContext<HoverState | null>(null);

export function HoverProvider({ children }: { children: React.ReactNode }) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const value = React.useMemo(() => ({ hoverIndex, setHoverIndex }), [hoverIndex]);
  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>;
}

export function useHoverTile(): {
  index: number | null;
  id: string | null;
  coord: { q: number; r: number } | null;
  biome: string | null;
  world: [number, number] | null;
  setHoverIndex: (index: number | null) => void;
} {
  const ctx = React.useContext(HoverContext);
  if (!ctx) throw new Error('useHoverTile must be used within HoverProvider');
  const { hoverIndex, setHoverIndex } = ctx;
  const { state } = useGame();
  const tiles = state.map.tiles;
  const tile = hoverIndex != null ? tiles[hoverIndex] : null;
  const coord = tile ? tile.coord : null;
  const id = tile ? tile.id : null;
  const biome = tile ? (tile as any).biome : null;
  const world = coord ? axialToWorld(coord.q, coord.r) : null;
  return { index: hoverIndex, id, coord, biome, world, setHoverIndex };
}

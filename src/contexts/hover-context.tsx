import React from 'react';
import { axialToWorld } from '../scene/utils/coords';
import { useGame } from "..\\hooks\\use-game";

export type HoverState = {
  hoverIndex: number | undefined;
  setHoverIndex: (index: number | undefined) => void;
};

const HoverContext = React.createContext<HoverState | undefined>(undefined);

export function HoverProvider({ children }: {children: React.ReactNode;}) {
  const [hoverIndex, setHoverIndex] = React.useState<number | undefined>();
  const value = React.useMemo(() => ({ hoverIndex, setHoverIndex }), [hoverIndex]);
  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>;
}

export function useHoverTile(): {
  index: number | undefined;
  id: string | undefined;
  coord: {q: number;r: number;} | undefined;
  biome: string | undefined;
  world: [number, number] | undefined;
  setHoverIndex: (index: number | undefined) => void;
} {
  const context = React.useContext(HoverContext);
  if (!context) throw new Error('useHoverTile must be used within HoverProvider');
  const { hoverIndex, setHoverIndex } = context;
  const { state } = useGame();
  const tiles = state.map.tiles;
  const tile = hoverIndex == undefined ? undefined : tiles[hoverIndex];
  const coord = tile ? tile.coord : undefined;
  const id = tile ? tile.id : undefined;
  const biome = tile ? (tile as any).biome : undefined;
  const world = coord ? axialToWorld(coord.q, coord.r) : undefined;
  return { index: hoverIndex, id, coord, biome, world, setHoverIndex };
}
import React, { createContext, useContext, useState } from 'react'

export type Tile = { x: number; y: number; terrain: 'grass' | 'water' }
export type Unit = { id: string; x: number; y: number; owner: string }

type GameContextType = {
  width: number
  height: number
  grid: Tile[]
  units: Unit[]
  turn: number
  endTurn: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

function generateGrid(w: number, h: number) {
  const arr: Tile[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      arr.push({ x, y, terrain: Math.random() < 0.12 ? 'water' : 'grass' })
    }
  }
  return arr
}

export default function GameProvider({ children }: { children: React.ReactNode }) {
  const width = 16
  const height = 12
  const [grid] = useState(() => generateGrid(width, height))
  const [units, setUnits] = useState<Unit[]>([
    { id: 'u1', x: 2, y: 2, owner: 'player' },
    { id: 'u2', x: 5, y: 4, owner: 'ai' }
  ])
  const [turn, setTurn] = useState(1)

  const endTurn = () => setTurn((t) => t + 1)

  return (
    <GameContext.Provider value={{ width, height, grid, units, turn, endTurn }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}

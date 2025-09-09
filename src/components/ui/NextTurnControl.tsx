import React from 'react';

export type NextTurnControlProps = {
  onNextTurn: () => void;
};

export default function NextTurnControl({ onNextTurn }: NextTurnControlProps) {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNextTurn();
    }
  };
  return (
    <button
      ref={btnRef}
      className="hud-nextturn"
      aria-label="end turn"
      onClick={onNextTurn}
      onKeyDown={onKeyDown}
    >
      End Turn
    </button>
  );
}

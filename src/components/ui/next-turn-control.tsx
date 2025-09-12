import React from 'react';

/**
 * @file This file contains the NextTurnControl component, which is a button to end the current turn.
 */

/**
 * Represents the properties for the NextTurnControl component.
 * @property onNextTurn - A callback function to end the current turn.
 */
export type NextTurnControlProps = {
  onNextTurn: () => void;
};

/**
 * A button component to end the current turn.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export default function NextTurnControl({ onNextTurn }: NextTurnControlProps) {
  const buttonReference = React.useRef<HTMLButtonElement | null>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNextTurn();
    }
  };
  return (
    <button
      ref={buttonReference}
      className="hud-nextturn"
      aria-label="end turn"
      onClick={onNextTurn}
      onKeyDown={onKeyDown}
    >
      End Turn
    </button>
  );
}

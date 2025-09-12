import React from 'react';

/**
 * @file This file contains the ContextPanel component, which displays contextual information and actions.
 */

/**
 * Represents a single action in the context panel.
 * @property id - The unique ID of the action.
 * @property label - The label for the action.
 * @property onClick - A callback function to execute when the action is clicked.
 */
export type ContextAction = { id: string; label: string; onClick: () => void };

/**
 * Represents the properties for the ContextPanel component.
 * @property title - The title of the panel.
 * @property details - The details to display in the panel.
 * @property actions - An array of actions to display in the panel.
 */
export type ContextPanelProps = {
  title?: string;
  details?: React.ReactNode;
  actions?: ContextAction[];
};

/**
 * A component that displays contextual information and actions.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export default function ContextPanel({
  title = 'Context',
  details,
  actions = [],
}: ContextPanelProps) {
  return (
    <aside className="hud-context" aria-label="context panel">
      <h2 className="panel-title">{title}</h2>
      <div className="context-details">{details || <em>No selection</em>}</div>
      <div className="context-actions">
        {actions.map((a) => (
          <button key={a.id} onClick={a.onClick} aria-label={a.label} className="context-action">
            {a.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

import React from 'react';

export type ContextAction = { id: string; label: string; onClick: () => void };

export type ContextPanelProperties = {
  title?: string;
  details?: React.ReactNode;
  actions?: ContextAction[];
};

export default function ContextPanel({
  title = 'Context',
  details,
  actions = [],
}: ContextPanelProperties) {
  return (
    <aside className="hud-context" aria-label="context panel">
      <div className="hud-context-left">
        <h2 className="panel-title">{title}</h2>
        <div className="context-details">{details || <em>No selection</em>}</div>
      </div>
      <div className="hud-context-right">
        <div className="context-actions">
          {actions.map((a) => (
            <button key={a.id} onClick={a.onClick} aria-label={a.label} className="context-action">
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

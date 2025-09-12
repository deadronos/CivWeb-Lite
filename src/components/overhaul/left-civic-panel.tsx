import React from 'react';
import civics from '../../data/civics.json';
import techs from '../../data/techs.json';

/**
 * @file This file contains the LeftCivicPanel component, which displays the civics and science trees.
 */

/**
 * A component that displays the civics and science trees.
 * @param props - The component properties.
 * @param props.open - Whether the panel is open.
 * @param props.onClose - A callback function to close the panel.
 * @returns The rendered component.
 */
export default function LeftCivicPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = React.useState<'science' | 'culture'>('culture');
  if (!open) return;
  const list = tab === 'culture' ? (civics as any[]) : (techs as any[]);
  return (
    <aside className="ui-leftpanel" aria-label="research chooser">
      <div className="panel-header">
        <div className="tabs">
          <button
            className={tab === 'culture' ? 'tab active' : 'tab'}
            onClick={() => setTab('culture')}
          >
            Civics
          </button>
          <button
            className={tab === 'science' ? 'tab active' : 'tab'}
            onClick={() => setTab('science')}
          >
            Science
          </button>
        </div>
        <button className="close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="panel-body">
        {list.slice(0, 30).map((it: any) => (
          <button key={it.id || it.name} className="list-item">
            <div className="title">{it.name}</div>
            {it.cost && <div className="meta">Cost: {it.cost}</div>}
          </button>
        ))}
      </div>
    </aside>
  );
}

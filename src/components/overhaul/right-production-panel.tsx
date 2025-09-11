import React from 'react';
import units from '../../data/units.json';
import buildings from '../../data/buildings.json';

export default function RightProductionPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = React.useState<'units' | 'buildings'>('units');
  if (!open) return;
  return (
    <aside className="ui-rightpanel" aria-label="city production">
      <div className="panel-header">
        <div className="tabs">
          <button className={tab === 'units' ? 'tab active' : 'tab'} onClick={() => setTab('units')}>Units</button>
          <button className={tab === 'buildings' ? 'tab active' : 'tab'} onClick={() => setTab('buildings')}>Buildings</button>
        </div>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="panel-body">
        {(tab === 'units' ? (units as any[]) : (buildings as any[])).slice(0, 20).map((it: any) => (
          <button key={it.id || it.name} className="list-item">
            <div className="title">{it.name}</div>
            {it.cost && <div className="meta">Cost: {it.cost}</div>}
          </button>
        ))}
      </div>
    </aside>
  );
}

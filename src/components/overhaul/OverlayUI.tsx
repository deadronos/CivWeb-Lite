import React from 'react';
import { useGame } from '../../hooks/use-game';
import units from '../../data/units.json';
import buildings from '../../data/buildings.json';
import civics from '../../data/civics.json';
import techs from '../../data/techs.json';

type PanelProps = { open: boolean; onClose: () => void };

export default function OverlayUI() {
  const [showRight, setShowRight] = React.useState(false);
  const [showLeft, setShowLeft] = React.useState(false);

  return (
    <>
      <TopMenu
        onOpenResearch={() => setShowLeft(true)}
        onOpenCities={() => setShowRight(true)}
      />
      <StatsBar />
      <LeftCivicPanel open={showLeft} onClose={() => setShowLeft(false)} />
      <RightProductionPanel open={showRight} onClose={() => setShowRight(false)} />
    </>
  );
}

function TopMenu({ onOpenResearch, onOpenCities }: { onOpenResearch: () => void; onOpenCities: () => void }) {
  const Item = (p: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button className="ui-topmenu-item" onClick={p.onClick}>
      {p.children}
    </button>
  );
  return (
    <div className="ui-topmenu" role="navigation" aria-label="top menu">
      <div className="ui-topmenu-left">
        <Item>Map</Item>
        <Item>Government</Item>
        <Item onClick={onOpenResearch}>Research</Item>
        <Item>Nations</Item>
        <Item onClick={onOpenCities}>Cities</Item>
        <Item>Options</Item>
        <Item>Manual</Item>
      </div>
      <div className="ui-topmenu-right">
        <button className="ui-turn">Turn Done</button>
      </div>
    </div>
  );
}

function StatsBar() {
  const { state } = useGame();
  // Very light mock numbers; wire real economy later
  const science = 5;
  const culture = 3;
  const gold = 7;
  const resources = [
    { key: 'iron', qty: 2 },
    { key: 'horses', qty: 1 },
  ];
  return (
    <div className="ui-statsbar" aria-label="empire stats">
      <span>Turn {state.turn}</span>
      <div className="stat"><b>Science</b> +{science}/t</div>
      <div className="stat"><b>Culture</b> +{culture}/t</div>
      <div className="stat"><b>Gold</b> +{gold}/t</div>
      <div className="stat sep" />
      {resources.map((r) => (
        <div key={r.key} className="stat res">{r.key}: {r.qty}</div>
      ))}
    </div>
  );
}

function RightProductionPanel({ open, onClose }: PanelProps) {
  const [tab, setTab] = React.useState<'units' | 'buildings'>('units');
  if (!open) return null;
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
        {(tab === 'units' ? units : buildings).slice(0, 20).map((it: any) => (
          <button key={it.id || it.name} className="list-item">
            <div className="title">{it.name}</div>
            {it.cost && <div className="meta">Cost: {it.cost}</div>}
          </button>
        ))}
      </div>
    </aside>
  );
}

function LeftCivicPanel({ open, onClose }: PanelProps) {
  const [tab, setTab] = React.useState<'science' | 'culture'>('culture');
  if (!open) return null;
  const list = tab === 'culture' ? civics : techs;
  return (
    <aside className="ui-leftpanel" aria-label="research chooser">
      <div className="panel-header">
        <div className="tabs">
          <button className={tab === 'culture' ? 'tab active' : 'tab'} onClick={() => setTab('culture')}>Civics</button>
          <button className={tab === 'science' ? 'tab active' : 'tab'} onClick={() => setTab('science')}>Science</button>
        </div>
        <button className="close" onClick={onClose}>×</button>
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


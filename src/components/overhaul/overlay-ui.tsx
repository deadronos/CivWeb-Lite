import React from 'react';
import LazySpinner from '../common/lazy-spinner';
import { useGame } from '../../hooks/use-game';
import GameHUD from '../game-hud';
import LogList from '../ui/log-list';

const LeftCivicPanel = React.lazy(() => import('./left-civic-panel'));
const RightProductionPanel = React.lazy(() => import('./right-production-panel'));

type PanelProperties = { open: boolean; onClose: () => void };

export default function OverlayUI() {
  const { state, dispatch } = useGame();
  const [showRight, setShowRight] = React.useState(false);
  const [showLeft, setShowLeft] = React.useState(false);
  
  // Sync with game state
  const researchPanelOpen = state.ui.openPanels.researchPanel || showLeft;
  const cityPanelOpen = !!state.ui.openPanels.cityPanel || showRight;
  
  // Prefetch likely-next chunks shortly after mount (warm-up without blocking):
  React.useEffect(() => {
    const id = setTimeout(() => {
      import('./left-civic-panel');
      import('./right-production-panel');
    }, 500);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <TopMenu 
        onOpenResearch={() => {
          setShowLeft(true);
          dispatch({ type: 'OPEN_RESEARCH_PANEL', payload: {} });
        }} 
        onOpenCities={() => {
          setShowRight(true);
          // Open first city for now - in real implementation would show city list
          const firstCity = state.contentExt && Object.keys(state.contentExt.cities)[0];
          if (firstCity) {
            dispatch({ type: 'OPEN_CITY_PANEL', payload: { cityId: firstCity } });
          }
        }} 
      />
      <StatsBar />
      <LogListContainer />
      <GameHUD />
      <React.Suspense fallback={<LazySpinner />}>
        <LeftCivicPanel open={researchPanelOpen} onClose={() => {
          setShowLeft(false);
          dispatch({ type: 'CLOSE_RESEARCH_PANEL', payload: {} });
        }} />
      </React.Suspense>
      <React.Suspense fallback={<LazySpinner />}>
        <RightProductionPanel open={cityPanelOpen} onClose={() => {
          setShowRight(false);
          dispatch({ type: 'CLOSE_CITY_PANEL', payload: {} });
        }} />
      </React.Suspense>
    </>
  );
}

function TopMenu({
  onOpenResearch,
  onOpenCities,
}: {
  onOpenResearch: () => void;
  onOpenCities: () => void;
}) {
  // call hook once to avoid subtle mismatches and keep values in sync
  const { state, dispatch } = useGame();
  
  const Item = (p: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button className="ui-topmenu-item" onClick={p.onClick}>
      {p.children}
    </button>
  );
  return (
    <div
      className="ui-topmenu"
      role="navigation"
      aria-label="top menu"
      onMouseEnter={() => {
        import('./left-civic-panel');
        import('./right-production-panel');
      }}
    >
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
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            // guard access in case ui or openPanels are undefined
            checked={!!state.ui?.openPanels?.devPanel}
            onChange={(event) => {
              const action = event.target.checked ? { type: 'OPEN_DEV_PANEL' } : { type: 'CLOSE_DEV_PANEL' };
              dispatch(action as any);
            }}
          />
          Dev
        </label>
        <button className="ui-turn" onClick={() => dispatch({ type: 'END_TURN' })}>
          Turn Done
        </button>
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
      <span aria-label="turn">Turn: {state.turn}</span>
      <div className="stat">
        <b>Science</b> +{science}/t
      </div>
      <div className="stat">
        <b>Culture</b> +{culture}/t
      </div>
      <div className="stat">
        <b>Gold</b> +{gold}/t
      </div>
      <div className="stat sep" />
      {resources.map((r) => (
        <div key={r.key} className="stat res">
          {r.key}: {r.qty}
        </div>
      ))}
    </div>
  );
}

function LogListContainer() {
  const { state } = useGame();
  return (
    <div className="ui-log-list-container" role="log" aria-label="event log" aria-live="polite">
        <LogList entries={state.log.slice(-10)}/>
    </div>
  );
}

// (Panels split into separate lazy-loaded components above)

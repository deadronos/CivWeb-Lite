import React from 'react';
import { useGame } from '../hooks/use-game';
import { exportToFile, importFromFile } from '../game/save';
import { TECHS } from '../game/content/registry';
import { loadUnits, loadBuildings } from '../data/loader';
import LoadModal from './ui/load-modal';
import MinimapContainer from './ui/minimap-container';


function GameHUDInner() {
  const { state, dispatch } = useGame();

  const handleSave = async () => {
    // Export using statically imported helper
    exportToFile(state);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    importFromFile(file)
      .then((loaded) => dispatch({ type: 'LOAD_STATE', payload: loaded } as any))
      .catch((error) => console.error(error));
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const toggleAuto = () => dispatch({ type: 'AUTO_SIM_TOGGLE' });

  const regenerate = () => {
    if (globalThis.confirm('Regenerate world with new seed?')) {
      dispatch({ type: 'INIT', payload: { seed: String(Date.now()) } });
    }
  };

  const human = state.players.find((p) => p.isHuman);
  const techSummary = React.useMemo(() => {
    if (!human?.researching) return;
    const tech = state.techCatalog.find((t) => t.id === human.researching!.techId);
    if (!tech) return;
    const pct = Math.floor((human.researching.progress / tech.cost) * 100);
    return `${tech.name} ${pct}%`;
  }, [human, state.techCatalog]);

  const aiAvg =
    state.aiPerf && state.aiPerf.count > 0
      ? (state.aiPerf.total / state.aiPerf.count).toFixed(2)
      : undefined;

  // Content extension HUD bits (cities, science, research progress)
  const extension = state.contentExt;
  const cityCount = extension ? Object.keys(extension.cities).length : 0;
  const extensionResearch = React.useMemo(() => {
    if (!extension?.playerState.research) return;
    const tech = TECHS[extension.playerState.research.techId];
    if (!tech) return;
    const pct = Math.floor((extension.playerState.research.progress / tech.cost) * 100);
    return `${tech.name} ${pct}%`;
  }, [extension?.playerState.research]);
  const extensionCultureResearch = React.useMemo(() => {
    if (!extension?.playerState.cultureResearch || !extension?.civics) return;
    const civic = extension.civics[extension.playerState.cultureResearch.civicId];
    if (!civic) return;
    const pct = Math.floor((extension.playerState.cultureResearch.progress / civic.cost) * 100);
    return `${civic.name} ${pct}%`;
  }, [extension?.playerState.cultureResearch]);

  // Minimal data-backed catalog view (Units/Buildings)
  const [unitList, setUnitList] = React.useState<{
    id: string;
    name: string;
    category: string;
    requires?: string;
  }[]>([]);
  const [buildingList, setBuildingList] = React.useState<
    { id: string; name: string; cost: number }[]
  >([]);
  React.useEffect(() => {
    let on = true;
    loadUnits().then((us) => {
      if (on) setUnitList(us.map((u) => ({ id: u.id, name: u.name, category: u.category })));
    });
    loadBuildings().then((bs) => {
      if (on) setBuildingList(bs.map((b) => ({ id: b.id, name: b.name, cost: b.cost as number })));
    });
    return () => {
      on = false;
    };
  }, []);

  const [showLoad, setShowLoad] = React.useState(false);
  const [loadFocusPaste, setLoadFocusPaste] = React.useState(false);
  React.useEffect(() => {
    const handler = () => {
      setLoadFocusPaste(false);
      setShowLoad(true);
    };
    const handlerPaste = () => {
      setLoadFocusPaste(true);
      setShowLoad(true);
    };
    globalThis.addEventListener('hud:openLoad', handler);
    globalThis.addEventListener('hud:openLoad:paste', handlerPaste);
    return () => {
      globalThis.removeEventListener('hud:openLoad', handler);
      globalThis.removeEventListener('hud:openLoad:paste', handlerPaste);
    };
  }, []);

  const playersSummary =
    state.players.length > 0 ? (
      <div aria-label="game summary" className="players-summary">
        Players:{' '}
        {state.players
          .map((p) => {
            const pv = (p.leader.preferredVictory || []) as string[];
            const badge = pv.length > 0 ? ` [${pv.map((v) => victoryBadge(v)).join('')}]` : '';
            return `${p.id}: ${p.leader.name}${badge}`;
          })
          .join(' · ')}
      </div>
  ) : undefined;

  return (
    <div
      role="region"
      aria-label="game heads up display"
      className="game-hud"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
  <div>Seed: {state.seed}</div>
  <div>Mode: {state.mode}</div>
      {playersSummary}
      <div className="hud-actions">
        <button aria-label="save game" onClick={handleSave}>
          Save…
        </button>
        <button aria-label="open load" onClick={() => setShowLoad(true)}>
          Load…
        </button>
        <input
          id="hud-load-input"
          aria-label="load file"
          type="file"
          accept="application/json"
          className="hidden-file-input"
          onChange={onFileChange}
        />
      </div>
      {techSummary && <div>Research: {techSummary}</div>}
      {extension && (
        <>
          <div />
          <div>Cities: {cityCount}</div>
          <div>Science per turn {extension.playerState.science}</div>
          {typeof extension.playerState.culture === 'number' && (
            <div>Culture per turn {extension.playerState.culture}</div>
          )}
          {extensionResearch && <div>Ext Research: {extensionResearch}</div>}
          {extensionCultureResearch && <div>Ext Civic: {extensionCultureResearch}</div>}
          {state.ui?.openPanels?.devPanel && (
            <>
                      <div className="spec-toggle-row">
                <button
                  aria-label="toggle spec controls"
                  onClick={() =>
                    dispatch(
                      state.ui?.openPanels?.specPanel ? { type: 'CLOSE_SPEC_PANEL' } : { type: 'OPEN_SPEC_PANEL' }
                    )
                  }
                >
                  {state.ui?.openPanels?.specPanel ? 'Hide Spec' : 'Show Spec'}
                </button>
              </div>
              {state.ui?.openPanels?.specPanel && <SpecControls />}
            </>
          )}
        </>
      )}
      {aiAvg && <div>AI Avg: {aiAvg}ms</div>}
      <LoadModal
        open={showLoad}
        onClose={() => setShowLoad(false)}
        autoFocusText={loadFocusPaste}
      />
      <div className="hud-section">
        <div>
          <div className="section-title">Units</div>
          <ul
            aria-label="catalog units"
            className="catalog-list"
          >
            {(extension
              ? unitList.filter(
                  (u) =>
                    extension.playerState.availableUnits?.includes(u.id) ||
                    !u.requires ||
                    extension.playerState.researchedTechs.includes(u.requires)
                )
              : unitList
            ).map((u) => (
              <li key={u.id}>
                {u.name} <span className="muted">({u.category})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="section-title">Buildings</div>
          <ul
            aria-label="catalog buildings"
            className="catalog-list"
          >
            {(extension
              ? buildingList.filter((b) => {
                  const request = (b as any).requires ?? undefined;
                  return (
                    !request ||
                    extension.playerState.researchedTechs.includes(request) ||
                    (extension.playerState.researchedCivics ?? []).includes(request)
                  );
                })
              : buildingList
            ).map((b) => (
              <li key={b.id}>
                {b.name} <span className="muted">({b.cost})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button onClick={toggleAuto} aria-label="toggle simulation">
        {state.autoSim ? 'Pause' : 'Start'}
      </button>
      <button onClick={regenerate} aria-label="regenerate seed">
        Regenerate Seed
      </button>
      <button onClick={handleSave} aria-label="save game">
        Save
      </button>
      <input type="file" accept="application/json" aria-label="load file" onChange={onFileChange} />
      <div><MinimapContainer /></div >
    </div>
  );
}

export default React.memo(GameHUDInner);

function SpecControls() {
  const { state, dispatch } = useGame();
  const extension = state.contentExt!;
  const [moveUnitId, setMoveUnitId] = React.useState('');
  const [moveToTileId, setMoveToTileId] = React.useState('');
  const [spawnUnitType, setSpawnUnitType] = React.useState('');
  const [catalogUnits, setCatalogUnits] = React.useState<
    { id: string; name: string; requires?: string }[]
  >([]);
  const [catalogBuildings, setCatalogBuildings] = React.useState<
    { id: string; name: string; requires?: string }[]
  >([]);
  const [queueBuildingId, setQueueBuildingId] = React.useState('');
  const [cultureCivics, setCultureCivics] = React.useState<
    { id: string; name: string; cost: number; prereqs: string[] }[]
  >([]);
  React.useEffect(() => {
    let on = true;
    import('../data/loader').then((m) =>
      Promise.all([m.loadUnits(), m.loadBuildings(), m.loadCivics() as any]).then(
        ([ulist, blist, clist]) => {
          if (on)
            setCatalogUnits(
              ulist.map((u) => ({
                id: u.id,
                name: u.name,
                requires: (u as any).requires ?? undefined,
              }))
            );
          if (on && ulist.length > 0 && !spawnUnitType) setSpawnUnitType(ulist[0].id);
          if (on)
            setCatalogBuildings(
              blist.map((b) => ({
                id: b.id,
                name: b.name,
                requires: (b as any).requires ?? undefined,
              }))
            );
          if (on && blist.length > 0 && !queueBuildingId) setQueueBuildingId(blist[0].id);
          if (on && clist)
            setCultureCivics(
              clist.map((c: any) => ({
                id: c.id,
                name: c.name,
                cost: c.culture_cost,
                prereqs: c.prereqs,
              }))
            );
        }
      )
    );
    return () => {
      on = false;
    };
  }, []);

  const ensureDemoCity = () => {
    if (!extension) return;
    const cityIds = Object.keys(extension.cities);
    if (cityIds.length > 0) return cityIds[0];
    const tileId = 'hex_demo_city';
    dispatch({
      type: 'EXT_ADD_CITY',
      payload: { cityId: 'city_demo', name: 'Demo City', ownerId: 'player_1', tileId },
    });
    return 'city_demo';
  };

  const startAgriculture = () =>
    dispatch({ type: 'EXT_BEGIN_RESEARCH', payload: { techId: 'agriculture' } });

  const queueWarrior = () => {
    const cid = ensureDemoCity();
    if (!cid) return;
    dispatch({
      type: 'EXT_QUEUE_PRODUCTION',
      payload: { cityId: cid, order: { type: 'unit', item: 'warrior', turns: 2 } },
    });
  };

  const spawnWorker = () => {
    const cid = ensureDemoCity();
    if (!cid) return;
    const city = extension.cities[cid];
    dispatch({
      type: 'EXT_ADD_UNIT',
      payload: {
        unitId: `worker_${Date.now()}`,
        type: 'worker',
        ownerId: city.ownerId,
        tileId: city.location,
      },
    });
  };

  const spawnFromCatalog = () => {
    const cid = ensureDemoCity();
    if (!cid) return;
    const city = extension.cities[cid];
    if (!spawnUnitType) return;
    dispatch({
      type: 'EXT_ADD_UNIT',
      payload: {
        unitId: `${spawnUnitType}_${Date.now()}`,
        type: spawnUnitType,
        ownerId: city.ownerId,
        tileId: city.location,
      },
    });
  };

  const addNeighborTile = () => {
    // create a simple neighbor tile to move to
    dispatch({
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'hex_demo_neighbor', q: 0, r: 1, biome: 'hills' } },
    });
    setMoveToTileId('hex_demo_neighbor');
  };

  const moveUnit = () => {
    if (moveUnitId && moveToTileId)
      dispatch({ type: 'EXT_MOVE_UNIT', payload: { unitId: moveUnitId, toTileId: moveToTileId } });
  };

  const queueBuilding = () => {
    const cid = ensureDemoCity();
    if (!cid) return;
    if (!queueBuildingId) return;
    // Rough turns estimate: map from building cost via same model used for units (turns at production 1)
    const turns = 2;
    dispatch({
      type: 'EXT_QUEUE_PRODUCTION',
      payload: { cityId: cid, order: { type: 'building', item: queueBuildingId, turns } },
    });
  };

  const startCivic = (civicId: string) => {
    dispatch({ type: 'EXT_BEGIN_CULTURE_RESEARCH', payload: { civicId } });
  };

  const researchLabel = extension.playerState.research
    ? `Researching ${extension.playerState.research.techId}`
    : 'Start Agriculture';

  return (
    <div className="spec-controls">
      <div className="strong">Spec Controls</div>
      <div className="spec-controls-row">
        <button onClick={ensureDemoCity}>Add Demo City</button>
        <button onClick={startAgriculture} disabled={!!extension.playerState.research}>
          {researchLabel}
        </button>
        <button onClick={queueWarrior}>Queue Warrior</button>
        <button onClick={spawnWorker}>Spawn Worker</button>
        <label>
          Spawn Unit
          <select
            aria-label="spawn unit select"
            value={spawnUnitType}
              onChange={(event) => setSpawnUnitType(event.target.value)}
          >
            {catalogUnits
              .filter(
                (u) =>
                  extension.playerState.availableUnits?.includes(u.id) ||
                  !u.requires ||
                  extension.playerState.researchedTechs.includes(u.requires)
              )
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
          <button onClick={spawnFromCatalog}>Spawn</button>
        </label>
        <button onClick={addNeighborTile}>Add Neighbor Tile</button>
        <label>
          Unit ID
          <input
            aria-label="unit id"
            value={moveUnitId}
            onChange={(event) => setMoveUnitId(event.target.value)}
            placeholder="unit_..."
          />
        </label>
        <label>
          To Tile ID
          <input
            aria-label="to tile id"
            value={moveToTileId}
            onChange={(event) => setMoveToTileId(event.target.value)}
            placeholder="hex_..."
          />
        </label>
        <button onClick={moveUnit}>Move Unit</button>
        <label>
          Start Civic
          <select
            aria-label="start civic select"
            onChange={(event) => startCivic(event.target.value)}
            value=""
          >
            <option value="" disabled>
              Choose...
            </option>
            {cultureCivics
              .filter((c) =>
                (extension.playerState.researchedCivics ?? []).every((id) => id !== c.id)
              )
              .filter((c) =>
                c.prereqs.every((p) => (extension.playerState.researchedCivics ?? []).includes(p))
              )
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          Queue Building
          <select
            aria-label="queue building select"
            value={queueBuildingId}
            onChange={(event) => setQueueBuildingId(event.target.value)}
          >
            {catalogBuildings.map((b) => {
              // Avoid side-effects during render: don't call ensureDemoCity() here
              // which may dispatch and trigger "update a component while rendering" errors.
              const demoCityId = Object.keys(extension.cities)[0] ?? undefined;
              const built = demoCityId
                ? (extension.cities[demoCityId]?.buildings ?? []).includes(b.id)
                : false;
              const request = b.requires;
              const canBuild =
                !request ||
                extension.playerState.researchedTechs.includes(request) ||
                (extension.playerState.researchedCivics ?? []).includes(request);
              return (
                <option key={b.id} value={b.id} disabled={!canBuild || built}>
                  {b.name}
                  {built ? ' (built)' : (canBuild ? '' : ' (locked)')}
                </option>
              );
            })}
          </select>
          <button onClick={queueBuilding}>Queue</button>
        </label>
      </div>
    </div>
  );
}

/**
 * Developer UI Controls
 * 
 * The SpecControls and Show/Hide Spec button are gated behind the Dev checkbox toggle in the top overlay UI.
 * This toggle sets state.ui.openPanels.devPanel to true/false, and only when true will this dev section render.
 * 
 * To enable: Check the "Dev" checkbox in the top menu (left of End Turn button).
 * Spec controls allow spawning units, queuing production, moving units, adding demo cities/tiles, and starting research/civics for testing.
 * 
 * Note: This is for development/debugging. Consider gating further with import.meta.env.DEV in production builds.
 */

function victoryBadge(v: string): string {
  switch (v) {
    case 'science': {
      return 'SCI';
    }
    case 'culture': {
      return 'CUL';
    }
    case 'domination': {
      return 'DOM';
    }
    case 'diplomacy': {
      return 'DIP';
    }
    default: {
      return v.toUpperCase().slice(0, 3);
    }
  }
}

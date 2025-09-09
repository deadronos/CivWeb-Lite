import React from 'react';
import { useGame } from '../hooks/useGame';
import { exportToFile, importFromFile } from '../game/save';
import { TECHS } from '../game/content/registry';

function GameHUDInner() {
  const { state, dispatch } = useGame();

  const handleSave = async () => {
    // Export using statically imported helper
    exportToFile(state);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    importFromFile(file)
      .then(loaded => dispatch({ type: 'LOAD_STATE', payload: loaded } as any))
      .catch(err => console.error(err));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const toggleAuto = () => dispatch({ type: 'AUTO_SIM_TOGGLE' });

  const regenerate = () => {
    if (window.confirm('Regenerate world with new seed?')) {
      dispatch({ type: 'INIT', payload: { seed: String(Date.now()) } });
    }
  };

  const human = state.players.find(p => p.isHuman);
  const techSummary = React.useMemo(() => {
    if (!human?.researching) return null;
    const tech = state.techCatalog.find(t => t.id === human.researching!.techId);
    if (!tech) return null;
    const pct = Math.floor((human.researching.progress / tech.cost) * 100);
    return `${tech.name} ${pct}%`;
  }, [human, state.techCatalog]);

  const aiAvg = state.aiPerf && state.aiPerf.count > 0 ? (state.aiPerf.total / state.aiPerf.count).toFixed(2) : null;

  // Content extension HUD bits (cities, science, research progress)
  const ext = state.contentExt;
  const cityCount = ext ? Object.keys(ext.cities).length : 0;
  const extResearch = React.useMemo(() => {
    if (!ext?.playerState.research) return null;
    const tech = TECHS[ext.playerState.research.techId];
    if (!tech) return null;
    const pct = Math.floor((ext.playerState.research.progress / tech.cost) * 100);
    return `${tech.name} ${pct}%`;
  }, [ext?.playerState.research]);

  return (
    <div role="region" aria-label="game heads up display" className="game-hud" onDrop={onDrop} onDragOver={onDragOver}>
      <div>Turn: {state.turn}</div>
      <div>Seed: {state.seed}</div>
      <div>Mode: {state.mode}</div>
      {techSummary && <div>Research: {techSummary}</div>}
      {ext && (
        <>
          <div>Cities: {cityCount}</div>
          <div>Science/turn: {ext.playerState.science}</div>
          {extResearch && <div>Ext Research: {extResearch}</div>}
          <SpecControls />
        </>
      )}
      {aiAvg && <div>AI Avg: {aiAvg}ms</div>}
      <button onClick={toggleAuto} aria-label="toggle simulation">{state.autoSim ? 'Pause' : 'Start'}</button>
      <button onClick={regenerate} aria-label="regenerate seed">Regenerate Seed</button>
      <button onClick={handleSave} aria-label="save game">Save</button>
      <input type="file" accept="application/json" aria-label="load file" onChange={onFileChange} />
      <div role="log" aria-label="event log" aria-live="polite">
        <LogList entries={state.log.slice(-10)} />
      </div>
    </div>
  );
}

const LogList = React.memo(function LogList({ entries }: { entries: { type: string }[] }) {
  return (
    <ul>
      {entries.map((e, i) => (
        <li key={i}>{e.type}</li>
      ))}
    </ul>
  );
});

export default React.memo(GameHUDInner);

function SpecControls() {
  const { state, dispatch } = useGame();
  const ext = state.contentExt!;
  const [moveUnitId, setMoveUnitId] = React.useState('');
  const [moveToTileId, setMoveToTileId] = React.useState('');

  const ensureDemoCity = () => {
    if (!ext) return;
    const cityIds = Object.keys(ext.cities);
    if (cityIds.length) return cityIds[0];
    const tileId = 'hex_demo_city';
    dispatch({ type: 'EXT_ADD_CITY', payload: { cityId: 'city_demo', name: 'Demo City', ownerId: 'player_1', tileId } });
    return 'city_demo';
  };

  const startAgriculture = () => dispatch({ type: 'EXT_BEGIN_RESEARCH', payload: { techId: 'agriculture' } });

  const queueWarrior = () => {
    const cid = ensureDemoCity();
    if (!cid) return;
    dispatch({ type: 'EXT_QUEUE_PRODUCTION', payload: { cityId: cid, order: { type: 'unit', item: 'warrior', turns: 2 } } });
  };

  const spawnWorker = () => {
    const cid = ensureDemoCity();
    if (!cid) return;
    const city = ext.cities[cid];
    dispatch({ type: 'EXT_ADD_UNIT', payload: { unitId: `worker_${Date.now()}`, type: 'worker', ownerId: city.ownerId, tileId: city.location } });
  };

  const addNeighborTile = () => {
    // create a simple neighbor tile to move to
    dispatch({ type: 'EXT_ADD_TILE', payload: { tile: { id: 'hex_demo_neighbor', q: 0, r: 1, biome: 'hills' } } });
    setMoveToTileId('hex_demo_neighbor');
  };

  const moveUnit = () => {
    if (moveUnitId && moveToTileId) dispatch({ type: 'EXT_MOVE_UNIT', payload: { unitId: moveUnitId, toTileId: moveToTileId } });
  };

  const researchLabel = ext.playerState.research ? `Researching ${ext.playerState.research.techId}` : 'Start Agriculture';

  return (
    <div style={{ marginTop: 8, padding: 8, borderTop: '1px solid #444' }}>
      <div style={{ fontWeight: 600 }}>Spec Controls</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={ensureDemoCity}>Add Demo City</button>
        <button onClick={startAgriculture} disabled={!!ext.playerState.research}>{researchLabel}</button>
        <button onClick={queueWarrior}>Queue Warrior</button>
        <button onClick={spawnWorker}>Spawn Worker</button>
        <button onClick={addNeighborTile}>Add Neighbor Tile</button>
        <label>
          Unit ID
          <input aria-label="unit id" value={moveUnitId} onChange={e => setMoveUnitId(e.target.value)} placeholder="unit_..." />
        </label>
        <label>
          To Tile ID
          <input aria-label="to tile id" value={moveToTileId} onChange={e => setMoveToTileId(e.target.value)} placeholder="hex_..." />
        </label>
        <button onClick={moveUnit}>Move Unit</button>
      </div>
    </div>
  );
}

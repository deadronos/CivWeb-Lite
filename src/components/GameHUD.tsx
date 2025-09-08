import React from 'react';
import { useGame } from '../hooks/useGame';
import { exportToFile, importFromFile } from '../game/save';

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

  return (
    <div role="region" aria-label="game heads up display" className="game-hud" onDrop={onDrop} onDragOver={onDragOver}>
      <div>Turn: {state.turn}</div>
      <div>Seed: {state.seed}</div>
      <div>Mode: {state.mode}</div>
      {techSummary && <div>Research: {techSummary}</div>}
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

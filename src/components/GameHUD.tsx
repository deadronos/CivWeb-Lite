import React from 'react';
import { useGame } from '../hooks/useGame';
import { exportToFile, importFromFile } from '../game/save';

export default function GameHUD() {
  const { state, dispatch } = useGame();

  const handleSave = () => {
    exportToFile(state);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    importFromFile(file)
      .then(loaded => {
        dispatch({ type: 'LOAD_STATE', payload: loaded } as any);
      })
      .catch(err => {
        console.error(err);
      });
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

  return (
    <div className="game-hud" onDrop={onDrop} onDragOver={onDragOver}>
      <div>Turn: {state.turn}</div>
      <div>Seed: {state.seed}</div>
      <div>Mode: {state.mode}</div>
      <button onClick={toggleAuto}>{state.autoSim ? 'Pause' : 'Start'}</button>
      <button onClick={regenerate}>Regenerate Seed</button>
      <button onClick={handleSave}>Save</button>
      <input type="file" accept="application/json" aria-label="load-file" onChange={onFileChange} />
    </div>
  );
}

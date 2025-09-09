import React from 'react';
import { useGame } from '../../hooks/useGame';
import leaders from '../../data/leaders.json';
const LS_KEY = 'civweblite:newgame';

type MapSizeKey = 'small' | 'standard' | 'large';
const MAP_SIZES: Record<MapSizeKey, { width: number; height: number; label: string }> = {
  small: { width: 30, height: 30, label: 'Small (30x30)' },
  standard: { width: 50, height: 50, label: 'Standard (50x50)' },
  large: { width: 70, height: 70, label: 'Large (70x70)' },
};

type StartConfig = {
  width: number;
  height: number;
  seed?: string;
  totalPlayers: number;
  humanPlayers: number;
  selectedLeaders?: Array<string | 'random' | undefined>;
};

export default function MainMenu({ onStart }: { onStart(config: StartConfig): void }) {
  const { dispatch } = useGame();
  const [size, setSize] = React.useState<MapSizeKey>('standard');
  const [seed, setSeed] = React.useState<string>('');
  const [players, setPlayers] = React.useState<number>(2);
  const humanPlayers = 1; // MVP: one human
  const [selectedLeaders, setSelectedLeaders] = React.useState<
    Array<string | 'random' | undefined>
  >(['random', 'random', 'random', 'random', 'random', 'random']);

  // hydrate from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const cfg = JSON.parse(raw);
      if (cfg.size) setSize(cfg.size);
      if (typeof cfg.seed === 'string') setSeed(cfg.seed);
      if (typeof cfg.players === 'number') setPlayers(cfg.players);
      if (Array.isArray(cfg.selectedLeaders)) setSelectedLeaders(cfg.selectedLeaders);
    } catch (e) {
      // ignore JSON parse/localStorage errors during hydrate in browsers without storage
    }
  }, []);

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    const { width, height } = MAP_SIZES[size];
    const payload: StartConfig = {
      width,
      height,
      seed: seed || undefined,
      totalPlayers: players,
      humanPlayers,
      selectedLeaders: selectedLeaders.slice(0, players),
    };
    dispatch({ type: 'NEW_GAME', payload } as any);
    onStart(payload);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ size, seed, players, selectedLeaders }));
    } catch (e) {
      /* ignore quota errors or storage issues */
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Main Menu" style={styles.backdrop}>
      <form onSubmit={start} style={styles.panel}>
        <h1 style={{ marginTop: 0 }}>CivWeb‑Lite</h1>
        <div style={styles.field}>
          <label htmlFor="size">Map Size</label>
          <select id="size" value={size} onChange={(e) => setSize(e.target.value as MapSizeKey)}>
            {Object.entries(MAP_SIZES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.field}>
          <label htmlFor="seed">Seed (optional)</label>
          <input
            id="seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="random if blank"
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="players">Players (total)</label>
          <input
            id="players"
            type="number"
            min={1}
            max={6}
            value={players}
            onChange={(e) => setPlayers(parseInt(e.target.value || '2', 10))}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>Leaders</div>
          {Array.from({ length: players }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 6,
              }}
            >
              <label>Player {i + 1}</label>
              <select
                aria-label={`Leader for player ${i + 1}`}
                value={selectedLeaders[i] ?? 'random'}
                onChange={(e) => {
                  const next = [...selectedLeaders];
                  next[i] = e.target.value as any;
                  setSelectedLeaders(next);
                }}
              >
                <option value="random">Random</option>
                {(leaders as any[]).map((l) => (
                  <option
                    key={l.id}
                    value={l.id}
                    title={`${l.historical_note || ''} | Victory: ${(l.preferred_victory || []).join(', ')}`}
                  >
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="submit">Start New Game</button>
          <button type="button" onClick={() => document.getElementById('hud-load-input')?.click()}>
            Load Save…
          </button>
          <input
            id="load-input"
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={onLoadFile}
          />
        </div>
        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 12 }}>
          Tip: You can paste JSON in the in‑game load panel.
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  panel: {
    background: 'var(--color-bg, #1e1e1e)',
    color: 'var(--color-fg, #f0f0f0)',
    padding: 20,
    borderRadius: 8,
    width: 360,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  field: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
};

async function onLoadFile(ev: React.ChangeEvent<HTMLInputElement>) {
  const input = ev.currentTarget;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  try {
    const { importFromFile } = await import('../../game/save');
    const state = await importFromFile(file);
    // Lazy import useGame hooks is not possible here; instead dispatch LOAD_STATE via a custom event
    const evt = new CustomEvent('civweblite:loadState', { detail: state });
    window.dispatchEvent(evt);
  } catch (e: any) {
    alert(`Failed to load save: ${e?.message || e}`);
  } finally {
    input.value = '';
  }
}

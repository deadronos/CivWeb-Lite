import React from 'react';
import { useGame } from '../../hooks/use-game';
import leaders from '../../data/leaders.json';
import { MAP_PRESETS } from '../../game/world/config';
const LS_KEY = 'civweblite:newgame';

type MapSizeKey = 'small' | 'medium' | 'large' | 'xlarge';
const MAP_SIZES: Record<MapSizeKey, { width: number; height: number; label: string }> = {
  small: {
    ...MAP_PRESETS.small,
    label: `Small (${MAP_PRESETS.small.width}x${MAP_PRESETS.small.height})`,
  },
  medium: {
    ...MAP_PRESETS.medium,
    label: `Medium (${MAP_PRESETS.medium.width}x${MAP_PRESETS.medium.height})`,
  },
  large: {
    ...MAP_PRESETS.large,
    label: `Large (${MAP_PRESETS.large.width}x${MAP_PRESETS.large.height})`,
  },
  xlarge: {
    ...MAP_PRESETS.xlarge,
    label: `XL (${MAP_PRESETS.xlarge.width}x${MAP_PRESETS.xlarge.height})`,
  },
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
  const [size, setSize] = React.useState<MapSizeKey>('medium');
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
      if (cfg.size > 0 && typeof cfg.size === 'string') setSize(cfg.size as MapSizeKey);
      if (typeof cfg.seed === 'string') setSeed(cfg.seed);
      if (typeof cfg.players === 'number') setPlayers(cfg.players);
      if (Array.isArray(cfg.selectedLeaders)) setSelectedLeaders(cfg.selectedLeaders);
    } catch {
      // ignore JSON parse/localStorage errors during hydrate in browsers without storage
    }
  }, []);

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    const { width, height } = MAP_SIZES[size];
    const payload: StartConfig = {
      width,
      height,
      seed: seed || undefined,
      totalPlayers: players,
      humanPlayers,
      selectedLeaders: selectedLeaders.slice(0, players),
    };
    // Defensive: drop any persisted save slots in localStorage before starting a fresh map
    try {
      // We only persist menu prefs under LS_KEY; if future builds add save keys,
      // clear well-known ones here so new games never pull an outdated map.
      const maybeKeys = ['civweblite:save', 'civweblite:autosave'];
      for (const k of maybeKeys) localStorage.removeItem(k);
    } catch {}
    dispatch({ type: 'NEW_GAME', payload } as any);
    onStart(payload);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ size, seed, players, selectedLeaders }));
    } catch {
      /* ignore quota errors or storage issues */
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Main Menu" style={styles.backdrop}>
      <form onSubmit={start} style={styles.panel}>
        <h1 style={{ marginTop: 0 }}>CivWeb‑Lite</h1>
        <div style={styles.field}>
          <label htmlFor="size">Map Size</label>
          <select
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value as MapSizeKey)}
          >
            {Object.entries(MAP_SIZES).map(([key, sizeObject]) => (
              <option key={key} value={key}>
                {sizeObject.label}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.field}>
          <label htmlFor="seed">Seed (optional)</label>
          <input
            id="seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
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
            onChange={(event) => setPlayers(Number.parseInt(event.target.value || '2', 10))}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>Leaders</div>
          {Array.from({ length: players }).map((_, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 6,
              }}
            >
              <label>Player {index + 1}</label>
              <select
                aria-label={`Leader for player ${index + 1}`}
                value={selectedLeaders[index] ?? 'random'}
                onChange={(e) => {
                  const next = [...selectedLeaders];
                  next[index] = e.target.value as any;
                  setSelectedLeaders(next);
                }}
              >
                <option value="random">Random</option>
                {(leaders as any[]).map((leader) => (
                  <option
                    key={leader.id}
                    value={leader.id}
                    title={`${leader.historical_note || ''} | Victory: ${(leader.preferred_victory || []).join(', ')}`}
                  >
                    {leader.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="submit">Start New Game</button>
          <button
            type="button"
            onClick={() => {
              const element = document.querySelector('#load-input');
              if (element && element instanceof HTMLInputElement) element.click();
            }}
          >
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
    // Allow clicks to pass through the backdrop to HUD elements (tests expect minimap clickable)
    pointerEvents: 'none',
  },
  panel: {
    background: 'var(--color-bg, #1e1e1e)',
    color: 'var(--color-fg, #f0f0f0)',
    padding: 20,
    borderRadius: 8,
    width: 360,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    // Keep the panel itself interactive
    pointerEvents: 'auto',
  },
  field: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
};

async function onLoadFile(event: React.ChangeEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  try {
    const { importFromFile } = await import('../../game/save');
    const state = await importFromFile(file);
    // Lazy import useGame hooks is not possible here; instead dispatch LOAD_STATE via a custom event
    const event = new CustomEvent('civweblite:loadState', { detail: state });
    globalThis.dispatchEvent(event);
  } catch (error: any) {
    alert(`Failed to load save: ${error?.message || error}`);
  } finally {
    input.value = '';
  }
}

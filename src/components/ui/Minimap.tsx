import React from 'react';

export type MinimapProps = {
  width: number;
  height: number;
  onPickCoord: (coord: { q: number; r: number }) => void;
  highlightedTileIds?: string[];
};

export default function Minimap({ width, height, onPickCoord, highlightedTileIds }: MinimapProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const onClick = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // naive mapping: scale to map coordinates and round
    const q = Math.round((x / rect.width) * (width - 1));
    const r = Math.round((y / rect.height) * (height - 1));
    onPickCoord({ q, r });
  };
  return (
    <div
      ref={ref}
      className="hud-minimap"
      role="img"
      aria-label="minimap"
      onClick={onClick}
      style={{ width: 120, height: 120, background: 'var(--color-minimap, #222)' }}
     data-highlight={(highlightedTileIds||[]).join(',')} />
  );
}


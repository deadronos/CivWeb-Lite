// Simple GLTF resolver: maps labels to URLs, or passes through path-like strings.

const MAP: Record<string, string> = {
  // Example defaults; replace with real assets when available.
  warrior: '/models/warrior.glb',
  archer: '/models/archer.glb',
  spearman: '/models/spearman.glb',
  settler: '/models/settler.glb',
  worker: '/models/worker.glb',
  galley: '/models/galley.glb',
};

function looksLikePath(s: string): boolean {
  return s.includes('/') || s.endsWith('.glb') || s.endsWith('.gltf') || s.startsWith('http');
}

export function resolveGLTF(labelOrPath?: string): string | null {
  if (!labelOrPath) return null;
  const key = labelOrPath.trim();
  if (!key) return null;
  if (looksLikePath(key)) return key;
  return MAP[key.toLowerCase()] ?? null;
}

export function gltfEnabled(): boolean {
  const v = (import.meta as any)?.env?.VITE_ENABLE_GLTF;
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true' || v.toLowerCase() === 'yes';
  if (typeof v === 'boolean') return v;
  return false;
}


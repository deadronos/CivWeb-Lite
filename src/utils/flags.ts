/**
 * @file This file contains utility functions for working with feature flags.
 */

/**
 * Checks if GLTF models are enabled.
 * @returns True if GLTF models are enabled, false otherwise.
 */
export function gltfEnabled(): boolean {
  const v = (import.meta as any)?.env?.VITE_ENABLE_GLTF;
  if (typeof v === 'string')
    return v === '1' || v.toLowerCase() === 'true' || v.toLowerCase() === 'yes';
  if (typeof v === 'boolean') return v;
  return false;
}

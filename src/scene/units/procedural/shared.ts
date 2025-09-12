import * as THREE from 'three';

/**
 * @file This file contains shared functions for creating procedural unit models.
 */

type Key = string;
const geoCache = new Map<Key, THREE.BufferGeometry>();

function key(name: string, arguments_: any[]): Key {
  return `${name}:${arguments_.join(',')}`;
}

/**
 * Gets a sphere geometry from the cache, or creates a new one if it doesn't exist.
 * @param radius - The radius of the sphere.
 * @param widthSeg - The number of horizontal segments.
 * @param heightSeg - The number of vertical segments.
 * @returns The sphere geometry.
 */
export function getSphere(radius = 0.2, widthSeg = 16, heightSeg = 12): THREE.SphereGeometry {
  const k = key('sphere', [radius, widthSeg, heightSeg]);
  let g = geoCache.get(k) as THREE.SphereGeometry | undefined;
  if (!g) {
    g = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
    geoCache.set(k, g);
  }
  return g as THREE.SphereGeometry;
}

/**
 * Gets a box geometry from the cache, or creates a new one if it doesn't exist.
 * @param w - The width of the box.
 * @param h - The height of the box.
 * @param d - The depth of the box.
 * @returns The box geometry.
 */
export function getBox(w = 0.5, h = 1, d = 0.3): THREE.BoxGeometry {
  const k = key('box', [w, h, d]);
  let g = geoCache.get(k) as THREE.BoxGeometry | undefined;
  if (!g) {
    g = new THREE.BoxGeometry(w, h, d);
    geoCache.set(k, g);
  }
  return g as THREE.BoxGeometry;
}

/**
 * Gets a cylinder geometry from the cache, or creates a new one if it doesn't exist.
 * @param rTop - The radius of the top of the cylinder.
 * @param rBot - The radius of the bottom of the cylinder.
 * @param h - The height of the cylinder.
 * @param radial - The number of radial segments.
 * @returns The cylinder geometry.
 */
export function getCylinder(rTop = 0.05, rBot = 0.05, h = 1, radial = 8): THREE.CylinderGeometry {
  const k = key('cyl', [rTop, rBot, h, radial]);
  let g = geoCache.get(k) as THREE.CylinderGeometry | undefined;
  if (!g) {
    g = new THREE.CylinderGeometry(rTop, rBot, h, radial);
    geoCache.set(k, g);
  }
  return g as THREE.CylinderGeometry;
}

/**
 * Gets a cone geometry from the cache, or creates a new one if it doesn't exist.
 * @param r - The radius of the cone.
 * @param h - The height of the cone.
 * @param radial - The number of radial segments.
 * @returns The cone geometry.
 */
export function getCone(r = 0.1, h = 0.3, radial = 8): THREE.ConeGeometry {
  const k = key('cone', [r, h, radial]);
  let g = geoCache.get(k) as THREE.ConeGeometry | undefined;
  if (!g) {
    g = new THREE.ConeGeometry(r, h, radial);
    geoCache.set(k, g);
  }
  return g as THREE.ConeGeometry;
}

/**
 * Gets a torus geometry from the cache, or creates a new one if it doesn't exist.
 * @param r - The radius of the torus.
 * @param tube - The radius of the tube.
 * @param radial - The number of radial segments.
 * @param tubular - The number of tubular segments.
 * @param arc - The arc of the torus.
 * @returns The torus geometry.
 */
export function getTorus(
  r = 0.25,
  tube = 0.02,
  radial = 8,
  tubular = 12,
  arc = Math.PI
): THREE.TorusGeometry {
  const k = key('torus', [r, tube, radial, tubular, arc.toFixed(3)]);
  let g = geoCache.get(k) as THREE.TorusGeometry | undefined;
  if (!g) {
    g = new THREE.TorusGeometry(r, tube, radial, tubular, arc);
    geoCache.set(k, g);
  }
  return g as THREE.TorusGeometry;
}

/**
 * Eagerly builds common geometries so first spawn doesn’t stutter.
 */
export function preloadProceduralUnits() {
  // Typical sizes used by stick figures
  getSphere(0.18, 16, 16);
  getBox(0.35, 0.6, 0.18);
  getCylinder(0.04, 0.04, 0.6, 8);
  getCylinder(0.05, 0.05, 0.7, 8);
  getCylinder(0.03, 0.03, 1.6, 8); // spear shaft
  getCone(0.08, 0.18, 8); // spear tip
  getTorus(0.22, 0.015, 8, 14, Math.PI * 0.9); // bow arc
}

import * as THREE from 'three';

type Key = string;
const geoCache = new Map<Key, THREE.BufferGeometry>();

function key(name: string, arguments_: any[]): Key {
  return `${name}:${arguments_.join(',')}`;
}

export function getSphere(radius = 0.2, widthSeg = 16, heightSeg = 12): THREE.SphereGeometry {
  const k = key('sphere', [radius, widthSeg, heightSeg]);
  let g = geoCache.get(k) as THREE.SphereGeometry | undefined;
  if (!g) {
    g = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
    geoCache.set(k, g);
  }
  return g as THREE.SphereGeometry;
}

export function getBox(w = 0.5, h = 1, d = 0.3): THREE.BoxGeometry {
  const k = key('box', [w, h, d]);
  let g = geoCache.get(k) as THREE.BoxGeometry | undefined;
  if (!g) {
    g = new THREE.BoxGeometry(w, h, d);
    geoCache.set(k, g);
  }
  return g as THREE.BoxGeometry;
}

export function getCylinder(rTop = 0.05, rBot = 0.05, h = 1, radial = 8): THREE.CylinderGeometry {
  const k = key('cyl', [rTop, rBot, h, radial]);
  let g = geoCache.get(k) as THREE.CylinderGeometry | undefined;
  if (!g) {
    g = new THREE.CylinderGeometry(rTop, rBot, h, radial);
    geoCache.set(k, g);
  }
  return g as THREE.CylinderGeometry;
}

export function getCone(r = 0.1, h = 0.3, radial = 8): THREE.ConeGeometry {
  const k = key('cone', [r, h, radial]);
  let g = geoCache.get(k) as THREE.ConeGeometry | undefined;
  if (!g) {
    g = new THREE.ConeGeometry(r, h, radial);
    geoCache.set(k, g);
  }
  return g as THREE.ConeGeometry;
}

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

// Eagerly build common geometries so first spawn doesn’t stutter
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

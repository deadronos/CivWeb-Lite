import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGame } from '../../hooks/use-game';
import { axialToWorld, DEFAULT_HEX_SIZE } from '../utils/coords';

/**
 * @file This file contains the CameraControls component, which provides custom camera controls for the scene.
 */

/**
 * Represents the properties for the CameraControls component.
 * @property enabled - Whether the controls are enabled.
 * @property minPitch - The minimum pitch of the camera in radians.
 * @property maxPitch - The maximum pitch of the camera in radians.
 * @property minDistance - The minimum distance of the camera from the target.
 * @property maxDistance - The maximum distance of the camera from the target.
 * @property moveSpeed - The movement speed of the camera.
 * @property rotateSpeed - The rotation speed of the camera.
 * @property zoomSpeed - The zoom speed of the camera.
 */
type Properties = {
  enabled?: boolean;
  minPitch?: number; // radians
  maxPitch?: number; // radians
  minDistance?: number;
  maxDistance?: number;
  moveSpeed?: number; // units per second on map plane
  rotateSpeed?: number; // radians per pixel dragged
  zoomSpeed?: number; // distance delta per wheel notch
};

/**
 * A component that provides custom camera controls for the scene.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export default function CameraControls({
  enabled = true,
  minPitch = 0.25,
  maxPitch = 1.2,
  minDistance = 6,
  maxDistance = 36,
  moveSpeed = 8,
  rotateSpeed = 0.004,
  zoomSpeed = 1.2,
}: Properties) {
  const { camera, gl } = useThree();
  const { state } = useGame();

  // Compute world bounds for the hex grid
  const bounds = useMemo(() => {
    const w = Math.max(1, state.map.width);
    const h = Math.max(1, state.map.height);
    const [x0, z0] = axialToWorld(0, 0, DEFAULT_HEX_SIZE);
    const [x1, z1] = axialToWorld(w - 1, 0, DEFAULT_HEX_SIZE);
    const [x2, z2] = axialToWorld(0, h - 1, DEFAULT_HEX_SIZE);
    const [x3, z3] = axialToWorld(w - 1, h - 1, DEFAULT_HEX_SIZE);
    const minX = Math.min(x0, x1, x2, x3) - 1;
    const maxX = Math.max(x0, x1, x2, x3) + 1;
    const minZ = Math.min(z0, z1, z2, z3) - 1;
    const maxZ = Math.max(z0, z1, z2, z3) + 1;
    return { minX, maxX, minZ, maxZ };
  }, [state.map.width, state.map.height]);

  // Control state
  const target = useRef(new Vector3(0, 0, 0));
  const yaw = useRef(0); // rotation around Y
  const pitch = useRef(0.6);
  const distance = useRef(14);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const pressed = useRef<{ [k: string]: boolean }>({});

  // Helpers
  const clampTarget = () => {
    target.current.x = Math.min(bounds.maxX, Math.max(bounds.minX, target.current.x));
    target.current.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, target.current.z));
  };

  useEffect(() => {
    if (!enabled) return;
    const element = gl.domElement as HTMLCanvasElement;
    const onDown = (e: MouseEvent) => {
      if (e.button === 0) {
        dragging.current = true;
        lastX.current = e.clientX;
      }
    };
    const onUp = () => (dragging.current = false);
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        const dx = e.clientX - lastX.current;
        lastX.current = e.clientX;
        yaw.current -= dx * rotateSpeed;
      }
    };
    const onWheel = (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY);
      distance.current = Math.min(
        maxDistance,
        Math.max(minDistance, distance.current + dir * zoomSpeed)
      );
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        pressed.current[k] = down;
        e.preventDefault();
      }
      if (k === 'q') {
        pitch.current = Math.min(maxPitch, Math.max(minPitch, pitch.current + (down ? 0.03 : 0)));
      }
      if (k === 'e') {
        pitch.current = Math.min(maxPitch, Math.max(minPitch, pitch.current - (down ? 0.03 : 0)));
      }
    };
    element.addEventListener('mousedown', onDown);
    globalThis.addEventListener('mouseup', onUp);
    globalThis.addEventListener('mousemove', onMove);
    element.addEventListener('wheel', onWheel, { passive: true });
    globalThis.addEventListener('keydown', onKey(true));
    globalThis.addEventListener('keyup', onKey(false));
    return () => {
      element.removeEventListener('mousedown', onDown);
      globalThis.removeEventListener('mouseup', onUp);
      globalThis.removeEventListener('mousemove', onMove);
      element.removeEventListener('wheel', onWheel as any);
      globalThis.removeEventListener('keydown', onKey(true));
      globalThis.removeEventListener('keyup', onKey(false));
    };
  }, [
    enabled,
    gl.domElement,
    rotateSpeed,
    zoomSpeed,
    minDistance,
    maxDistance,
    minPitch,
    maxPitch,
  ]);

  useFrame((_, dt) => {
    if (!enabled) return;
    // Movement in camera-relative plane
    const forward =
      +(pressed.current['w'] || pressed.current['arrowup'] || false) -
      +(pressed.current['s'] || pressed.current['arrowdown'] || false);
    const strafe =
      +(pressed.current['d'] || pressed.current['arrowright'] || false) -
      +(pressed.current['a'] || pressed.current['arrowleft'] || false);
    if (forward || strafe) {
      const speed = moveSpeed * dt;
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      // Move along ground plane relative to yaw
      target.current.x += (forward * -sin + strafe * cos) * speed;
      target.current.z += (forward * -cos - strafe * sin) * speed;
      clampTarget();
    }

    // Compose camera position from spherical coords
    pitch.current = Math.min(maxPitch, Math.max(minPitch, pitch.current));
    distance.current = Math.min(maxDistance, Math.max(minDistance, distance.current));
    const r = distance.current;
    const y = Math.sin(pitch.current) * r;
    const flat = Math.cos(pitch.current) * r;
    const x = target.current.x + Math.sin(yaw.current) * flat;
    const z = target.current.z + Math.cos(yaw.current) * flat;
    camera.position.set(x, Math.max(1.5, y), z);
    camera.lookAt(target.current);
  });

  return null;
}

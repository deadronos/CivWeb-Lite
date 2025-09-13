/**
 * Hook for managing camera wrapping in a cylindrical world
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import {
  checkCameraTeleport,
  WrappingConfig,
  DEFAULT_WRAPPING_CONFIG,
} from '../utils/world-wrapping';

export function useCameraWrapping(config: WrappingConfig = DEFAULT_WRAPPING_CONFIG) {
  const { camera } = useThree();
  const lastPositionReference = useRef(new Vector3());
  const teleportCooldownReference = useRef(0);

  // Initialize last position
  useEffect(() => {
    lastPositionReference.current.copy(camera.position);
  }, [camera]);

  useFrame((state, delta) => {
    // Reduce teleport cooldown
    if (teleportCooldownReference.current > 0) {
      teleportCooldownReference.current -= delta;
      return;
    }

    const currentX = camera.position.x;
    const newX = checkCameraTeleport(currentX, config);

    if (newX === null) {
      lastPositionReference.current.copy(camera.position);
    } else {
      // Teleport camera
      camera.position.setX(newX);
      lastPositionReference.current.copy(camera.position);

      // Set cooldown to prevent rapid teleporting
      teleportCooldownReference.current = 0.5; // 500ms cooldown

      console.log(`Camera teleported from X=${currentX.toFixed(2)} to X=${newX.toFixed(2)}`);
    }
  });
}

/**
 * Hook to check if a position is visible considering world wrapping
 */
export function useWrappedVisibility(config: WrappingConfig = DEFAULT_WRAPPING_CONFIG) {
  const { camera } = useThree();

  return (worldX: number): boolean => {
    const cameraX = camera.position.x;
    const threshold = config.teleportThreshold * 2; // Visibility threshold

    // Check if position is visible in main world bounds
    if (Math.abs(worldX - cameraX) < threshold) {
      return true;
    }

    // Check wrapped positions
    const { worldSpan } = require('../utils/world-wrapping').getWorldBounds(config);

    // Check left-wrapped position
    if (Math.abs(worldX + worldSpan - cameraX) < threshold) {
      return true;
    }

    // Check right-wrapped position
    if (Math.abs(worldX - worldSpan - cameraX) < threshold) {
      return true;
    }

    return false;
  };
}

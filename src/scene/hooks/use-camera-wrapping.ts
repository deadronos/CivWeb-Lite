/**
 * @file This file contains hooks for managing camera wrapping in a cylindrical world.
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import {
  checkCameraTeleport,
  WrappingConfig,
  DEFAULT_WRAPPING_CONFIG,
} from '../utils/world-wrapping';

/**
 * A hook for managing camera wrapping in a cylindrical world.
 * @param config - The wrapping configuration.
 */
export function useCameraWrapping(config: WrappingConfig = DEFAULT_WRAPPING_CONFIG) {
  const { camera } = useThree();
  const lastPositionRef = useRef(new Vector3());
  const teleportCooldownRef = useRef(0);

  // Initialize last position
  useEffect(() => {
    lastPositionRef.current.copy(camera.position);
  }, [camera]);

  useFrame((state, delta) => {
    // Reduce teleport cooldown
    if (teleportCooldownRef.current > 0) {
      teleportCooldownRef.current -= delta;
      return;
    }

    const currentX = camera.position.x;
    const newX = checkCameraTeleport(currentX, config);

    if (newX !== null) {
      // Teleport camera
      camera.position.setX(newX);
      lastPositionRef.current.copy(camera.position);

      // Set cooldown to prevent rapid teleporting
      teleportCooldownRef.current = 0.5; // 500ms cooldown

      console.log(`Camera teleported from X=${currentX.toFixed(2)} to X=${newX.toFixed(2)}`);
    } else {
      lastPositionRef.current.copy(camera.position);
    }
  });
}

/**
 * A hook to check if a position is visible considering world wrapping.
 * @param config - The wrapping configuration.
 * @returns A function that returns true if the position is visible, false otherwise.
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

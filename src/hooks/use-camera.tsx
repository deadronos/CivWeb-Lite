import React, { createContext, useContext } from 'react';

/**
 * @file This file contains the CameraProvider component and the useCamera hook, which are used to control the camera.
 */

/**
 * Represents the API for controlling the camera.
 * @property centerOn - A function to center the camera on a given coordinate.
 */
export type CameraAPI = {
  centerOn: (coord: { q: number; r: number }) => void;
};

const defaultAPI: CameraAPI = {
  centerOn: () => {},
};

const CameraContext = createContext<CameraAPI>(defaultAPI);

/**
 * A context provider for the camera API.
 * @param props - The component properties.
 * @param props.api - A partial camera API to merge with the default API.
 * @param props.children - The child components.
 * @returns The rendered component.
 */
export function CameraProvider({
  api,
  children,
}: {
  api?: Partial<CameraAPI>;
  children: React.ReactNode;
}) {
  const merged = { ...defaultAPI, ...api } as CameraAPI;
  return <CameraContext.Provider value={merged}>{children}</CameraContext.Provider>;
}

/**
 * A hook that provides access to the camera API.
 * @returns The camera API.
 */
export function useCamera(): CameraAPI {
  return useContext(CameraContext);
}

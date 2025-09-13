import React, { createContext, useContext } from 'react';

export type CameraAPI = {
  centerOn: (coord: { q: number; r: number }) => void;
  // Human-readable camera status for HUD/tests. Optional; empty string when unavailable.
  getPositionLabel?: () => string;
};

const defaultAPI: CameraAPI = {
  centerOn: () => {},
  getPositionLabel: () => '',
};

const CameraContext = createContext<CameraAPI>(defaultAPI);

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

export function useCamera(): CameraAPI {
  return useContext(CameraContext);
}

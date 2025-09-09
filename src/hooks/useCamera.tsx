import React, { createContext, useContext } from 'react';

export type CameraAPI = {
  centerOn: (coord: { q: number; r: number }) => void;
};

const defaultAPI: CameraAPI = {
  centerOn: () => {},
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

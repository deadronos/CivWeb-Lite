import React from 'react';
import { useGame } from '../hooks/use-game';

export type SelectionState = {
  selectedUnitId: string | undefined;
  selectedTileId: string | undefined;
  selectedCityId: string | undefined;
  setSelectedUnitId: (id: string | undefined) => void;
  setSelectedTileId: (id: string | undefined) => void;
  setSelectedCityId: (id: string | undefined) => void;
};

const SelectionContext = React.createContext<SelectionState | undefined>(undefined);

export function SelectionProvider({
  children,
  initialSelectedUnitId,
  initialSelectedTileId,
  initialSelectedCityId,
}: {
  children: React.ReactNode;
  initialSelectedUnitId?: string | undefined;
  initialSelectedTileId?: string | undefined;
  initialSelectedCityId?: string | undefined;
}) {
  const { state, dispatch } = useGame();
  
  // Get selectedUnitId from game state
  const selectedUnitId = state.ui.selectedUnitId || initialSelectedUnitId;

  // Read tile/city selection from game state UI (persisted)
  const selectedTileId = state.ui?.selectedTileId ?? initialSelectedTileId;
  const selectedCityId = state.ui?.selectedCityId ?? initialSelectedCityId;

  const setSelectedUnitId = React.useCallback((id: string | undefined) => {
    if (id) {
      // selecting a unit should clear tile/city selection
      // clear persisted tile/city selection
      dispatch({ type: 'SELECT_TILE', payload: { tileId: undefined } } as any);
      dispatch({ type: 'SELECT_CITY', payload: { cityId: undefined } } as any);
      dispatch({ type: 'SELECT_UNIT', payload: { unitId: id } });
    } else {
      if (selectedUnitId) {
        dispatch({ type: 'CANCEL_SELECTION' } as any);
      }
    }
  }, [dispatch, selectedUnitId]);

  const setSelectedTileId = React.useCallback((id: string | undefined) => {
    if (id) {
      // selecting a tile should clear unit selection
      dispatch({ type: 'CANCEL_SELECTION' } as any);
      dispatch({ type: 'SELECT_TILE', payload: { tileId: id } } as any);
    } else {
      dispatch({ type: 'SELECT_TILE', payload: { tileId: undefined } } as any);
    }
  }, [dispatch]);

  const setSelectedCityId = React.useCallback((id: string | undefined) => {
    if (id) {
      dispatch({ type: 'CANCEL_SELECTION' } as any);
      dispatch({ type: 'SELECT_CITY', payload: { cityId: id } } as any);
    } else {
      dispatch({ type: 'SELECT_CITY', payload: { cityId: undefined } } as any);
    }
  }, [dispatch]);
  
  const value = React.useMemo(
    () => ({ selectedUnitId, selectedTileId, selectedCityId, setSelectedUnitId, setSelectedTileId, setSelectedCityId }),
    [selectedUnitId, selectedTileId, selectedCityId, setSelectedUnitId, setSelectedTileId, setSelectedCityId]
  );
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionState {
  const context = React.useContext(SelectionContext);
  if (!context) throw new Error('useSelection must be used within SelectionProvider');
  return context;
}

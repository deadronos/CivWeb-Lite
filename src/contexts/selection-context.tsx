import React from 'react';
import { useGame } from '../hooks/use-game';

export type SelectionState = {
  selectedUnitId: string | undefined;
  setSelectedUnitId: (id: string | undefined) => void;
};

const SelectionContext = React.createContext<SelectionState | undefined>(undefined);

export function SelectionProvider({
  children,
  initialSelectedUnitId,
}: {
  children: React.ReactNode;
  initialSelectedUnitId?: string | undefined;
}) {
  const { state, dispatch } = useGame();
  
  // Get selectedUnitId from game state
  const selectedUnitId = state.ui.selectedUnitId || initialSelectedUnitId;
  
  const setSelectedUnitId = React.useCallback((id: string | undefined) => {
    if (id) {
      dispatch({ type: 'SELECT_UNIT', payload: { unitId: id } });
    } else {
      if (selectedUnitId) {
        dispatch({ type: 'CANCEL_SELECTION', payload: { unitId: selectedUnitId } });
      }
    }
  }, [dispatch, selectedUnitId]);
  
  const value = React.useMemo(() => ({ selectedUnitId, setSelectedUnitId }), [selectedUnitId, setSelectedUnitId]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionState {
  const context = React.useContext(SelectionContext);
  if (!context) throw new Error('useSelection must be used within SelectionProvider');
  return context;
}

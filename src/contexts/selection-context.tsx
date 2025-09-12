import React from 'react';
import { useGame } from '../hooks/use-game';

/**
 * @file This file contains the SelectionProvider component and the useSelection hook, which are used to manage the selection state of units.
 */

/**
 * Represents the state of the selection context.
 * @property selectedUnitId - The ID of the selected unit, or undefined if no unit is selected.
 * @property setSelectedUnitId - A function to set the selected unit ID.
 */
export type SelectionState = {
  selectedUnitId: string | undefined;
  setSelectedUnitId: (id: string | undefined) => void;
};

const SelectionContext = React.createContext<SelectionState | undefined>(undefined);

/**
 * A context provider for the selection state.
 * @param props - The component properties.
 * @param props.children - The child components.
 * @param props.initialSelectedUnitId - The initially selected unit ID.
 * @returns The rendered component.
 */
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

/**
 * A hook that provides access to the selection state of units.
 * @returns An object containing the selection state and a function to set it.
 * @throws An error if used outside of a SelectionProvider.
 */
export function useSelection(): SelectionState {
  const context = React.useContext(SelectionContext);
  if (!context) throw new Error('useSelection must be used within SelectionProvider');
  return context;
}

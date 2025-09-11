import React from 'react';

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
  const [selectedUnitId, setSelectedUnitId] = React.useState<string | undefined>(
    initialSelectedUnitId
  );
  const value = React.useMemo(() => ({ selectedUnitId, setSelectedUnitId }), [selectedUnitId]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionState {
  const context = React.useContext(SelectionContext);
  if (!context) throw new Error('useSelection must be used within SelectionProvider');
  return context;
}

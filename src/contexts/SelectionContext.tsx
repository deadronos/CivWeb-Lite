import React from 'react';

export type SelectionState = {
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
};

const SelectionContext = React.createContext<SelectionState | null>(null);

export function SelectionProvider({
  children,
  initialSelectedUnitId = null,
}: {
  children: React.ReactNode;
  initialSelectedUnitId?: string | null;
}) {
  const [selectedUnitId, setSelectedUnitId] = React.useState<string | null>(
    initialSelectedUnitId ?? null
  );
  const value = React.useMemo(() => ({ selectedUnitId, setSelectedUnitId }), [selectedUnitId]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionState {
  const ctx = React.useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}

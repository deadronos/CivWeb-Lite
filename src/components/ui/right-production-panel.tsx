import React from 'react';
import { useGame } from '../../hooks/use-game';
import CityPanelContainer from './city-panel-container';

export default function RightProductionPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state } = useGame();
  const cityId = state.ui.openPanels.cityPanel;
  if (!open || !cityId) return null;
  return (
    <aside className="ui-rightpanel" aria-label="city production">
      <div className="panel-header">
        <div className="title">City Production</div>
        <button className="close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="panel-body">
        <CityPanelContainer cityId={cityId} />
      </div>
    </aside>
  );
}


import React from 'react';

/**
 * @file This file contains the LeftPanel component, which displays the research panel.
 */

/**
 * Represents a single technology item in the research panel.
 * @property id - The unique ID of the technology.
 * @property name - The name of the technology.
 * @property cost - The cost of the technology.
 * @property unlocked - Whether the technology has been unlocked.
 */
export type TechItem = { id: string; name: string; cost: number; unlocked?: boolean };

/**
 * Represents the properties for the LeftPanel component.
 * @property techs - An array of available technologies.
 * @property currentTechId - The ID of the technology that is currently being researched.
 * @property onSelect - A callback function to select a technology to research.
 */
export type LeftPanelProps = {
  techs: TechItem[];
  currentTechId?: string;
  onSelect: (techId: string) => void;
};

/**
 * A component that displays the research panel.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export default function LeftPanel({ techs, currentTechId, onSelect }: LeftPanelProps) {
  return (
    <aside className="hud-leftpanel" aria-label="research panel">
      <h2 className="panel-title">Research</h2>
      <ul className="tech-list">
        {techs.map((t) => (
          <li key={t.id}>
            <button
              className={`tech-item ${currentTechId === t.id ? 'active' : ''}`}
              onClick={() => onSelect(t.id)}
              aria-pressed={currentTechId === t.id}
              aria-label={`select tech ${t.name}`}
            >
              <span className="tech-name">{t.name}</span>
              <span className="tech-cost">{t.cost}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

import React from 'react';

// Simple log list component to display recent game events

export function LogList({ entries }: { entries: { type: string; }[]; }) {
  return (
    <ul>
      {entries.map((e, index) => (
        <li key={index}>{String(e.type).replaceAll(':', '·')}</li>
      ))}
    </ul>
  );
});

export default LogList;


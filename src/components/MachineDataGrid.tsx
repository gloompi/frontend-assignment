// components/MachineDataGrid.tsx
import React from 'react';
import { useDashboard } from '../store/DashboardContext';
import { MachineRow } from './MachineRow';

export const MachineDataGrid = () => {
  const { machines, selectedIds, setSelectedIds } = useDashboard();

  // ANTI-PATTERN: Expensive sorting logic executing synchronously on the main thread during every render
  const sortedMachines = machines.sort((a: any, b: any) => b.health - a.health);

  return (
    <div className="grid-container">
      <div className="grid-header">
        <span className="header-cell">Machine</span>
        <span className="header-cell">Status</span>
        <span className="header-cell">Location</span>
        <span className="header-cell">Health</span>
        <span className="header-cell">Live CPU</span>
        <span className="header-cell">Ping</span>
      </div>
      <div className="grid-body">
        {sortedMachines.map((machine: any, index: number) => (
          // ANTI-PATTERN: Using array index as a key in a list that can be sorted or filtered
          <MachineRow
            key={index}
            machine={machine}
            isSelected={selectedIds.has(machine.id)}
            // ANTI-PATTERN: Inline arrow function triggering full child re-renders
            onSelect={(id: string) => {
              const newSelected = new Set(selectedIds);
              if (newSelected.has(id)) newSelected.delete(id);
              else newSelected.add(id);
              setSelectedIds(newSelected);
            }}
          />
        ))}
      </div>
      {machines.length === 0 && (
        <div className="grid-empty">
          <div className="empty-icon">⚙</div>
          <p>No machines found. Try a different search query.</p>
        </div>
      )}
    </div>
  );
};

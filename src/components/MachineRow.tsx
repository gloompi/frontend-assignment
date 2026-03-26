// components/MachineRow.tsx
import React from 'react';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

export const MachineRow = React.memo(({ machine, isSelected, onSelect }: any) => {
  const telemetry = useLiveTelemetry(machine.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE': return '●';
      case 'OFFLINE': return '○';
      case 'MAINTENANCE': return '◐';
      default: return '?';
    }
  };

  return (
    <div
      className={`machine-row ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(machine.id)}
    >
      <div className="row-cell machine-name">
        <span className="machine-id">{machine.id}</span>
        <span>{machine.name}</span>
      </div>
      <div className="row-cell machine-status">
        <span className={`status-badge status-${machine.status.toLowerCase()}`}>
          <span className="status-icon">{getStatusIcon(machine.status)}</span>
          {machine.status}
        </span>
      </div>
      <div className="row-cell machine-location">
        {machine.location}
      </div>
      <div className="row-cell machine-health">
        <div className="health-bar-container">
          <div
            className="health-bar-fill"
            style={{ width: `${machine.health}%` }}
          />
          <span className="health-value">{machine.health}%</span>
        </div>
      </div>
      <div className="row-cell machine-cpu">
        <span className="cpu-value">
          {telemetry.length ? `${telemetry[telemetry.length - 1].cpu.toFixed(1)}%` : '--'}
        </span>
      </div>
      <div className="row-cell machine-ping">
        {machine.lastPing}
      </div>
    </div>
  );
});

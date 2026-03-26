// components/MachineRow-solution.tsx
//
// ============================================================================
// SOLUTION: Misapplied Memoization & Accessibility Violations
// ============================================================================
//
// PROBLEMS FOUND:
//   1. BROKEN MEMOIZATION — `React.memo` performs a shallow equality check
//      (===) on incoming props. However, the parent (`MachineDataGrid`)
//      passes a new inline arrow function for `onSelect` on every render.
//      A new function = a new memory address = shallow check always fails =
//      React.memo is completely useless, adding overhead with zero benefit.
//
//   2. PROPS TYPED AS `any` — The component accepts `({ machine, isSelected,
//      onSelect }: any)`, which silently allows passing incorrect props
//      without compiler warnings.
//
//   3. MISSING `aria-live` — The live CPU metric updates silently on screen.
//      Screen readers have no way to detect these dynamic mutations, making
//      the real-time telemetry data completely invisible to visually impaired
//      users.
//
// FIXES APPLIED:
//   1. REACT.MEMO WORKS NOW — The parent component (`MachineDataGrid-solution`)
//      now passes a stable `onSelect` callback via `useCallback`. With a stable
//      reference, React.memo's shallow check correctly detects unchanged props
//      and skips unnecessary re-renders.
//
//   2. TYPED PROPS INTERFACE — Replaced `any` with a strongly typed
//      `MachineRowProps` interface. The compiler now catches invalid prop usage.
//
//   3. `aria-live="polite"` — Wraps the CPU metric display in an aria-live
//      region. Screen readers will announce updated values during natural
//      speech pauses ("polite") rather than interrupting the user ("assertive").
//
// NOTE ON MEMOIZATION PHILOSOPHY:
//   React.memo is not a default architectural pattern. It's a targeted,
//   surgical optimization applied only when profiling reveals a measurable
//   bottleneck. In this case, each MachineRow spawns a `useLiveTelemetry`
//   hook with its own interval, making it provably expensive to re-render
//   unnecessarily — so memoization is justified here.
//
// ============================================================================

import React from 'react';
import { MachineData } from '../types/index-solution';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry-solution';

// FIX: Strongly typed props instead of `any`
interface MachineRowProps {
  machine: MachineData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const MachineRow = React.memo(({ machine, isSelected, onSelect }: MachineRowProps) => {
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
      role="row"          // FIX: Semantic role for data grid accessibility
      tabIndex={0}        // FIX: Makes the row focusable via keyboard
      onKeyDown={(e) => { // FIX: Keyboard support (Enter/Space to select)
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(machine.id);
        }
      }}
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
      {/* FIX: aria-live="polite" announces CPU metric updates to screen readers
          during natural speech pauses, without interrupting the user's context. */}
      <div className="row-cell machine-cpu" aria-live="polite" aria-atomic="true">
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

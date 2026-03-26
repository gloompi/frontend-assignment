// components/MachineDataGrid-solution.tsx
//
// ============================================================================
// SOLUTION: Misapplied Memoization & Premature Optimization
// ============================================================================
//
// PROBLEMS FOUND:
//   1. IN-PLACE MUTATION + UNMEMOIZED SORT — `machines.sort(...)` mutates the
//      original array in place (violating React's immutability expectations)
//      AND executes synchronously on every single render. Sorting is O(n log n)
//      — for hundreds of machines, this blocks the main thread and causes
//      visible input lag in the search component.
//
//   2. INDEX-BASED KEYS — `key={index}` is used on a list that can be sorted
//      and filtered. When the sort order changes, React cannot correctly
//      identify which elements moved — it destroys and rebuilds DOM nodes
//      unnecessarily, losing internal component state (like the telemetry
//      metrics collected so far) and causing visual flicker.
//
//   3. INLINE ARROW FUNCTION — `onSelect={(id) => { ... }}` creates a new
//      function reference on every render. This breaks `React.memo` on
//      `MachineRow` because the shallow equality check always fails, forcing
//      every single row to re-render even when its data hasn't changed.
//
//   4. ALL TYPES ARE `any` — The sort comparator, map callback, and onSelect
//      parameter all use `any`, defeating compile-time type checking.
//
// FIXES APPLIED:
//   1. `useMemo` FOR SORT — The sort operation is memoized so it only
//      re-executes when `machines` actually changes. Uses `[...machines]` to
//      create a copy before sorting, preserving React's immutability contract.
//
//   2. STABLE UNIQUE KEYS — `key={machine.id}` uses the machine's unique
//      identifier. React can now correctly track element identity across
//      re-sorts and re-filters, preserving component state and minimizing
//      DOM mutations.
//
//   3. `useCallback` FOR STABLE REFERENCE — The `handleSelect` function is
//      memoized with `useCallback`. Its reference stays stable across renders
//      (only changing when `selectedIds` or `setSelectedIds` change), allowing
//      `React.memo` on `MachineRow` to work as intended.
//
//   4. PROPER TYPING — Removed all `any` annotations with real types.
//
// ADVANCED CONSIDERATION:
//   An even more architectural approach is to move the selection logic into
//   a context or use the Compound Components pattern, so `MachineRow` doesn't
//   need an `onSelect` prop at all — naturally bypassing the memoization issue
//   without relying on `useCallback`.
//
// ============================================================================

import React, { useMemo, useCallback } from 'react';
import { useDashboardData } from '../store/DashboardContext-solution';
import { MachineRow } from './MachineRow-solution';
import { MachineData } from '../types/index-solution';

export const MachineDataGrid = () => {
  const { machines, selectedIds, setSelectedIds } = useDashboardData();

  // FIX: Memoize the sort so it only re-executes when `machines` changes.
  // Spread into a new array first to avoid mutating the original (React expects
  // state to be treated as immutable).
  const sortedMachines = useMemo(
    () => [...machines].sort((a: MachineData, b: MachineData) => b.health - a.health),
    [machines]
  );

  // FIX: Stabilize the callback reference with useCallback so React.memo on
  // MachineRow can correctly skip re-renders when props haven't changed.
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev: Set<string>) => {
        const newSelected = new Set(prev);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        return newSelected;
      });
    },
    [setSelectedIds]
  );

  return (
    <div className="grid-container" role="grid" aria-label="Machine fleet data">
      <div className="grid-header" role="row">
        <span className="header-cell" role="columnheader">Machine</span>
        <span className="header-cell" role="columnheader">Status</span>
        <span className="header-cell" role="columnheader">Location</span>
        <span className="header-cell" role="columnheader">Health</span>
        <span className="header-cell" role="columnheader">Live CPU</span>
        <span className="header-cell" role="columnheader">Ping</span>
      </div>
      <div className="grid-body" role="rowgroup">
        {sortedMachines.map((machine: MachineData) => (
          // FIX: Use machine.id as key — a stable, unique identifier that
          // allows React to correctly track elements across sorts and filters.
          <MachineRow
            key={machine.id}
            machine={machine}
            isSelected={selectedIds.has(machine.id)}
            onSelect={handleSelect} // FIX: Stable reference via useCallback
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

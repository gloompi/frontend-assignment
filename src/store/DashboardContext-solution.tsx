// store/DashboardContext-solution.tsx
//
// ============================================================================
// SOLUTION: State Management Traps & Context Rendering Cascades
// ============================================================================
//
// PROBLEMS FOUND:
//   1. MONOLITHIC CONTEXT — A single DashboardContext houses both static data
//      (theme, user preferences) and highly volatile data (search query,
//      machine list, selected IDs). When ANY value changes, React forces a
//      synchronous re-render of EVERY component that consumes this context.
//      With machine data updating frequently, the entire app — including
//      static headers, sidebar, etc. — re-renders continuously.
//
//   2. INLINE OBJECT VALUE — The provider value is `{{ theme, machines, ... }}`,
//      creating a brand new object reference on every render. React's Context
//      uses strict referential equality (===) to detect changes. A new object
//      reference always fails this check, triggering unnecessary consumer
//      re-renders even when the actual data hasn't changed.
//
//   3. CONTEXT TYPED AS `any` — `createContext<any>(null)` defeats TypeScript's
//      ability to catch misused properties at compile time.
//
// FIXES APPLIED:
//   1. CONTEXT SLICING — Split the monolithic context into two logically bounded
//      domains:
//        • `ThemeContext` — changes rarely (user toggles theme).
//        • `DashboardDataContext` — changes frequently (search, machines, selection).
//      Static UI (sidebar, header chrome) consumes only ThemeContext and is
//      completely isolated from the frequent data updates.
//
//   2. MEMOIZED PROVIDER VALUES — Both provider values are wrapped in `useMemo`
//      to stabilize their object references. The value only changes when its
//      dependencies actually change, not on every parent render.
//
//   3. PROPER TYPING — Both contexts are typed with explicit interfaces,
//      eliminating `any` and enabling full IDE autocompletion.
//
// ADVANCED CONSIDERATION:
//   For truly high-frequency data (sub-second telemetry), even a split context
//   may cause unacceptable rendering overhead. In that case, consider:
//     • A subscriber-based store (Zustand, Jotai) for granular subscriptions.
//     • `useSyncExternalStore` for external mutable data sources.
//     • Keeping high-frequency data in a `useRef` and updating the DOM
//       imperatively, bypassing React's reconciliation entirely.
//
// ============================================================================

import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { MachineData } from '../types/index-solution';

// ---- Theme Context (static, changes rarely) ----

interface ThemeContextType {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// ---- Dashboard Data Context (volatile, changes frequently) ----

interface DashboardDataContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  machines: MachineData[];
  setMachines: React.Dispatch<React.SetStateAction<MachineData[]>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

// ---- Providers ----

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // FIX: Memoize each provider value so the object reference remains stable
  // across renders unless the underlying data actually changes.
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  const dataValue = useMemo(
    () => ({ searchQuery, setSearchQuery, machines, setMachines, selectedIds, setSelectedIds }),
    [searchQuery, machines, selectedIds]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <DashboardDataContext.Provider value={dataValue}>
        <div className={`app-wrapper theme-${theme}`}>
          {children}
        </div>
      </DashboardDataContext.Provider>
    </ThemeContext.Provider>
  );
};

// ---- Typed Hooks ----

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within DashboardProvider');
  return ctx;
};

export const useDashboardData = (): DashboardDataContextType => {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error('useDashboardData must be used within DashboardProvider');
  return ctx;
};

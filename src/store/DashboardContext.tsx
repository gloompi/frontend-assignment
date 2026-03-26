// store/DashboardContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import type { MachineData } from '../types';

// ANTI-PATTERN: Monolithic Context housing both static user preferences and high-frequency data
export const DashboardContext = createContext<any>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ANTI-PATTERN: Passing a brand new inline object literal as value.
  // This forces a synchronous re-render of EVERY consumer component on every single state change.
  return (
    <DashboardContext.Provider value={{
      theme, setTheme,
      searchQuery, setSearchQuery,
      machines, setMachines,
      selectedIds, setSelectedIds
    }}>
      <div className={`app-wrapper theme-${theme}`}>
        {children}
      </div>
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);

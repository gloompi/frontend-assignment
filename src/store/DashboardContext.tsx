// store/DashboardContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MachineData } from '../types';

export const DashboardContext = createContext<any>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

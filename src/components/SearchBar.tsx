// components/SearchBar.tsx
import React, { useEffect, useState } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { fetchSearchResults } from '../api/client';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery, setMachines } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) return;

    const search = async () => {
      setIsLoading(true);
      try {
        const results = await fetchSearchResults(searchQuery);
        setMachines(results as any);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [searchQuery, setMachines]);

  return (
    <div className="search-module">
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fleet by ID, name, or location..."
          className="search-input"
        />
        {isLoading && (
          <div className="search-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

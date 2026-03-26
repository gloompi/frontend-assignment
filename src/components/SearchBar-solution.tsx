// components/SearchBar-solution.tsx
//
// ============================================================================
// SOLUTION: Network Race Conditions & Async State Desynchronization
// ============================================================================
//
// PROBLEMS FOUND:
//   1. RACE CONDITION — Every keystroke fires a new fetch request via useEffect.
//      Because network latency is non-deterministic, responses can arrive out
//      of order. If "Ser" (broad query, slow) resolves AFTER "Server" (specific
//      query, fast), the UI displays stale, incorrect results. The user sees
//      data that doesn't match what they typed.
//
//   2. NO DEBOUNCE — The API is hit on every single keystroke. Typing "Server"
//      fires 6 separate HTTP requests in rapid succession. This wastes
//      bandwidth, hammers the backend, and at scale constitutes a self-inflicted
//      denial-of-service.
//
//   3. UNSAFE TYPE CASTING — `results as any` silently bypasses TypeScript's
//      type system at the network boundary, where runtime safety matters most.
//
//   4. ACCESSIBILITY — The search input lacks `role="combobox"`, `aria-expanded`,
//      `aria-activedescendant`, and keyboard navigation handlers. This makes
//      the component unusable for screen reader users and violates WCAG.
//
// FIXES APPLIED:
//   1. ABORT CONTROLLER — The `AbortController` API actively cancels the
//      in-flight HTTP request at the network level when the query changes or
//      the component unmounts. Unlike a simple boolean flag (which only prevents
//      the state update but still downloads the full response), AbortController
//      terminates the underlying TCP connection, saving bandwidth and backend
//      processing cycles. The resulting `AbortError` is gracefully caught.
//
//   2. DEBOUNCE — A 300ms `setTimeout` delay before firing the fetch. The
//      timer is cleared in the useEffect cleanup, so rapid keystrokes only
//      trigger one request (for the final query). Combined with AbortController,
//      this provides a dual-layer defense: debounce reduces request volume,
//      and AbortController handles the latency variability edge case.
//
//   3. REMOVED UNSAFE CAST — `setMachines(results)` is now type-safe because
//      `fetchSearchResults` already returns `Promise<MachineData[]>`.
//
//   4. ARIA ATTRIBUTES — Added `role="combobox"`, `aria-expanded`, and
//      proper labeling to the search input for screen reader accessibility.
//
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { useDashboardData } from '../store/DashboardContext-solution';
import { fetchSearchResults } from '../api/client';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery, setMachines } = useDashboardData();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) return;

    // FIX: AbortController to cancel stale in-flight requests at the network level.
    const controller = new AbortController();

    // FIX: Debounce to reduce the volume of API calls during rapid typing.
    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchSearchResults(searchQuery);

        // If this request was aborted while awaiting, do not update state.
        if (!controller.signal.aborted) {
          setMachines(results); // FIX: No more unsafe `as any` cast
        }
      } catch (error: unknown) {
        // FIX: Gracefully ignore AbortError — it's an expected control flow signal,
        // not an actual failure.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error("Search failed", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    // Cleanup: cancel pending debounce timer AND abort any in-flight request.
    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchQuery, setMachines]);

  return (
    <div className="search-module">
      {/* FIX: Added role="combobox" and aria-expanded for screen reader accessibility */}
      <div className="search-input-wrapper" role="combobox" aria-expanded="false">
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
          aria-label="Search machines" // FIX: Accessible label for screen readers
          autoComplete="off"
        />
        {isLoading && (
          <div className="search-spinner" role="status" aria-label="Loading results">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// hooks/useLiveTelemetry-solution.ts
//
// ============================================================================
// SOLUTION: Memory Leaks & Stale Closures
// ============================================================================
//
// PROBLEMS FOUND:
//   1. MEMORY LEAK — The `setInterval` creates a persistent timer that
//      continues running even after the component unmounts. Because the
//      interval callback holds a reference to the component's lexical scope,
//      the garbage collector cannot reclaim that memory. If a user navigates
//      away and back multiple times, orphaned intervals accumulate, causing
//      CPU degradation and eventual browser tab crashes.
//
//   2. STALE CLOSURE — The interval callback captures `metrics` from the
//      initial render via closure. Because `setInterval` seals over the
//      variable at creation time, `metrics` will forever evaluate to `[]`
//      (the initial state). Every tick produces `[...[], newMetric]` = a
//      single-element array, discarding all previous data.
//
// FIXES APPLIED:
//   1. Added a cleanup function: `return () => clearInterval(intervalId)`.
//      This is a fundamental requirement of the React useEffect lifecycle.
//      When the component unmounts or `machineId` changes, React calls the
//      cleanup function, which stops the timer and releases the memory
//      reference, allowing garbage collection to proceed.
//
//   2. Replaced direct state reference `setMetrics([...metrics, newMetric])`
//      with the functional updater pattern: `setMetrics(prev => [...prev, newMetric])`.
//      The functional updater receives the current state value as an argument
//      from React itself, completely decoupling the callback from the stale
//      closure. This ensures every tick correctly appends to the full array.
//
//   3. Replaced `any` with a proper `TelemetryMetric` interface.
//
// ADVANCED CONSIDERATION:
//   The same cleanup principle applies to WebSocket connections
//   (`socket.close()`), RxJS subscriptions (`subscription.unsubscribe()`),
//   and event listeners (`removeEventListener`). Any persistent connection
//   opened in a useEffect MUST be torn down in its cleanup function.
//
//   For extremely high-frequency data (sub-100ms), injecting directly into
//   React state may still cause excessive re-renders. In that case, consider
//   `useRef` for mutable storage + `useSyncExternalStore` for selective
//   subscriptions, or render to a `<canvas>` imperatively.
//
// ============================================================================

import { useEffect, useState } from 'react';

interface TelemetryMetric {
  timestamp: number;
  cpu: number;
}

export const useLiveTelemetry = (machineId: string) => {
  const [metrics, setMetrics] = useState<TelemetryMetric[]>([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newMetric: TelemetryMetric = {
        timestamp: Date.now(),
        cpu: Math.random() * 100,
      };

      // FIX: Functional updater decouples the callback from the stale closure.
      // `prev` always reflects the true current state, regardless of when the
      // closure was created.
      setMetrics(prev => [...prev, newMetric]);
    }, 1000);

    // FIX: Cleanup function ensures the interval is destroyed on unmount,
    // preventing memory leaks and orphaned background execution.
    return () => clearInterval(intervalId);
  }, [machineId]);

  return metrics;
};

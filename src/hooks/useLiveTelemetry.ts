// hooks/useLiveTelemetry.ts
import { useEffect, useState } from 'react';

export const useLiveTelemetry = (machineId: string) => {
  const [metrics, setMetrics] = useState<any>([]); // ANTI-PATTERN: any

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newMetric = { timestamp: Date.now(), cpu: Math.random() * 100 };

      // ANTI-PATTERN: Stale closure. 'metrics' evaluates to the initial empty array forever.
      setMetrics([...metrics, newMetric]);
    }, 1000);

    // ANTI-PATTERN: Missing return () => clearInterval(intervalId) leads to catastrophic memory leaks
  }, [machineId]);

  return metrics;
};

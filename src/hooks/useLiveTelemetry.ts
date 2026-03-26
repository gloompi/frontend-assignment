// hooks/useLiveTelemetry.ts
import { useEffect, useState } from 'react';

export const useLiveTelemetry = (machineId: string) => {
  const [metrics, setMetrics] = useState<any>([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newMetric = { timestamp: Date.now(), cpu: Math.random() * 100 };
      setMetrics([...metrics, newMetric]);
    }, 1000);
  }, [machineId]);

  return metrics;
};

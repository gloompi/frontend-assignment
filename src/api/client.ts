// api/client.ts
import { MachineData } from '../types';

const mockDatabase: MachineData[] = [
  { id: "M-001", name: "Server Alpha-01", status: "ONLINE", health: 98, location: "US-East-1", lastPing: "2ms" },
  { id: "M-002", name: "Server Alpha-02", status: "ONLINE", health: 95, location: "US-East-1", lastPing: "3ms" },
  { id: "M-003", name: "Server Beta-01", status: "MAINTENANCE", health: 45, location: "EU-West-1", lastPing: "150ms" },
  { id: "M-004", name: "Server Beta-02", status: "OFFLINE", health: 0, location: "EU-West-1", lastPing: "N/A" },
  { id: "M-005", name: "Server Gamma-01", status: "ONLINE", health: 87, location: "AP-South-1", lastPing: "12ms" },
  { id: "M-006", name: "Server Gamma-02", status: "ONLINE", health: 92, location: "AP-South-1", lastPing: "8ms" },
  { id: "M-007", name: "Server Delta-01", status: "ONLINE", health: 76, location: "US-West-2", lastPing: "5ms" },
  { id: "M-008", name: "Server Delta-02", status: "MAINTENANCE", health: 30, location: "US-West-2", lastPing: "200ms" },
  { id: "M-009", name: "Server Epsilon-01", status: "ONLINE", health: 99, location: "EU-Central-1", lastPing: "1ms" },
  { id: "M-010", name: "Server Epsilon-02", status: "OFFLINE", health: 0, location: "EU-Central-1", lastPing: "N/A" },
  { id: "M-011", name: "Server Zeta-01", status: "ONLINE", health: 88, location: "US-East-2", lastPing: "4ms" },
  { id: "M-012", name: "Server Zeta-02", status: "ONLINE", health: 91, location: "US-East-2", lastPing: "3ms" },
  { id: "M-013", name: "Server Eta-01", status: "MAINTENANCE", health: 22, location: "AP-Northeast-1", lastPing: "500ms" },
  { id: "M-014", name: "Server Eta-02", status: "ONLINE", health: 85, location: "AP-Northeast-1", lastPing: "15ms" },
  { id: "M-015", name: "Server Theta-01", status: "ONLINE", health: 94, location: "SA-East-1", lastPing: "20ms" },
  { id: "M-016", name: "Server Theta-02", status: "OFFLINE", health: 0, location: "SA-East-1", lastPing: "N/A" },
  { id: "M-017", name: "Server Iota-01", status: "ONLINE", health: 79, location: "US-Central-1", lastPing: "6ms" },
  { id: "M-018", name: "Server Iota-02", status: "ONLINE", health: 96, location: "US-Central-1", lastPing: "2ms" },
  { id: "M-019", name: "Server Kappa-01", status: "ONLINE", health: 82, location: "EU-North-1", lastPing: "10ms" },
  { id: "M-020", name: "Server Kappa-02", status: "MAINTENANCE", health: 15, location: "EU-North-1", lastPing: "1200ms" },
];

export const fetchSearchResults = async (query: string): Promise<MachineData[]> => {
  const delay = Math.floor(Math.random() * 2900) + 100;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (!query) return mockDatabase;
  return mockDatabase.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.id.toLowerCase().includes(query.toLowerCase()) ||
    m.location.toLowerCase().includes(query.toLowerCase()) ||
    m.status.toLowerCase().includes(query.toLowerCase())
  );
};

// types/index.ts
export interface MachineData {
  id: any; // ANTI-PATTERN: Use of 'any' defeats type checking
  name: string;
  status: string; // ANTI-PATTERN: Should be a strict union type ("ONLINE" | "OFFLINE" | "MAINTENANCE")
  health: any;
  location: string;
  lastPing: string;
}

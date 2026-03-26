// types/index-solution.ts
//
// ============================================================================
// SOLUTION: Type System Vulnerabilities & "Stringly-Typed" Data
// ============================================================================
//
// PROBLEMS FOUND:
//   1. `id` and `health` were typed as `any`, completely defeating TypeScript's
//      static analysis. If the API payload changes shape, the compiler won't
//      warn us — bugs silently reach production as runtime exceptions.
//   2. `status` was typed as a generic `string`, allowing any arbitrary value.
//      This neuters IDE autocomplete, permits typos like "ONLNE" to compile,
//      and shifts error detection from compile-time to runtime.
//
// FIXES APPLIED:
//   1. Replaced all `any` types with specific, narrow types (`string` for id,
//      `number` for health). The id is a string like "M-001", so `string` is
//      the correct type. Health is a numeric percentage, so `number` fits.
//   2. Replaced the generic `string` status with a discriminated union type
//      `MachineStatus`, restricting values to exactly "ONLINE" | "OFFLINE" |
//      "MAINTENANCE". This turns invalid states into compile-time errors.
//
// ADVANCED CONSIDERATION:
//   TypeScript types are erased at compile time — they do NOT protect against
//   malformed data arriving from an API at runtime. For true safety at the
//   network boundary, a runtime validation library (Zod, io-ts, Yup) should
//   parse and validate incoming payloads before they enter the application.
//
//   Example with Zod:
//     const MachineDataSchema = z.object({
//       id: z.string(),
//       name: z.string(),
//       status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE"]),
//       health: z.number().min(0).max(100),
//       location: z.string(),
//       lastPing: z.string(),
//     });
//
// ============================================================================

export type MachineStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface MachineData {
  id: string;
  name: string;
  status: MachineStatus;
  health: number;
  location: string;
  lastPing: string;
}

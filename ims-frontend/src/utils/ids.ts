// FILE: src/utils/ids.ts
// PURPOSE: creates temporary IDs for new records, e.g. createId('P') -> "P-48213".
// WHAT TO DO: nothing yet. Once the NestJS API exists the DATABASE creates IDs, so delete this file and read `id` from the API response.
export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-5)}`
}

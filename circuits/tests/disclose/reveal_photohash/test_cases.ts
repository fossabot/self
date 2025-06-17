import path from 'path';

// Define the interface for DG2-hash test cases
export interface Dg2HashTestCase {
  dgHashAlgo: string;
  eContentHashAlgo: string;
}

// Unique {DG_HASH_ALGO, ECONTENT_HASH_ALGO} pairs that appear in the full-algorithm register test-suite
export const dg2hashAlgs: Dg2HashTestCase[] = [
  { dgHashAlgo: 'sha1', eContentHashAlgo: 'sha1' },
  { dgHashAlgo: 'sha1', eContentHashAlgo: 'sha256' },
  { dgHashAlgo: 'sha224', eContentHashAlgo: 'sha224' },
  { dgHashAlgo: 'sha256', eContentHashAlgo: 'sha224' },
  { dgHashAlgo: 'sha256', eContentHashAlgo: 'sha256' },
  { dgHashAlgo: 'sha384', eContentHashAlgo: 'sha384' },
  { dgHashAlgo: 'sha512', eContentHashAlgo: 'sha512' },
];

/**
 * Builds the simplified circuit instance name, e.g.
 *   dg2hash_sha256_sha256.circom
 */
export function getDg2HashCircuitName(dgHashAlgo: string, eContentHashAlgo: string) {
  return `dg2hash_${dgHashAlgo}_${eContentHashAlgo}`;
}

/**
 * Helper that returns the absolute path to the circuit instance file.  The
 * caller can pass its own __dirname so the relative path remains correct in
 * every location where the helper is used (tests, scripts, etc.).
 */
export function getDg2HashCircuitPath(
  dgHashAlgo: string,
  eContentHashAlgo: string,
  callerDirname: string
) {
  return path.join(
    callerDirname,
    `../../../circuits/disclose/photohash/instances/${getDg2HashCircuitName(
      dgHashAlgo,
      eContentHashAlgo
    )}.circom`
  );
}

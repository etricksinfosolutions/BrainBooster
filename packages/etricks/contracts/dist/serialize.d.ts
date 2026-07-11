/**
 * Canonical pack payload serialization.
 *
 * The publisher hashes `serializePackPayload(payload)` to produce a pack's checksum; the
 * client hashes the payload it downloaded and compares. Both sides MUST use this exact
 * function or every download would look tampered. That is why it lives in the contract,
 * not in the backend or the client.
 *
 * NOTE: JSON.stringify preserves object key insertion order, which is stable because our
 * payloads are produced by the pipeline (not re-parsed and re-emitted). When we move to
 * DB-backed generation we will switch this to a key-sorted canonical form and bump the
 * pack schemaVersion — a deliberate, versioned change.
 */
export declare function serializePackPayload(payload: unknown): string;
//# sourceMappingURL=serialize.d.ts.map
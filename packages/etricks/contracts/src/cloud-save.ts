import { z } from "zod";

/**
 * Cloud Save contracts — the synchronised player document and the sync protocol. Shared by the
 * backend and every client. Builds on the Identity Platform (ADR-0018) and Postgres persistence
 * (ADR-0019); the server is the source of truth and every write is versioned. See ADR-0020.
 *
 * Design notes for the merge engine (see cloud-save.merge in the backend):
 *   - monotonic numbers (xp, coins, gems, stars, streak, furthest level/world) merge by MAX —
 *     earned progress is never lost;
 *   - sets (completedActivities, badges, achievements, daily.rewardsClaimed) merge by UNION;
 *   - preference fields (profile, settings) merge by last-write-wins on `metadata.lastModified`.
 * All rules are commutative/deterministic, so any two devices converge to the same result.
 */

export const PlayerProfile = z.object({
  displayName: z.string().optional(),
  /** Future-ready cosmetic id. */
  avatar: z.string().optional(),
});
export type PlayerProfile = z.infer<typeof PlayerProfile>;

export const PlayerProgress = z.object({
  xp: z.number().int().nonnegative().default(0),
  coins: z.number().int().nonnegative().default(0),
  gems: z.number().int().nonnegative().default(0),
  hearts: z.number().int().nonnegative().default(0),
  /** Furthest unlocked level. */
  level: z.number().int().nonnegative().default(0),
  /** Furthest progress per world id. */
  worldProgress: z.record(z.string(), z.number().int().nonnegative()).default({}),
  completedActivities: z.array(z.string()).default([]),
  /** Best star rating per level id. */
  stars: z.record(z.string(), z.number().int().min(0).max(3)).default({}),
  badges: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  /** Future-ready: item id → count. */
  inventory: z.record(z.string(), z.number().int().nonnegative()).default({}),
});
export type PlayerProgress = z.infer<typeof PlayerProgress>;

export const PlayerSettings = z.object({
  audio: z.boolean().default(true),
  language: z.string().default("en"),
  accessibility: z.record(z.string(), z.union([z.boolean(), z.string()])).default({}),
  notifications: z.boolean().default(true),
});
export type PlayerSettings = z.infer<typeof PlayerSettings>;

export const PlayerDaily = z.object({
  rewardsClaimed: z.array(z.string()).default([]),
  streak: z.number().int().nonnegative().default(0),
  lastClaimedAt: z.string().optional(),
});
export type PlayerDaily = z.infer<typeof PlayerDaily>;

export const SaveMetadata = z.object({
  /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
  version: z.number().int().nonnegative().default(0),
  /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
  lastModified: z.string(),
  device: z.string().optional(),
  /** The account id that last wrote (audit + tie-break). */
  updatedBy: z.string().optional(),
});
export type SaveMetadata = z.infer<typeof SaveMetadata>;

/** The complete synchronised document for one account. */
export const CloudSave = z.object({
  profile: PlayerProfile.default({}),
  progress: PlayerProgress.default({}),
  settings: PlayerSettings.default({}),
  daily: PlayerDaily.default({}),
  metadata: SaveMetadata,
});
export type CloudSave = z.infer<typeof CloudSave>;

/** The mergeable body (everything except server-owned version). */
export const CloudSaveData = CloudSave.omit({ metadata: true }).extend({
  metadata: SaveMetadata.omit({ version: true }),
});
export type CloudSaveData = z.infer<typeof CloudSaveData>;

// --- Sync protocol -----------------------------------------------------------

/** POST /cloud/sync — push the client document, based on the last server version it saw. */
export const SyncRequest = z.object({
  /** The server `version` this client last synced from (0 if it has never synced). */
  baseVersion: z.number().int().nonnegative(),
  data: CloudSaveData,
});
export type SyncRequest = z.infer<typeof SyncRequest>;

/** One field the merge had to reconcile between diverging devices — never silently dropped. */
export const SyncConflict = z.object({
  field: z.string(),
  resolution: z.enum(["max", "union", "last-write-wins"]),
  kept: z.unknown().optional(),
  discarded: z.unknown().optional(),
});
export type SyncConflict = z.infer<typeof SyncConflict>;

export const SyncStatus = z.enum(["applied", "merged", "up-to-date"]);
export type SyncStatus = z.infer<typeof SyncStatus>;

export const SyncResponse = z.object({
  status: SyncStatus,
  /** The authoritative document after the sync. */
  save: CloudSave,
  /** Populated when status === "merged": what diverged and how it was resolved. */
  conflicts: z.array(SyncConflict).default([]),
});
export type SyncResponse = z.infer<typeof SyncResponse>;

/** GET /cloud/status — cheap freshness check. */
export const CloudStatus = z.object({
  exists: z.boolean(),
  version: z.number().int().nonnegative(),
  lastModified: z.string().optional(),
});
export type CloudStatus = z.infer<typeof CloudStatus>;

/** PUT /cloud/profile and PUT /cloud/progress — versioned partial writes (avoid full uploads). */
export const PutProfileRequest = z.object({
  baseVersion: z.number().int().nonnegative(),
  profile: PlayerProfile,
  lastModified: z.string(),
  device: z.string().optional(),
});
export type PutProfileRequest = z.infer<typeof PutProfileRequest>;

export const PutProgressRequest = z.object({
  baseVersion: z.number().int().nonnegative(),
  progress: PlayerProgress,
  lastModified: z.string(),
  device: z.string().optional(),
});
export type PutProgressRequest = z.infer<typeof PutProgressRequest>;

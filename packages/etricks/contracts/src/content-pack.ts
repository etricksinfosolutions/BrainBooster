import { z } from "zod";
import { IsoDateTime, Locale, Semver, Sha256, Slug } from "./primitives.js";

/**
 * CONTRACT #1 — ContentPack.
 *
 * A ContentPack is the atomic unit the platform manufactures and ships. Humans build
 * engines; AIOS fills packs; the CDN serves them; the app downloads and caches them.
 *
 * The envelope below is engine-agnostic. Each engine (quiz, memory, story...) owns the
 * shape of `payload` and composes its own concrete pack schema via `defineContentPack`.
 * This keeps the dependency arrow pointing one way: engines depend on contracts, never
 * the reverse.
 */

/**
 * The list of engines the platform ships. New engines are added here deliberately.
 *
 * `"activity"` is the Universal Activity Engine (ADR-0024): a single engine whose pack payload is a
 * discriminated union of ~15 configurable activity types (multiple-choice, memory-match, word-search,
 * …). It is the throughput engine — new games compose it by content + config, not code. The older
 * single-purpose ids (`quiz`, `memory`) remain for the reference game; new games use `activity`.
 */
export const EngineId = z.enum([
  "quiz",
  "memory",
  "puzzle",
  "board",
  "story",
  "language",
  "simulation",
  "activity",
]);
export type EngineId = z.infer<typeof EngineId>;

/**
 * ContentPackMeta — everything about a pack EXCEPT its payload.
 *
 * The app fetches meta first (small, cheap) to decide whether it already has the
 * content cached. Only on a miss does it download the full pack + verify `checksum`.
 */
export const ContentPackMeta = z.object({
  /** Globally unique pack id, e.g. "brain-booster.quiz.general-knowledge.en". */
  packId: Slug,
  /** Which game this pack belongs to. */
  gameId: Slug,
  /** Which engine can interpret this pack's payload. */
  engine: EngineId,
  /** Semver of the pack CONTENT (bump when content changes, independent of the app). */
  version: Semver,
  /** Content locale. One pack = one locale; localisation ships as sibling packs. */
  locale: Locale,
  /** Schema version of the payload shape, so old apps can reject packs they can't read. */
  schemaVersion: z.number().int().positive(),
  /** SHA-256 of the serialized payload — the app verifies this after download. */
  checksum: Sha256,
  /** Approximate uncompressed payload size in bytes, for download-budget decisions. */
  sizeBytes: z.number().int().nonnegative(),
  /** When this pack was published. */
  publishedAt: IsoDateTime,
  /** Free-form, engine-agnostic tags for merchandising ("daily", "hard", "kids"). */
  tags: z.array(Slug).default([]),
});
export type ContentPackMeta = z.infer<typeof ContentPackMeta>;

/**
 * Compose a full, typed ContentPack schema for a given engine payload.
 *
 * @example
 *   export const QuizPack = defineContentPack(QuizPayload);
 *   type QuizPack = z.infer<typeof QuizPack>;
 */
export function defineContentPack<T extends z.ZodTypeAny>(payload: T) {
  return ContentPackMeta.extend({ payload });
}

/** Generic pack with an unvalidated payload — useful for meta-only tooling / storage. */
export const AnyContentPack = ContentPackMeta.extend({ payload: z.unknown() });
export type AnyContentPack = z.infer<typeof AnyContentPack>;

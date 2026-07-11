import { z } from "zod";

/**
 * Shared primitives used across every contract. Keeping these in one place means
 * a game id or a semver string is validated identically everywhere in the platform.
 */

/** Semantic version, e.g. "1.4.2". Content packs and app versions both use this. */
export const Semver = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "must be a semantic version like 1.2.3");

/** BCP-47-ish locale tag we actually support, e.g. "en", "hi", "en-IN". */
export const Locale = z
  .string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "must be a locale like 'en' or 'en-IN'");

/** A stable, url-safe identifier for games, engines, packs, products. */
export const Slug = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "must be a lowercase slug like 'brain-booster'");

/** ISO-8601 timestamp. */
export const IsoDateTime = z.string().datetime();

/** SHA-256 hex digest — used to verify a downloaded pack matches what we published. */
export const Sha256 = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "must be a sha256 hex digest");

export type Semver = z.infer<typeof Semver>;
export type Locale = z.infer<typeof Locale>;
export type Slug = z.infer<typeof Slug>;

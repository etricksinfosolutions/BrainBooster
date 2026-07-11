import { z } from "zod";
/**
 * Shared primitives used across every contract. Keeping these in one place means
 * a game id or a semver string is validated identically everywhere in the platform.
 */
/** Semantic version, e.g. "1.4.2". Content packs and app versions both use this. */
export declare const Semver: z.ZodString;
/** BCP-47-ish locale tag we actually support, e.g. "en", "hi", "en-IN". */
export declare const Locale: z.ZodString;
/** A stable, url-safe identifier for games, engines, packs, products. */
export declare const Slug: z.ZodString;
/** ISO-8601 timestamp. */
export declare const IsoDateTime: z.ZodString;
/** SHA-256 hex digest — used to verify a downloaded pack matches what we published. */
export declare const Sha256: z.ZodString;
export type Semver = z.infer<typeof Semver>;
export type Locale = z.infer<typeof Locale>;
export type Slug = z.infer<typeof Slug>;
//# sourceMappingURL=primitives.d.ts.map
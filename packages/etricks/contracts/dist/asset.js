import { z } from "zod";
import { Slug } from "./primitives.js";
/**
 * AssetRef — how content references a non-text asset (image, audio, …) it depends on.
 *
 * This is the seam for the future **Asset Registry** without building it yet
 * (ADR-0010 defers persistence; ADR-0011 introduces this ref). Today `uri` is a concrete,
 * resolvable location and content carries it directly. When the registry lands, it becomes
 * the resolver: content keeps referencing a stable `assetId`, and the registry maps that id
 * to a versioned, CDN-hosted `uri` (and localisations, variants, licences). Because the ref
 * shape is stable, that upgrade is additive — content packs authored today keep validating.
 *
 * The Memory Engine is the first consumer: a card face is an image AssetRef. Quiz content
 * has no assets and never references one — assets are opt-in per engine.
 */
/** The asset media types the platform manufactures / ships. Extended deliberately. */
export const AssetKind = z.enum(["image", "audio", "video", "font", "lottie"]);
export const AssetRef = z.object({
    /** Stable, registry-resolvable id. Survives re-hosting; the dedup + versioning key. */
    assetId: Slug,
    kind: AssetKind,
    /**
     * Resolvable location of the asset TODAY (a URL or pack-relative path). Once the Asset
     * Registry exists it derives this from `assetId`; until then content carries it inline.
     */
    uri: z.string().min(1),
    /** Accessibility / offline-fallback text. Also the human label for review tooling. */
    alt: z.string().min(1).optional(),
});
//# sourceMappingURL=asset.js.map
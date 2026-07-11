import { z } from "zod";
/**
 * Product Analytics contracts. The platform collects strongly-typed product events through a
 * provider-agnostic pipeline: the app talks only to these contracts and the backend ingest
 * endpoint — never to Firebase (or any vendor) directly. Adapters (Firebase / console / no-op,
 * and later Mixpanel/Amplitude/PostHog) sit behind the backend AnalyticsService. Builds on
 * Identity (ADR-0018) for the actor, Subscriptions (ADR-0021) for premium status, and Postgres
 * (ADR-0019) for durable storage. See docs/ANALYTICS.md and ADR-0022.
 */
/**
 * The strongly-typed event catalogue. Canonical snake_case keys; human names are in the event
 * catalogue (docs/ANALYTICS.md). New events are added here — one line, no architectural change.
 */
export const AnalyticsEventName = z.enum([
    // lifecycle / session
    "app_started",
    "session_started",
    "session_ended",
    "screen_viewed",
    // identity
    "user_signed_in",
    "user_signed_out",
    "guest_created",
    // monetization
    "subscription_started",
    "subscription_renewed",
    "purchase_restored",
    // gameplay / learning outcomes
    "level_started",
    "level_completed",
    "question_answered",
    "question_failed",
    "hint_used",
    "story_completed",
    "achievement_earned",
    "world_completed",
    "daily_reward_claimed",
    // platform / content
    "cloud_sync_completed",
    "generation_job_published",
    "content_viewed",
    "search_performed",
    // adaptive learning (ADR-0025) — one line each, no architectural change
    "skill_mastered",
    "recommendation_accepted",
    "recommendation_ignored",
    "mission_completed",
    "review_completed",
    "difficulty_increased",
    "difficulty_decreased",
    "learning_goal_completed",
    // health
    "crash_reported",
]);
/** Where the event originated. `server` is for backend-emitted platform events. */
export const AnalyticsPlatform = z.enum(["web", "ios", "android", "server"]);
/**
 * The automatic attribute envelope attached to every event. Deliberately free of PII: the
 * `anonymousId` is a random device id (not a person), `userId` is the opaque account id, and no
 * name/email/phone is ever carried. See the Privacy Model in docs/ANALYTICS.md.
 */
export const AnalyticsContext = z.object({
    /** Opaque account id when signed in (server-enriched; the client hint is advisory). */
    userId: z.string().optional(),
    /** Random per-device id — the acquisition/attribution anchor before sign-in. Not a person. */
    anonymousId: z.string().min(1),
    /** Per-app-run session id (rotates on session_started). */
    sessionId: z.string().min(1),
    game: z.string().optional(),
    world: z.string().optional(),
    activity: z.string().optional(),
    /** Coarse device descriptor (model/class), never a hardware serial. */
    device: z.string().optional(),
    platform: AnalyticsPlatform,
    appVersion: z.string().optional(),
    /** Premium status — server-authoritative (derived from entitlements), client hint ignored. */
    premium: z.boolean().optional(),
});
/** An event param value — scalar only, keeping payloads small and PII-resistant. */
export const AnalyticsParamValue = z.union([z.string(), z.number(), z.boolean()]);
export const AnalyticsEvent = z.object({
    name: AnalyticsEventName,
    /** Client event time (ISO-8601). The server also stamps a trusted `receivedAt`. */
    timestamp: z.string(),
    params: z.record(AnalyticsParamValue).default({}),
    context: AnalyticsContext,
});
// --- requests / responses ----------------------------------------------------
/** POST /analytics/events — a batch of events collected + flushed by the client. */
export const IngestEventsRequest = z.object({
    events: z.array(AnalyticsEvent).max(500),
});
export const IngestEventsResponse = z.object({
    accepted: z.number(),
    rejected: z.number(),
});
/** GET /analytics/health — product-health snapshot for dashboards/debugging. */
export const AnalyticsHealth = z.object({
    enabled: z.boolean(),
    provider: z.string(),
    totalEvents: z.number(),
    byName: z.record(z.number()),
});
//# sourceMappingURL=analytics.js.map
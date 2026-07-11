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
export declare const AnalyticsEventName: z.ZodEnum<["app_started", "session_started", "session_ended", "screen_viewed", "user_signed_in", "user_signed_out", "guest_created", "subscription_started", "subscription_renewed", "purchase_restored", "level_started", "level_completed", "question_answered", "question_failed", "hint_used", "story_completed", "achievement_earned", "world_completed", "daily_reward_claimed", "cloud_sync_completed", "generation_job_published", "content_viewed", "search_performed", "skill_mastered", "recommendation_accepted", "recommendation_ignored", "mission_completed", "review_completed", "difficulty_increased", "difficulty_decreased", "learning_goal_completed", "crash_reported"]>;
export type AnalyticsEventName = z.infer<typeof AnalyticsEventName>;
/** Where the event originated. `server` is for backend-emitted platform events. */
export declare const AnalyticsPlatform: z.ZodEnum<["web", "ios", "android", "server"]>;
export type AnalyticsPlatform = z.infer<typeof AnalyticsPlatform>;
/**
 * The automatic attribute envelope attached to every event. Deliberately free of PII: the
 * `anonymousId` is a random device id (not a person), `userId` is the opaque account id, and no
 * name/email/phone is ever carried. See the Privacy Model in docs/ANALYTICS.md.
 */
export declare const AnalyticsContext: z.ZodObject<{
    /** Opaque account id when signed in (server-enriched; the client hint is advisory). */
    userId: z.ZodOptional<z.ZodString>;
    /** Random per-device id — the acquisition/attribution anchor before sign-in. Not a person. */
    anonymousId: z.ZodString;
    /** Per-app-run session id (rotates on session_started). */
    sessionId: z.ZodString;
    game: z.ZodOptional<z.ZodString>;
    world: z.ZodOptional<z.ZodString>;
    activity: z.ZodOptional<z.ZodString>;
    /** Coarse device descriptor (model/class), never a hardware serial. */
    device: z.ZodOptional<z.ZodString>;
    platform: z.ZodEnum<["web", "ios", "android", "server"]>;
    appVersion: z.ZodOptional<z.ZodString>;
    /** Premium status — server-authoritative (derived from entitlements), client hint ignored. */
    premium: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    anonymousId: string;
    sessionId: string;
    platform: "web" | "ios" | "android" | "server";
    userId?: string | undefined;
    game?: string | undefined;
    world?: string | undefined;
    activity?: string | undefined;
    device?: string | undefined;
    appVersion?: string | undefined;
    premium?: boolean | undefined;
}, {
    anonymousId: string;
    sessionId: string;
    platform: "web" | "ios" | "android" | "server";
    userId?: string | undefined;
    game?: string | undefined;
    world?: string | undefined;
    activity?: string | undefined;
    device?: string | undefined;
    appVersion?: string | undefined;
    premium?: boolean | undefined;
}>;
export type AnalyticsContext = z.infer<typeof AnalyticsContext>;
/** An event param value — scalar only, keeping payloads small and PII-resistant. */
export declare const AnalyticsParamValue: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
export type AnalyticsParamValue = z.infer<typeof AnalyticsParamValue>;
export declare const AnalyticsEvent: z.ZodObject<{
    name: z.ZodEnum<["app_started", "session_started", "session_ended", "screen_viewed", "user_signed_in", "user_signed_out", "guest_created", "subscription_started", "subscription_renewed", "purchase_restored", "level_started", "level_completed", "question_answered", "question_failed", "hint_used", "story_completed", "achievement_earned", "world_completed", "daily_reward_claimed", "cloud_sync_completed", "generation_job_published", "content_viewed", "search_performed", "skill_mastered", "recommendation_accepted", "recommendation_ignored", "mission_completed", "review_completed", "difficulty_increased", "difficulty_decreased", "learning_goal_completed", "crash_reported"]>;
    /** Client event time (ISO-8601). The server also stamps a trusted `receivedAt`. */
    timestamp: z.ZodString;
    params: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>>;
    context: z.ZodObject<{
        /** Opaque account id when signed in (server-enriched; the client hint is advisory). */
        userId: z.ZodOptional<z.ZodString>;
        /** Random per-device id — the acquisition/attribution anchor before sign-in. Not a person. */
        anonymousId: z.ZodString;
        /** Per-app-run session id (rotates on session_started). */
        sessionId: z.ZodString;
        game: z.ZodOptional<z.ZodString>;
        world: z.ZodOptional<z.ZodString>;
        activity: z.ZodOptional<z.ZodString>;
        /** Coarse device descriptor (model/class), never a hardware serial. */
        device: z.ZodOptional<z.ZodString>;
        platform: z.ZodEnum<["web", "ios", "android", "server"]>;
        appVersion: z.ZodOptional<z.ZodString>;
        /** Premium status — server-authoritative (derived from entitlements), client hint ignored. */
        premium: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        anonymousId: string;
        sessionId: string;
        platform: "web" | "ios" | "android" | "server";
        userId?: string | undefined;
        game?: string | undefined;
        world?: string | undefined;
        activity?: string | undefined;
        device?: string | undefined;
        appVersion?: string | undefined;
        premium?: boolean | undefined;
    }, {
        anonymousId: string;
        sessionId: string;
        platform: "web" | "ios" | "android" | "server";
        userId?: string | undefined;
        game?: string | undefined;
        world?: string | undefined;
        activity?: string | undefined;
        device?: string | undefined;
        appVersion?: string | undefined;
        premium?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: Record<string, string | number | boolean>;
    name: "app_started" | "session_started" | "session_ended" | "screen_viewed" | "user_signed_in" | "user_signed_out" | "guest_created" | "subscription_started" | "subscription_renewed" | "purchase_restored" | "level_started" | "level_completed" | "question_answered" | "question_failed" | "hint_used" | "story_completed" | "achievement_earned" | "world_completed" | "daily_reward_claimed" | "cloud_sync_completed" | "generation_job_published" | "content_viewed" | "search_performed" | "skill_mastered" | "recommendation_accepted" | "recommendation_ignored" | "mission_completed" | "review_completed" | "difficulty_increased" | "difficulty_decreased" | "learning_goal_completed" | "crash_reported";
    timestamp: string;
    context: {
        anonymousId: string;
        sessionId: string;
        platform: "web" | "ios" | "android" | "server";
        userId?: string | undefined;
        game?: string | undefined;
        world?: string | undefined;
        activity?: string | undefined;
        device?: string | undefined;
        appVersion?: string | undefined;
        premium?: boolean | undefined;
    };
}, {
    name: "app_started" | "session_started" | "session_ended" | "screen_viewed" | "user_signed_in" | "user_signed_out" | "guest_created" | "subscription_started" | "subscription_renewed" | "purchase_restored" | "level_started" | "level_completed" | "question_answered" | "question_failed" | "hint_used" | "story_completed" | "achievement_earned" | "world_completed" | "daily_reward_claimed" | "cloud_sync_completed" | "generation_job_published" | "content_viewed" | "search_performed" | "skill_mastered" | "recommendation_accepted" | "recommendation_ignored" | "mission_completed" | "review_completed" | "difficulty_increased" | "difficulty_decreased" | "learning_goal_completed" | "crash_reported";
    timestamp: string;
    context: {
        anonymousId: string;
        sessionId: string;
        platform: "web" | "ios" | "android" | "server";
        userId?: string | undefined;
        game?: string | undefined;
        world?: string | undefined;
        activity?: string | undefined;
        device?: string | undefined;
        appVersion?: string | undefined;
        premium?: boolean | undefined;
    };
    params?: Record<string, string | number | boolean> | undefined;
}>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;
/** POST /analytics/events — a batch of events collected + flushed by the client. */
export declare const IngestEventsRequest: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        name: z.ZodEnum<["app_started", "session_started", "session_ended", "screen_viewed", "user_signed_in", "user_signed_out", "guest_created", "subscription_started", "subscription_renewed", "purchase_restored", "level_started", "level_completed", "question_answered", "question_failed", "hint_used", "story_completed", "achievement_earned", "world_completed", "daily_reward_claimed", "cloud_sync_completed", "generation_job_published", "content_viewed", "search_performed", "skill_mastered", "recommendation_accepted", "recommendation_ignored", "mission_completed", "review_completed", "difficulty_increased", "difficulty_decreased", "learning_goal_completed", "crash_reported"]>;
        /** Client event time (ISO-8601). The server also stamps a trusted `receivedAt`. */
        timestamp: z.ZodString;
        params: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>>;
        context: z.ZodObject<{
            /** Opaque account id when signed in (server-enriched; the client hint is advisory). */
            userId: z.ZodOptional<z.ZodString>;
            /** Random per-device id — the acquisition/attribution anchor before sign-in. Not a person. */
            anonymousId: z.ZodString;
            /** Per-app-run session id (rotates on session_started). */
            sessionId: z.ZodString;
            game: z.ZodOptional<z.ZodString>;
            world: z.ZodOptional<z.ZodString>;
            activity: z.ZodOptional<z.ZodString>;
            /** Coarse device descriptor (model/class), never a hardware serial. */
            device: z.ZodOptional<z.ZodString>;
            platform: z.ZodEnum<["web", "ios", "android", "server"]>;
            appVersion: z.ZodOptional<z.ZodString>;
            /** Premium status — server-authoritative (derived from entitlements), client hint ignored. */
            premium: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            anonymousId: string;
            sessionId: string;
            platform: "web" | "ios" | "android" | "server";
            userId?: string | undefined;
            game?: string | undefined;
            world?: string | undefined;
            activity?: string | undefined;
            device?: string | undefined;
            appVersion?: string | undefined;
            premium?: boolean | undefined;
        }, {
            anonymousId: string;
            sessionId: string;
            platform: "web" | "ios" | "android" | "server";
            userId?: string | undefined;
            game?: string | undefined;
            world?: string | undefined;
            activity?: string | undefined;
            device?: string | undefined;
            appVersion?: string | undefined;
            premium?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, string | number | boolean>;
        name: "app_started" | "session_started" | "session_ended" | "screen_viewed" | "user_signed_in" | "user_signed_out" | "guest_created" | "subscription_started" | "subscription_renewed" | "purchase_restored" | "level_started" | "level_completed" | "question_answered" | "question_failed" | "hint_used" | "story_completed" | "achievement_earned" | "world_completed" | "daily_reward_claimed" | "cloud_sync_completed" | "generation_job_published" | "content_viewed" | "search_performed" | "skill_mastered" | "recommendation_accepted" | "recommendation_ignored" | "mission_completed" | "review_completed" | "difficulty_increased" | "difficulty_decreased" | "learning_goal_completed" | "crash_reported";
        timestamp: string;
        context: {
            anonymousId: string;
            sessionId: string;
            platform: "web" | "ios" | "android" | "server";
            userId?: string | undefined;
            game?: string | undefined;
            world?: string | undefined;
            activity?: string | undefined;
            device?: string | undefined;
            appVersion?: string | undefined;
            premium?: boolean | undefined;
        };
    }, {
        name: "app_started" | "session_started" | "session_ended" | "screen_viewed" | "user_signed_in" | "user_signed_out" | "guest_created" | "subscription_started" | "subscription_renewed" | "purchase_restored" | "level_started" | "level_completed" | "question_answered" | "question_failed" | "hint_used" | "story_completed" | "achievement_earned" | "world_completed" | "daily_reward_claimed" | "cloud_sync_completed" | "generation_job_published" | "content_viewed" | "search_performed" | "skill_mastered" | "recommendation_accepted" | "recommendation_ignored" | "mission_completed" | "review_completed" | "difficulty_increased" | "difficulty_decreased" | "learning_goal_completed" | "crash_reported";
        timestamp: string;
        context: {
            anonymousId: string;
            sessionId: string;
            platform: "web" | "ios" | "android" | "server";
            userId?: string | undefined;
            game?: string | undefined;
            world?: string | undefined;
            activity?: string | undefined;
            device?: string | undefined;
            appVersion?: string | undefined;
            premium?: boolean | undefined;
        };
        params?: Record<string, string | number | boolean> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    events: {
        params: Record<string, string | number | boolean>;
        name: "app_started" | "session_started" | "session_ended" | "screen_viewed" | "user_signed_in" | "user_signed_out" | "guest_created" | "subscription_started" | "subscription_renewed" | "purchase_restored" | "level_started" | "level_completed" | "question_answered" | "question_failed" | "hint_used" | "story_completed" | "achievement_earned" | "world_completed" | "daily_reward_claimed" | "cloud_sync_completed" | "generation_job_published" | "content_viewed" | "search_performed" | "skill_mastered" | "recommendation_accepted" | "recommendation_ignored" | "mission_completed" | "review_completed" | "difficulty_increased" | "difficulty_decreased" | "learning_goal_completed" | "crash_reported";
        timestamp: string;
        context: {
            anonymousId: string;
            sessionId: string;
            platform: "web" | "ios" | "android" | "server";
            userId?: string | undefined;
            game?: string | undefined;
            world?: string | undefined;
            activity?: string | undefined;
            device?: string | undefined;
            appVersion?: string | undefined;
            premium?: boolean | undefined;
        };
    }[];
}, {
    events: {
        name: "app_started" | "session_started" | "session_ended" | "screen_viewed" | "user_signed_in" | "user_signed_out" | "guest_created" | "subscription_started" | "subscription_renewed" | "purchase_restored" | "level_started" | "level_completed" | "question_answered" | "question_failed" | "hint_used" | "story_completed" | "achievement_earned" | "world_completed" | "daily_reward_claimed" | "cloud_sync_completed" | "generation_job_published" | "content_viewed" | "search_performed" | "skill_mastered" | "recommendation_accepted" | "recommendation_ignored" | "mission_completed" | "review_completed" | "difficulty_increased" | "difficulty_decreased" | "learning_goal_completed" | "crash_reported";
        timestamp: string;
        context: {
            anonymousId: string;
            sessionId: string;
            platform: "web" | "ios" | "android" | "server";
            userId?: string | undefined;
            game?: string | undefined;
            world?: string | undefined;
            activity?: string | undefined;
            device?: string | undefined;
            appVersion?: string | undefined;
            premium?: boolean | undefined;
        };
        params?: Record<string, string | number | boolean> | undefined;
    }[];
}>;
export type IngestEventsRequest = z.infer<typeof IngestEventsRequest>;
export declare const IngestEventsResponse: z.ZodObject<{
    accepted: z.ZodNumber;
    rejected: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    accepted: number;
    rejected: number;
}, {
    accepted: number;
    rejected: number;
}>;
export type IngestEventsResponse = z.infer<typeof IngestEventsResponse>;
/** GET /analytics/health — product-health snapshot for dashboards/debugging. */
export declare const AnalyticsHealth: z.ZodObject<{
    enabled: z.ZodBoolean;
    provider: z.ZodString;
    totalEvents: z.ZodNumber;
    byName: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    provider: string;
    totalEvents: number;
    byName: Record<string, number>;
}, {
    enabled: boolean;
    provider: string;
    totalEvents: number;
    byName: Record<string, number>;
}>;
export type AnalyticsHealth = z.infer<typeof AnalyticsHealth>;
//# sourceMappingURL=analytics.d.ts.map
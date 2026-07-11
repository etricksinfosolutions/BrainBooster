import { z } from "zod";
/**
 * Subscription & Entitlement contracts. The platform answers one question — "does this user
 * possess entitlement Y?" — never "did they buy X?". Entitlements are derived from server-verified
 * purchases + subscriptions (and, later, direct grants). Builds on Identity (ADR-0018), Cloud Save
 * (ADR-0020), and Postgres (ADR-0019). See docs/SUBSCRIPTIONS.md.
 */
/** Billing providers. Amazon/Steam/Microsoft are added as adapters later — no contract change. */
export declare const BillingProvider: z.ZodEnum<["google", "apple", "web"]>;
export type BillingProvider = z.infer<typeof BillingProvider>;
/** Known entitlement keys. Kept as an open string for forward-compatibility (marketplace, packs). */
export declare const ENTITLEMENTS: {
    readonly PREMIUM: "PREMIUM";
    readonly UNLIMITED_HEARTS: "UNLIMITED_HEARTS";
    readonly FINANCE_MASTER: "FINANCE_MASTER";
    readonly AI_TUTOR: "AI_TUTOR";
    readonly PARENT_DASHBOARD: "PARENT_DASHBOARD";
    readonly STORY_PACK_001: "STORY_PACK_001";
};
export declare const PurchaseType: z.ZodEnum<["subscription", "one-time"]>;
export type PurchaseType = z.infer<typeof PurchaseType>;
export declare const SubscriptionState: z.ZodEnum<["active", "expired", "cancelled", "in_trial"]>;
export type SubscriptionState = z.infer<typeof SubscriptionState>;
/** Lifecycle events the platform emits (exposed for a future analytics sink — not integrated yet). */
export declare const SubscriptionEventType: z.ZodEnum<["subscription_started", "subscription_renewed", "subscription_cancelled", "purchase_restored", "purchase_failed", "trial_started"]>;
export type SubscriptionEventType = z.infer<typeof SubscriptionEventType>;
/** POST /subscriptions/{google|apple|web} — verify a single purchase receipt/token. */
export declare const VerifyPurchaseRequest: z.ZodObject<{
    /** Provider receipt/token. In mock mode a JSON string `{ productId, txnId?, expiresAt? }`. */
    receipt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    receipt: string;
}, {
    receipt: string;
}>;
export type VerifyPurchaseRequest = z.infer<typeof VerifyPurchaseRequest>;
/** POST /subscriptions/restore — re-verify the account's receipts (cross-device restore). */
export declare const RestorePurchasesRequest: z.ZodObject<{
    provider: z.ZodEnum<["google", "apple", "web"]>;
    receipts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    provider: "web" | "google" | "apple";
    receipts: string[];
}, {
    provider: "web" | "google" | "apple";
    receipts?: string[] | undefined;
}>;
export type RestorePurchasesRequest = z.infer<typeof RestorePurchasesRequest>;
export declare const EntitlementInfo: z.ZodObject<{
    entitlement: z.ZodString;
    source: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entitlement: string;
    source: string;
    expiresAt?: string | undefined;
}, {
    entitlement: string;
    source: string;
    expiresAt?: string | undefined;
}>;
export type EntitlementInfo = z.infer<typeof EntitlementInfo>;
export declare const EntitlementsResponse: z.ZodObject<{
    entitlements: z.ZodArray<z.ZodString, "many">;
    details: z.ZodArray<z.ZodObject<{
        entitlement: z.ZodString;
        source: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        entitlement: string;
        source: string;
        expiresAt?: string | undefined;
    }, {
        entitlement: string;
        source: string;
        expiresAt?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    entitlements: string[];
    details: {
        entitlement: string;
        source: string;
        expiresAt?: string | undefined;
    }[];
}, {
    entitlements: string[];
    details: {
        entitlement: string;
        source: string;
        expiresAt?: string | undefined;
    }[];
}>;
export type EntitlementsResponse = z.infer<typeof EntitlementsResponse>;
export declare const SubscriptionInfo: z.ZodObject<{
    productId: z.ZodString;
    provider: z.ZodEnum<["google", "apple", "web"]>;
    status: z.ZodEnum<["active", "expired", "cancelled", "in_trial"]>;
    startedAt: z.ZodString;
    expiresAt: z.ZodString;
    autoRenew: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "active" | "expired" | "cancelled" | "in_trial";
    provider: "web" | "google" | "apple";
    startedAt: string;
    productId: string;
    expiresAt: string;
    autoRenew: boolean;
}, {
    status: "active" | "expired" | "cancelled" | "in_trial";
    provider: "web" | "google" | "apple";
    startedAt: string;
    productId: string;
    expiresAt: string;
    autoRenew: boolean;
}>;
export type SubscriptionInfo = z.infer<typeof SubscriptionInfo>;
export declare const SubscriptionStatus: z.ZodObject<{
    active: z.ZodBoolean;
    subscriptions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        provider: z.ZodEnum<["google", "apple", "web"]>;
        status: z.ZodEnum<["active", "expired", "cancelled", "in_trial"]>;
        startedAt: z.ZodString;
        expiresAt: z.ZodString;
        autoRenew: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "expired" | "cancelled" | "in_trial";
        provider: "web" | "google" | "apple";
        startedAt: string;
        productId: string;
        expiresAt: string;
        autoRenew: boolean;
    }, {
        status: "active" | "expired" | "cancelled" | "in_trial";
        provider: "web" | "google" | "apple";
        startedAt: string;
        productId: string;
        expiresAt: string;
        autoRenew: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    subscriptions: {
        status: "active" | "expired" | "cancelled" | "in_trial";
        provider: "web" | "google" | "apple";
        startedAt: string;
        productId: string;
        expiresAt: string;
        autoRenew: boolean;
    }[];
}, {
    active: boolean;
    subscriptions: {
        status: "active" | "expired" | "cancelled" | "in_trial";
        provider: "web" | "google" | "apple";
        startedAt: string;
        productId: string;
        expiresAt: string;
        autoRenew: boolean;
    }[];
}>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export declare const PurchaseEventDto: z.ZodObject<{
    type: z.ZodEnum<["subscription_started", "subscription_renewed", "subscription_cancelled", "purchase_restored", "purchase_failed", "trial_started"]>;
    productId: z.ZodOptional<z.ZodString>;
    at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    at: string;
    type: "subscription_started" | "subscription_renewed" | "purchase_restored" | "subscription_cancelled" | "purchase_failed" | "trial_started";
    productId?: string | undefined;
}, {
    at: string;
    type: "subscription_started" | "subscription_renewed" | "purchase_restored" | "subscription_cancelled" | "purchase_failed" | "trial_started";
    productId?: string | undefined;
}>;
export type PurchaseEventDto = z.infer<typeof PurchaseEventDto>;
export declare const PurchaseHistory: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["subscription_started", "subscription_renewed", "subscription_cancelled", "purchase_restored", "purchase_failed", "trial_started"]>;
        productId: z.ZodOptional<z.ZodString>;
        at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        at: string;
        type: "subscription_started" | "subscription_renewed" | "purchase_restored" | "subscription_cancelled" | "purchase_failed" | "trial_started";
        productId?: string | undefined;
    }, {
        at: string;
        type: "subscription_started" | "subscription_renewed" | "purchase_restored" | "subscription_cancelled" | "purchase_failed" | "trial_started";
        productId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    events: {
        at: string;
        type: "subscription_started" | "subscription_renewed" | "purchase_restored" | "subscription_cancelled" | "purchase_failed" | "trial_started";
        productId?: string | undefined;
    }[];
}, {
    events: {
        at: string;
        type: "subscription_started" | "subscription_renewed" | "purchase_restored" | "subscription_cancelled" | "purchase_failed" | "trial_started";
        productId?: string | undefined;
    }[];
}>;
export type PurchaseHistory = z.infer<typeof PurchaseHistory>;
//# sourceMappingURL=subscription.d.ts.map
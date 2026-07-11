import { z } from "zod";

/**
 * Subscription & Entitlement contracts. The platform answers one question — "does this user
 * possess entitlement Y?" — never "did they buy X?". Entitlements are derived from server-verified
 * purchases + subscriptions (and, later, direct grants). Builds on Identity (ADR-0018), Cloud Save
 * (ADR-0020), and Postgres (ADR-0019). See docs/SUBSCRIPTIONS.md.
 */

/** Billing providers. Amazon/Steam/Microsoft are added as adapters later — no contract change. */
export const BillingProvider = z.enum(["google", "apple", "web"]);
export type BillingProvider = z.infer<typeof BillingProvider>;

/** Known entitlement keys. Kept as an open string for forward-compatibility (marketplace, packs). */
export const ENTITLEMENTS = {
  PREMIUM: "PREMIUM",
  UNLIMITED_HEARTS: "UNLIMITED_HEARTS",
  FINANCE_MASTER: "FINANCE_MASTER",
  AI_TUTOR: "AI_TUTOR",
  PARENT_DASHBOARD: "PARENT_DASHBOARD",
  STORY_PACK_001: "STORY_PACK_001",
} as const;

export const PurchaseType = z.enum(["subscription", "one-time"]);
export type PurchaseType = z.infer<typeof PurchaseType>;

export const SubscriptionState = z.enum(["active", "expired", "cancelled", "in_trial"]);
export type SubscriptionState = z.infer<typeof SubscriptionState>;

/** Lifecycle events the platform emits (exposed for a future analytics sink — not integrated yet). */
export const SubscriptionEventType = z.enum([
  "subscription_started",
  "subscription_renewed",
  "subscription_cancelled",
  "purchase_restored",
  "purchase_failed",
  "trial_started",
]);
export type SubscriptionEventType = z.infer<typeof SubscriptionEventType>;

// --- requests ----------------------------------------------------------------

/** POST /subscriptions/{google|apple|web} — verify a single purchase receipt/token. */
export const VerifyPurchaseRequest = z.object({
  /** Provider receipt/token. In mock mode a JSON string `{ productId, txnId?, expiresAt? }`. */
  receipt: z.string().min(1),
});
export type VerifyPurchaseRequest = z.infer<typeof VerifyPurchaseRequest>;

/** POST /subscriptions/restore — re-verify the account's receipts (cross-device restore). */
export const RestorePurchasesRequest = z.object({
  provider: BillingProvider,
  receipts: z.array(z.string().min(1)).default([]),
});
export type RestorePurchasesRequest = z.infer<typeof RestorePurchasesRequest>;

// --- responses ---------------------------------------------------------------

export const EntitlementInfo = z.object({
  entitlement: z.string(),
  source: z.string(),
  expiresAt: z.string().optional(),
});
export type EntitlementInfo = z.infer<typeof EntitlementInfo>;

export const EntitlementsResponse = z.object({
  entitlements: z.array(z.string()),
  details: z.array(EntitlementInfo),
});
export type EntitlementsResponse = z.infer<typeof EntitlementsResponse>;

export const SubscriptionInfo = z.object({
  productId: z.string(),
  provider: BillingProvider,
  status: SubscriptionState,
  startedAt: z.string(),
  expiresAt: z.string(),
  autoRenew: z.boolean(),
});
export type SubscriptionInfo = z.infer<typeof SubscriptionInfo>;

export const SubscriptionStatus = z.object({
  active: z.boolean(),
  subscriptions: z.array(SubscriptionInfo),
});
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const PurchaseEventDto = z.object({
  type: SubscriptionEventType,
  productId: z.string().optional(),
  at: z.string(),
});
export type PurchaseEventDto = z.infer<typeof PurchaseEventDto>;

export const PurchaseHistory = z.object({
  events: z.array(PurchaseEventDto),
});
export type PurchaseHistory = z.infer<typeof PurchaseHistory>;

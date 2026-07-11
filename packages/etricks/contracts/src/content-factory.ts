import { z } from "zod";

/**
 * Content Factory & Admin CMS contracts — the internal operating system for manufacturing
 * educational content at scale with human review. Built entirely on the frozen architecture
 * (ADR-0016): the AIOS `generateContent`/`runGenerationJob` pipeline (ADR-0008/0017), the
 * repository-interface + Postgres persistence (ADR-0019), and Identity/Entitlements
 * (ADR-0018/0021) for admin-only access. See docs/CONTENT_FACTORY.md and ADR-0023.
 *
 * Publishing NEVER happens directly from generation: content flows through a review workflow
 *   draft → ai_generated → pending_review → approved → published → archived
 * (with `rejected` as a terminal-until-regenerated state).
 */

// --- AI providers ------------------------------------------------------------

/** AI provider ids. New providers are a new adapter + one registry entry — no business-logic change. */
export const AIProviderId = z.enum(["offline", "claude", "openai", "gemini"]);
export type AIProviderId = z.infer<typeof AIProviderId>;

export const AIProviderInfo = z.object({
  id: AIProviderId,
  displayName: z.string(),
  model: z.string(),
  /** Whether a real key is configured; false ⇒ the adapter runs in deterministic mock mode. */
  configured: z.boolean(),
  /** USD per 1K input / output tokens — the cost model. */
  costPer1kInput: z.number().nonnegative(),
  costPer1kOutput: z.number().nonnegative(),
});
export type AIProviderInfo = z.infer<typeof AIProviderInfo>;

// --- prompt versioning -------------------------------------------------------

/**
 * A versioned prompt template. Every generation records the exact template version + model params
 * it used, so any generated asset is reproducible. A new version is a new row (same `name`,
 * incremented `version`) — old versions are immutable and never overwritten.
 */
export const PromptTemplate = z.object({
  id: z.string(),
  /** Stable logical name, e.g. "quiz.questions.default". Versions share a name. */
  name: z.string().min(1),
  version: z.number().int().positive(),
  engine: z.string().min(1),
  contentType: z.string().min(1),
  /** The system framing (stable across a run; cacheable). */
  system: z.string(),
  /** The user-message template. `{{topic}}`, `{{count}}`, `{{avoid}}` are substituted. */
  userTemplate: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().default(4096),
  /** Whether this is the active version for its name (only one active per name). */
  active: z.boolean().default(true),
  createdAt: z.string(),
  createdBy: z.string(),
});
export type PromptTemplate = z.infer<typeof PromptTemplate>;

export const CreatePromptRequest = z.object({
  name: z.string().min(1),
  engine: z.string().min(1),
  contentType: z.string().min(1),
  system: z.string(),
  userTemplate: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});
export type CreatePromptRequest = z.infer<typeof CreatePromptRequest>;

// --- content lifecycle -------------------------------------------------------

/**
 * The review lifecycle. Publishing is only reachable from `approved`; generation lands content in
 * `pending_review`, never `published`. `rejected` items can be regenerated (new revision).
 */
export const ContentStatus = z.enum([
  "draft",
  "ai_generated",
  "pending_review",
  "approved",
  "rejected",
  "published",
  "archived",
]);
export type ContentStatus = z.infer<typeof ContentStatus>;

/** Deterministic quality signals computed from the content (no model call). */
export const QualityReport = z.object({
  /** 0..100 composite score. */
  score: z.number().min(0).max(100),
  /** Grade-level reading score (Flesch–Kincaid-style). */
  readingLevel: z.number(),
  /** Suggested minimum age from reading level + content. */
  ageSuitability: z.number().int(),
  difficulty: z.enum(["easy", "medium", "hard", "unknown"]),
  grammarIssues: z.array(z.string()),
  isDuplicate: z.boolean(),
  missingExplanation: z.boolean(),
});
export type QualityReport = z.infer<typeof QualityReport>;

export const ContentItem = z.object({
  id: z.string(),
  batchId: z.string().optional(),
  gameId: z.string(),
  engine: z.string(),
  contentType: z.string(),
  status: ContentStatus,
  /** The engine-shaped payload (one generated asset: a question, a memory pair, a story…). */
  payload: z.record(z.unknown()),
  quality: QualityReport,
  /** Reproducibility: which prompt version + provider/model produced this. */
  promptName: z.string().optional(),
  promptVersion: z.number().int().optional(),
  provider: AIProviderId.optional(),
  model: z.string().optional(),
  /** Regeneration counter — bumped each time the item is regenerated. */
  revision: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  tokens: z.number().int().nonnegative(),
  createdAt: z.string(),
  createdBy: z.string(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewNote: z.string().optional(),
  publishedAt: z.string().optional(),
});
export type ContentItem = z.infer<typeof ContentItem>;

/** A prior payload of an item, kept when it is regenerated — the revision history. */
export const ContentRevisionDto = z.object({
  revision: z.number().int().nonnegative(),
  payload: z.record(z.unknown()),
  quality: QualityReport,
  promptVersion: z.number().int().optional(),
  provider: AIProviderId.optional(),
  createdAt: z.string(),
});
export type ContentRevisionDto = z.infer<typeof ContentRevisionDto>;

// --- bulk generation ---------------------------------------------------------

export const BatchStatus = z.enum(["queued", "running", "completed", "partial", "failed"]);
export type BatchStatus = z.infer<typeof BatchStatus>;

/** POST /admin/batches — "Generate 500 Finance Questions". */
export const CreateBatchRequest = z.object({
  label: z.string().min(1),
  gameId: z.string().min(1),
  engine: z.string().min(1),
  contentType: z.string().min(1),
  count: z.number().int().positive().max(5000),
  topic: z.string().min(1),
  locale: z.string().default("en"),
  idPrefix: z.string().min(1),
  tags: z.array(z.string()).default([]),
  /** Which prompt template name to use (latest active version). Optional → engine default. */
  promptName: z.string().optional(),
  /** Which provider to manufacture with. Default: the configured default provider. */
  provider: AIProviderId.optional(),
});
export type CreateBatchRequest = z.infer<typeof CreateBatchRequest>;

export const GenerationBatch = z.object({
  id: z.string(),
  label: z.string(),
  gameId: z.string(),
  engine: z.string(),
  contentType: z.string(),
  /** Generation inputs kept for reproducibility + single-item regeneration. */
  topic: z.string(),
  idPrefix: z.string(),
  locale: z.string().default("en"),
  requested: z.number().int(),
  generated: z.number().int(),
  rejected: z.number().int(),
  failed: z.number().int(),
  retries: z.number().int(),
  status: BatchStatus,
  provider: AIProviderId,
  model: z.string(),
  promptName: z.string().optional(),
  promptVersion: z.number().int().optional(),
  operator: z.string(),
  costUsd: z.number().nonnegative(),
  tokens: z.number().int().nonnegative(),
  latencyMs: z.number().int().nonnegative(),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  /** Estimated completion (ISO) while running; absent when finished. */
  eta: z.string().optional(),
});
export type GenerationBatch = z.infer<typeof GenerationBatch>;

// --- review actions ----------------------------------------------------------

export const ReviewActionRequest = z.object({
  note: z.string().optional(),
});
export type ReviewActionRequest = z.infer<typeof ReviewActionRequest>;

// --- dashboards --------------------------------------------------------------

export const QualityDashboard = z.object({
  totalItems: z.number().int(),
  byStatus: z.record(z.number()),
  approvalRate: z.number(),
  rejectionRate: z.number(),
  averageQuality: z.number(),
  averageReviewMinutes: z.number(),
  duplicates: z.number().int(),
  grammarFlagged: z.number().int(),
  difficultyDistribution: z.record(z.number()),
  ageDistribution: z.record(z.number()),
});
export type QualityDashboard = z.infer<typeof QualityDashboard>;

export const CostDashboard = z.object({
  totalCostUsd: z.number(),
  totalTokens: z.number().int(),
  costPerItem: z.number(),
  byContentType: z.record(z.object({ items: z.number().int(), costUsd: z.number() })),
  byProvider: z.record(z.object({ items: z.number().int(), costUsd: z.number(), avgLatencyMs: z.number() })),
  byPrompt: z.record(z.object({ items: z.number().int(), approvalRate: z.number(), avgQuality: z.number() })),
});
export type CostDashboard = z.infer<typeof CostDashboard>;

// --- listing -----------------------------------------------------------------

export const ContentQuery = z.object({
  status: ContentStatus.optional(),
  gameId: z.string().optional(),
  engine: z.string().optional(),
  contentType: z.string().optional(),
  batchId: z.string().optional(),
  /** Free-text search over the payload. */
  q: z.string().optional(),
  limit: z.number().int().positive().max(500).default(50),
  offset: z.number().int().nonnegative().default(0),
});
export type ContentQuery = z.infer<typeof ContentQuery>;

export const ContentPage = z.object({
  items: z.array(ContentItem),
  total: z.number().int(),
});
export type ContentPage = z.infer<typeof ContentPage>;

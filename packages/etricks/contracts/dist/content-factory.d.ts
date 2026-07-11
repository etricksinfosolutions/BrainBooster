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
/** AI provider ids. New providers are a new adapter + one registry entry — no business-logic change. */
export declare const AIProviderId: z.ZodEnum<["offline", "claude", "openai", "gemini"]>;
export type AIProviderId = z.infer<typeof AIProviderId>;
export declare const AIProviderInfo: z.ZodObject<{
    id: z.ZodEnum<["offline", "claude", "openai", "gemini"]>;
    displayName: z.ZodString;
    model: z.ZodString;
    /** Whether a real key is configured; false ⇒ the adapter runs in deterministic mock mode. */
    configured: z.ZodBoolean;
    /** USD per 1K input / output tokens — the cost model. */
    costPer1kInput: z.ZodNumber;
    costPer1kOutput: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: "offline" | "claude" | "openai" | "gemini";
    displayName: string;
    model: string;
    configured: boolean;
    costPer1kInput: number;
    costPer1kOutput: number;
}, {
    id: "offline" | "claude" | "openai" | "gemini";
    displayName: string;
    model: string;
    configured: boolean;
    costPer1kInput: number;
    costPer1kOutput: number;
}>;
export type AIProviderInfo = z.infer<typeof AIProviderInfo>;
/**
 * A versioned prompt template. Every generation records the exact template version + model params
 * it used, so any generated asset is reproducible. A new version is a new row (same `name`,
 * incremented `version`) — old versions are immutable and never overwritten.
 */
export declare const PromptTemplate: z.ZodObject<{
    id: z.ZodString;
    /** Stable logical name, e.g. "quiz.questions.default". Versions share a name. */
    name: z.ZodString;
    version: z.ZodNumber;
    engine: z.ZodString;
    contentType: z.ZodString;
    /** The system framing (stable across a run; cacheable). */
    system: z.ZodString;
    /** The user-message template. `{{topic}}`, `{{count}}`, `{{avoid}}` are substituted. */
    userTemplate: z.ZodString;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    /** Whether this is the active version for its name (only one active per name). */
    active: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    createdBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: string;
    version: number;
    engine: string;
    contentType: string;
    system: string;
    userTemplate: string;
    temperature: number;
    maxTokens: number;
    active: boolean;
    createdBy: string;
}, {
    name: string;
    id: string;
    createdAt: string;
    version: number;
    engine: string;
    contentType: string;
    system: string;
    userTemplate: string;
    createdBy: string;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    active?: boolean | undefined;
}>;
export type PromptTemplate = z.infer<typeof PromptTemplate>;
export declare const CreatePromptRequest: z.ZodObject<{
    name: z.ZodString;
    engine: z.ZodString;
    contentType: z.ZodString;
    system: z.ZodString;
    userTemplate: z.ZodString;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    engine: string;
    contentType: string;
    system: string;
    userTemplate: string;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
}, {
    name: string;
    engine: string;
    contentType: string;
    system: string;
    userTemplate: string;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
}>;
export type CreatePromptRequest = z.infer<typeof CreatePromptRequest>;
/**
 * The review lifecycle. Publishing is only reachable from `approved`; generation lands content in
 * `pending_review`, never `published`. `rejected` items can be regenerated (new revision).
 */
export declare const ContentStatus: z.ZodEnum<["draft", "ai_generated", "pending_review", "approved", "rejected", "published", "archived"]>;
export type ContentStatus = z.infer<typeof ContentStatus>;
/** Deterministic quality signals computed from the content (no model call). */
export declare const QualityReport: z.ZodObject<{
    /** 0..100 composite score. */
    score: z.ZodNumber;
    /** Grade-level reading score (Flesch–Kincaid-style). */
    readingLevel: z.ZodNumber;
    /** Suggested minimum age from reading level + content. */
    ageSuitability: z.ZodNumber;
    difficulty: z.ZodEnum<["easy", "medium", "hard", "unknown"]>;
    grammarIssues: z.ZodArray<z.ZodString, "many">;
    isDuplicate: z.ZodBoolean;
    missingExplanation: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    score: number;
    readingLevel: number;
    ageSuitability: number;
    difficulty: "unknown" | "easy" | "medium" | "hard";
    grammarIssues: string[];
    isDuplicate: boolean;
    missingExplanation: boolean;
}, {
    score: number;
    readingLevel: number;
    ageSuitability: number;
    difficulty: "unknown" | "easy" | "medium" | "hard";
    grammarIssues: string[];
    isDuplicate: boolean;
    missingExplanation: boolean;
}>;
export type QualityReport = z.infer<typeof QualityReport>;
export declare const ContentItem: z.ZodObject<{
    id: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    gameId: z.ZodString;
    engine: z.ZodString;
    contentType: z.ZodString;
    status: z.ZodEnum<["draft", "ai_generated", "pending_review", "approved", "rejected", "published", "archived"]>;
    /** The engine-shaped payload (one generated asset: a question, a memory pair, a story…). */
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    quality: z.ZodObject<{
        /** 0..100 composite score. */
        score: z.ZodNumber;
        /** Grade-level reading score (Flesch–Kincaid-style). */
        readingLevel: z.ZodNumber;
        /** Suggested minimum age from reading level + content. */
        ageSuitability: z.ZodNumber;
        difficulty: z.ZodEnum<["easy", "medium", "hard", "unknown"]>;
        grammarIssues: z.ZodArray<z.ZodString, "many">;
        isDuplicate: z.ZodBoolean;
        missingExplanation: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    }, {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    }>;
    /** Reproducibility: which prompt version + provider/model produced this. */
    promptName: z.ZodOptional<z.ZodString>;
    promptVersion: z.ZodOptional<z.ZodNumber>;
    provider: z.ZodOptional<z.ZodEnum<["offline", "claude", "openai", "gemini"]>>;
    model: z.ZodOptional<z.ZodString>;
    /** Regeneration counter — bumped each time the item is regenerated. */
    revision: z.ZodNumber;
    costUsd: z.ZodNumber;
    tokens: z.ZodNumber;
    createdAt: z.ZodString;
    createdBy: z.ZodString;
    reviewedBy: z.ZodOptional<z.ZodString>;
    reviewedAt: z.ZodOptional<z.ZodString>;
    reviewNote: z.ZodOptional<z.ZodString>;
    publishedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived";
    id: string;
    createdAt: string;
    engine: string;
    contentType: string;
    createdBy: string;
    gameId: string;
    payload: Record<string, unknown>;
    quality: {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    };
    revision: number;
    costUsd: number;
    tokens: number;
    provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
    model?: string | undefined;
    batchId?: string | undefined;
    promptName?: string | undefined;
    promptVersion?: number | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    reviewNote?: string | undefined;
    publishedAt?: string | undefined;
}, {
    status: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived";
    id: string;
    createdAt: string;
    engine: string;
    contentType: string;
    createdBy: string;
    gameId: string;
    payload: Record<string, unknown>;
    quality: {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    };
    revision: number;
    costUsd: number;
    tokens: number;
    provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
    model?: string | undefined;
    batchId?: string | undefined;
    promptName?: string | undefined;
    promptVersion?: number | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    reviewNote?: string | undefined;
    publishedAt?: string | undefined;
}>;
export type ContentItem = z.infer<typeof ContentItem>;
/** A prior payload of an item, kept when it is regenerated — the revision history. */
export declare const ContentRevisionDto: z.ZodObject<{
    revision: z.ZodNumber;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    quality: z.ZodObject<{
        /** 0..100 composite score. */
        score: z.ZodNumber;
        /** Grade-level reading score (Flesch–Kincaid-style). */
        readingLevel: z.ZodNumber;
        /** Suggested minimum age from reading level + content. */
        ageSuitability: z.ZodNumber;
        difficulty: z.ZodEnum<["easy", "medium", "hard", "unknown"]>;
        grammarIssues: z.ZodArray<z.ZodString, "many">;
        isDuplicate: z.ZodBoolean;
        missingExplanation: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    }, {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    }>;
    promptVersion: z.ZodOptional<z.ZodNumber>;
    provider: z.ZodOptional<z.ZodEnum<["offline", "claude", "openai", "gemini"]>>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    payload: Record<string, unknown>;
    quality: {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    };
    revision: number;
    provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
    promptVersion?: number | undefined;
}, {
    createdAt: string;
    payload: Record<string, unknown>;
    quality: {
        score: number;
        readingLevel: number;
        ageSuitability: number;
        difficulty: "unknown" | "easy" | "medium" | "hard";
        grammarIssues: string[];
        isDuplicate: boolean;
        missingExplanation: boolean;
    };
    revision: number;
    provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
    promptVersion?: number | undefined;
}>;
export type ContentRevisionDto = z.infer<typeof ContentRevisionDto>;
export declare const BatchStatus: z.ZodEnum<["queued", "running", "completed", "partial", "failed"]>;
export type BatchStatus = z.infer<typeof BatchStatus>;
/** POST /admin/batches — "Generate 500 Finance Questions". */
export declare const CreateBatchRequest: z.ZodObject<{
    label: z.ZodString;
    gameId: z.ZodString;
    engine: z.ZodString;
    contentType: z.ZodString;
    count: z.ZodNumber;
    topic: z.ZodString;
    locale: z.ZodDefault<z.ZodString>;
    idPrefix: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Which prompt template name to use (latest active version). Optional → engine default. */
    promptName: z.ZodOptional<z.ZodString>;
    /** Which provider to manufacture with. Default: the configured default provider. */
    provider: z.ZodOptional<z.ZodEnum<["offline", "claude", "openai", "gemini"]>>;
}, "strip", z.ZodTypeAny, {
    engine: string;
    contentType: string;
    gameId: string;
    label: string;
    count: number;
    topic: string;
    locale: string;
    idPrefix: string;
    tags: string[];
    provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
    promptName?: string | undefined;
}, {
    engine: string;
    contentType: string;
    gameId: string;
    label: string;
    count: number;
    topic: string;
    idPrefix: string;
    provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
    promptName?: string | undefined;
    locale?: string | undefined;
    tags?: string[] | undefined;
}>;
export type CreateBatchRequest = z.infer<typeof CreateBatchRequest>;
export declare const GenerationBatch: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    gameId: z.ZodString;
    engine: z.ZodString;
    contentType: z.ZodString;
    /** Generation inputs kept for reproducibility + single-item regeneration. */
    topic: z.ZodString;
    idPrefix: z.ZodString;
    locale: z.ZodDefault<z.ZodString>;
    requested: z.ZodNumber;
    generated: z.ZodNumber;
    rejected: z.ZodNumber;
    failed: z.ZodNumber;
    retries: z.ZodNumber;
    status: z.ZodEnum<["queued", "running", "completed", "partial", "failed"]>;
    provider: z.ZodEnum<["offline", "claude", "openai", "gemini"]>;
    model: z.ZodString;
    promptName: z.ZodOptional<z.ZodString>;
    promptVersion: z.ZodOptional<z.ZodNumber>;
    operator: z.ZodString;
    costUsd: z.ZodNumber;
    tokens: z.ZodNumber;
    latencyMs: z.ZodNumber;
    startedAt: z.ZodString;
    finishedAt: z.ZodOptional<z.ZodString>;
    /** Estimated completion (ISO) while running; absent when finished. */
    eta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "queued" | "running" | "completed" | "partial" | "failed";
    rejected: number;
    provider: "offline" | "claude" | "openai" | "gemini";
    id: string;
    model: string;
    engine: string;
    contentType: string;
    gameId: string;
    costUsd: number;
    tokens: number;
    failed: number;
    label: string;
    topic: string;
    locale: string;
    idPrefix: string;
    requested: number;
    generated: number;
    retries: number;
    operator: string;
    latencyMs: number;
    startedAt: string;
    promptName?: string | undefined;
    promptVersion?: number | undefined;
    finishedAt?: string | undefined;
    eta?: string | undefined;
}, {
    status: "queued" | "running" | "completed" | "partial" | "failed";
    rejected: number;
    provider: "offline" | "claude" | "openai" | "gemini";
    id: string;
    model: string;
    engine: string;
    contentType: string;
    gameId: string;
    costUsd: number;
    tokens: number;
    failed: number;
    label: string;
    topic: string;
    idPrefix: string;
    requested: number;
    generated: number;
    retries: number;
    operator: string;
    latencyMs: number;
    startedAt: string;
    promptName?: string | undefined;
    promptVersion?: number | undefined;
    locale?: string | undefined;
    finishedAt?: string | undefined;
    eta?: string | undefined;
}>;
export type GenerationBatch = z.infer<typeof GenerationBatch>;
export declare const ReviewActionRequest: z.ZodObject<{
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    note?: string | undefined;
}, {
    note?: string | undefined;
}>;
export type ReviewActionRequest = z.infer<typeof ReviewActionRequest>;
export declare const QualityDashboard: z.ZodObject<{
    totalItems: z.ZodNumber;
    byStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    approvalRate: z.ZodNumber;
    rejectionRate: z.ZodNumber;
    averageQuality: z.ZodNumber;
    averageReviewMinutes: z.ZodNumber;
    duplicates: z.ZodNumber;
    grammarFlagged: z.ZodNumber;
    difficultyDistribution: z.ZodRecord<z.ZodString, z.ZodNumber>;
    ageDistribution: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    totalItems: number;
    byStatus: Record<string, number>;
    approvalRate: number;
    rejectionRate: number;
    averageQuality: number;
    averageReviewMinutes: number;
    duplicates: number;
    grammarFlagged: number;
    difficultyDistribution: Record<string, number>;
    ageDistribution: Record<string, number>;
}, {
    totalItems: number;
    byStatus: Record<string, number>;
    approvalRate: number;
    rejectionRate: number;
    averageQuality: number;
    averageReviewMinutes: number;
    duplicates: number;
    grammarFlagged: number;
    difficultyDistribution: Record<string, number>;
    ageDistribution: Record<string, number>;
}>;
export type QualityDashboard = z.infer<typeof QualityDashboard>;
export declare const CostDashboard: z.ZodObject<{
    totalCostUsd: z.ZodNumber;
    totalTokens: z.ZodNumber;
    costPerItem: z.ZodNumber;
    byContentType: z.ZodRecord<z.ZodString, z.ZodObject<{
        items: z.ZodNumber;
        costUsd: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        costUsd: number;
        items: number;
    }, {
        costUsd: number;
        items: number;
    }>>;
    byProvider: z.ZodRecord<z.ZodString, z.ZodObject<{
        items: z.ZodNumber;
        costUsd: z.ZodNumber;
        avgLatencyMs: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        costUsd: number;
        items: number;
        avgLatencyMs: number;
    }, {
        costUsd: number;
        items: number;
        avgLatencyMs: number;
    }>>;
    byPrompt: z.ZodRecord<z.ZodString, z.ZodObject<{
        items: z.ZodNumber;
        approvalRate: z.ZodNumber;
        avgQuality: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        approvalRate: number;
        items: number;
        avgQuality: number;
    }, {
        approvalRate: number;
        items: number;
        avgQuality: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    totalCostUsd: number;
    totalTokens: number;
    costPerItem: number;
    byContentType: Record<string, {
        costUsd: number;
        items: number;
    }>;
    byProvider: Record<string, {
        costUsd: number;
        items: number;
        avgLatencyMs: number;
    }>;
    byPrompt: Record<string, {
        approvalRate: number;
        items: number;
        avgQuality: number;
    }>;
}, {
    totalCostUsd: number;
    totalTokens: number;
    costPerItem: number;
    byContentType: Record<string, {
        costUsd: number;
        items: number;
    }>;
    byProvider: Record<string, {
        costUsd: number;
        items: number;
        avgLatencyMs: number;
    }>;
    byPrompt: Record<string, {
        approvalRate: number;
        items: number;
        avgQuality: number;
    }>;
}>;
export type CostDashboard = z.infer<typeof CostDashboard>;
export declare const ContentQuery: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "ai_generated", "pending_review", "approved", "rejected", "published", "archived"]>>;
    gameId: z.ZodOptional<z.ZodString>;
    engine: z.ZodOptional<z.ZodString>;
    contentType: z.ZodOptional<z.ZodString>;
    batchId: z.ZodOptional<z.ZodString>;
    /** Free-text search over the payload. */
    q: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived" | undefined;
    engine?: string | undefined;
    contentType?: string | undefined;
    batchId?: string | undefined;
    gameId?: string | undefined;
    q?: string | undefined;
}, {
    status?: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived" | undefined;
    engine?: string | undefined;
    contentType?: string | undefined;
    batchId?: string | undefined;
    gameId?: string | undefined;
    q?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ContentQuery = z.infer<typeof ContentQuery>;
export declare const ContentPage: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        batchId: z.ZodOptional<z.ZodString>;
        gameId: z.ZodString;
        engine: z.ZodString;
        contentType: z.ZodString;
        status: z.ZodEnum<["draft", "ai_generated", "pending_review", "approved", "rejected", "published", "archived"]>;
        /** The engine-shaped payload (one generated asset: a question, a memory pair, a story…). */
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        quality: z.ZodObject<{
            /** 0..100 composite score. */
            score: z.ZodNumber;
            /** Grade-level reading score (Flesch–Kincaid-style). */
            readingLevel: z.ZodNumber;
            /** Suggested minimum age from reading level + content. */
            ageSuitability: z.ZodNumber;
            difficulty: z.ZodEnum<["easy", "medium", "hard", "unknown"]>;
            grammarIssues: z.ZodArray<z.ZodString, "many">;
            isDuplicate: z.ZodBoolean;
            missingExplanation: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            score: number;
            readingLevel: number;
            ageSuitability: number;
            difficulty: "unknown" | "easy" | "medium" | "hard";
            grammarIssues: string[];
            isDuplicate: boolean;
            missingExplanation: boolean;
        }, {
            score: number;
            readingLevel: number;
            ageSuitability: number;
            difficulty: "unknown" | "easy" | "medium" | "hard";
            grammarIssues: string[];
            isDuplicate: boolean;
            missingExplanation: boolean;
        }>;
        /** Reproducibility: which prompt version + provider/model produced this. */
        promptName: z.ZodOptional<z.ZodString>;
        promptVersion: z.ZodOptional<z.ZodNumber>;
        provider: z.ZodOptional<z.ZodEnum<["offline", "claude", "openai", "gemini"]>>;
        model: z.ZodOptional<z.ZodString>;
        /** Regeneration counter — bumped each time the item is regenerated. */
        revision: z.ZodNumber;
        costUsd: z.ZodNumber;
        tokens: z.ZodNumber;
        createdAt: z.ZodString;
        createdBy: z.ZodString;
        reviewedBy: z.ZodOptional<z.ZodString>;
        reviewedAt: z.ZodOptional<z.ZodString>;
        reviewNote: z.ZodOptional<z.ZodString>;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived";
        id: string;
        createdAt: string;
        engine: string;
        contentType: string;
        createdBy: string;
        gameId: string;
        payload: Record<string, unknown>;
        quality: {
            score: number;
            readingLevel: number;
            ageSuitability: number;
            difficulty: "unknown" | "easy" | "medium" | "hard";
            grammarIssues: string[];
            isDuplicate: boolean;
            missingExplanation: boolean;
        };
        revision: number;
        costUsd: number;
        tokens: number;
        provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
        model?: string | undefined;
        batchId?: string | undefined;
        promptName?: string | undefined;
        promptVersion?: number | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNote?: string | undefined;
        publishedAt?: string | undefined;
    }, {
        status: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived";
        id: string;
        createdAt: string;
        engine: string;
        contentType: string;
        createdBy: string;
        gameId: string;
        payload: Record<string, unknown>;
        quality: {
            score: number;
            readingLevel: number;
            ageSuitability: number;
            difficulty: "unknown" | "easy" | "medium" | "hard";
            grammarIssues: string[];
            isDuplicate: boolean;
            missingExplanation: boolean;
        };
        revision: number;
        costUsd: number;
        tokens: number;
        provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
        model?: string | undefined;
        batchId?: string | undefined;
        promptName?: string | undefined;
        promptVersion?: number | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNote?: string | undefined;
        publishedAt?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    items: {
        status: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived";
        id: string;
        createdAt: string;
        engine: string;
        contentType: string;
        createdBy: string;
        gameId: string;
        payload: Record<string, unknown>;
        quality: {
            score: number;
            readingLevel: number;
            ageSuitability: number;
            difficulty: "unknown" | "easy" | "medium" | "hard";
            grammarIssues: string[];
            isDuplicate: boolean;
            missingExplanation: boolean;
        };
        revision: number;
        costUsd: number;
        tokens: number;
        provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
        model?: string | undefined;
        batchId?: string | undefined;
        promptName?: string | undefined;
        promptVersion?: number | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNote?: string | undefined;
        publishedAt?: string | undefined;
    }[];
    total: number;
}, {
    items: {
        status: "rejected" | "draft" | "ai_generated" | "pending_review" | "approved" | "published" | "archived";
        id: string;
        createdAt: string;
        engine: string;
        contentType: string;
        createdBy: string;
        gameId: string;
        payload: Record<string, unknown>;
        quality: {
            score: number;
            readingLevel: number;
            ageSuitability: number;
            difficulty: "unknown" | "easy" | "medium" | "hard";
            grammarIssues: string[];
            isDuplicate: boolean;
            missingExplanation: boolean;
        };
        revision: number;
        costUsd: number;
        tokens: number;
        provider?: "offline" | "claude" | "openai" | "gemini" | undefined;
        model?: string | undefined;
        batchId?: string | undefined;
        promptName?: string | undefined;
        promptVersion?: number | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNote?: string | undefined;
        publishedAt?: string | undefined;
    }[];
    total: number;
}>;
export type ContentPage = z.infer<typeof ContentPage>;
//# sourceMappingURL=content-factory.d.ts.map
import { z } from "zod";
/**
 * Adaptive Learning contracts — the wire API for the Learning Platform (ADR-0025). These are the
 * request/response DTOs the app and parent dashboard exchange with the backend `learning` module.
 * They are deliberately self-contained (contracts depend on nothing), decoupled from the
 * `@etricks/learning` domain types the backend computes with — the same boundary
 * `content-factory.ts` uses. Builds on Identity (actor), Analytics (events), and the dedicated
 * learning repository (persistence).
 */
export declare const MasteryLevel: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
export type MasteryLevel = z.infer<typeof MasteryLevel>;
/** A learner's mastery for one skill, as returned to clients/dashboards. */
export declare const SkillMasteryDto: z.ZodObject<{
    skillId: z.ZodString;
    level: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
    /** Demonstrated ceiling (0..1). */
    mastery: z.ZodNumber;
    /** Time-decayed current recall (0..1). */
    retention: z.ZodNumber;
    accuracy: z.ZodNumber;
    attempts: z.ZodNumber;
    streak: z.ZodNumber;
    confidence: z.ZodNumber;
    lastPracticedAt: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    level: "novice" | "developing" | "proficient" | "mastered";
    streak: number;
    skillId: string;
    mastery: number;
    retention: number;
    accuracy: number;
    attempts: number;
    confidence: number;
    lastPracticedAt?: string | undefined;
    dueAt?: string | undefined;
}, {
    level: "novice" | "developing" | "proficient" | "mastered";
    streak: number;
    skillId: string;
    mastery: number;
    retention: number;
    accuracy: number;
    attempts: number;
    confidence: number;
    lastPracticedAt?: string | undefined;
    dueAt?: string | undefined;
}>;
export type SkillMasteryDto = z.infer<typeof SkillMasteryDto>;
export declare const AdaptiveDifficultyDto: z.ZodObject<{
    difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
    hints: z.ZodNumber;
    lives: z.ZodNumber;
    timeLimitMs: z.ZodOptional<z.ZodNumber>;
    passThreshold: z.ZodNumber;
    direction: z.ZodEnum<["increased", "decreased", "same"]>;
}, "strip", z.ZodTypeAny, {
    difficulty: "easy" | "medium" | "hard";
    hints: number;
    lives: number;
    passThreshold: number;
    direction: "increased" | "decreased" | "same";
    timeLimitMs?: number | undefined;
}, {
    difficulty: "easy" | "medium" | "hard";
    hints: number;
    lives: number;
    passThreshold: number;
    direction: "increased" | "decreased" | "same";
    timeLimitMs?: number | undefined;
}>;
export type AdaptiveDifficultyDto = z.infer<typeof AdaptiveDifficultyDto>;
/** POST /learning/results — report one graded activity outcome. */
export declare const SubmitActivityResultRequest: z.ZodObject<{
    activityId: z.ZodString;
    gameId: z.ZodString;
    packId: z.ZodOptional<z.ZodString>;
    activityType: z.ZodOptional<z.ZodString>;
    /** Skills this activity trains. If omitted, the server derives them from `tags`+`activityType`. */
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Free-text activity tags — used to derive skills when `skills` is absent. */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    correct: z.ZodBoolean;
    elapsedMs: z.ZodOptional<z.ZodNumber>;
    hintsUsed: z.ZodDefault<z.ZodNumber>;
    /** Client event time (ISO). The server falls back to its own clock if absent. */
    at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    gameId: string;
    tags: string[];
    activityId: string;
    correct: boolean;
    hintsUsed: number;
    at?: string | undefined;
    packId?: string | undefined;
    activityType?: string | undefined;
    skills?: string[] | undefined;
    elapsedMs?: number | undefined;
}, {
    gameId: string;
    activityId: string;
    correct: boolean;
    at?: string | undefined;
    tags?: string[] | undefined;
    packId?: string | undefined;
    activityType?: string | undefined;
    skills?: string[] | undefined;
    elapsedMs?: number | undefined;
    hintsUsed?: number | undefined;
}>;
export type SubmitActivityResultRequest = z.infer<typeof SubmitActivityResultRequest>;
export declare const SubmitActivityResultResponse: z.ZodObject<{
    updated: z.ZodArray<z.ZodObject<{
        skillId: z.ZodString;
        level: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
        /** Demonstrated ceiling (0..1). */
        mastery: z.ZodNumber;
        /** Time-decayed current recall (0..1). */
        retention: z.ZodNumber;
        accuracy: z.ZodNumber;
        attempts: z.ZodNumber;
        streak: z.ZodNumber;
        confidence: z.ZodNumber;
        lastPracticedAt: z.ZodOptional<z.ZodString>;
        dueAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }, {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }>, "many">;
    /** Skills that reached "mastered" as a result of this attempt. */
    masteredNow: z.ZodArray<z.ZodString, "many">;
    /** Learning goals completed as a result. */
    goalsCompleted: z.ZodArray<z.ZodString, "many">;
    /** The adaptive difficulty to use next for this skill. */
    nextDifficulty: z.ZodObject<{
        difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
        hints: z.ZodNumber;
        lives: z.ZodNumber;
        timeLimitMs: z.ZodOptional<z.ZodNumber>;
        passThreshold: z.ZodNumber;
        direction: z.ZodEnum<["increased", "decreased", "same"]>;
    }, "strip", z.ZodTypeAny, {
        difficulty: "easy" | "medium" | "hard";
        hints: number;
        lives: number;
        passThreshold: number;
        direction: "increased" | "decreased" | "same";
        timeLimitMs?: number | undefined;
    }, {
        difficulty: "easy" | "medium" | "hard";
        hints: number;
        lives: number;
        passThreshold: number;
        direction: "increased" | "decreased" | "same";
        timeLimitMs?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    updated: {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }[];
    masteredNow: string[];
    goalsCompleted: string[];
    nextDifficulty: {
        difficulty: "easy" | "medium" | "hard";
        hints: number;
        lives: number;
        passThreshold: number;
        direction: "increased" | "decreased" | "same";
        timeLimitMs?: number | undefined;
    };
}, {
    updated: {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }[];
    masteredNow: string[];
    goalsCompleted: string[];
    nextDifficulty: {
        difficulty: "easy" | "medium" | "hard";
        hints: number;
        lives: number;
        passThreshold: number;
        direction: "increased" | "decreased" | "same";
        timeLimitMs?: number | undefined;
    };
}>;
export type SubmitActivityResultResponse = z.infer<typeof SubmitActivityResultResponse>;
export declare const RecommendationDto: z.ZodObject<{
    activityId: z.ZodString;
    packId: z.ZodString;
    gameId: z.ZodString;
    skills: z.ZodArray<z.ZodString, "many">;
    difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
    score: z.ZodNumber;
    reasons: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    score: number;
    difficulty: "easy" | "medium" | "hard";
    gameId: string;
    packId: string;
    activityId: string;
    skills: string[];
    reasons: string[];
}, {
    score: number;
    difficulty: "easy" | "medium" | "hard";
    gameId: string;
    packId: string;
    activityId: string;
    skills: string[];
    reasons: string[];
}>;
export type RecommendationDto = z.infer<typeof RecommendationDto>;
export declare const RecommendationsResponse: z.ZodObject<{
    recommendations: z.ZodArray<z.ZodObject<{
        activityId: z.ZodString;
        packId: z.ZodString;
        gameId: z.ZodString;
        skills: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
        score: z.ZodNumber;
        reasons: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }, {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }>, "many">;
    /** How the ranking was computed, for transparency/debug. */
    computeMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    recommendations: {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }[];
    computeMs: number;
}, {
    recommendations: {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }[];
    computeMs: number;
}>;
export type RecommendationsResponse = z.infer<typeof RecommendationsResponse>;
export declare const MissionActivityDto: z.ZodObject<{
    activityId: z.ZodString;
    packId: z.ZodString;
    gameId: z.ZodString;
    skills: z.ZodArray<z.ZodString, "many">;
    difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
    estimatedDurationSec: z.ZodNumber;
    reward: z.ZodNumber;
    completed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    difficulty: "easy" | "medium" | "hard";
    gameId: string;
    completed: boolean;
    packId: string;
    activityId: string;
    skills: string[];
    estimatedDurationSec: number;
    reward: number;
}, {
    difficulty: "easy" | "medium" | "hard";
    gameId: string;
    completed: boolean;
    packId: string;
    activityId: string;
    skills: string[];
    estimatedDurationSec: number;
    reward: number;
}>;
export type MissionActivityDto = z.infer<typeof MissionActivityDto>;
export declare const DailyMissionDto: z.ZodObject<{
    id: z.ZodString;
    date: z.ZodString;
    activities: z.ZodArray<z.ZodObject<{
        activityId: z.ZodString;
        packId: z.ZodString;
        gameId: z.ZodString;
        skills: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
        estimatedDurationSec: z.ZodNumber;
        reward: z.ZodNumber;
        completed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        completed: boolean;
        packId: string;
        activityId: string;
        skills: string[];
        estimatedDurationSec: number;
        reward: number;
    }, {
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        completed: boolean;
        packId: string;
        activityId: string;
        skills: string[];
        estimatedDurationSec: number;
        reward: number;
    }>, "many">;
    totalReward: z.ZodNumber;
    estimatedDurationSec: z.ZodNumber;
    skills: z.ZodArray<z.ZodString, "many">;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    id: string;
    skills: string[];
    estimatedDurationSec: number;
    activities: {
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        completed: boolean;
        packId: string;
        activityId: string;
        skills: string[];
        estimatedDurationSec: number;
        reward: number;
    }[];
    totalReward: number;
    generatedAt: string;
}, {
    date: string;
    id: string;
    skills: string[];
    estimatedDurationSec: number;
    activities: {
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        completed: boolean;
        packId: string;
        activityId: string;
        skills: string[];
        estimatedDurationSec: number;
        reward: number;
    }[];
    totalReward: number;
    generatedAt: string;
}>;
export type DailyMissionDto = z.infer<typeof DailyMissionDto>;
export declare const ReviewItemDto: z.ZodObject<{
    skillId: z.ZodString;
    bucket: z.ZodEnum<["due-today", "overdue", "forgotten"]>;
    retention: z.ZodNumber;
    overdueDays: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    skillId: string;
    retention: number;
    bucket: "due-today" | "overdue" | "forgotten";
    overdueDays: number;
}, {
    skillId: string;
    retention: number;
    bucket: "due-today" | "overdue" | "forgotten";
    overdueDays: number;
}>;
export type ReviewItemDto = z.infer<typeof ReviewItemDto>;
/** GET /learning/overview — the learner's own snapshot. */
export declare const LearningOverview: z.ZodObject<{
    mastery: z.ZodArray<z.ZodObject<{
        skillId: z.ZodString;
        level: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
        /** Demonstrated ceiling (0..1). */
        mastery: z.ZodNumber;
        /** Time-decayed current recall (0..1). */
        retention: z.ZodNumber;
        accuracy: z.ZodNumber;
        attempts: z.ZodNumber;
        streak: z.ZodNumber;
        confidence: z.ZodNumber;
        lastPracticedAt: z.ZodOptional<z.ZodString>;
        dueAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }, {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }>, "many">;
    weakSkills: z.ZodArray<z.ZodString, "many">;
    strongSkills: z.ZodArray<z.ZodString, "many">;
    activitiesCompleted: z.ZodNumber;
    learningTimeMs: z.ZodNumber;
    achievements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        unlocked: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        unlocked: boolean;
    }, {
        name: string;
        id: string;
        unlocked: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    achievements: {
        name: string;
        id: string;
        unlocked: boolean;
    }[];
    mastery: {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }[];
    weakSkills: string[];
    strongSkills: string[];
    activitiesCompleted: number;
    learningTimeMs: number;
}, {
    achievements: {
        name: string;
        id: string;
        unlocked: boolean;
    }[];
    mastery: {
        level: "novice" | "developing" | "proficient" | "mastered";
        streak: number;
        skillId: string;
        mastery: number;
        retention: number;
        accuracy: number;
        attempts: number;
        confidence: number;
        lastPracticedAt?: string | undefined;
        dueAt?: string | undefined;
    }[];
    weakSkills: string[];
    strongSkills: string[];
    activitiesCompleted: number;
    learningTimeMs: number;
}>;
export type LearningOverview = z.infer<typeof LearningOverview>;
export declare const SkillReport: z.ZodObject<{
    skillId: z.ZodString;
    name: z.ZodString;
    level: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
    retention: z.ZodNumber;
    accuracy: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    level: "novice" | "developing" | "proficient" | "mastered";
    skillId: string;
    retention: number;
    accuracy: number;
}, {
    name: string;
    level: "novice" | "developing" | "proficient" | "mastered";
    skillId: string;
    retention: number;
    accuracy: number;
}>;
export type SkillReport = z.infer<typeof SkillReport>;
/** GET /learning/parent/report/:childId — parent-facing progress report. */
export declare const ParentReport: z.ZodObject<{
    childId: z.ZodString;
    /** Total learning time (ms) over the report window. */
    learningTimeMs: z.ZodNumber;
    /** Activities completed in the window (from Analytics). */
    activitiesCompleted: z.ZodNumber;
    masteredSkills: z.ZodArray<z.ZodObject<{
        skillId: z.ZodString;
        name: z.ZodString;
        level: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
        retention: z.ZodNumber;
        accuracy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }, {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }>, "many">;
    skillsNeedingPractice: z.ZodArray<z.ZodObject<{
        skillId: z.ZodString;
        name: z.ZodString;
        level: z.ZodEnum<["novice", "developing", "proficient", "mastered"]>;
        retention: z.ZodNumber;
        accuracy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }, {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }>, "many">;
    /** Consecutive days with learning activity. */
    dailyStreak: z.ZodNumber;
    achievements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        unlocked: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        unlocked: boolean;
    }, {
        name: string;
        id: string;
        unlocked: boolean;
    }>, "many">;
    recommendations: z.ZodArray<z.ZodObject<{
        activityId: z.ZodString;
        packId: z.ZodString;
        gameId: z.ZodString;
        skills: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
        score: z.ZodNumber;
        reasons: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }, {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }>, "many">;
    /** Per-day activity counts over the window, oldest→newest — the progress trend. */
    trend: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        activities: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        activities: number;
    }, {
        date: string;
        activities: number;
    }>, "many">;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    achievements: {
        name: string;
        id: string;
        unlocked: boolean;
    }[];
    recommendations: {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }[];
    generatedAt: string;
    activitiesCompleted: number;
    learningTimeMs: number;
    childId: string;
    masteredSkills: {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }[];
    skillsNeedingPractice: {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }[];
    dailyStreak: number;
    trend: {
        date: string;
        activities: number;
    }[];
}, {
    achievements: {
        name: string;
        id: string;
        unlocked: boolean;
    }[];
    recommendations: {
        score: number;
        difficulty: "easy" | "medium" | "hard";
        gameId: string;
        packId: string;
        activityId: string;
        skills: string[];
        reasons: string[];
    }[];
    generatedAt: string;
    activitiesCompleted: number;
    learningTimeMs: number;
    childId: string;
    masteredSkills: {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }[];
    skillsNeedingPractice: {
        name: string;
        level: "novice" | "developing" | "proficient" | "mastered";
        skillId: string;
        retention: number;
        accuracy: number;
    }[];
    dailyStreak: number;
    trend: {
        date: string;
        activities: number;
    }[];
}>;
export type ParentReport = z.infer<typeof ParentReport>;
//# sourceMappingURL=learning.d.ts.map
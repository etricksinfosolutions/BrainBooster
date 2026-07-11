import { z } from "zod";

/**
 * Adaptive Learning contracts — the wire API for the Learning Platform (ADR-0025). These are the
 * request/response DTOs the app and parent dashboard exchange with the backend `learning` module.
 * They are deliberately self-contained (contracts depend on nothing), decoupled from the
 * `@etricks/learning` domain types the backend computes with — the same boundary
 * `content-factory.ts` uses. Builds on Identity (actor), Analytics (events), and the dedicated
 * learning repository (persistence).
 */

export const MasteryLevel = z.enum(["novice", "developing", "proficient", "mastered"]);
export type MasteryLevel = z.infer<typeof MasteryLevel>;

/** A learner's mastery for one skill, as returned to clients/dashboards. */
export const SkillMasteryDto = z.object({
  skillId: z.string(),
  level: MasteryLevel,
  /** Demonstrated ceiling (0..1). */
  mastery: z.number().min(0).max(1),
  /** Time-decayed current recall (0..1). */
  retention: z.number().min(0).max(1),
  accuracy: z.number().min(0).max(1),
  attempts: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1),
  lastPracticedAt: z.string().optional(),
  dueAt: z.string().optional(),
});
export type SkillMasteryDto = z.infer<typeof SkillMasteryDto>;

export const AdaptiveDifficultyDto = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  hints: z.number().int().nonnegative(),
  lives: z.number().int().positive(),
  timeLimitMs: z.number().positive().optional(),
  passThreshold: z.number().min(0).max(1),
  direction: z.enum(["increased", "decreased", "same"]),
});
export type AdaptiveDifficultyDto = z.infer<typeof AdaptiveDifficultyDto>;

/** POST /learning/results — report one graded activity outcome. */
export const SubmitActivityResultRequest = z.object({
  activityId: z.string().min(1),
  gameId: z.string().min(1),
  packId: z.string().optional(),
  activityType: z.string().optional(),
  /** Skills this activity trains. If omitted, the server derives them from `tags`+`activityType`. */
  skills: z.array(z.string()).optional(),
  /** Free-text activity tags — used to derive skills when `skills` is absent. */
  tags: z.array(z.string()).default([]),
  correct: z.boolean(),
  elapsedMs: z.number().nonnegative().optional(),
  hintsUsed: z.number().int().nonnegative().default(0),
  /** Client event time (ISO). The server falls back to its own clock if absent. */
  at: z.string().optional(),
});
export type SubmitActivityResultRequest = z.infer<typeof SubmitActivityResultRequest>;

export const SubmitActivityResultResponse = z.object({
  updated: z.array(SkillMasteryDto),
  /** Skills that reached "mastered" as a result of this attempt. */
  masteredNow: z.array(z.string()),
  /** Learning goals completed as a result. */
  goalsCompleted: z.array(z.string()),
  /** The adaptive difficulty to use next for this skill. */
  nextDifficulty: AdaptiveDifficultyDto,
});
export type SubmitActivityResultResponse = z.infer<typeof SubmitActivityResultResponse>;

export const RecommendationDto = z.object({
  activityId: z.string(),
  packId: z.string(),
  gameId: z.string(),
  skills: z.array(z.string()),
  difficulty: z.enum(["easy", "medium", "hard"]),
  score: z.number(),
  reasons: z.array(z.string()),
});
export type RecommendationDto = z.infer<typeof RecommendationDto>;

export const RecommendationsResponse = z.object({
  recommendations: z.array(RecommendationDto),
  /** How the ranking was computed, for transparency/debug. */
  computeMs: z.number().nonnegative(),
});
export type RecommendationsResponse = z.infer<typeof RecommendationsResponse>;

export const MissionActivityDto = z.object({
  activityId: z.string(),
  packId: z.string(),
  gameId: z.string(),
  skills: z.array(z.string()),
  difficulty: z.enum(["easy", "medium", "hard"]),
  estimatedDurationSec: z.number().int().positive(),
  reward: z.number().int().nonnegative(),
  completed: z.boolean(),
});
export type MissionActivityDto = z.infer<typeof MissionActivityDto>;

export const DailyMissionDto = z.object({
  id: z.string(),
  date: z.string(),
  activities: z.array(MissionActivityDto),
  totalReward: z.number().int().nonnegative(),
  estimatedDurationSec: z.number().int().nonnegative(),
  skills: z.array(z.string()),
  generatedAt: z.string(),
});
export type DailyMissionDto = z.infer<typeof DailyMissionDto>;

export const ReviewItemDto = z.object({
  skillId: z.string(),
  bucket: z.enum(["due-today", "overdue", "forgotten"]),
  retention: z.number().min(0).max(1),
  overdueDays: z.number(),
});
export type ReviewItemDto = z.infer<typeof ReviewItemDto>;

/** GET /learning/overview — the learner's own snapshot. */
export const LearningOverview = z.object({
  mastery: z.array(SkillMasteryDto),
  weakSkills: z.array(z.string()),
  strongSkills: z.array(z.string()),
  activitiesCompleted: z.number().int().nonnegative(),
  learningTimeMs: z.number().nonnegative(),
  achievements: z.array(z.object({ id: z.string(), name: z.string(), unlocked: z.boolean() })),
});
export type LearningOverview = z.infer<typeof LearningOverview>;

// --- parent dashboard --------------------------------------------------------

export const SkillReport = z.object({
  skillId: z.string(),
  name: z.string(),
  level: MasteryLevel,
  retention: z.number().min(0).max(1),
  accuracy: z.number().min(0).max(1),
});
export type SkillReport = z.infer<typeof SkillReport>;

/** GET /learning/parent/report/:childId — parent-facing progress report. */
export const ParentReport = z.object({
  childId: z.string(),
  /** Total learning time (ms) over the report window. */
  learningTimeMs: z.number().nonnegative(),
  /** Activities completed in the window (from Analytics). */
  activitiesCompleted: z.number().int().nonnegative(),
  masteredSkills: z.array(SkillReport),
  skillsNeedingPractice: z.array(SkillReport),
  /** Consecutive days with learning activity. */
  dailyStreak: z.number().int().nonnegative(),
  achievements: z.array(z.object({ id: z.string(), name: z.string(), unlocked: z.boolean() })),
  recommendations: z.array(RecommendationDto),
  /** Per-day activity counts over the window, oldest→newest — the progress trend. */
  trend: z.array(z.object({ date: z.string(), activities: z.number().int().nonnegative() })),
  generatedAt: z.string(),
});
export type ParentReport = z.infer<typeof ParentReport>;

import { z } from "zod";
/**
 * Parent Platform contracts — the wire API for the parent-facing dashboard (Program C). These DTOs
 * are ADDITIVE: the Parent Platform COMPOSES existing capabilities (Learning, Analytics, Identity,
 * Subscriptions) and adds no new architectural layer. Like the other contracts they are
 * self-contained (depend on nothing) and decoupled from the `@etricks/learning` domain types the
 * backend computes with. Parent↔child linking, weekly reports, goals, homework, screen-time and
 * notifications all live here.
 */
// --- parent ↔ child linking --------------------------------------------------
/** POST /parent/children — link a child learner to the calling parent. */
export const LinkChildRequest = z.object({
    childId: z.string().min(1),
    /** Optional display name the parent gives the child. */
    displayName: z.string().min(1).optional(),
});
export const ParentLinkDto = z.object({
    parentId: z.string(),
    childId: z.string(),
    displayName: z.string().optional(),
    linkedAt: z.string(),
});
export const LinkedChildrenResponse = z.object({
    children: z.array(ParentLinkDto),
});
// --- weekly report -----------------------------------------------------------
/** One ISO-week bucket of a child's activity. */
export const WeeklyBucketDto = z.object({
    /** yyyy-mm-dd of the Monday that starts the week (UTC). */
    weekStart: z.string(),
    activities: z.number().int().nonnegative(),
    /** Estimated learning time this week (ms), apportioned from the learner's totals. */
    timeMs: z.number().nonnegative(),
    /** Skills practised during the week (from each skill's last-practised date). */
    skills: z.array(z.string()),
    /** Sum of demonstrated mastery for the skills attributed to this week (0..n). */
    masteryGained: z.number().nonnegative(),
});
export const WeeklyReportResponse = z.object({
    childId: z.string(),
    weeks: z.array(WeeklyBucketDto),
    generatedAt: z.string(),
});
// --- goals -------------------------------------------------------------------
/** POST /parent/children/:childId/goals — parent sets a learning goal for a child. */
export const SetParentGoalRequest = z.object({
    skillId: z.string().min(1),
    /** Target effective mastery (0..1) for the skill. */
    target: z.number().min(0).max(1).default(0.6),
    label: z.string().min(1).optional(),
});
export const ParentGoalDto = z.object({
    id: z.string(),
    parentId: z.string(),
    childId: z.string(),
    skillId: z.string(),
    target: z.number().min(0).max(1),
    label: z.string(),
    createdAt: z.string(),
    completed: z.boolean(),
    completedAt: z.string().optional(),
    /** The child's current effective mastery for the skill (0..1), evaluated at read time. */
    currentMastery: z.number().min(0).max(1),
});
export const ParentGoalsResponse = z.object({
    goals: z.array(ParentGoalDto),
});
// --- homework ----------------------------------------------------------------
/** POST /parent/children/:childId/homework — parent assigns skills/activities as homework. */
export const AssignHomeworkRequest = z.object({
    title: z.string().min(1),
    skills: z.array(z.string()).default([]),
    activityIds: z.array(z.string()).default([]),
    /** ISO due date. */
    dueAt: z.string().optional(),
});
export const HomeworkAssignmentDto = z.object({
    id: z.string(),
    parentId: z.string(),
    childId: z.string(),
    title: z.string(),
    skills: z.array(z.string()),
    activityIds: z.array(z.string()),
    dueAt: z.string().optional(),
    assignedAt: z.string(),
    completed: z.boolean(),
    completedAt: z.string().optional(),
});
export const HomeworkResponse = z.object({
    homework: z.array(HomeworkAssignmentDto),
});
// --- screen-time -------------------------------------------------------------
/** PUT /parent/children/:childId/screen-time — configure a child's daily limit. */
export const SetScreenTimeRequest = z.object({
    dailyLimitMinutes: z.number().int().nonnegative(),
});
export const ScreenTimeConfigDto = z.object({
    childId: z.string(),
    dailyLimitMinutes: z.number().int().nonnegative(),
    updatedAt: z.string(),
});
/** GET /parent/children/:childId/screen-time — remaining time for today. */
export const ScreenTimeCheckResponse = z.object({
    childId: z.string(),
    /** yyyy-mm-dd (UTC) the check is for. */
    date: z.string(),
    dailyLimitMinutes: z.number().int().nonnegative(),
    usedMinutes: z.number().nonnegative(),
    remainingMinutes: z.number().nonnegative(),
    /** Whether the child has hit or exceeded today's limit. */
    limitReached: z.boolean(),
});
// --- notifications -----------------------------------------------------------
export const ParentNotificationType = z.enum([
    "goal_completed",
    "streak_milestone",
    "homework_due",
    "screen_time_reached",
]);
export const ParentNotificationDto = z.object({
    id: z.string(),
    parentId: z.string(),
    childId: z.string().optional(),
    type: ParentNotificationType,
    message: z.string(),
    /** Free-form context (skill id, streak length, goal id, …). */
    data: z.record(z.string(), z.unknown()).default({}),
    createdAt: z.string(),
    read: z.boolean(),
});
export const NotificationsResponse = z.object({
    notifications: z.array(ParentNotificationDto),
    unread: z.number().int().nonnegative(),
});
//# sourceMappingURL=parent.js.map
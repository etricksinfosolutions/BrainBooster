import { z } from "zod";
/**
 * Parent Platform contracts — the wire API for the parent-facing dashboard (Program C). These DTOs
 * are ADDITIVE: the Parent Platform COMPOSES existing capabilities (Learning, Analytics, Identity,
 * Subscriptions) and adds no new architectural layer. Like the other contracts they are
 * self-contained (depend on nothing) and decoupled from the `@etricks/learning` domain types the
 * backend computes with. Parent↔child linking, weekly reports, goals, homework, screen-time and
 * notifications all live here.
 */
/** POST /parent/children — link a child learner to the calling parent. */
export declare const LinkChildRequest: z.ZodObject<{
    childId: z.ZodString;
    /** Optional display name the parent gives the child. */
    displayName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    childId: string;
    displayName?: string | undefined;
}, {
    childId: string;
    displayName?: string | undefined;
}>;
export type LinkChildRequest = z.infer<typeof LinkChildRequest>;
export declare const ParentLinkDto: z.ZodObject<{
    parentId: z.ZodString;
    childId: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    linkedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    childId: string;
    parentId: string;
    linkedAt: string;
    displayName?: string | undefined;
}, {
    childId: string;
    parentId: string;
    linkedAt: string;
    displayName?: string | undefined;
}>;
export type ParentLinkDto = z.infer<typeof ParentLinkDto>;
export declare const LinkedChildrenResponse: z.ZodObject<{
    children: z.ZodArray<z.ZodObject<{
        parentId: z.ZodString;
        childId: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        linkedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        childId: string;
        parentId: string;
        linkedAt: string;
        displayName?: string | undefined;
    }, {
        childId: string;
        parentId: string;
        linkedAt: string;
        displayName?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    children: {
        childId: string;
        parentId: string;
        linkedAt: string;
        displayName?: string | undefined;
    }[];
}, {
    children: {
        childId: string;
        parentId: string;
        linkedAt: string;
        displayName?: string | undefined;
    }[];
}>;
export type LinkedChildrenResponse = z.infer<typeof LinkedChildrenResponse>;
/** One ISO-week bucket of a child's activity. */
export declare const WeeklyBucketDto: z.ZodObject<{
    /** yyyy-mm-dd of the Monday that starts the week (UTC). */
    weekStart: z.ZodString;
    activities: z.ZodNumber;
    /** Estimated learning time this week (ms), apportioned from the learner's totals. */
    timeMs: z.ZodNumber;
    /** Skills practised during the week (from each skill's last-practised date). */
    skills: z.ZodArray<z.ZodString, "many">;
    /** Sum of demonstrated mastery for the skills attributed to this week (0..n). */
    masteryGained: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    skills: string[];
    activities: number;
    weekStart: string;
    timeMs: number;
    masteryGained: number;
}, {
    skills: string[];
    activities: number;
    weekStart: string;
    timeMs: number;
    masteryGained: number;
}>;
export type WeeklyBucketDto = z.infer<typeof WeeklyBucketDto>;
export declare const WeeklyReportResponse: z.ZodObject<{
    childId: z.ZodString;
    weeks: z.ZodArray<z.ZodObject<{
        /** yyyy-mm-dd of the Monday that starts the week (UTC). */
        weekStart: z.ZodString;
        activities: z.ZodNumber;
        /** Estimated learning time this week (ms), apportioned from the learner's totals. */
        timeMs: z.ZodNumber;
        /** Skills practised during the week (from each skill's last-practised date). */
        skills: z.ZodArray<z.ZodString, "many">;
        /** Sum of demonstrated mastery for the skills attributed to this week (0..n). */
        masteryGained: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        skills: string[];
        activities: number;
        weekStart: string;
        timeMs: number;
        masteryGained: number;
    }, {
        skills: string[];
        activities: number;
        weekStart: string;
        timeMs: number;
        masteryGained: number;
    }>, "many">;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    generatedAt: string;
    childId: string;
    weeks: {
        skills: string[];
        activities: number;
        weekStart: string;
        timeMs: number;
        masteryGained: number;
    }[];
}, {
    generatedAt: string;
    childId: string;
    weeks: {
        skills: string[];
        activities: number;
        weekStart: string;
        timeMs: number;
        masteryGained: number;
    }[];
}>;
export type WeeklyReportResponse = z.infer<typeof WeeklyReportResponse>;
/** POST /parent/children/:childId/goals — parent sets a learning goal for a child. */
export declare const SetParentGoalRequest: z.ZodObject<{
    skillId: z.ZodString;
    /** Target effective mastery (0..1) for the skill. */
    target: z.ZodDefault<z.ZodNumber>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    skillId: string;
    target: number;
    label?: string | undefined;
}, {
    skillId: string;
    label?: string | undefined;
    target?: number | undefined;
}>;
export type SetParentGoalRequest = z.infer<typeof SetParentGoalRequest>;
export declare const ParentGoalDto: z.ZodObject<{
    id: z.ZodString;
    parentId: z.ZodString;
    childId: z.ZodString;
    skillId: z.ZodString;
    target: z.ZodNumber;
    label: z.ZodString;
    createdAt: z.ZodString;
    completed: z.ZodBoolean;
    completedAt: z.ZodOptional<z.ZodString>;
    /** The child's current effective mastery for the skill (0..1), evaluated at read time. */
    currentMastery: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    completed: boolean;
    label: string;
    skillId: string;
    childId: string;
    parentId: string;
    target: number;
    currentMastery: number;
    completedAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    completed: boolean;
    label: string;
    skillId: string;
    childId: string;
    parentId: string;
    target: number;
    currentMastery: number;
    completedAt?: string | undefined;
}>;
export type ParentGoalDto = z.infer<typeof ParentGoalDto>;
export declare const ParentGoalsResponse: z.ZodObject<{
    goals: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodString;
        childId: z.ZodString;
        skillId: z.ZodString;
        target: z.ZodNumber;
        label: z.ZodString;
        createdAt: z.ZodString;
        completed: z.ZodBoolean;
        completedAt: z.ZodOptional<z.ZodString>;
        /** The child's current effective mastery for the skill (0..1), evaluated at read time. */
        currentMastery: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        completed: boolean;
        label: string;
        skillId: string;
        childId: string;
        parentId: string;
        target: number;
        currentMastery: number;
        completedAt?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        completed: boolean;
        label: string;
        skillId: string;
        childId: string;
        parentId: string;
        target: number;
        currentMastery: number;
        completedAt?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    goals: {
        id: string;
        createdAt: string;
        completed: boolean;
        label: string;
        skillId: string;
        childId: string;
        parentId: string;
        target: number;
        currentMastery: number;
        completedAt?: string | undefined;
    }[];
}, {
    goals: {
        id: string;
        createdAt: string;
        completed: boolean;
        label: string;
        skillId: string;
        childId: string;
        parentId: string;
        target: number;
        currentMastery: number;
        completedAt?: string | undefined;
    }[];
}>;
export type ParentGoalsResponse = z.infer<typeof ParentGoalsResponse>;
/** POST /parent/children/:childId/homework — parent assigns skills/activities as homework. */
export declare const AssignHomeworkRequest: z.ZodObject<{
    title: z.ZodString;
    skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    activityIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** ISO due date. */
    dueAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    skills: string[];
    activityIds: string[];
    dueAt?: string | undefined;
}, {
    title: string;
    dueAt?: string | undefined;
    skills?: string[] | undefined;
    activityIds?: string[] | undefined;
}>;
export type AssignHomeworkRequest = z.infer<typeof AssignHomeworkRequest>;
export declare const HomeworkAssignmentDto: z.ZodObject<{
    id: z.ZodString;
    parentId: z.ZodString;
    childId: z.ZodString;
    title: z.ZodString;
    skills: z.ZodArray<z.ZodString, "many">;
    activityIds: z.ZodArray<z.ZodString, "many">;
    dueAt: z.ZodOptional<z.ZodString>;
    assignedAt: z.ZodString;
    completed: z.ZodBoolean;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    completed: boolean;
    title: string;
    skills: string[];
    childId: string;
    parentId: string;
    activityIds: string[];
    assignedAt: string;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
}, {
    id: string;
    completed: boolean;
    title: string;
    skills: string[];
    childId: string;
    parentId: string;
    activityIds: string[];
    assignedAt: string;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
}>;
export type HomeworkAssignmentDto = z.infer<typeof HomeworkAssignmentDto>;
export declare const HomeworkResponse: z.ZodObject<{
    homework: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodString;
        childId: z.ZodString;
        title: z.ZodString;
        skills: z.ZodArray<z.ZodString, "many">;
        activityIds: z.ZodArray<z.ZodString, "many">;
        dueAt: z.ZodOptional<z.ZodString>;
        assignedAt: z.ZodString;
        completed: z.ZodBoolean;
        completedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        completed: boolean;
        title: string;
        skills: string[];
        childId: string;
        parentId: string;
        activityIds: string[];
        assignedAt: string;
        dueAt?: string | undefined;
        completedAt?: string | undefined;
    }, {
        id: string;
        completed: boolean;
        title: string;
        skills: string[];
        childId: string;
        parentId: string;
        activityIds: string[];
        assignedAt: string;
        dueAt?: string | undefined;
        completedAt?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    homework: {
        id: string;
        completed: boolean;
        title: string;
        skills: string[];
        childId: string;
        parentId: string;
        activityIds: string[];
        assignedAt: string;
        dueAt?: string | undefined;
        completedAt?: string | undefined;
    }[];
}, {
    homework: {
        id: string;
        completed: boolean;
        title: string;
        skills: string[];
        childId: string;
        parentId: string;
        activityIds: string[];
        assignedAt: string;
        dueAt?: string | undefined;
        completedAt?: string | undefined;
    }[];
}>;
export type HomeworkResponse = z.infer<typeof HomeworkResponse>;
/** PUT /parent/children/:childId/screen-time — configure a child's daily limit. */
export declare const SetScreenTimeRequest: z.ZodObject<{
    dailyLimitMinutes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    dailyLimitMinutes: number;
}, {
    dailyLimitMinutes: number;
}>;
export type SetScreenTimeRequest = z.infer<typeof SetScreenTimeRequest>;
export declare const ScreenTimeConfigDto: z.ZodObject<{
    childId: z.ZodString;
    dailyLimitMinutes: z.ZodNumber;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    childId: string;
    dailyLimitMinutes: number;
    updatedAt: string;
}, {
    childId: string;
    dailyLimitMinutes: number;
    updatedAt: string;
}>;
export type ScreenTimeConfigDto = z.infer<typeof ScreenTimeConfigDto>;
/** GET /parent/children/:childId/screen-time — remaining time for today. */
export declare const ScreenTimeCheckResponse: z.ZodObject<{
    childId: z.ZodString;
    /** yyyy-mm-dd (UTC) the check is for. */
    date: z.ZodString;
    dailyLimitMinutes: z.ZodNumber;
    usedMinutes: z.ZodNumber;
    remainingMinutes: z.ZodNumber;
    /** Whether the child has hit or exceeded today's limit. */
    limitReached: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    date: string;
    childId: string;
    dailyLimitMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
    limitReached: boolean;
}, {
    date: string;
    childId: string;
    dailyLimitMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
    limitReached: boolean;
}>;
export type ScreenTimeCheckResponse = z.infer<typeof ScreenTimeCheckResponse>;
export declare const ParentNotificationType: z.ZodEnum<["goal_completed", "streak_milestone", "homework_due", "screen_time_reached"]>;
export type ParentNotificationType = z.infer<typeof ParentNotificationType>;
export declare const ParentNotificationDto: z.ZodObject<{
    id: z.ZodString;
    parentId: z.ZodString;
    childId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["goal_completed", "streak_milestone", "homework_due", "screen_time_reached"]>;
    message: z.ZodString;
    /** Free-form context (skill id, streak length, goal id, …). */
    data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    read: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "goal_completed" | "streak_milestone" | "homework_due" | "screen_time_reached";
    id: string;
    createdAt: string;
    data: Record<string, unknown>;
    parentId: string;
    read: boolean;
    childId?: string | undefined;
}, {
    message: string;
    type: "goal_completed" | "streak_milestone" | "homework_due" | "screen_time_reached";
    id: string;
    createdAt: string;
    parentId: string;
    read: boolean;
    data?: Record<string, unknown> | undefined;
    childId?: string | undefined;
}>;
export type ParentNotificationDto = z.infer<typeof ParentNotificationDto>;
export declare const NotificationsResponse: z.ZodObject<{
    notifications: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodString;
        childId: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["goal_completed", "streak_milestone", "homework_due", "screen_time_reached"]>;
        message: z.ZodString;
        /** Free-form context (skill id, streak length, goal id, …). */
        data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodString;
        read: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "goal_completed" | "streak_milestone" | "homework_due" | "screen_time_reached";
        id: string;
        createdAt: string;
        data: Record<string, unknown>;
        parentId: string;
        read: boolean;
        childId?: string | undefined;
    }, {
        message: string;
        type: "goal_completed" | "streak_milestone" | "homework_due" | "screen_time_reached";
        id: string;
        createdAt: string;
        parentId: string;
        read: boolean;
        data?: Record<string, unknown> | undefined;
        childId?: string | undefined;
    }>, "many">;
    unread: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    notifications: {
        message: string;
        type: "goal_completed" | "streak_milestone" | "homework_due" | "screen_time_reached";
        id: string;
        createdAt: string;
        data: Record<string, unknown>;
        parentId: string;
        read: boolean;
        childId?: string | undefined;
    }[];
    unread: number;
}, {
    notifications: {
        message: string;
        type: "goal_completed" | "streak_milestone" | "homework_due" | "screen_time_reached";
        id: string;
        createdAt: string;
        parentId: string;
        read: boolean;
        data?: Record<string, unknown> | undefined;
        childId?: string | undefined;
    }[];
    unread: number;
}>;
export type NotificationsResponse = z.infer<typeof NotificationsResponse>;
//# sourceMappingURL=parent.d.ts.map
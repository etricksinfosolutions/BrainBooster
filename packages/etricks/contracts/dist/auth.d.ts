import { z } from "zod";
/**
 * Identity contracts — the shape of the authentication API, shared by the backend and every
 * client (web, mobile). Identity is the platform foundation that Cloud Save, Purchases, Parent
 * Dashboard, Analytics, Achievements and Leaderboards all build on, so its DTOs live here in the
 * shared contract package, next to ContentPack/GameManifest. See ADR-0018.
 *
 * Authentication only — NO authorization/permissions/roles yet (deliberately out of scope).
 */
/** The identity providers the platform understands. `guest` is always available. */
export declare const AuthProvider: z.ZodEnum<["guest", "google", "apple"]>;
export type AuthProvider = z.infer<typeof AuthProvider>;
/** The public view of an account — safe to send to clients and store locally. Never secrets. */
export declare const AuthUser: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["guest", "google", "apple"]>;
    /** Human display name when the provider supplies one; absent for bare guests. */
    displayName: z.ZodOptional<z.ZodString>;
    /** True until the account is upgraded (guest → Google/Apple) via account migration. */
    isGuest: z.ZodBoolean;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: "guest" | "google" | "apple";
    id: string;
    isGuest: boolean;
    createdAt: string;
    displayName?: string | undefined;
}, {
    provider: "guest" | "google" | "apple";
    id: string;
    isGuest: boolean;
    createdAt: string;
    displayName?: string | undefined;
}>;
export type AuthUser = z.infer<typeof AuthUser>;
/** The token pair + who they belong to. Returned by every successful sign-in and refresh. */
export declare const AuthSession: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["guest", "google", "apple"]>;
        /** Human display name when the provider supplies one; absent for bare guests. */
        displayName: z.ZodOptional<z.ZodString>;
        /** True until the account is upgraded (guest → Google/Apple) via account migration. */
        isGuest: z.ZodBoolean;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: "guest" | "google" | "apple";
        id: string;
        isGuest: boolean;
        createdAt: string;
        displayName?: string | undefined;
    }, {
        provider: "guest" | "google" | "apple";
        id: string;
        isGuest: boolean;
        createdAt: string;
        displayName?: string | undefined;
    }>;
    /** Short-lived JWT (HS256). Sent as `Authorization: Bearer` on authenticated requests. */
    accessToken: z.ZodString;
    /** Access-token lifetime in seconds — lets the client refresh proactively. */
    expiresIn: z.ZodNumber;
    /** Long-lived opaque token used only to obtain a new session. Rotated on every use. */
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        provider: "guest" | "google" | "apple";
        id: string;
        isGuest: boolean;
        createdAt: string;
        displayName?: string | undefined;
    };
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}, {
    user: {
        provider: "guest" | "google" | "apple";
        id: string;
        isGuest: boolean;
        createdAt: string;
        displayName?: string | undefined;
    };
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}>;
export type AuthSession = z.infer<typeof AuthSession>;
/** POST /auth/guest — no body required. */
export declare const GuestSignInRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type GuestSignInRequest = z.infer<typeof GuestSignInRequest>;
/**
 * POST /auth/google, POST /auth/apple.
 * `credential` is the provider's id_token / identity token. `link: true` (with a guest
 * Authorization header) upgrades the calling guest account in place instead of creating a new one.
 */
export declare const ProviderSignInRequest: z.ZodObject<{
    credential: z.ZodString;
    link: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    credential: string;
    link: boolean;
}, {
    credential: string;
    link?: boolean | undefined;
}>;
export type ProviderSignInRequest = z.infer<typeof ProviderSignInRequest>;
/** POST /auth/refresh — exchange a refresh token for a fresh, rotated session. */
export declare const RefreshRequest: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshRequest = z.infer<typeof RefreshRequest>;
/** POST /auth/logout — revoke a refresh token. */
export declare const LogoutRequest: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type LogoutRequest = z.infer<typeof LogoutRequest>;
export declare const LogoutResponse: z.ZodObject<{
    ok: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
}, {
    ok: boolean;
}>;
export type LogoutResponse = z.infer<typeof LogoutResponse>;
//# sourceMappingURL=auth.d.ts.map
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
export const AuthProvider = z.enum(["guest", "google", "apple"]);
/** The public view of an account — safe to send to clients and store locally. Never secrets. */
export const AuthUser = z.object({
    id: z.string().min(1),
    provider: AuthProvider,
    /** Human display name when the provider supplies one; absent for bare guests. */
    displayName: z.string().optional(),
    /** True until the account is upgraded (guest → Google/Apple) via account migration. */
    isGuest: z.boolean(),
    createdAt: z.string(),
});
/** The token pair + who they belong to. Returned by every successful sign-in and refresh. */
export const AuthSession = z.object({
    user: AuthUser,
    /** Short-lived JWT (HS256). Sent as `Authorization: Bearer` on authenticated requests. */
    accessToken: z.string().min(1),
    /** Access-token lifetime in seconds — lets the client refresh proactively. */
    expiresIn: z.number().int().positive(),
    /** Long-lived opaque token used only to obtain a new session. Rotated on every use. */
    refreshToken: z.string().min(1),
});
/** POST /auth/guest — no body required. */
export const GuestSignInRequest = z.object({}).strip();
/**
 * POST /auth/google, POST /auth/apple.
 * `credential` is the provider's id_token / identity token. `link: true` (with a guest
 * Authorization header) upgrades the calling guest account in place instead of creating a new one.
 */
export const ProviderSignInRequest = z.object({
    credential: z.string().min(1),
    link: z.boolean().optional().default(false),
});
/** POST /auth/refresh — exchange a refresh token for a fresh, rotated session. */
export const RefreshRequest = z.object({ refreshToken: z.string().min(1) });
/** POST /auth/logout — revoke a refresh token. */
export const LogoutRequest = z.object({ refreshToken: z.string().min(1) });
export const LogoutResponse = z.object({ ok: z.boolean() });
//# sourceMappingURL=auth.js.map
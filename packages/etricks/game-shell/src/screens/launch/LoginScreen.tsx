import { type ReactNode, useState } from "react";
import {
  useBranding,
  useAccessibility,
  useNavigation,
  usePorts,
  useShellDispatch,
} from "../../runtime/context.js";
import type { PlayerProfile } from "../../ports.js";
import type { AccessibilitySlice } from "../../runtime/state.js";
import { LaunchStage, MascotBadge, BrandArt, launchButtonStyle } from "./shared.js";

/**
 * LoginScreen ("login") — guest / Google / Apple sign-in gate.
 *
 * Calls only the auth PORT (`usePorts().auth`): never a backend directly, honouring ADR-0027 §5
 * (the client never owns authoritative data). On success it stores the returned profile and routes to
 * `home`. Fully de-branded — the heading is `useBranding().displayName` and the mascot is resolved.
 * Renders loading (in-flight) and error states, and degrades gracefully when no auth port is injected.
 */
type Provider = "guest" | "google" | "apple";

export function LoginScreen(): ReactNode {
  const branding = useBranding();
  const a11y = useAccessibility();
  const { navigate } = useNavigation();
  const dispatch = useShellDispatch();
  const auth = usePorts().auth;

  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = pending !== null;

  const succeed = (profile: PlayerProfile): void => {
    dispatch({ type: "SET_PROFILE", profile });
    navigate("home");
  };

  const attempt = async (provider: Provider): Promise<void> => {
    if (!auth || busy) return;
    setError(null);
    setPending(provider);
    try {
      const profile =
        provider === "guest" ? await auth.signInGuest() : await auth.signIn(provider);
      succeed(profile);
    } catch {
      setError(
        provider === "guest"
          ? "Couldn't start a guest session. Please try again."
          : `${label(provider)} sign-in didn't work. Please try again.`,
      );
      setPending(null);
    }
  };

  // No auth port wired: the game runs without sign-in — offer a clear way to continue.
  if (!auth) {
    return (
      <LaunchStage ariaLabel="Sign in unavailable" reducedMotion={a11y.reducedMotion}>
        <BrandArt
          art={branding.logo}
          fallbackLabel={branding.displayName}
          size={132}
          reducedMotion={a11y.reducedMotion}
        />
        <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }}>
          {branding.displayName}
        </h1>
        <p style={{ margin: 0, color: "var(--dim)", maxWidth: 380, lineHeight: 1.5 }}>
          Sign-in isn&apos;t set up for this game. You can jump straight in.
        </p>
        <button
          type="button"
          onClick={() => navigate("home")}
          style={launchButtonStyle("primary", a11y, { fullWidth: true })}
          aria-label="Continue to home"
        >
          Continue
        </button>
      </LaunchStage>
    );
  }

  return (
    <LaunchStage ariaLabel={`Sign in to ${branding.displayName}`} reducedMotion={a11y.reducedMotion}>
      <MascotBadge mascot={branding.mascot} size={110} reducedMotion={a11y.reducedMotion} />
      {!branding.mascot ? (
        <BrandArt
          art={branding.logo}
          fallbackLabel={branding.displayName}
          size={110}
          reducedMotion={a11y.reducedMotion}
        />
      ) : null}

      <div style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }}>
          {branding.displayName}
        </h1>
        <p style={{ margin: 0, color: "var(--dim)" }}>Sign in to save your progress</p>
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            margin: 0,
            color: "var(--bad)",
            background: "var(--surface)",
            border: `${a11y.highContrast ? 2 : 1}px solid var(--bad)`,
            borderRadius: "var(--radius)",
            padding: "10px 14px",
            maxWidth: 420,
            fontSize: "0.95rem",
          }}
        >
          {error}
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 12, width: "min(420px, 84vw)" }}>
        <SignInButton
          provider="google"
          label="Continue with Google"
          icon="🇬"
          pending={pending}
          disabled={busy}
          a11y={a11y}
          onClick={() => void attempt("google")}
          tone="ghost"
        />
        <SignInButton
          provider="apple"
          label="Continue with Apple"
          icon="🍎"
          pending={pending}
          disabled={busy}
          a11y={a11y}
          onClick={() => void attempt("apple")}
          tone="ghost"
        />
        <SignInButton
          provider="guest"
          label="Play as guest"
          icon="👤"
          pending={pending}
          disabled={busy}
          a11y={a11y}
          onClick={() => void attempt("guest")}
          tone="primary"
        />
      </div>

      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dim)", maxWidth: 360 }}>
        Guest progress stays on this device until you sign in.
      </p>
    </LaunchStage>
  );
}

function label(provider: Provider): string {
  return provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Guest";
}

function SignInButton({
  provider,
  label: text,
  icon,
  pending,
  disabled,
  a11y,
  onClick,
  tone,
}: {
  provider: Provider;
  label: string;
  icon: string;
  pending: Provider | null;
  disabled: boolean;
  a11y: AccessibilitySlice;
  onClick: () => void;
  tone: "primary" | "ghost";
}): ReactNode {
  const isPending = pending === provider;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isPending}
      aria-label={text}
      style={launchButtonStyle(tone, a11y, { fullWidth: true, disabled })}
    >
      <span aria-hidden="true" style={{ fontSize: "1.2rem" }}>
        {isPending ? "⏳" : icon}
      </span>
      {isPending ? "Signing in…" : text}
    </button>
  );
}

import { type ReactNode, type CSSProperties, useEffect, useState } from "react";
import {
  useBranding,
  useAccessibility,
  useNavigation,
  useShellState,
  useShellDispatch,
} from "../../runtime/context.js";
import { BrandArt, LaunchStage, launchButtonStyle } from "./shared.js";

/**
 * LoadingScreen ("loading") — themed asset/content preload between splash and home.
 *
 * Ports the reference app's "buy time for the API" loader: brand art, a progress indicator and content
 * skeletons, then hands off to `home`. De-branded — the art is `useBranding().loadingArt` and every
 * colour is a theme var. Reads `session.online` and the root `error` slice: when offline or errored it
 * pauses the preload and shows a recoverable state with a Retry, rather than spinning forever.
 */
const TICK_MS = 220;
const TICK_MS_REDUCED = 140;

export function LoadingScreen(): ReactNode {
  const branding = useBranding();
  const a11y = useAccessibility();
  const { navigate } = useNavigation();
  const dispatch = useShellDispatch();
  const state = useShellState();
  const online = state.session.online;
  const error = state.error;
  const blocked = !online || error !== null;

  const [progress, setProgress] = useState(0);
  const done = progress >= 100;

  // Advance the preload while nothing is blocking it; route home once complete.
  useEffect(() => {
    if (blocked) return;
    if (done) {
      navigate("home");
      return;
    }
    const step = a11y.reducedMotion ? 34 : 11;
    const id = setInterval(
      () => setProgress((p) => Math.min(100, p + step)),
      a11y.reducedMotion ? TICK_MS_REDUCED : TICK_MS,
    );
    return () => clearInterval(id);
  }, [blocked, done, a11y.reducedMotion, navigate]);

  const retry = (): void => {
    if (error) dispatch({ type: "CLEAR_ERROR" });
    if (!online) dispatch({ type: "SET_ONLINE", online: true });
  };

  // ---- Offline / error (recoverable) state ---------------------------------
  if (blocked) {
    const offline = !online;
    return (
      <LaunchStage
        ariaLabel={offline ? "You are offline" : "Something went wrong"}
        reducedMotion={a11y.reducedMotion}
      >
        <div role="alert" style={{ display: "grid", gap: 14, maxWidth: 420 }}>
          <span aria-hidden="true" style={{ fontSize: "3rem" }}>
            {offline ? "📡" : "⚠️"}
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 4.5vw, 1.9rem)", color: "var(--ink)" }}>
            {offline ? "You're offline" : "We hit a snag"}
          </h1>
          <p style={{ margin: 0, color: "var(--dim)", lineHeight: 1.5 }}>
            {offline
              ? "Reconnect to finish loading. Your progress is safe."
              : (error?.message ?? "Loading couldn't complete. Please try again.")}
          </p>
          <button
            type="button"
            onClick={retry}
            style={launchButtonStyle("primary", a11y, { fullWidth: true })}
            aria-label="Retry loading"
          >
            Try again
          </button>
        </div>
      </LaunchStage>
    );
  }

  // ---- Normal preload state ------------------------------------------------
  return (
    <LaunchStage ariaLabel={`Loading ${branding.displayName}`} reducedMotion={a11y.reducedMotion}>
      <BrandArt
        art={branding.loadingArt ?? branding.logo}
        fallbackLabel={branding.displayName}
        size={140}
        reducedMotion={a11y.reducedMotion}
        bob
      />

      <div style={{ display: "grid", gap: 8, width: "min(420px, 80vw)" }}>
        <div
          role="progressbar"
          aria-label="Loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          style={{
            height: 12,
            borderRadius: 999,
            background: "var(--surface)",
            border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              borderRadius: 999,
              transition: a11y.reducedMotion ? "none" : "width .25s ease",
            }}
          />
        </div>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--dim)" }} aria-hidden="true">
          Loading your adventure… {Math.round(progress)}%
        </p>
      </div>

      {/* Content skeletons — placeholders for the hub the player is about to see. */}
      <div
        aria-hidden="true"
        style={{ display: "grid", gap: 12, width: "min(420px, 80vw)", marginTop: 4 }}
      >
        <Skeleton height={64} reducedMotion={a11y.reducedMotion} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Skeleton height={88} reducedMotion={a11y.reducedMotion} />
          <Skeleton height={88} reducedMotion={a11y.reducedMotion} />
        </div>
      </div>
    </LaunchStage>
  );
}

function Skeleton({ height, reducedMotion }: { height: number; reducedMotion: boolean }): ReactNode {
  const shimmer: CSSProperties = reducedMotion
    ? { background: "var(--surface)" }
    : {
        backgroundImage:
          "linear-gradient(100deg, var(--surface) 30%, var(--line) 50%, var(--surface) 70%)",
        backgroundSize: "200% 100%",
        animation: "shell-launch-shimmer 1.4s linear infinite",
      };
  return (
    <div
      style={{
        height,
        borderRadius: "var(--radius)",
        border: "1px solid var(--line)",
        ...shimmer,
      }}
    />
  );
}

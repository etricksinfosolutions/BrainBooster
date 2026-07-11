import { type CSSProperties, type ReactNode } from "react";
import { useNavigation, useBranding, useAccessibility } from "../../runtime/context.js";

/**
 * FailureScreen ("failure") — an ENCOURAGING "try again" screen (never punishing). Retry remounts the
 * activity; Home returns to the hub. Game-neutral: the mascot appears only when branding provides one,
 * and any score/stars come from nav params. Reduced motion disables the gentle pulse.
 */

function readNumber(params: Readonly<Record<string, unknown>>, key: string): number | null {
  const v = params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function FailureScreen(): ReactNode {
  const { params, navigate } = useNavigation();
  const branding = useBranding();
  const a11y = useAccessibility();

  const score = readNumber(params, "score");

  const button = (variant: "primary" | "ghost"): CSSProperties => ({
    width: "100%",
    maxWidth: 340,
    padding: a11y.bigButtons ? "18px 26px" : "14px 24px",
    minHeight: a11y.bigButtons ? 56 : 48,
    fontFamily: "var(--font)",
    fontSize: a11y.bigButtons ? "1.15rem" : "1.02rem",
    fontWeight: 700,
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: a11y.reducedMotion ? "none" : "filter .12s ease",
    border: variant === "primary" ? "none" : `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
    background: variant === "primary" ? "var(--accent)" : "var(--surface)",
    color: variant === "primary" ? "var(--accent-ink)" : "var(--ink)",
  });

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "clamp(20px, 6vw, 40px)",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font)",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontSize: "3rem",
          animation: a11y.reducedMotion ? "none" : "gs-fail-pulse 1.8s ease-in-out infinite",
        }}
      >
        💪
      </div>
      {a11y.reducedMotion ? null : (
        <style>
          {"@keyframes gs-fail-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}"}
        </style>
      )}

      <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>So close!</h1>
      <p style={{ margin: 0, color: "var(--dim)", maxWidth: 420 }}>
        {branding.mascot
          ? `${branding.mascot.name} believes in you — give it another go!`
          : "Every try makes you stronger. Give it another go!"}
      </p>

      {score != null ? (
        <p style={{ margin: 0, fontSize: "1.05rem" }}>
          Score <strong>{score}</strong>
        </p>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          width: "100%",
          marginTop: 8,
        }}
      >
        <button type="button" style={button("primary")} onClick={() => navigate("activity")}>
          Try again
        </button>
        <button type="button" style={button("ghost")} onClick={() => navigate("home")}>
          Home
        </button>
      </div>
    </div>
  );
}

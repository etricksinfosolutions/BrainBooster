import { type ReactNode, type CSSProperties } from "react";
import type { AssetRef } from "@etricks/contracts";
import type { AccessibilitySlice } from "../../runtime/state.js";
import type { ResolvedMascot } from "../../branding.js";

/**
 * Shared building blocks for the launch-flow screens (splash, loading, onboarding, login).
 *
 * These are game-NEUTRAL helpers: every colour comes from a CSS custom property the shell sets on
 * :root (var(--bg), var(--accent), …) and every label/art comes from resolved branding — never a
 * Brain-Booster literal. Kept inside the `launch` group so the launch team owns them without touching
 * any shared barrel.
 */

/** Keyframes the launch screens use. Injected inline so the package needs no external stylesheet. */
const LAUNCH_KEYFRAMES = `
@keyframes shell-launch-spin { to { transform: rotate(360deg); } }
@keyframes shell-launch-pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
@keyframes shell-launch-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes shell-launch-shimmer { 0% { background-position: -160% 0; } 100% { background-position: 160% 0; } }
@keyframes shell-launch-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
`;

/** One-off style injection. Rendered inside a screen root; a single screen is mounted at a time. */
export function LaunchStyles(): ReactNode {
  return <style>{LAUNCH_KEYFRAMES}</style>;
}

/** Resolve an AssetRef to a usable image src, or null when there is no art to show. */
export function assetUri(ref: AssetRef | null | undefined): string | null {
  return ref && ref.uri ? ref.uri : null;
}

/** Full-bleed, centred stage every launch screen sits on. Paints purely from theme vars. */
export function LaunchStage({
  children,
  ariaLabel,
  onActivate,
  reducedMotion,
}: {
  children: ReactNode;
  ariaLabel: string;
  onActivate?: () => void;
  reducedMotion: boolean;
}): ReactNode {
  const style: CSSProperties = {
    position: "relative",
    minHeight: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(16px, 4vw, 28px)",
    padding: "clamp(20px, 6vw, 48px)",
    boxSizing: "border-box",
    textAlign: "center",
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "var(--font)",
    cursor: onActivate ? "pointer" : "default",
    animation: reducedMotion ? undefined : "shell-launch-rise .5s ease both",
  };
  return (
    <div
      className="shell-launch-stage"
      role={onActivate ? "button" : "group"}
      aria-label={ariaLabel}
      tabIndex={onActivate ? 0 : undefined}
      onClick={onActivate}
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
      style={style}
    >
      <LaunchStyles />
      {children}
    </div>
  );
}

/**
 * Brand art (logo / splash / loading illustration). Shows the resolved image when present, otherwise
 * a neutral wordmark of the display name — so a game with no art still renders something finished.
 */
export function BrandArt({
  art,
  fallbackLabel,
  size,
  reducedMotion,
  bob,
}: {
  art: AssetRef | null;
  fallbackLabel: string;
  size: number;
  reducedMotion: boolean;
  bob?: boolean;
}): ReactNode {
  const uri = assetUri(art);
  const anim = !reducedMotion && bob ? "shell-launch-bob 3.4s ease-in-out infinite" : undefined;
  if (uri) {
    return (
      <img
        src={uri}
        alt={art?.alt ?? fallbackLabel}
        width={size}
        height={size}
        draggable={false}
        style={{
          width: size,
          height: "auto",
          maxWidth: "70vw",
          objectFit: "contain",
          animation: anim,
        }}
      />
    );
  }
  // Neutral fallback: a rounded wordmark badge painted from theme vars.
  return (
    <div
      role="img"
      aria-label={fallbackLabel}
      style={{
        width: size,
        height: size,
        maxWidth: "70vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        border: "2px solid var(--line)",
        color: "var(--accent)",
        fontWeight: 800,
        fontSize: Math.max(20, Math.round(size * 0.22)),
        lineHeight: 1.05,
        padding: "8%",
        boxSizing: "border-box",
        animation: anim,
      }}
    >
      {fallbackLabel}
    </div>
  );
}

/** The game's mascot as a circular portrait. Renders nothing when the game has no mascot. */
export function MascotBadge({
  mascot,
  size,
  reducedMotion,
}: {
  mascot: ResolvedMascot | null;
  size: number;
  reducedMotion: boolean;
}): ReactNode {
  if (!mascot) return null;
  const uri = assetUri(mascot.art);
  const anim = reducedMotion ? undefined : "shell-launch-bob 3s ease-in-out infinite";
  if (uri) {
    return (
      <img
        src={uri}
        alt={mascot.name}
        width={size}
        height={size}
        draggable={false}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          borderRadius: "50%",
          animation: anim,
        }}
      />
    );
  }
  // No art but we do have a name: a friendly initial badge stands in for the mascot portrait.
  const initial = mascot.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      role="img"
      aria-label={mascot.name}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "var(--accent)",
        color: "var(--accent-ink)",
        fontWeight: 800,
        fontSize: Math.round(size * 0.42),
        animation: anim,
      }}
    >
      {initial}
    </div>
  );
}

export type ButtonTone = "primary" | "ghost" | "brand";

/**
 * Shared button style honouring accessibility toggles: bigButtons enlarges the hit target,
 * highContrast strengthens the border. All colours come from theme vars.
 */
export function launchButtonStyle(
  tone: ButtonTone,
  a11y: AccessibilitySlice,
  opts?: { fullWidth?: boolean; disabled?: boolean },
): CSSProperties {
  const minHeight = a11y.bigButtons ? 64 : 52;
  const pad = a11y.bigButtons ? "0 26px" : "0 20px";
  const borderWidth = a11y.highContrast ? 2 : 1;
  const base: CSSProperties = {
    minHeight,
    padding: pad,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: "var(--radius)",
    fontFamily: "var(--font)",
    fontWeight: 700,
    fontSize: a11y.bigButtons ? "1.12rem" : "1rem",
    cursor: opts?.disabled ? "not-allowed" : "pointer",
    opacity: opts?.disabled ? 0.55 : 1,
    width: opts?.fullWidth ? "100%" : undefined,
    maxWidth: opts?.fullWidth ? 420 : undefined,
    transition: a11y.reducedMotion ? "none" : "transform .12s ease, filter .12s ease",
    boxSizing: "border-box",
  };
  if (tone === "primary" || tone === "brand") {
    return {
      ...base,
      background: "var(--accent)",
      color: "var(--accent-ink)",
      border: `${borderWidth}px solid ${a11y.highContrast ? "var(--ink)" : "var(--accent)"}`,
    };
  }
  return {
    ...base,
    background: "var(--surface)",
    color: "var(--ink)",
    border: `${borderWidth}px solid ${a11y.highContrast ? "var(--ink)" : "var(--line)"}`,
  };
}

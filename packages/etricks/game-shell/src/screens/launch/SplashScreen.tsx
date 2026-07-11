import { type ReactNode, useEffect, useState } from "react";
import { useBranding, useAccessibility, useNavigation } from "../../runtime/context.js";
import { BrandArt, LaunchStage, MascotBadge, launchButtonStyle } from "./shared.js";

/**
 * SplashScreen ("splash") — the brand intro every manufactured game opens on.
 *
 * Ports the two-beat brand splash from the reference web app (studio/logo → wordmark → mascot),
 * fully de-branded: the title is `useBranding().displayName`, the art is the resolved splash/logo
 * AssetRef, the mascot is `useBranding().mascot` (hidden when a game has none), and the tagline shows
 * only when set. Auto-advances to `loading` after a short beat; a tap skips ahead.
 *
 * Accessibility: when reducedMotion is on there is NO animation and NO auto-advance timer — instead a
 * plain "Continue" CTA is shown, so nothing moves or changes without the player's action.
 */
const AUTO_ADVANCE_MS = 2200;

export function SplashScreen(): ReactNode {
  const branding = useBranding();
  const a11y = useAccessibility();
  const { navigate } = useNavigation();
  const [advanced, setAdvanced] = useState(false);

  const go = (): void => {
    if (advanced) return;
    setAdvanced(true);
    navigate("loading");
  };

  // Auto-advance only when motion is allowed; reducedMotion players use the explicit CTA below.
  useEffect(() => {
    if (a11y.reducedMotion) return;
    const t = setTimeout(() => navigate("loading"), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
    // navigate is stable; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefer the dedicated splash art; fall back to the logo, then to a neutral wordmark.
  const art = branding.splash ?? branding.logo;

  return (
    <LaunchStage
      ariaLabel={`${branding.displayName} — tap to continue`}
      onActivate={a11y.reducedMotion ? undefined : go}
      reducedMotion={a11y.reducedMotion}
    >
      <BrandArt
        art={art}
        fallbackLabel={branding.displayName}
        size={220}
        reducedMotion={a11y.reducedMotion}
        bob
      />

      <h1
        style={{
          margin: 0,
          fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
          fontWeight: 800,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
        }}
      >
        {branding.displayName}
      </h1>

      {branding.tagline ? (
        <p style={{ margin: 0, fontSize: "clamp(1rem, 3.4vw, 1.2rem)", color: "var(--dim)" }}>
          {branding.tagline}
        </p>
      ) : null}

      <MascotBadge mascot={branding.mascot} size={96} reducedMotion={a11y.reducedMotion} />

      {a11y.reducedMotion ? (
        <button
          type="button"
          onClick={go}
          style={launchButtonStyle("primary", a11y)}
          aria-label={`Continue to ${branding.displayName}`}
        >
          Continue
        </button>
      ) : (
        <p
          aria-hidden="true"
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "var(--dim)",
            animation: "shell-launch-pulse 1.6s ease-in-out infinite",
          }}
        >
          Tap to continue
        </p>
      )}
    </LaunchStage>
  );
}

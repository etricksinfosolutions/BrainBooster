import { type ReactNode, useState } from "react";
import {
  useBranding,
  useAccessibility,
  useNavigation,
  useShellState,
} from "../../runtime/context.js";
import { LaunchStage, MascotBadge, BrandArt, launchButtonStyle } from "./shared.js";

/**
 * OnboardingScreen ("onboarding") — a short first-run intro featuring the game's mascot.
 *
 * A 3-slide carousel that welcomes the player, explains the loop, and hands off to `home`. Skip and
 * Get-Started both navigate("home"). Game-neutral: copy is templated from `useBranding().displayName`
 * and the mascot's name; no Brain-Booster literals. Only meaningful on first run — when
 * `session.onboardingSeen` is already true we present a single "you're all set" panel so a returning
 * player who lands here (e.g. via back navigation) still gets a sensible screen, not a broken flow.
 */
interface Slide {
  emoji: string;
  title: string;
  body: string;
}

export function OnboardingScreen(): ReactNode {
  const branding = useBranding();
  const a11y = useAccessibility();
  const { navigate } = useNavigation();
  const seen = useShellState().session.onboardingSeen;

  const [index, setIndex] = useState(0);
  const finish = (): void => navigate("home");

  const mascotName = branding.mascot?.name ?? null;
  const guide = mascotName ? `${mascotName}, your guide,` : "Your guide";

  const slides: Slide[] = [
    {
      emoji: "👋",
      title: `Welcome to ${branding.displayName}!`,
      body: mascotName
        ? `${mascotName} is here to cheer you on every step of the way.`
        : "A world of play and learning is waiting for you.",
    },
    {
      emoji: "🗺️",
      title: "Play through worlds",
      body: `${guide} leads you level by level — each one a fresh challenge to master.`,
    },
    {
      emoji: "⭐",
      title: "Earn rewards",
      body: "Collect stars, keep your streak alive, and unlock new surprises as you grow.",
    },
  ];

  // Returning player: nothing to onboard — offer a single clear way onward.
  if (seen) {
    return (
      <LaunchStage ariaLabel="You're all set" reducedMotion={a11y.reducedMotion}>
        <MascotBadge mascot={branding.mascot} size={120} reducedMotion={a11y.reducedMotion} />
        {!branding.mascot ? (
          <BrandArt
            art={branding.logo}
            fallbackLabel={branding.displayName}
            size={120}
            reducedMotion={a11y.reducedMotion}
          />
        ) : null}
        <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }}>
          You&apos;re all set!
        </h1>
        <p style={{ margin: 0, color: "var(--dim)", maxWidth: 380, lineHeight: 1.5 }}>
          Jump back in and keep the adventure going.
        </p>
        <button
          type="button"
          onClick={finish}
          style={launchButtonStyle("primary", a11y, { fullWidth: true })}
          aria-label="Go to home"
        >
          Let&apos;s go
        </button>
      </LaunchStage>
    );
  }

  const slide = slides[index]!;
  const isLast = index === slides.length - 1;

  return (
    <LaunchStage ariaLabel="Welcome" reducedMotion={a11y.reducedMotion}>
      {/* Skip is always reachable, top-right. */}
      <button
        type="button"
        onClick={finish}
        style={{
          position: "absolute",
          top: "max(12px, env(safe-area-inset-top))",
          right: 16,
          background: "transparent",
          border: "none",
          color: "var(--dim)",
          fontFamily: "var(--font)",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          minHeight: a11y.bigButtons ? 48 : 40,
          padding: "0 8px",
        }}
        aria-label="Skip introduction"
      >
        Skip
      </button>

      <MascotBadge mascot={branding.mascot} size={132} reducedMotion={a11y.reducedMotion} />
      {!branding.mascot ? (
        <span aria-hidden="true" style={{ fontSize: "3.4rem" }}>
          {slide.emoji}
        </span>
      ) : null}

      <div
        key={index}
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 420,
          animation: a11y.reducedMotion ? undefined : "shell-launch-rise .35s ease both",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }}>
          {slide.title}
        </h1>
        <p style={{ margin: 0, color: "var(--dim)", fontSize: "1.08rem", lineHeight: 1.5 }}>
          {slide.body}
        </p>
      </div>

      {/* Progress dots. */}
      <div role="tablist" aria-label="Slide progress" style={{ display: "flex", gap: 8 }}>
        {slides.map((s, i) => (
          <span
            key={s.title}
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1} of ${slides.length}`}
            style={{
              width: i === index ? 22 : 10,
              height: 10,
              borderRadius: 999,
              background: i === index ? "var(--accent)" : "var(--line)",
              transition: a11y.reducedMotion ? "none" : "width .2s ease",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, width: "min(420px, 80vw)" }}>
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            style={launchButtonStyle("ghost", a11y, { fullWidth: true })}
            aria-label="Previous slide"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
          style={launchButtonStyle("primary", a11y, { fullWidth: true })}
          aria-label={isLast ? "Get started" : "Next slide"}
        >
          {isLast ? "Get started" : "Next"}
        </button>
      </div>
    </LaunchStage>
  );
}

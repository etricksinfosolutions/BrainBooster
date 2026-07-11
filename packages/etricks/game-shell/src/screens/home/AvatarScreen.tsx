import { type ReactNode, type CSSProperties } from "react";
import {
  useNavigation,
  useProfile,
  useShellDispatch,
  useAccessibility,
} from "../../runtime/context.js";
import { AVATAR_SKINS } from "./common.js";

/**
 * AvatarScreen — a presentational avatar picker grid.
 *
 * The skins are game-NEUTRAL emoji characters (see `common.ts`); selecting one updates the profile's
 * `avatarId` through the shell dispatch. No brand-specific avatar names, no hardcoded colours/fonts.
 * Renders an EMPTY state when there is no profile to attach the choice to.
 */
export function AvatarScreen(): ReactNode {
  const { navigate } = useNavigation();
  const profile = useProfile();
  const dispatch = useShellDispatch();
  const a11y = useAccessibility();

  const cardBorder = a11y.highContrast ? "2px solid var(--ink)" : "1px solid var(--line)";
  const tapMin = a11y.bigButtons ? 64 : 48;
  const motion = a11y.reducedMotion ? "none" : "transform .12s ease, box-shadow .12s ease";

  const screenStyle: CSSProperties = {
    minHeight: "100%",
    boxSizing: "border-box",
    padding: "clamp(12px, 3vw, 24px)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "var(--font)",
  };
  const backButtonStyle: CSSProperties = {
    minHeight: tapMin,
    minWidth: tapMin,
    padding: 0,
    borderRadius: "var(--radius)",
    border: cardBorder,
    background: "var(--surface)",
    color: "var(--ink)",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
  };

  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        onClick={() => navigate(profile ? "profile" : "home")}
        aria-label="Back"
        style={backButtonStyle}
      >
        ‹
      </button>
      <h1 style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 1.5rem)" }}>Choose your avatar</h1>
    </div>
  );

  // ---- EMPTY state: cannot persist a choice without a profile ---------------------------------
  if (!profile) {
    return (
      <div style={screenStyle}>
        {header}
        <div
          style={{
            background: "var(--surface)",
            border: cardBorder,
            borderRadius: "var(--radius)",
            padding: "clamp(14px, 3vw, 22px)",
            textAlign: "center",
          }}
        >
          <p aria-hidden="true" style={{ fontSize: "2.4rem", margin: 0 }}>
            🎭
          </p>
          <h2 style={{ margin: "8px 0 4px", fontSize: "1.2rem" }}>Sign in to pick an avatar</h2>
          <p style={{ color: "var(--dim)", margin: 0 }}>
            Your avatar is saved to your profile, so you'll need to be signed in.
          </p>
        </div>
      </div>
    );
  }

  const selected = profile.avatarId;
  const choose = (id: string): void => {
    if (id === selected) return;
    dispatch({ type: "SET_PROFILE", profile: { ...profile, avatarId: id } });
  };

  return (
    <div style={screenStyle}>
      {header}

      <div
        role="radiogroup"
        aria-label="Avatar options"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
          gap: 12,
        }}
      >
        {AVATAR_SKINS.map((skin) => {
          const isSelected = skin.id === selected;
          return (
            <button
              key={skin.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={skin.label}
              onClick={() => choose(skin.id)}
              style={{
                aspectRatio: "1 / 1",
                minHeight: tapMin + 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                borderRadius: "var(--radius)",
                cursor: "pointer",
                transition: motion,
                background: isSelected ? "var(--accent)" : "var(--surface)",
                color: isSelected ? "var(--accent-ink)" : "var(--ink)",
                border: isSelected ? "2px solid var(--accent)" : cardBorder,
                fontFamily: "inherit",
                boxShadow: isSelected && !a11y.reducedMotion ? "0 4px 14px rgba(0,0,0,0.14)" : "none",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "2.2rem", lineHeight: 1 }}>
                {skin.glyph}
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>{skin.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate("profile")}
        style={{
          minHeight: tapMin,
          borderRadius: "var(--radius)",
          border: "none",
          background: "var(--accent)",
          color: "var(--accent-ink)",
          fontWeight: 800,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}

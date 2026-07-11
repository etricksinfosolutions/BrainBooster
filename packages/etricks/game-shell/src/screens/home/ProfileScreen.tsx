import { type ReactNode, type CSSProperties, useState } from "react";
import {
  useNavigation,
  useEconomy,
  useProfile,
  usePorts,
  useShellDispatch,
  useAccessibility,
} from "../../runtime/context.js";
import { avatarGlyph, levelForXp } from "./common.js";

/**
 * ProfileScreen — the player's own summary and account controls.
 *
 * Player identity comes from `useProfile()` (server-authoritative), the level is derived from live XP,
 * and sign-out goes through the injected `auth` port. Fully de-branded: no currency/mascot/studio
 * literals, all styling via theme CSS variables. Renders an EMPTY state when there is no profile.
 */
export function ProfileScreen(): ReactNode {
  const { navigate } = useNavigation();
  const profile = useProfile();
  const wallet = useEconomy();
  const ports = usePorts();
  const dispatch = useShellDispatch();
  const a11y = useAccessibility();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const cardBorder = a11y.highContrast ? "2px solid var(--ink)" : "1px solid var(--line)";
  const tapMin = a11y.bigButtons ? 64 : 48;
  const motion = a11y.reducedMotion ? "none" : "background .14s ease";

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
  const cardStyle: CSSProperties = {
    background: "var(--surface)",
    border: cardBorder,
    borderRadius: "var(--radius)",
    padding: "clamp(14px, 3vw, 22px)",
  };
  const buttonStyle: CSSProperties = {
    minHeight: tapMin,
    padding: "0 18px",
    borderRadius: "var(--radius)",
    border: cardBorder,
    background: "var(--surface)",
    color: "var(--ink)",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: motion,
  };
  const primaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    background: "var(--accent)",
    color: "var(--accent-ink)",
    border: "none",
  };

  const header = (title: string): ReactNode => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        onClick={() => navigate("home")}
        aria-label="Back to home"
        style={{ ...buttonStyle, padding: 0, width: tapMin, minWidth: tapMin }}
      >
        ‹
      </button>
      <h1 style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 1.5rem)" }}>{title}</h1>
    </div>
  );

  // ---- EMPTY state: no profile (guest / signed out) -------------------------------------------
  if (!profile) {
    return (
      <div style={screenStyle}>
        {header("Profile")}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <p aria-hidden="true" style={{ fontSize: "2.4rem", margin: 0 }}>
            👤
          </p>
          <h2 style={{ margin: "8px 0 4px", fontSize: "1.2rem" }}>You're not signed in</h2>
          <p style={{ color: "var(--dim)", margin: "0 0 16px" }}>
            Sign in to save your progress and sync across devices.
          </p>
          <button type="button" style={primaryButtonStyle} onClick={() => navigate("home")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const level = levelForXp(wallet.xp);

  const startEdit = (): void => {
    setDraftName(profile.displayName);
    setEditing(true);
  };
  const saveName = (): void => {
    const name = draftName.trim();
    if (name.length > 0 && name !== profile.displayName) {
      dispatch({ type: "SET_PROFILE", profile: { ...profile, displayName: name } });
    }
    setEditing(false);
  };

  const signOut = async (): Promise<void> => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await ports.auth?.signOut();
      dispatch({ type: "SET_PROFILE", profile: null });
      navigate("home");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div style={screenStyle}>
      {header("Profile")}

      {/* ---- Player summary ------------------------------------------------------------------ */}
      <section style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
        <span
          role="img"
          aria-label={`Avatar for ${profile.displayName}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--bg)",
            border: cardBorder,
            fontSize: "2.4rem",
            flex: "0 0 auto",
          }}
        >
          {avatarGlyph(profile.avatarId)}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                aria-label="Display name"
                maxLength={40}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: cardBorder,
                  background: "var(--bg)",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <button type="button" style={primaryButtonStyle} onClick={saveName} aria-label="Save name">
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile.displayName}
              </h2>
              {profile.premium ? (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                  }}
                  aria-label="Premium member"
                >
                  ✨ Premium
                </span>
              ) : null}
              <button
                type="button"
                onClick={startEdit}
                aria-label="Edit name"
                style={{
                  ...buttonStyle,
                  minHeight: 0,
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                }}
              >
                ✏️ Edit
              </button>
            </div>
          )}
          <p style={{ margin: "6px 0 0", color: "var(--dim)" }}>
            Level {level} · {wallet.xp.toLocaleString()} XP
          </p>
        </div>
      </section>

      {/* ---- Account actions ----------------------------------------------------------------- */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          style={{ ...buttonStyle, textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
          onClick={() => navigate("avatar")}
        >
          <span aria-hidden="true">🎭</span> Change avatar
          <span aria-hidden="true" style={{ marginLeft: "auto", color: "var(--dim)" }}>
            ›
          </span>
        </button>
        <button
          type="button"
          style={{ ...buttonStyle, textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
          onClick={() => navigate("settings")}
        >
          <span aria-hidden="true">⚙️</span> Settings
          <span aria-hidden="true" style={{ marginLeft: "auto", color: "var(--dim)" }}>
            ›
          </span>
        </button>
        {ports.auth ? (
          <button
            type="button"
            style={{ ...buttonStyle, color: "var(--bad)", textAlign: "left" }}
            onClick={() => void signOut()}
            disabled={signingOut}
            aria-busy={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        ) : null}
      </section>
    </div>
  );
}

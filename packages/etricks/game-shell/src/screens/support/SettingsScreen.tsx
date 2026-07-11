import { type ReactNode, useState } from "react";
import {
  useBranding,
  useNavigation,
  usePorts,
  useProfile,
  useSettings,
  useShell,
  useShellDispatch,
} from "../../runtime/context.js";
import type { SettingsSlice } from "../../runtime/state.js";
import {
  ActionRow,
  Card,
  PrimaryButton,
  RowDivider,
  ScreenShell,
  SectionTitle,
  SliderRow,
  TitleBar,
  ToggleRow,
  useUiPrefs,
} from "./_ui.js";

/**
 * SettingsScreen ("settings") — the universal preferences surface. Audio & experience toggles and
 * volumes bind to the shell's `settings` slice via `UPDATE_SETTINGS`; the language picker is driven by
 * the game's own declared locales (identity), never a hardcoded list. Cross-links to Accessibility and
 * the Parents area are guarded by the navigation FSM (`canNavigate`) so an illegal link simply disables
 * rather than dead-ends. Every string that would name a brand reads from resolved branding.
 */

/** The boolean-valued settings this screen toggles (volumes/language handled separately). */
type BoolSettingKey = "music" | "sound" | "voice" | "notifications";

/** Human-facing endonyms for common locale codes; unknown codes fall back to their uppercased tag. */
const LOCALE_LABELS: Readonly<Record<string, string>> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  nl: "Nederlands",
  hi: "हिन्दी",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  mr: "मराठी",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  tr: "Türkçe",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
};

function localeLabel(code: string): string {
  const base = code.split(/[-_]/)[0] ?? code;
  return LOCALE_LABELS[base] ?? code.toUpperCase();
}

export function SettingsScreen(): ReactNode {
  const { identity } = useShell();
  const settings = useSettings();
  const branding = useBranding();
  const ports = usePorts();
  const dispatch = useShellDispatch();
  const { navigate, canNavigate } = useNavigation();
  const prefs = useUiPrefs();

  // Boot hydration may not have populated the settings slice yet.
  if (!settings) {
    return (
      <ScreenShell>
        <TitleBar title="Settings" icon="⚙️" />
        <Card style={{ padding: 20 }}>
          <p style={{ color: "var(--dim)", margin: 0 }}>Loading your preferences…</p>
        </Card>
      </ScreenShell>
    );
  }

  const patch = (p: Partial<SettingsSlice>) => dispatch({ type: "UPDATE_SETTINGS", patch: p });
  const toggle = (k: BoolSettingKey) => {
    const next: Partial<SettingsSlice> = {};
    next[k] = !settings[k];
    patch(next);
  };

  const locales = identity.definition.locales;

  return (
    <ScreenShell>
      <TitleBar title="Settings" icon="⚙️" />

      {/* etricksEmpire ID — cloud account so progress is never lost */}
      <AccountSection />

      {/* Audio */}
      <SectionTitle>Audio</SectionTitle>
      <Card>
        <ToggleRow
          icon="🎵"
          label="Music"
          hint="Background themes as you play"
          checked={settings.music}
          onToggle={() => toggle("music")}
        />
        <SliderRow
          icon="🎚️"
          label="Music volume"
          value={settings.musicVolume}
          disabled={!settings.music}
          onChange={(v) => patch({ musicVolume: v })}
        />
        <RowDivider />
        <ToggleRow
          icon="🔊"
          label="Sound effects"
          hint="Taps, answers and celebrations"
          checked={settings.sound}
          onToggle={() => toggle("sound")}
        />
        <SliderRow
          icon="🎚️"
          label="Effects volume"
          value={settings.sfxVolume}
          disabled={!settings.sound}
          onChange={(v) => patch({ sfxVolume: v })}
        />
      </Card>

      {/* Experience */}
      <SectionTitle>Experience</SectionTitle>
      <Card>
        <ToggleRow
          icon="🗣️"
          label="Voice"
          hint="Read questions and hints out loud"
          checked={settings.voice}
          onToggle={() => toggle("voice")}
        />
        <RowDivider />
        <ToggleRow
          icon="🔔"
          label="Notifications"
          hint="Daily reminders and streak nudges"
          checked={settings.notifications}
          onToggle={() => {
            if (!settings.notifications) void ports.notifications?.request();
            toggle("notifications");
          }}
        />
      </Card>

      {/* Language — sourced from the game's own declared locales */}
      <SectionTitle>Language</SectionTitle>
      <Card style={{ padding: 10 }}>
        {locales.length <= 1 ? (
          <p style={{ margin: 6, color: "var(--dim)", fontSize: "0.9rem" }}>
            {localeLabel(locales[0] ?? settings.language)} is the only language available.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: 8,
            }}
          >
            {locales.map((code) => {
              const active = settings.language === code;
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patch({ language: code })}
                  style={{
                    minHeight: prefs.controlMinHeight,
                    padding: prefs.controlPad,
                    borderRadius: "var(--radius)",
                    border: `${active ? 2 : prefs.borderWidth}px solid ${active ? "var(--accent)" : prefs.borderColor}`,
                    background: active ? "var(--accent)" : "var(--surface)",
                    color: active ? "var(--accent-ink)" : "var(--ink)",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: prefs.transition,
                  }}
                >
                  {localeLabel(code)}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* More surfaces — links guarded by the navigation FSM */}
      <SectionTitle>More</SectionTitle>
      <Card>
        <ActionRow
          icon="♿"
          label="Accessibility"
          hint="Motion, contrast, button size and colour"
          onClick={() => navigate("accessibility")}
          disabled={!canNavigate("accessibility")}
        />
        <RowDivider />
        <ActionRow
          icon="👨‍👩‍👧"
          label="For grown-ups"
          hint="Parent & guardian area"
          onClick={() => navigate("parents")}
          disabled={!canNavigate("parents")}
        />
      </Card>

      {/* Support */}
      <SectionTitle>Support</SectionTitle>
      <Card style={{ padding: 12, gap: 10 }}>
        <PrimaryButton
          onClick={() => ports.analytics?.track("support_contact_open", { from: "settings" })}
        >
          ✉️ Contact support
        </PrimaryButton>
        <p style={{ margin: 0, color: "var(--dim)", fontSize: "0.85rem", textAlign: "center" }}>
          Questions about {branding.displayName}? We are happy to help.
        </p>
      </Card>

      {/* About / branding — all values resolved, none hardcoded */}
      <AboutCard />
    </ScreenShell>
  );
}

/**
 * The etricksEmpire ID account card — the cross-game player identity (à la "Supercell ID"). Signing in
 * backs a child's progress to the cloud so it's never lost and follows them across devices. Purely
 * port-driven: it calls the `AuthPort` and reflects the resolved `profile` — the same section works in
 * every manufactured game, branded generically. Providers unavailable offline surface a friendly error.
 */
function AccountSection(): ReactNode {
  const profile = useProfile();
  const ports = usePorts();
  const dispatch = useShellDispatch();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    void fn()
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Something went wrong. Please try again."))
      .finally(() => setBusy(null));
  };

  const signIn = (provider: "google" | "apple" | "guest") =>
    run(provider, async () => {
      if (!ports.auth) throw new Error("Sign-in isn’t available right now.");
      const p = provider === "guest" ? await ports.auth.signInGuest() : await ports.auth.signIn(provider);
      dispatch({ type: "SET_PROFILE", profile: p });
    });

  const signOut = () =>
    run("signout", async () => {
      await ports.auth?.signOut();
      dispatch({ type: "SET_PROFILE", profile: null });
    });

  const providerBtn = (key: "google" | "apple", label: string, glyph: string): ReactNode => (
    <button
      type="button"
      disabled={busy != null}
      onClick={() => signIn(key)}
      style={{
        flex: 1,
        minWidth: 130,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 14px",
        borderRadius: "var(--radius)",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--ink)",
        fontWeight: 700,
        cursor: busy ? "default" : "pointer",
        opacity: busy && busy !== key ? 0.6 : 1,
        font: "inherit",
      }}
    >
      <span aria-hidden="true">{glyph}</span> {busy === key ? "Signing in…" : label}
    </button>
  );

  return (
    <>
      <SectionTitle>etricksEmpire ID</SectionTitle>
      <Card style={{ padding: 16, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden="true" style={{ fontSize: 26 }}>👑</span>
          <div>
            <strong style={{ color: "var(--ink)" }}>
              {profile ? `Signed in as ${profile.displayName}` : "Save your game to the cloud"}
            </strong>
            <div style={{ color: "var(--dim)", fontSize: ".9rem" }}>
              {profile
                ? "Your progress is backed up — it follows you to any device and is never lost."
                : "Create your etricksEmpire ID so your progress is never forgotten, on any device."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {providerBtn("google", "Continue with Google", "🅶")}
          {providerBtn("apple", "Continue with Apple", "")}
        </div>

        {profile ? (
          <button
            type="button"
            disabled={busy != null}
            onClick={signOut}
            style={{
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--dim)",
              fontWeight: 700,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {busy === "signout" ? "Signing out…" : "Sign out"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy != null}
            onClick={() => signIn("guest")}
            style={{
              alignSelf: "flex-start",
              padding: "8px 4px",
              border: "none",
              background: "transparent",
              color: "var(--accent)",
              fontWeight: 700,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {busy === "guest" ? "Setting up…" : "Continue as guest for now"}
          </button>
        )}

        {error ? (
          <p role="alert" style={{ margin: 0, color: "var(--bad)", fontSize: ".9rem" }}>
            ⚠️ {error}
          </p>
        ) : null}
      </Card>
    </>
  );
}

/** A compact About card that shows only resolved brand identity (name, tagline, mascot, icon). */
function AboutCard(): ReactNode {
  const branding = useBranding();
  const mascot = branding.mascot;
  return (
    <Card style={{ alignItems: "center", textAlign: "center", padding: 18, gap: 6, marginTop: 8 }}>
      {branding.appIcon?.uri ? (
        <img
          src={branding.appIcon.uri}
          alt={branding.appIcon.alt ?? `${branding.displayName} icon`}
          style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover" }}
        />
      ) : mascot?.art?.uri ? (
        <img
          src={mascot.art.uri}
          alt={mascot.art.alt ?? mascot.name}
          style={{ width: 64, height: 64, objectFit: "contain" }}
        />
      ) : (
        <span aria-hidden="true" style={{ fontSize: 40 }}>
          🎮
        </span>
      )}
      <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>{branding.displayName}</strong>
      {branding.tagline && <small style={{ color: "var(--dim)" }}>{branding.tagline}</small>}
      {mascot?.name && (
        <small style={{ color: "var(--dim)" }}>Your guide: {mascot.name}</small>
      )}
    </Card>
  );
}

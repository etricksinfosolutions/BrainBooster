import { type ReactNode, useMemo, useState } from "react";
import {
  useBranding,
  useEconomy,
  useNavigation,
  usePorts,
  useProfile,
  useShellState,
} from "../../runtime/context.js";
import {
  ActionRow,
  Card,
  PrimaryButton,
  RowDivider,
  ScreenShell,
  SectionTitle,
  TitleBar,
  useUiPrefs,
} from "./_ui.js";

/**
 * ParentsScreen ("parents") — the parent/guardian area behind a simple parental gate. Neutral and
 * brand-driven: every piece of copy that would name a product reads from resolved branding, and the
 * only player data shown is the non-sensitive economy summary the shell already holds (no extra PII).
 * A screen-time card renders an honest EMPTY state because detailed reporting is a server surface the
 * shell does not yet own. Privacy / help / about are informational; the support action pings analytics.
 */

export function ParentsScreen(): ReactNode {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <ParentalGate onUnlock={() => setUnlocked(true)} />;
  return <ParentsDashboard />;
}

/** A lightweight parental gate: a multiplication an adult answers instantly, a child likely cannot. */
function ParentalGate({ onUnlock }: { onUnlock: () => void }): ReactNode {
  const prefs = useUiPrefs();
  // Stable per mount so the question does not change while typing.
  const { a, b } = useMemo(() => ({ a: 6 + Math.floor(Math.random() * 6), b: 3 + Math.floor(Math.random() * 6) }), []);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (Number(entry) === a * b) onUnlock();
    else {
      setError(true);
      setEntry("");
    }
  };

  return (
    <ScreenShell>
      <TitleBar title="For grown-ups" icon="👨‍👩‍👧" />
      <Card style={{ padding: 20, gap: 14, alignItems: "center", textAlign: "center" }}>
        <span aria-hidden="true" style={{ fontSize: 40 }}>
          🔒
        </span>
        <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>Parental check</strong>
        <p style={{ margin: 0, color: "var(--dim)" }}>
          Ask a grown-up: what is <b style={{ color: "var(--ink)" }}>{a} × {b}</b>?
        </p>
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320 }}>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={entry}
            aria-label="Answer to the parental check"
            aria-invalid={error}
            onChange={(e) => {
              setEntry(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            style={{
              flex: 1,
              minHeight: prefs.controlMinHeight,
              padding: prefs.controlPad,
              borderRadius: "var(--radius)",
              border: `${error ? 2 : prefs.borderWidth}px solid ${error ? "var(--bad)" : prefs.borderColor}`,
              background: "var(--bg)",
              color: "var(--ink)",
              fontSize: "1.1rem",
              textAlign: "center",
            }}
          />
          <PrimaryButton onClick={submit}>Open</PrimaryButton>
        </div>
        {error && (
          <small role="alert" style={{ color: "var(--bad)" }}>
            Not quite — please try again.
          </small>
        )}
      </Card>
    </ScreenShell>
  );
}

function ParentsDashboard(): ReactNode {
  const branding = useBranding();
  const economy = useEconomy();
  const economySkin = useShellState().economySkin;
  const profile = useProfile();
  const ports = usePorts();
  const { navigate, canNavigate } = useNavigation();

  const stats: { icon: string; value: number; label: string; show: boolean }[] = [
    { icon: economySkin.soft.icon, value: economy?.coins ?? 0, label: economySkin.soft.label, show: true },
    { icon: economySkin.xp.icon, value: economy?.xp ?? 0, label: economySkin.xp.label, show: true },
    {
      icon: "🔥",
      value: economy?.streakDays ?? 0,
      label: "Day streak",
      show: economySkin.showStreak,
    },
  ].filter((s) => s.show);

  return (
    <ScreenShell>
      <TitleBar title="For grown-ups" icon="👨‍👩‍👧" />

      {profile && (
        <Card style={{ padding: 14 }}>
          <span style={{ color: "var(--dim)", fontSize: "0.85rem" }}>Player</span>
          <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>{profile.displayName}</strong>
        </Card>
      )}

      {/* Progress summary — non-sensitive economy figures the shell already holds */}
      <SectionTitle>Progress</SectionTitle>
      <Card style={{ padding: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: 8,
            textAlign: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2, padding: 6 }}>
              <span aria-hidden="true" style={{ fontSize: 22 }}>
                {s.icon}
              </span>
              <strong style={{ color: "var(--ink)", fontSize: "1.3rem" }}>{s.value}</strong>
              <small style={{ color: "var(--dim)" }}>{s.label}</small>
            </div>
          ))}
        </div>
      </Card>

      {/* Screen-time — honest EMPTY state until the server reporting surface lands */}
      <SectionTitle>Screen time</SectionTitle>
      <Card style={{ padding: 18, alignItems: "center", textAlign: "center", gap: 8 }}>
        <span aria-hidden="true" style={{ fontSize: 32 }}>
          ⏳
        </span>
        <p style={{ margin: 0, color: "var(--dim)" }}>
          Weekly screen-time reports for {branding.displayName} appear here as your child plays.
        </p>
      </Card>

      {/* Privacy & safety — informational, brand-driven copy */}
      <SectionTitle>Privacy &amp; safety</SectionTitle>
      <Card>
        <ActionRow
          icon="🛡️"
          label="Privacy policy"
          hint={`How ${branding.displayName} handles your family's data`}
          marker="↗"
          onClick={() => ports.analytics?.track("privacy_open", { from: "parents" })}
        />
        <RowDivider />
        <ActionRow
          icon="❓"
          label="Help centre"
          hint="Guides and answers to common questions"
          marker="↗"
          onClick={() => ports.analytics?.track("help_open", { from: "parents" })}
        />
        <RowDivider />
        <ActionRow
          icon="⚙️"
          label="App settings"
          hint="Sound, language and accessibility"
          onClick={() => navigate("settings")}
          disabled={!canNavigate("settings")}
        />
      </Card>

      {/* Support contact */}
      <SectionTitle>Support</SectionTitle>
      <Card style={{ padding: 12, gap: 10 }}>
        <PrimaryButton onClick={() => ports.analytics?.track("support_contact_open", { from: "parents" })}>
          ✉️ Contact support
        </PrimaryButton>
        <p style={{ margin: 0, color: "var(--dim)", fontSize: "0.85rem", textAlign: "center" }}>
          Our team is here to help with anything about {branding.displayName}.
        </p>
      </Card>

      {/* About */}
      <Card style={{ alignItems: "center", textAlign: "center", padding: 18, gap: 6, marginTop: 8 }}>
        {branding.appIcon?.uri ? (
          <img
            src={branding.appIcon.uri}
            alt={branding.appIcon.alt ?? `${branding.displayName} icon`}
            style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }}
          />
        ) : (
          <span aria-hidden="true" style={{ fontSize: 36 }}>
            🎮
          </span>
        )}
        <strong style={{ color: "var(--ink)" }}>{branding.displayName}</strong>
        {branding.tagline && <small style={{ color: "var(--dim)" }}>{branding.tagline}</small>}
      </Card>
    </ScreenShell>
  );
}

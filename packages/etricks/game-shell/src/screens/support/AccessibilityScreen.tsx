import { type ReactNode } from "react";
import { useAccessibility, useNavigation, useShellDispatch } from "../../runtime/context.js";
import type { AccessibilitySlice } from "../../runtime/state.js";
import {
  ActionRow,
  Card,
  RowDivider,
  ScreenShell,
  SectionTitle,
  TitleBar,
  ToggleRow,
  useUiPrefs,
} from "./_ui.js";

/**
 * AccessibilityScreen ("accessibility") — toggles for the four platform accessibility preferences,
 * each bound to the shell's `accessibility` slice via `UPDATE_ACCESSIBILITY`. Because every shared
 * primitive reads that same slice, flipping a toggle re-styles the whole screen instantly — the live
 * preview is the screen itself. A dedicated preview panel makes the effect obvious at a glance.
 */

/** All accessibility keys are boolean, so one toggle handler covers every row. */
type A11yKey = keyof AccessibilitySlice;

interface A11yOption {
  key: A11yKey;
  icon: string;
  label: string;
  hint: string;
}

const OPTIONS: readonly A11yOption[] = [
  { key: "reducedMotion", icon: "🌀", label: "Reduce motion", hint: "Calmer screens with less animation and movement" },
  { key: "highContrast", icon: "◐", label: "High contrast", hint: "Stronger outlines and colours for easier reading" },
  { key: "bigButtons", icon: "🔘", label: "Big buttons", hint: "Larger targets and text for small hands" },
  { key: "colorBlind", icon: "🎨", label: "Colour-blind friendly", hint: "Adds shapes and patterns alongside colour" },
];

export function AccessibilityScreen(): ReactNode {
  const a11y = useAccessibility();
  const dispatch = useShellDispatch();
  const { navigate, canNavigate } = useNavigation();

  if (!a11y) {
    return (
      <ScreenShell>
        <TitleBar title="Accessibility" icon="♿" />
        <Card style={{ padding: 20 }}>
          <p style={{ color: "var(--dim)", margin: 0 }}>Loading your preferences…</p>
        </Card>
      </ScreenShell>
    );
  }

  const toggle = (k: A11yKey) => {
    const next: Partial<AccessibilitySlice> = {};
    next[k] = !a11y[k];
    dispatch({ type: "UPDATE_ACCESSIBILITY", patch: next });
  };

  return (
    <ScreenShell>
      <TitleBar title="Accessibility" icon="♿" />

      <PreviewPanel />

      <SectionTitle>Preferences</SectionTitle>
      <Card>
        {OPTIONS.map((opt, i) => (
          <div key={opt.key}>
            {i > 0 && <RowDivider />}
            <ToggleRow
              icon={opt.icon}
              label={opt.label}
              hint={opt.hint}
              checked={a11y[opt.key]}
              onToggle={() => toggle(opt.key)}
            />
          </div>
        ))}
      </Card>

      <Card>
        <ActionRow
          icon="⚙️"
          label="Back to settings"
          onClick={() => navigate("settings")}
          disabled={!canNavigate("settings")}
        />
      </Card>
    </ScreenShell>
  );
}

/** A small panel that visibly reflects the current preferences so changes preview live. */
function PreviewPanel(): ReactNode {
  const a11y = useAccessibility();
  const prefs = useUiPrefs();
  return (
    <Card style={{ padding: 16, gap: 12 }}>
      <span style={{ color: "var(--dim)", fontSize: "0.85rem", fontWeight: 700 }}>Live preview</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => undefined}
          aria-label="Preview button"
          style={{
            minHeight: prefs.controlMinHeight,
            padding: prefs.controlPad,
            borderRadius: "var(--radius)",
            border: `${prefs.borderWidth}px solid var(--accent)`,
            background: "var(--accent)",
            color: "var(--accent-ink)",
            fontWeight: 700,
            fontSize: `calc(1rem * ${prefs.fontScale})`,
            transition: prefs.transition,
          }}
        >
          Sample button
        </button>
        {/* Colour-blind: correctness is conveyed by a shape, not colour alone. */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--ok)",
            fontWeight: 700,
            fontSize: `calc(0.95rem * ${prefs.fontScale})`,
          }}
        >
          {a11y.colorBlind && <span aria-hidden="true">✓</span>}
          Correct
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--bad)",
            fontWeight: 700,
            fontSize: `calc(0.95rem * ${prefs.fontScale})`,
          }}
        >
          {a11y.colorBlind && <span aria-hidden="true">✕</span>}
          Try again
        </span>
        {/* Reduced-motion: the spinner stops moving when the preference is on. */}
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: `3px solid ${prefs.borderColor}`,
            borderTopColor: "var(--accent)",
            animation: a11y.reducedMotion ? "none" : "spin 900ms linear infinite",
          }}
        />
      </div>
      <p style={{ margin: 0, color: "var(--dim)", fontSize: "0.85rem" }}>
        Changes apply everywhere in {""}
        <b style={{ color: "var(--ink)" }}>real time</b> — no restart needed.
      </p>
      {/* Keyframes are inert when reduced motion is on (animation: none above). */}
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </Card>
  );
}

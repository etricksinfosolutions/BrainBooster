import { type ReactNode, type CSSProperties, useState } from "react";
import type { PreparedChoice, PreparedClassification } from "@etricks/activity-engine";
import { useAccessibility } from "../runtime/context.js";

/**
 * DOM view components for the activity types Science Master (and most quiz games) use: single-select
 * choice (multiple-choice / image-quiz / audio-quiz), true/false, and classification. Every colour is
 * a theme CSS variable; nothing is game-specific. Types the engine hasn't a view for yet fall back to
 * a neutral placeholder so the player still advances. Views only build the engine's response shape and
 * call `onSubmit` — grading lives in the engine.
 */

function optionStyle(a11y: { highContrast: boolean; bigButtons: boolean }, state: "idle" | "correct" | "wrong" | "muted"): CSSProperties {
  const bg =
    state === "correct" ? "color-mix(in srgb, var(--ok) 18%, var(--surface))"
    : state === "wrong" ? "color-mix(in srgb, var(--bad) 18%, var(--surface))"
    : "var(--surface)";
  const border =
    state === "correct" ? "var(--ok)" : state === "wrong" ? "var(--bad)" : "var(--line)";
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    padding: a11y.bigButtons ? "16px 18px" : "13px 16px",
    borderRadius: "var(--radius)",
    border: `${a11y.highContrast ? 2 : 1}px solid ${border}`,
    background: bg,
    color: "var(--ink)",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: state === "muted" ? "default" : "pointer",
    opacity: state === "muted" ? 0.6 : 1,
    font: "inherit",
  };
}

const promptStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: "clamp(1.1rem, 3.6vw, 1.4rem)",
  fontWeight: 800,
  color: "var(--ink)",
  textAlign: "center",
  lineHeight: 1.25,
};

// --- Single-select choice ----------------------------------------------------------------------

export function ChoiceView(props: {
  prepared: PreparedChoice;
  answered: boolean;
  chosenIndex?: number;
  onChoose: (i: number) => void;
}): ReactNode {
  const a11y = useAccessibility();
  const { prepared, answered, chosenIndex } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      <h2 style={promptStyle}>{prepared.prompt}</h2>
      <div role="listbox" aria-label="Answer choices" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {prepared.choices.map((choice, i) => {
          const state = !answered
            ? "idle"
            : i === prepared.correctIndex
              ? "correct"
              : i === chosenIndex
                ? "wrong"
                : "muted";
          return (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={chosenIndex === i}
              disabled={answered}
              onClick={() => props.onChoose(i)}
              style={optionStyle(a11y, state)}
            >
              <span aria-hidden="true" style={{ fontWeight: 800, color: "var(--dim)" }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- True / False ------------------------------------------------------------------------------

export function TrueFalseView(props: {
  prepared: { statement: string; answer: boolean };
  answered: boolean;
  chosenValue?: boolean;
  onAnswer: (v: boolean) => void;
}): ReactNode {
  const a11y = useAccessibility();
  const { prepared, answered, chosenValue } = props;
  const btn = (value: boolean, label: string, glyph: string): ReactNode => {
    const state = !answered
      ? "idle"
      : value === prepared.answer
        ? "correct"
        : chosenValue === value
          ? "wrong"
          : "muted";
    return (
      <button
        type="button"
        disabled={answered}
        onClick={() => props.onAnswer(value)}
        aria-label={label}
        style={{ ...optionStyle(a11y, state), justifyContent: "center", fontSize: "1.1rem", fontWeight: 800 }}
      >
        <span aria-hidden="true">{glyph}</span> {label}
      </button>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <h2 style={promptStyle}>{prepared.statement}</h2>
      <div style={{ display: "flex", gap: 12 }}>
        {btn(true, "True", "✓")}
        {btn(false, "False", "✗")}
      </div>
    </div>
  );
}

// --- Classification (assign each item to a category) --------------------------------------------

export function ClassificationView(props: {
  prepared: PreparedClassification;
  answered: boolean;
  onSubmit: (assignments: number[]) => void;
}): ReactNode {
  const a11y = useAccessibility();
  const { prepared, answered } = props;
  const [assignments, setAssignments] = useState<number[]>(() => prepared.items.map(() => -1));
  const allAssigned = assignments.every((a) => a >= 0);

  const setItem = (itemIdx: number, catIdx: number) => {
    if (answered) return;
    setAssignments((prev) => prev.map((v, i) => (i === itemIdx ? catIdx : v)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      <h2 style={promptStyle}>Sort each item into the right group</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {prepared.items.map((item, i) => {
          const chosen = assignments[i] ?? -1;
          const correct = answered && chosen === item.correctCategory;
          const wrong = answered && chosen >= 0 && chosen !== item.correctCategory;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "12px 14px",
                borderRadius: "var(--radius)",
                border: `${a11y.highContrast ? 2 : 1}px solid ${correct ? "var(--ok)" : wrong ? "var(--bad)" : "var(--line)"}`,
                background: "var(--surface)",
              }}
            >
              <strong style={{ color: "var(--ink)" }}>{item.label}</strong>
              <div role="group" aria-label={`Group for ${item.label}`} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {prepared.categories.map((cat, ci) => (
                  <button
                    key={ci}
                    type="button"
                    disabled={answered}
                    aria-pressed={chosen === ci}
                    onClick={() => setItem(i, ci)}
                    style={{
                      padding: a11y.bigButtons ? "10px 14px" : "7px 12px",
                      borderRadius: 999,
                      border: `${a11y.highContrast ? 2 : 1}px solid ${chosen === ci ? "var(--accent)" : "var(--line)"}`,
                      background: chosen === ci ? "var(--accent)" : "var(--surface)",
                      color: chosen === ci ? "var(--accent-ink)" : "var(--ink)",
                      fontWeight: 700,
                      cursor: answered ? "default" : "pointer",
                      font: "inherit",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!answered ? (
        <button
          type="button"
          disabled={!allAssigned}
          onClick={() => props.onSubmit(assignments)}
          style={{
            alignSelf: "center",
            padding: "12px 26px",
            borderRadius: "var(--radius)",
            border: "none",
            background: allAssigned ? "var(--accent)" : "var(--line)",
            color: allAssigned ? "var(--accent-ink)" : "var(--dim)",
            fontWeight: 800,
            cursor: allAssigned ? "pointer" : "not-allowed",
            font: "inherit",
          }}
        >
          Check
        </button>
      ) : null}
    </div>
  );
}

// --- Fallback for not-yet-rendered types -------------------------------------------------------

export function PlaceholderView(props: { type: string; onSkip: () => void }): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
      <div aria-hidden="true" style={{ fontSize: "2.2rem" }}>🧩</div>
      <p style={{ margin: 0, color: "var(--dim)" }}>
        This activity type (<code>{props.type}</code>) isn’t interactive yet.
      </p>
      <button
        type="button"
        onClick={props.onSkip}
        style={{
          padding: "10px 20px",
          borderRadius: "var(--radius)",
          border: "none",
          background: "var(--accent)",
          color: "var(--accent-ink)",
          fontWeight: 700,
          cursor: "pointer",
          font: "inherit",
        }}
      >
        Continue
      </button>
    </div>
  );
}

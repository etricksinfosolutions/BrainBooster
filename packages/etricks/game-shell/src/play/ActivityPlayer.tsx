import { type ReactNode, type CSSProperties, useState } from "react";
import type { Activity } from "@etricks/activity-engine";
import { useActivityPlay, type LevelSummary } from "./useActivityPlay.js";
import { ChoiceView, TrueFalseView, ClassificationView, PlaceholderView } from "./views.js";

/**
 * ActivityPlayer — the game-neutral React player mounted inside the shell's ActivityScreen. It drives
 * a level's `Activity[]` through the Universal Activity Engine (via `useActivityPlay`), renders the
 * right DOM view per type, shows correct/incorrect feedback + explanation, and reports the level
 * summary to `onComplete` when finished. No game-specific logic — the same player runs every game.
 */
export function ActivityPlayer(props: {
  gameId: string;
  activities: Activity[];
  seed?: string;
  onComplete: (summary: LevelSummary) => void;
}): ReactNode {
  const play = useActivityPlay({
    gameId: props.gameId,
    activities: props.activities,
    seed: props.seed,
    onFinished: props.onComplete,
  });
  const [lastValue, setLastValue] = useState<boolean | undefined>(undefined);

  const answered = play.phase === "feedback";
  const solved = play.feedback?.grade.solved ?? false;

  const wrap: CSSProperties = {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  };

  return (
    <div style={wrap}>
      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={play.total}
          aria-valuenow={play.index + 1}
          aria-label="Activity progress"
          style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}
        >
          <div
            style={{
              height: "100%",
              width: `${((play.index + (answered ? 1 : 0)) / Math.max(1, play.total)) * 100}%`,
              background: "var(--accent)",
              borderRadius: 999,
            }}
          />
        </div>
        <span style={{ color: "var(--dim)", fontSize: ".85rem", whiteSpace: "nowrap" }}>
          {play.index + 1}/{play.total}
        </span>
      </div>

      {/* current activity */}
      {play.view?.kind === "choice" ? (
        <ChoiceView
          prepared={play.view.prepared}
          answered={answered}
          chosenIndex={play.feedback?.chosenIndex}
          onChoose={(i) => play.submit({ choiceIndex: i }, { chosenIndex: i })}
        />
      ) : play.view?.kind === "true-false" ? (
        <TrueFalseView
          prepared={play.view.prepared}
          answered={answered}
          chosenValue={lastValue}
          onAnswer={(v) => {
            setLastValue(v);
            play.submit({ value: v });
          }}
        />
      ) : play.view?.kind === "classification" ? (
        <ClassificationView
          prepared={play.view.prepared}
          answered={answered}
          onSubmit={(assignments) => play.submit({ assignments })}
        />
      ) : play.view ? (
        <PlaceholderView type={play.view.type} onSkip={() => play.submit({})} />
      ) : null}

      {/* feedback + next */}
      {answered ? (
        <div
          role="status"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "14px 16px",
            borderRadius: "var(--radius)",
            border: `1px solid ${solved ? "var(--ok)" : "var(--bad)"}`,
            background: solved
              ? "color-mix(in srgb, var(--ok) 12%, var(--surface))"
              : "color-mix(in srgb, var(--bad) 12%, var(--surface))",
          }}
        >
          <strong style={{ color: solved ? "var(--ok)" : "var(--bad)" }}>
            {solved ? "Correct!" : "Not quite"}
            {play.feedback ? ` · +${play.feedback.grade.score}` : ""}
          </strong>
          {play.feedback?.explanation ? (
            <p style={{ margin: 0, color: "var(--ink)", fontSize: ".95rem" }}>{play.feedback.explanation}</p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setLastValue(undefined);
              play.next();
            }}
            style={{
              alignSelf: "flex-end",
              padding: "10px 22px",
              borderRadius: "var(--radius)",
              border: "none",
              background: "var(--accent)",
              color: "var(--accent-ink)",
              fontWeight: 800,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {play.index + 1 >= play.total ? "Finish" : "Next"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

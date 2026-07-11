import { type CSSProperties, type ReactNode, useCallback, useMemo } from "react";
import type { Activity } from "@etricks/activity-engine";
import {
  useNavigation,
  useEconomy,
  useShellState,
  useAccessibility,
  usePorts,
  useShell,
} from "../../runtime/context.js";
import { ActivityPlayer } from "../../play/ActivityPlayer.js";
import type { LevelSummary } from "../../play/useActivityPlay.js";

/** Defensively read the level's playable activities carried through navigation params. */
function parseActivities(v: unknown): Activity[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (a): a is Activity =>
      typeof a === "object" && a !== null && typeof (a as { id?: unknown }).id === "string" && "content" in a,
  );
}

/**
 * ActivityScreen ("activity") — the game-agnostic HOST frame around a single level. It NEVER implements
 * gameplay: it renders a top bar (pause, progress, currency HUD) and a neutral mount region where the
 * host embeds `@etricks/activity-engine`. Ported from the reference app's play layout (top bar +
 * content region) but stripped of every world/level/skill specific value — those arrive as nav params.
 */

function readString(params: Readonly<Record<string, unknown>>, key: string): string | null {
  const v = params[key];
  if (typeof v === "string" && v.length > 0) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function readNumber(params: Readonly<Record<string, unknown>>, key: string): number | null {
  const v = params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function ActivityScreen(): ReactNode {
  const { params, navigate } = useNavigation();
  const wallet = useEconomy();
  const skin = useShellState().economySkin;
  const sessionReady = useShellState().session.status === "ready";
  const a11y = useAccessibility();
  const ports = usePorts();
  const gameId = useShell().identity.definition.id;

  const worldId = readString(params, "worldId");
  const levelId = readString(params, "levelId");
  const activities = useMemo(() => parseActivities(params["activities"]), [params]);

  // When the level finishes, award its coins/xp through the economy port (server owns the amounts)
  // and route to the celebration/encouragement screen with the score/stars.
  const onComplete = useCallback(
    (summary: LevelSummary) => {
      if (summary.score > 0 || summary.stars > 0) {
        void ports.economy?.award({ coins: summary.score, xp: summary.stars * 10 }, "level-complete");
      }
      navigate(summary.stars > 0 ? "victory" : "failure", {
        worldId: worldId ?? undefined,
        levelId: levelId ?? undefined,
        score: summary.score,
        stars: summary.stars,
        maxStars: summary.maxStars,
      });
    },
    [ports, navigate, worldId, levelId],
  );
  // Optional progress: either a 0..1 fraction, or a step/total pair.
  const fraction = readNumber(params, "progress");
  const step = readNumber(params, "step");
  const total = readNumber(params, "total");
  const pct =
    fraction != null
      ? Math.max(0, Math.min(1, fraction))
      : step != null && total != null && total > 0
        ? Math.max(0, Math.min(1, step / total))
        : null;

  const chip: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: a11y.bigButtons ? "8px 14px" : "6px 11px",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--ink)",
    border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
    fontSize: "0.95rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  const iconBtn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: a11y.bigButtons ? 56 : 44,
    height: a11y.bigButtons ? 56 : 44,
    borderRadius: "var(--radius)",
    border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
    background: "var(--surface)",
    color: "var(--ink)",
    fontSize: "1.4rem",
    cursor: "pointer",
    transition: a11y.reducedMotion ? "none" : "filter .12s ease",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font)",
        boxSizing: "border-box",
      }}
    >
      {/* Top bar: pause · progress · currency HUD */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "clamp(10px, 2.5vw, 18px)",
          borderBottom: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
          background: "var(--bg)",
        }}
      >
        <button
          type="button"
          aria-label="Pause"
          title="Pause"
          onClick={() => navigate("pause")}
          style={iconBtn}
        >
          ⏸
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.05rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {levelId != null ? `Level ${levelId}` : "Activity"}
            {worldId != null ? <span style={{ color: "var(--dim)" }}> · {worldId}</span> : null}
          </div>
          {pct != null ? (
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct * 100)}
              aria-label="Level progress"
              style={{
                marginTop: 6,
                height: 8,
                borderRadius: 999,
                background: "var(--line)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct * 100}%`,
                  background: "var(--accent)",
                  borderRadius: 999,
                  transition: a11y.reducedMotion ? "none" : "width .3s ease",
                }}
              />
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={chip} title={skin.soft.label} aria-label={`${wallet.coins} ${skin.soft.label}`}>
            <span aria-hidden="true">{skin.soft.icon}</span> {wallet.coins}
          </span>
          <span style={chip} title={skin.hard.label} aria-label={`${wallet.diamonds} ${skin.hard.label}`}>
            <span aria-hidden="true">{skin.hard.icon}</span> {wallet.diamonds}
          </span>
          <span style={chip} title={skin.xp.label} aria-label={`${wallet.xp} ${skin.xp.label}`}>
            <span aria-hidden="true">{skin.xp.icon}</span> {wallet.xp}
          </span>
        </div>
      </header>

      {/* Content region — the neutral mount point for @etricks/activity-engine. The host embeds the
          engine here; the shell deliberately renders NO gameplay of its own. */}
      <main
        role="region"
        aria-label="Activity"
        aria-busy={!sessionReady && activities.length === 0}
        style={{
          flex: 1,
          display: "flex",
          alignItems: activities.length > 0 ? "flex-start" : "center",
          justifyContent: "center",
          padding: "clamp(16px, 4vw, 32px)",
          overflowY: "auto",
        }}
      >
        {activities.length > 0 ? (
          <ActivityPlayer
            key={`${worldId ?? ""}:${levelId ?? ""}`}
            gameId={gameId}
            activities={activities}
            seed={`${levelId ?? "level"}`}
            onComplete={onComplete}
          />
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              minHeight: "min(60vh, 460px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              textAlign: "center",
              padding: "clamp(20px, 5vw, 40px)",
              borderRadius: "var(--radius)",
              border: `${a11y.highContrast ? 3 : 2}px dashed var(--line)`,
              background: "var(--surface)",
              color: "var(--dim)",
              boxSizing: "border-box",
            }}
          >
            <div aria-hidden="true" style={{ fontSize: "2.4rem" }}>🎮</div>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--ink)" }}>
              {sessionReady ? "No activities for this level yet" : "Preparing your activity…"}
            </p>
            <p style={{ margin: 0, fontSize: "0.95rem", maxWidth: 420 }}>
              {levelId != null ? `Level ${levelId}` : "This level"}
              {worldId != null ? ` of ${worldId}` : ""} has no playable content loaded.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

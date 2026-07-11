import { type ReactNode, useCallback, useEffect, useState } from "react";
import { usePorts } from "../../runtime/context.js";
import {
  EconomyScreen,
  StateBlock,
  useUiTokens,
  asRecord,
  asArray,
  asStr,
  asNum,
  isTrue,
} from "./_shared.js";

/**
 * AchievementsScreen ("achievements") — a gallery of the game's achievements, fetched from the
 * authoritative rewards port (`achievements()`). Definitions + unlock state are server-owned; the shell
 * only renders locked/unlocked visuals with neutral iconography. Renders LOADING while the port
 * resolves, EMPTY when there are none, and ERROR (with retry) when the port throws.
 */

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  unlocked: boolean;
  /** Progress toward unlock, 0..1, when the server reports partial progress. */
  progress: number | null;
}

function parseAchievements(v: unknown): Achievement[] {
  return asArray(v).map((raw, i): Achievement => {
    const r = asRecord(raw);
    const current = r ? asNum(r["current"]) : null;
    const goal = r ? asNum(r["goal"]) : null;
    const explicit = r ? asNum(r["progress"]) : null;
    const derived =
      explicit !== null
        ? Math.min(1, Math.max(0, explicit))
        : current !== null && goal !== null && goal > 0
          ? Math.min(1, Math.max(0, current / goal))
          : null;
    return {
      id: (r ? asStr(r["id"]) : null) ?? `achievement-${i}`,
      title: (r ? asStr(r["title"]) ?? asStr(r["name"]) : null) ?? "Achievement",
      description: r ? asStr(r["description"]) : null,
      icon: (r ? asStr(r["icon"]) : null) ?? "🏆",
      unlocked: r ? isTrue(r["unlocked"]) : false,
      progress: derived,
    };
  });
}

export function AchievementsScreen(): ReactNode {
  const ports = usePorts();
  const t = useUiTokens();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [items, setItems] = useState<Achievement[]>([]);

  const load = useCallback(() => {
    if (!ports.rewards) {
      setPhase("error");
      return;
    }
    setPhase("loading");
    let live = true;
    ports.rewards
      .achievements()
      .then((v) => {
        if (!live) return;
        setItems(parseAchievements(v));
        setPhase("ready");
      })
      .catch(() => live && setPhase("error"));
    return () => {
      live = false;
    };
  }, [ports.rewards]);

  useEffect(() => load(), [load]);

  const unlockedCount = items.filter((a) => a.unlocked).length;

  let body: ReactNode;
  if (phase === "loading") body = <StateBlock kind="loading" message="Loading achievements…" />;
  else if (phase === "error")
    body = <StateBlock kind="error" message="Achievements are unavailable right now." onRetry={() => load()} />;
  else if (items.length === 0)
    body = <StateBlock kind="empty" message="No achievements yet — start playing to unlock them!" />;
  else
    body = (
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((a) => (
          <li
            key={a.id}
            aria-label={`${a.title}: ${a.unlocked ? "unlocked" : "locked"}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 8,
              padding: t.pad + 4,
              borderRadius: "var(--radius)",
              border: a.unlocked ? t.strongBorder : t.border,
              background: "var(--surface)",
              opacity: a.unlocked ? 1 : 0.72,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: 40,
                filter: a.unlocked ? "none" : "grayscale(1)",
              }}
            >
              {a.unlocked ? a.icon : "🔒"}
            </span>
            <strong style={{ fontSize: `calc(.95rem * ${t.fontScale})` }}>{a.title}</strong>
            {a.description ? (
              <span style={{ fontSize: ".8rem", color: "var(--dim)" }}>{a.description}</span>
            ) : null}
            {!a.unlocked && a.progress !== null ? (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(a.progress * 100)}
                aria-label="Progress"
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  border: t.border,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: `${a.progress * 100}%`, height: "100%", background: "var(--accent)" }} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    );

  return (
    <EconomyScreen
      title="Achievements"
      subtitle={phase === "ready" && items.length > 0 ? `${unlockedCount} of ${items.length} unlocked` : null}
    >
      {body}
    </EconomyScreen>
  );
}

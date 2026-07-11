import { type ReactNode, useCallback, useEffect, useState } from "react";
import { usePorts } from "../../runtime/context.js";
import {
  EconomyScreen,
  StateBlock,
  useUiTokens,
  useRewardFormat,
  asRecord,
  asArray,
  asStr,
  asNum,
  isTrue,
} from "./_shared.js";

/**
 * ChallengesScreen ("challenges") — the active challenges list, fetched from the authoritative rewards
 * port (`challenges()`). Each challenge's goal, progress and reward are server-owned; the shell renders
 * progress bars and the reward skinned by the game's currency labels/icons. LOADING / EMPTY / ERROR are
 * all handled.
 */

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  current: number;
  goal: number | null;
  completed: boolean;
  reward: { coins?: number; diamonds?: number; xp?: number };
}

function parseChallenges(v: unknown): Challenge[] {
  return asArray(v).map((raw, i): Challenge => {
    const r = asRecord(raw);
    const rewardRec = r ? asRecord(r["reward"]) : null;
    const goal = r ? asNum(r["goal"]) : null;
    const current = (r ? asNum(r["current"]) ?? asNum(r["progress"]) : null) ?? 0;
    return {
      id: (r ? asStr(r["id"]) : null) ?? `challenge-${i}`,
      title: (r ? asStr(r["title"]) ?? asStr(r["name"]) : null) ?? "Challenge",
      description: r ? asStr(r["description"]) : null,
      icon: (r ? asStr(r["icon"]) : null) ?? "🎯",
      current,
      goal,
      completed: r ? isTrue(r["completed"]) : goal !== null && current >= goal,
      reward: rewardRec
        ? {
            coins: asNum(rewardRec["coins"]) ?? undefined,
            diamonds: asNum(rewardRec["diamonds"]) ?? undefined,
            xp: asNum(rewardRec["xp"]) ?? undefined,
          }
        : {},
    };
  });
}

export function ChallengesScreen(): ReactNode {
  const ports = usePorts();
  const t = useUiTokens();
  const fmtReward = useRewardFormat();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [items, setItems] = useState<Challenge[]>([]);

  const load = useCallback(() => {
    if (!ports.rewards) {
      setPhase("error");
      return;
    }
    setPhase("loading");
    let live = true;
    ports.rewards
      .challenges()
      .then((v) => {
        if (!live) return;
        setItems(parseChallenges(v));
        setPhase("ready");
      })
      .catch(() => live && setPhase("error"));
    return () => {
      live = false;
    };
  }, [ports.rewards]);

  useEffect(() => load(), [load]);

  let body: ReactNode;
  if (phase === "loading") body = <StateBlock kind="loading" message="Loading challenges…" />;
  else if (phase === "error")
    body = <StateBlock kind="error" message="Challenges are unavailable right now." onRetry={() => load()} />;
  else if (items.length === 0)
    body = <StateBlock kind="empty" message="No active challenges right now — check back soon!" />;
  else
    body = (
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((c) => {
          const pct = c.goal && c.goal > 0 ? Math.min(1, Math.max(0, c.current / c.goal)) : c.completed ? 1 : 0;
          const rewardText = fmtReward(c.reward);
          return (
            <li
              key={c.id}
              aria-label={`${c.title}${c.completed ? " (completed)" : ""}`}
              style={{
                padding: t.pad + 4,
                borderRadius: "var(--radius)",
                border: c.completed ? t.strongBorder : t.border,
                background: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span aria-hidden="true" style={{ fontSize: 30, flexShrink: 0 }}>
                  {c.completed ? "✅" : c.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: `calc(1rem * ${t.fontScale})` }}>{c.title}</strong>
                  {c.description ? (
                    <p style={{ margin: "2px 0 0", fontSize: ".85rem", color: "var(--dim)" }}>{c.description}</p>
                  ) : null}
                </div>
                {rewardText ? (
                  <span
                    aria-label={`Reward: ${rewardText}`}
                    style={{
                      flexShrink: 0,
                      padding: "4px 10px",
                      borderRadius: "var(--radius)",
                      border: t.border,
                      background: "var(--bg)",
                      fontSize: ".85rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rewardText}
                  </span>
                ) : null}
              </div>
              {c.goal && c.goal > 0 ? (
                <div style={{ marginTop: 10 }}>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={c.goal}
                    aria-valuenow={Math.min(c.current, c.goal)}
                    aria-label="Challenge progress"
                    style={{
                      height: 10,
                      borderRadius: "var(--radius)",
                      background: "var(--bg)",
                      border: t.border,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct * 100}%`,
                        height: "100%",
                        background: c.completed ? "var(--ok)" : "var(--accent)",
                        transition: t.transition,
                      }}
                    />
                  </div>
                  <span style={{ display: "block", marginTop: 4, fontSize: ".78rem", color: "var(--dim)" }}>
                    {Math.min(c.current, c.goal)} / {c.goal}
                  </span>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );

  return (
    <EconomyScreen title="Challenges" subtitle="Complete goals to earn rewards" hud>
      {body}
    </EconomyScreen>
  );
}

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { usePorts, useProfile } from "../../runtime/context.js";
import {
  EconomyScreen,
  StateBlock,
  useUiTokens,
  asRecord,
  asArray,
  asStr,
  asNum,
} from "./_shared.js";

/**
 * LeaderboardScreen ("leaderboard") — a server-owned ranked list. Rankings are authoritative on the
 * server (ADR-0027 fan-out); the shell only fetches and renders them via `leaderboard.top()`. The
 * signed-in player's own row (matched on playerId) is highlighted. LOADING / EMPTY / ERROR handled. If
 * no leaderboard port is injected the screen degrades to a neutral "unavailable" state rather than
 * crashing (the port is optional at the type level).
 */

interface Entry {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
}

function parseEntries(v: unknown): Entry[] {
  const rec = asRecord(v);
  // Accept either { entries: [...] } or a bare array.
  const rows = asArray(rec ? rec["entries"] : v);
  return rows.map((raw, i): Entry => {
    const r = asRecord(raw);
    return {
      rank: (r ? asNum(r["rank"]) : null) ?? i + 1,
      playerId: (r ? asStr(r["playerId"]) : null) ?? `player-${i}`,
      displayName: (r ? asStr(r["displayName"]) ?? asStr(r["name"]) : null) ?? "Player",
      score: (r ? asNum(r["score"]) : null) ?? 0,
    };
  });
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function LeaderboardScreen(): ReactNode {
  const ports = usePorts();
  const profile = useProfile();
  const t = useUiTokens();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [entries, setEntries] = useState<Entry[]>([]);

  const load = useCallback(() => {
    if (!ports.leaderboard) {
      setPhase("error");
      return;
    }
    setPhase("loading");
    let live = true;
    ports.leaderboard
      .top("global", 50)
      .then((v) => {
        if (!live) return;
        setEntries(parseEntries(v).sort((a, b) => a.rank - b.rank));
        setPhase("ready");
      })
      .catch(() => live && setPhase("error"));
    return () => {
      live = false;
    };
  }, [ports.leaderboard]);

  useEffect(() => load(), [load]);

  let body: ReactNode;
  if (phase === "loading") body = <StateBlock kind="loading" message="Loading the leaderboard…" />;
  else if (phase === "error")
    body = <StateBlock kind="error" message="The leaderboard is unavailable right now." onRetry={() => load()} />;
  else if (entries.length === 0)
    body = <StateBlock kind="empty" message="No scores yet — be the first on the board!" />;
  else
    body = (
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map((e) => {
          const isMe = profile?.playerId != null && e.playerId === profile.playerId;
          const medal = MEDAL[e.rank];
          return (
            <li
              key={e.playerId}
              aria-label={`Rank ${e.rank}, ${e.displayName}, ${e.score.toLocaleString()} points${isMe ? " (you)" : ""}`}
              aria-current={isMe ? "true" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: t.pad,
                borderRadius: "var(--radius)",
                border: isMe ? t.strongBorder : t.border,
                background: isMe ? "var(--accent)" : "var(--surface)",
                color: isMe ? "var(--accent-ink)" : "var(--ink)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 34,
                  textAlign: "center",
                  fontWeight: 800,
                  fontSize: medal ? 22 : `calc(1rem * ${t.fontScale})`,
                  flexShrink: 0,
                }}
              >
                {medal ?? e.rank}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: isMe ? 800 : 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.displayName}
                {isMe ? " (You)" : ""}
              </span>
              <span style={{ fontWeight: 800, flexShrink: 0 }}>{e.score.toLocaleString()}</span>
            </li>
          );
        })}
      </ol>
    );

  return (
    <EconomyScreen title="Leaderboard" subtitle="Top players">
      {body}
    </EconomyScreen>
  );
}

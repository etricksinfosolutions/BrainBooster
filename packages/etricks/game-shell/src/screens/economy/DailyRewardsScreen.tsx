import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  useShell,
  usePorts,
  useShellState,
  useShellDispatch,
  useEconomy,
} from "../../runtime/context.js";
import {
  EconomyScreen,
  Card,
  ActionButton,
  StateBlock,
  useUiTokens,
  useRewardFormat,
  asRecord,
  asNum,
  isTrue,
} from "./_shared.js";

/**
 * DailyRewardsScreen ("daily-rewards") — a login-streak ladder. The number of tiers comes from the
 * game's shell config (`shell.dailyRewardDays`, default 7); the shell only renders the ladder. Claiming
 * goes through the authoritative rewards port (`claimDaily()`), and the freshly-granted wallet is pulled
 * back from the economy port — the client never invents balances (ADR-0027 §5). Claimed-today state is
 * reflected from `state.rewards.dailyClaimed`.
 */

interface DailyStatus {
  available: boolean;
  claimed: boolean;
  streakDays: number;
  reward: { coins?: number; diamonds?: number; xp?: number };
}

function parseStatus(v: unknown): DailyStatus {
  const r = asRecord(v);
  const reward = r ? asRecord(r["reward"]) : null;
  return {
    available: r ? isTrue(r["available"]) : false,
    claimed: r ? isTrue(r["claimed"]) : false,
    streakDays: (r ? asNum(r["streakDays"]) : null) ?? 0,
    reward: reward
      ? {
          coins: asNum(reward["coins"]) ?? undefined,
          diamonds: asNum(reward["diamonds"]) ?? undefined,
          xp: asNum(reward["xp"]) ?? undefined,
        }
      : {},
  };
}

export function DailyRewardsScreen(): ReactNode {
  const { config } = useShell();
  const ports = usePorts();
  const dispatch = useShellDispatch();
  const rewardsState = useShellState().rewards;
  const wallet = useEconomy();
  const skin = useShellState().economySkin;
  const t = useUiTokens();
  const fmtReward = useRewardFormat();

  const ladderDays = Math.max(1, config.shell?.dailyRewardDays ?? 7);

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [status, setStatus] = useState<DailyStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [granted, setGranted] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!ports.rewards) {
      setPhase("error");
      return;
    }
    setPhase("loading");
    let live = true;
    ports.rewards
      .dailyStatus()
      .then((v) => {
        if (!live) return;
        setStatus(parseStatus(v));
        setPhase("ready");
      })
      .catch(() => live && setPhase("error"));
    return () => {
      live = false;
    };
  }, [ports.rewards]);

  useEffect(() => load(), [load]);

  // Claimed-today reflects EITHER the server status or the reducer flag (whichever knows first).
  const claimedToday = rewardsState.dailyClaimed || (status?.claimed ?? false);
  // The player's position on the ladder: streak (mod tiers) marks "today"; earlier tiers are done.
  const streak = status?.streakDays ?? wallet.streakDays;
  const todayIndex = ladderDays > 0 ? streak % ladderDays : 0;

  const claim = useCallback(async () => {
    if (!ports.rewards || claiming || claimedToday) return;
    setClaiming(true);
    try {
      const res = await ports.rewards.claimDaily();
      dispatch({ type: "CLAIM_DAILY" });
      const grantedRec = asRecord(res)?.["granted"];
      const gr = asRecord(grantedRec);
      if (gr) {
        const text = fmtReward({
          coins: asNum(gr["coins"]),
          diamonds: asNum(gr["diamonds"]),
          xp: asNum(gr["xp"]),
        });
        setGranted(text || null);
      }
      // Pull the authoritative post-claim balance back from the economy port.
      if (ports.economy) {
        const w = await ports.economy.wallet();
        dispatch({ type: "SET_WALLET", economy: w });
      }
      // Refresh status so the ladder advances.
      const next = await ports.rewards.dailyStatus();
      setStatus(parseStatus(next));
    } catch {
      dispatch({
        type: "SET_ERROR",
        error: { fatal: false, kind: "recoverable", message: "Could not claim today's reward." },
      });
    } finally {
      setClaiming(false);
    }
  }, [ports.rewards, ports.economy, claiming, claimedToday, dispatch, fmtReward]);

  if (phase === "loading") {
    return (
      <EconomyScreen title="Daily Rewards" hud>
        <StateBlock kind="loading" message="Loading your daily rewards…" />
      </EconomyScreen>
    );
  }
  if (phase === "error") {
    return (
      <EconomyScreen title="Daily Rewards" hud>
        <StateBlock kind="error" message="Daily rewards are unavailable right now." onRetry={() => load()} />
      </EconomyScreen>
    );
  }

  return (
    <EconomyScreen title="Daily Rewards" subtitle={`Day ${todayIndex + 1} of ${ladderDays}`} hud>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span aria-hidden="true" style={{ fontSize: 24 }}>
            {"🔥"}
          </span>
          <strong style={{ fontSize: `calc(1.1rem * ${t.fontScale})` }}>
            {streak} day{streak === 1 ? "" : "s"} streak
          </strong>
        </div>
        <p style={{ margin: 0, color: "var(--dim)" }}>Come back every day to keep your streak growing.</p>
      </Card>

      <ol
        aria-label="Daily reward ladder"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
          gap: 10,
        }}
      >
        {Array.from({ length: ladderDays }, (_, i) => {
          const isDone = i < todayIndex || (i === todayIndex && claimedToday);
          const isToday = i === todayIndex && !claimedToday;
          const isMilestone = i === ladderDays - 1;
          const state = isDone ? "claimed" : isToday ? "today" : "locked";
          return (
            <li
              key={i}
              aria-label={`Day ${i + 1}: ${state}${isMilestone ? " (bonus)" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "12px 6px",
                borderRadius: "var(--radius)",
                border: isToday ? t.strongBorder : t.border,
                background: isDone ? "var(--accent)" : "var(--surface)",
                color: isDone ? "var(--accent-ink)" : "var(--ink)",
                opacity: state === "locked" ? 0.6 : 1,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: ".75rem", fontWeight: 700, color: isDone ? "var(--accent-ink)" : "var(--dim)" }}>
                Day {i + 1}
              </span>
              <span aria-hidden="true" style={{ fontSize: 26 }}>
                {isMilestone ? skin.hard.icon : skin.soft.icon}
              </span>
              <span aria-hidden="true" style={{ fontSize: 14 }}>
                {isDone ? "✓" : isToday ? "🎁" : "🔒"}
              </span>
            </li>
          );
        })}
      </ol>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {granted ? (
          <p role="status" style={{ margin: 0, fontWeight: 800, color: "var(--ok)" }}>
            You received {granted}
          </p>
        ) : null}
        <ActionButton
          full
          onClick={claim}
          disabled={claiming || claimedToday}
          ariaLabel={claimedToday ? "Already claimed today" : "Claim today's reward"}
        >
          {claiming ? "Claiming…" : claimedToday ? "Claimed today ✓" : "Claim today's reward"}
        </ActionButton>
      </div>
    </EconomyScreen>
  );
}

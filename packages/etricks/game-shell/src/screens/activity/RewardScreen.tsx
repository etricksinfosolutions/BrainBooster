import { type CSSProperties, type ReactNode } from "react";
import {
  useNavigation,
  useEconomy,
  useShellState,
  useAccessibility,
} from "../../runtime/context.js";

/**
 * RewardScreen ("reward") — presents the rewards granted this round and a Claim/Continue that returns
 * home. EVERY amount is authoritative: earned deltas arrive via nav params and current balances come
 * from `useEconomy()` (the server-owned wallet) — the shell never invents a number. Currency names come
 * from the economy skin, so this is fully game-neutral (no hardcoded currency names or icons).
 */

function readNumber(params: Readonly<Record<string, unknown>>, key: string): number | null {
  const v = params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function RewardScreen(): ReactNode {
  const { params, navigate } = useNavigation();
  const wallet = useEconomy();
  const skin = useShellState().economySkin;
  const a11y = useAccessibility();

  const rows = [
    {
      key: "soft",
      icon: skin.soft.icon,
      label: skin.soft.label,
      earned: readNumber(params, "coins"),
      balance: wallet.coins,
    },
    {
      key: "hard",
      icon: skin.hard.icon,
      label: skin.hard.label,
      earned: readNumber(params, "diamonds"),
      balance: wallet.diamonds,
    },
    {
      key: "xp",
      icon: skin.xp.icon,
      label: skin.xp.label,
      earned: readNumber(params, "xp"),
      balance: wallet.xp,
    },
  ];
  const granted = rows.filter((r) => r.earned != null && r.earned > 0);

  const button = (variant: "primary" | "ghost"): CSSProperties => ({
    width: "100%",
    maxWidth: 340,
    padding: a11y.bigButtons ? "18px 26px" : "14px 24px",
    minHeight: a11y.bigButtons ? 56 : 48,
    fontFamily: "var(--font)",
    fontSize: a11y.bigButtons ? "1.15rem" : "1.02rem",
    fontWeight: 700,
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: a11y.reducedMotion ? "none" : "filter .12s ease",
    border: variant === "primary" ? "none" : `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
    background: variant === "primary" ? "var(--accent)" : "var(--surface)",
    color: variant === "primary" ? "var(--accent-ink)" : "var(--ink)",
  });

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "clamp(20px, 6vw, 40px)",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font)",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div aria-hidden="true" style={{ fontSize: "2.8rem" }}>
        🎁
      </div>
      <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800 }}>Rewards</h1>

      {granted.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            width: "100%",
            maxWidth: 360,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {granted.map((r) => (
            <li
              key={r.key}
              aria-label={`Earned ${r.earned} ${r.label}. New balance ${r.balance}.`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                background: "var(--surface)",
                border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                <span aria-hidden="true" style={{ fontSize: "1.3rem" }}>
                  {r.icon}
                </span>
                {r.label}
              </span>
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                <strong style={{ color: "var(--ok)", fontSize: "1.1rem" }}>+{r.earned}</strong>
                <span style={{ color: "var(--dim)", fontSize: "0.85rem" }}>({r.balance})</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        // EMPTY state: no reward deltas were passed — still show the current wallet so the screen is
        // never blank, and never fabricate an award.
        <div style={{ color: "var(--dim)", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0 }}>No new rewards this time — keep playing to earn more!</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {rows.map((r) => (
              <span
                key={r.key}
                aria-label={`${r.balance} ${r.label}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "var(--surface)",
                  border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
                  color: "var(--ink)",
                  fontWeight: 700,
                }}
              >
                <span aria-hidden="true">{r.icon}</span> {r.balance}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        style={button("primary")}
        onClick={() => navigate("home")}
        aria-label="Claim rewards and continue"
      >
        Claim &amp; continue
      </button>
    </div>
  );
}

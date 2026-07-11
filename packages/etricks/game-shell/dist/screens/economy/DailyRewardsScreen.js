import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { useShell, usePorts, useShellState, useShellDispatch, useEconomy, } from "../../runtime/context.js";
import { EconomyScreen, Card, ActionButton, StateBlock, useUiTokens, useRewardFormat, asRecord, asNum, isTrue, } from "./_shared.js";
function parseStatus(v) {
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
export function DailyRewardsScreen() {
    const { config } = useShell();
    const ports = usePorts();
    const dispatch = useShellDispatch();
    const rewardsState = useShellState().rewards;
    const wallet = useEconomy();
    const skin = useShellState().economySkin;
    const t = useUiTokens();
    const fmtReward = useRewardFormat();
    const ladderDays = Math.max(1, config.shell?.dailyRewardDays ?? 7);
    const [phase, setPhase] = useState("loading");
    const [status, setStatus] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [granted, setGranted] = useState(null);
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
            if (!live)
                return;
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
        if (!ports.rewards || claiming || claimedToday)
            return;
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
        }
        catch {
            dispatch({
                type: "SET_ERROR",
                error: { fatal: false, kind: "recoverable", message: "Could not claim today's reward." },
            });
        }
        finally {
            setClaiming(false);
        }
    }, [ports.rewards, ports.economy, claiming, claimedToday, dispatch, fmtReward]);
    if (phase === "loading") {
        return (_jsx(EconomyScreen, { title: "Daily Rewards", hud: true, children: _jsx(StateBlock, { kind: "loading", message: "Loading your daily rewards\u2026" }) }));
    }
    if (phase === "error") {
        return (_jsx(EconomyScreen, { title: "Daily Rewards", hud: true, children: _jsx(StateBlock, { kind: "error", message: "Daily rewards are unavailable right now.", onRetry: () => load() }) }));
    }
    return (_jsxs(EconomyScreen, { title: "Daily Rewards", subtitle: `Day ${todayIndex + 1} of ${ladderDays}`, hud: true, children: [_jsxs(Card, { style: { marginBottom: 16 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 24 }, children: "🔥" }), _jsxs("strong", { style: { fontSize: `calc(1.1rem * ${t.fontScale})` }, children: [streak, " day", streak === 1 ? "" : "s", " streak"] })] }), _jsx("p", { style: { margin: 0, color: "var(--dim)" }, children: "Come back every day to keep your streak growing." })] }), _jsx("ol", { "aria-label": "Daily reward ladder", style: {
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
                    gap: 10,
                }, children: Array.from({ length: ladderDays }, (_, i) => {
                    const isDone = i < todayIndex || (i === todayIndex && claimedToday);
                    const isToday = i === todayIndex && !claimedToday;
                    const isMilestone = i === ladderDays - 1;
                    const state = isDone ? "claimed" : isToday ? "today" : "locked";
                    return (_jsxs("li", { "aria-label": `Day ${i + 1}: ${state}${isMilestone ? " (bonus)" : ""}`, style: {
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
                        }, children: [_jsxs("span", { style: { fontSize: ".75rem", fontWeight: 700, color: isDone ? "var(--accent-ink)" : "var(--dim)" }, children: ["Day ", i + 1] }), _jsx("span", { "aria-hidden": "true", style: { fontSize: 26 }, children: isMilestone ? skin.hard.icon : skin.soft.icon }), _jsx("span", { "aria-hidden": "true", style: { fontSize: 14 }, children: isDone ? "✓" : isToday ? "🎁" : "🔒" })] }, i));
                }) }), _jsxs("div", { style: { marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }, children: [granted ? (_jsxs("p", { role: "status", style: { margin: 0, fontWeight: 800, color: "var(--ok)" }, children: ["You received ", granted] })) : null, _jsx(ActionButton, { full: true, onClick: claim, disabled: claiming || claimedToday, ariaLabel: claimedToday ? "Already claimed today" : "Claim today's reward", children: claiming ? "Claiming…" : claimedToday ? "Claimed today ✓" : "Claim today's reward" })] })] }));
}
//# sourceMappingURL=DailyRewardsScreen.js.map
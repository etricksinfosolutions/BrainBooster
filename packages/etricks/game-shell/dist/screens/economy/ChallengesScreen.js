import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { usePorts } from "../../runtime/context.js";
import { EconomyScreen, StateBlock, useUiTokens, useRewardFormat, asRecord, asArray, asStr, asNum, isTrue, } from "./_shared.js";
function parseChallenges(v) {
    return asArray(v).map((raw, i) => {
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
export function ChallengesScreen() {
    const ports = usePorts();
    const t = useUiTokens();
    const fmtReward = useRewardFormat();
    const [phase, setPhase] = useState("loading");
    const [items, setItems] = useState([]);
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
            if (!live)
                return;
            setItems(parseChallenges(v));
            setPhase("ready");
        })
            .catch(() => live && setPhase("error"));
        return () => {
            live = false;
        };
    }, [ports.rewards]);
    useEffect(() => load(), [load]);
    let body;
    if (phase === "loading")
        body = _jsx(StateBlock, { kind: "loading", message: "Loading challenges\u2026" });
    else if (phase === "error")
        body = _jsx(StateBlock, { kind: "error", message: "Challenges are unavailable right now.", onRetry: () => load() });
    else if (items.length === 0)
        body = _jsx(StateBlock, { kind: "empty", message: "No active challenges right now \u2014 check back soon!" });
    else
        body = (_jsx("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }, children: items.map((c) => {
                const pct = c.goal && c.goal > 0 ? Math.min(1, Math.max(0, c.current / c.goal)) : c.completed ? 1 : 0;
                const rewardText = fmtReward(c.reward);
                return (_jsxs("li", { "aria-label": `${c.title}${c.completed ? " (completed)" : ""}`, style: {
                        padding: t.pad + 4,
                        borderRadius: "var(--radius)",
                        border: c.completed ? t.strongBorder : t.border,
                        background: "var(--surface)",
                    }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 30, flexShrink: 0 }, children: c.completed ? "✅" : c.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("strong", { style: { fontSize: `calc(1rem * ${t.fontScale})` }, children: c.title }), c.description ? (_jsx("p", { style: { margin: "2px 0 0", fontSize: ".85rem", color: "var(--dim)" }, children: c.description })) : null] }), rewardText ? (_jsx("span", { "aria-label": `Reward: ${rewardText}`, style: {
                                        flexShrink: 0,
                                        padding: "4px 10px",
                                        borderRadius: "var(--radius)",
                                        border: t.border,
                                        background: "var(--bg)",
                                        fontSize: ".85rem",
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                    }, children: rewardText })) : null] }), c.goal && c.goal > 0 ? (_jsxs("div", { style: { marginTop: 10 }, children: [_jsx("div", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": c.goal, "aria-valuenow": Math.min(c.current, c.goal), "aria-label": "Challenge progress", style: {
                                        height: 10,
                                        borderRadius: "var(--radius)",
                                        background: "var(--bg)",
                                        border: t.border,
                                        overflow: "hidden",
                                    }, children: _jsx("div", { style: {
                                            width: `${pct * 100}%`,
                                            height: "100%",
                                            background: c.completed ? "var(--ok)" : "var(--accent)",
                                            transition: t.transition,
                                        } }) }), _jsxs("span", { style: { display: "block", marginTop: 4, fontSize: ".78rem", color: "var(--dim)" }, children: [Math.min(c.current, c.goal), " / ", c.goal] })] })) : null] }, c.id));
            }) }));
    return (_jsx(EconomyScreen, { title: "Challenges", subtitle: "Complete goals to earn rewards", hud: true, children: body }));
}
//# sourceMappingURL=ChallengesScreen.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { usePorts } from "../../runtime/context.js";
import { EconomyScreen, StateBlock, useUiTokens, asRecord, asArray, asStr, asNum, isTrue, } from "./_shared.js";
function parseAchievements(v) {
    return asArray(v).map((raw, i) => {
        const r = asRecord(raw);
        const current = r ? asNum(r["current"]) : null;
        const goal = r ? asNum(r["goal"]) : null;
        const explicit = r ? asNum(r["progress"]) : null;
        const derived = explicit !== null
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
export function AchievementsScreen() {
    const ports = usePorts();
    const t = useUiTokens();
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
            .achievements()
            .then((v) => {
            if (!live)
                return;
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
    let body;
    if (phase === "loading")
        body = _jsx(StateBlock, { kind: "loading", message: "Loading achievements\u2026" });
    else if (phase === "error")
        body = _jsx(StateBlock, { kind: "error", message: "Achievements are unavailable right now.", onRetry: () => load() });
    else if (items.length === 0)
        body = _jsx(StateBlock, { kind: "empty", message: "No achievements yet \u2014 start playing to unlock them!" });
    else
        body = (_jsx("ul", { style: {
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 12,
            }, children: items.map((a) => (_jsxs("li", { "aria-label": `${a.title}: ${a.unlocked ? "unlocked" : "locked"}`, style: {
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
                }, children: [_jsx("span", { "aria-hidden": "true", style: {
                            fontSize: 40,
                            filter: a.unlocked ? "none" : "grayscale(1)",
                        }, children: a.unlocked ? a.icon : "🔒" }), _jsx("strong", { style: { fontSize: `calc(.95rem * ${t.fontScale})` }, children: a.title }), a.description ? (_jsx("span", { style: { fontSize: ".8rem", color: "var(--dim)" }, children: a.description })) : null, !a.unlocked && a.progress !== null ? (_jsx("div", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(a.progress * 100), "aria-label": "Progress", style: {
                            width: "100%",
                            height: 8,
                            borderRadius: "var(--radius)",
                            background: "var(--bg)",
                            border: t.border,
                            overflow: "hidden",
                        }, children: _jsx("div", { style: { width: `${a.progress * 100}%`, height: "100%", background: "var(--accent)" } }) })) : null] }, a.id))) }));
    return (_jsx(EconomyScreen, { title: "Achievements", subtitle: phase === "ready" && items.length > 0 ? `${unlockedCount} of ${items.length} unlocked` : null, children: body }));
}
//# sourceMappingURL=AchievementsScreen.js.map
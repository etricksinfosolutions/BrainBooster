import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { usePorts, useProfile } from "../../runtime/context.js";
import { EconomyScreen, StateBlock, useUiTokens, asRecord, asArray, asStr, asNum, } from "./_shared.js";
function parseEntries(v) {
    const rec = asRecord(v);
    // Accept either { entries: [...] } or a bare array.
    const rows = asArray(rec ? rec["entries"] : v);
    return rows.map((raw, i) => {
        const r = asRecord(raw);
        return {
            rank: (r ? asNum(r["rank"]) : null) ?? i + 1,
            playerId: (r ? asStr(r["playerId"]) : null) ?? `player-${i}`,
            displayName: (r ? asStr(r["displayName"]) ?? asStr(r["name"]) : null) ?? "Player",
            score: (r ? asNum(r["score"]) : null) ?? 0,
        };
    });
}
const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
export function LeaderboardScreen() {
    const ports = usePorts();
    const profile = useProfile();
    const t = useUiTokens();
    const [phase, setPhase] = useState("loading");
    const [entries, setEntries] = useState([]);
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
            if (!live)
                return;
            setEntries(parseEntries(v).sort((a, b) => a.rank - b.rank));
            setPhase("ready");
        })
            .catch(() => live && setPhase("error"));
        return () => {
            live = false;
        };
    }, [ports.leaderboard]);
    useEffect(() => load(), [load]);
    let body;
    if (phase === "loading")
        body = _jsx(StateBlock, { kind: "loading", message: "Loading the leaderboard\u2026" });
    else if (phase === "error")
        body = _jsx(StateBlock, { kind: "error", message: "The leaderboard is unavailable right now.", onRetry: () => load() });
    else if (entries.length === 0)
        body = _jsx(StateBlock, { kind: "empty", message: "No scores yet \u2014 be the first on the board!" });
    else
        body = (_jsx("ol", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }, children: entries.map((e) => {
                const isMe = profile?.playerId != null && e.playerId === profile.playerId;
                const medal = MEDAL[e.rank];
                return (_jsxs("li", { "aria-label": `Rank ${e.rank}, ${e.displayName}, ${e.score.toLocaleString()} points${isMe ? " (you)" : ""}`, "aria-current": isMe ? "true" : undefined, style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: t.pad,
                        borderRadius: "var(--radius)",
                        border: isMe ? t.strongBorder : t.border,
                        background: isMe ? "var(--accent)" : "var(--surface)",
                        color: isMe ? "var(--accent-ink)" : "var(--ink)",
                    }, children: [_jsx("span", { "aria-hidden": "true", style: {
                                width: 34,
                                textAlign: "center",
                                fontWeight: 800,
                                fontSize: medal ? 22 : `calc(1rem * ${t.fontScale})`,
                                flexShrink: 0,
                            }, children: medal ?? e.rank }), _jsxs("span", { style: {
                                flex: 1,
                                minWidth: 0,
                                fontWeight: isMe ? 800 : 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }, children: [e.displayName, isMe ? " (You)" : ""] }), _jsx("span", { style: { fontWeight: 800, flexShrink: 0 }, children: e.score.toLocaleString() })] }, e.playerId));
            }) }));
    return (_jsx(EconomyScreen, { title: "Leaderboard", subtitle: "Top players", children: body }));
}
//# sourceMappingURL=LeaderboardScreen.js.map
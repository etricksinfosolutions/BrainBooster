import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useNavigation, useShellState, useBranding, useAccessibility, useShell, } from "../../runtime/context.js";
/** Lets us set CSS custom properties inline without `any` (React CSSProperties has no index sig). */
function styled(s) {
    return s;
}
function asRecord(v) {
    return typeof v === "object" && v !== null ? v : {};
}
function asArray(v) {
    return Array.isArray(v) ? v : [];
}
function str(v) {
    return typeof v === "string" && v.length > 0 ? v : undefined;
}
function num(v) {
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function bool(v) {
    return typeof v === "boolean" ? v : undefined;
}
function parseWorld(u, index) {
    const o = asRecord(u);
    const id = str(o["id"]) ?? str(o["worldId"]);
    if (!id)
        return null;
    const levelsLen = asArray(o["levels"]).length;
    return {
        id,
        name: str(o["name"]) ?? str(o["title"]) ?? `World ${index + 1}`,
        icon: str(o["icon"]) ?? str(o["emoji"]) ?? null,
        accent: str(o["accent"]) ?? null,
        blurb: str(o["blurb"]) ?? str(o["description"]) ?? null,
        locked: bool(o["locked"]) ?? false,
        done: num(o["done"]) ?? num(o["levelsDone"]) ?? num(o["completed"]) ?? null,
        total: num(o["total"]) ?? num(o["levelsTotal"]) ?? (levelsLen > 0 ? levelsLen : null),
        raw: o,
    };
}
/** Pull the world list from params first (the navigation channel), then the game's supplied content. */
function useWorlds(params, fallback) {
    return useMemo(() => {
        const fromParams = asArray(params["worlds"]);
        const source = fromParams.length > 0 ? fromParams : fallback;
        return source.map(parseWorld).filter((w) => w !== null);
    }, [params, fallback]);
}
// -----------------------------------------------------------------------------------------------
export function WorldSelectScreen() {
    const { params, navigate, back } = useNavigation();
    const state = useShellState();
    const branding = useBranding();
    const a11y = useAccessibility();
    const { config } = useShell();
    const worlds = useWorlds(params, config.content?.worlds ?? []);
    const booting = state.session.status === "booting";
    const currentWorldId = state.progress.lastCheckpoint?.worldId ?? null;
    const explored = worlds.filter((w) => !w.locked).length;
    const noMotion = a11y.reducedMotion;
    const transition = noMotion ? "none" : "transform .15s ease, box-shadow .15s ease";
    const borderWidth = a11y.highContrast ? 2 : 1;
    const shell = {
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px clamp(12px, 4vw, 28px) 40px",
        background: "var(--bg)",
        color: "var(--ink)",
        font: "inherit",
        fontFamily: "var(--font)",
    };
    const header = {
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 2,
        paddingBottom: 8,
        background: "linear-gradient(var(--bg) 70%, transparent)",
    };
    return (_jsxs("div", { className: "screen world-select", style: shell, children: [_jsxs("div", { style: header, children: [_jsx("button", { type: "button", onClick: back, "aria-label": "Go back", style: backButtonStyle(a11y.bigButtons, borderWidth), children: "\u2190" }), _jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [_jsx("h1", { style: { fontSize: "clamp(1.15rem, 4vw, 1.5rem)", fontWeight: 800, margin: 0 }, children: "Choose a World" }), _jsx("p", { style: { margin: 0, color: "var(--dim)", fontSize: ".85rem" }, children: worlds.length > 0
                                    ? `${explored} of ${worlds.length} unlocked`
                                    : branding.displayName })] })] }), booting ? (_jsx(LoadingState, { count: 4 })) : worlds.length === 0 ? (_jsx(EmptyState, { mascotName: branding.mascot?.name ?? null, onHome: () => navigate("home") })) : (_jsx("ol", { "aria-label": "Adventure worlds", style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }, children: worlds.map((w, i) => (_jsx(WorldNode, { world: w, index: i, current: w.id === currentWorldId, connectTop: i > 0, connectBottom: i < worlds.length - 1, transition: transition, borderWidth: borderWidth, bigButtons: a11y.bigButtons, onSelect: () => navigate("level-select", { worldId: w.id, world: w.raw }) }, w.id))) }))] }));
}
// --- World node (a station on the map trail) ---------------------------------------------------
function WorldNode(props) {
    const { world: w, index, current, connectTop, connectBottom, transition, borderWidth, bigButtons } = props;
    const accent = w.accent ?? "var(--accent)";
    const locked = w.locked;
    const emblemSize = bigButtons ? 72 : 58;
    const pct = w.total && w.total > 0 && w.done != null
        ? Math.max(0, Math.min(100, Math.round((w.done / w.total) * 100)))
        : null;
    const rowStyle = styled({
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        gap: 14,
        paddingLeft: 4,
        "--w-accent": accent,
    });
    const emblem = {
        flex: "0 0 auto",
        width: emblemSize,
        height: emblemSize,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: emblemSize * 0.5,
        background: locked ? "var(--surface)" : "var(--w-accent)",
        color: locked ? "var(--dim)" : "var(--accent-ink)",
        border: `${borderWidth + 1}px solid var(--w-accent)`,
        boxShadow: current ? "0 0 0 4px color-mix(in srgb, var(--w-accent) 35%, transparent)" : "none",
        zIndex: 1,
    };
    const card = {
        flex: 1,
        minWidth: 0,
        textAlign: "left",
        border: `${borderWidth}px solid var(--line)`,
        borderLeft: `4px solid var(--w-accent)`,
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        color: "var(--ink)",
        padding: bigButtons ? "16px 18px" : "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.6 : 1,
        transition,
        font: "inherit",
    };
    const label = locked
        ? `${w.name}, locked`
        : `${w.name}${pct != null ? `, ${pct} percent complete` : ""}`;
    return (_jsxs("li", { style: rowStyle, children: [_jsx(Connector, { show: connectTop, half: "top", size: emblemSize }), _jsx(Connector, { show: connectBottom, half: "bottom", size: emblemSize }), _jsx("span", { style: emblem, "aria-hidden": "true", children: locked ? "🔒" : (w.icon ?? index + 1) }), _jsxs("button", { type: "button", onClick: props.onSelect, disabled: locked, "aria-disabled": locked, "aria-label": label, style: card, children: [_jsxs("span", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [_jsx("strong", { style: { fontSize: "1.05rem", fontWeight: 800 }, children: w.name }), current && !locked ? (_jsx("span", { style: pill(), "aria-hidden": "true", children: "Continue" })) : locked ? (_jsx("span", { style: { color: "var(--dim)", fontSize: ".8rem" }, children: "Locked" })) : null] }), w.blurb ? (_jsx("span", { style: { color: "var(--dim)", fontSize: ".85rem", lineHeight: 1.35 }, children: w.blurb })) : null, pct != null ? (_jsxs("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("span", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, "aria-label": `${w.name} progress`, style: {
                                    position: "relative",
                                    flex: 1,
                                    height: 8,
                                    borderRadius: 999,
                                    background: "var(--line)",
                                    overflow: "hidden",
                                }, children: _jsx("span", { style: styled({
                                        position: "absolute",
                                        inset: 0,
                                        width: `${pct}%`,
                                        borderRadius: 999,
                                        background: "var(--w-accent)",
                                        "--w-accent": accent,
                                    }) }) }), _jsxs("span", { style: { color: "var(--dim)", fontSize: ".78rem", whiteSpace: "nowrap" }, children: [w.done, "/", w.total] })] })) : null] })] }));
}
/** A short segment of the winding trail joining consecutive world emblems. */
function Connector({ show, half, size }) {
    if (!show)
        return null;
    return (_jsx("span", { "aria-hidden": "true", style: {
            position: "absolute",
            left: size / 2 + 4,
            transform: "translateX(-50%)",
            width: 4,
            borderRadius: 4,
            background: "var(--line)",
            top: half === "top" ? 0 : "50%",
            bottom: half === "bottom" ? 0 : "50%",
        } }));
}
// --- Shared bits -------------------------------------------------------------------------------
function pill() {
    return {
        fontSize: ".72rem",
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 999,
        background: "var(--accent)",
        color: "var(--accent-ink)",
        whiteSpace: "nowrap",
    };
}
function backButtonStyle(bigButtons, borderWidth) {
    const s = bigButtons ? 52 : 42;
    return {
        flex: "0 0 auto",
        width: s,
        height: s,
        borderRadius: "50%",
        border: `${borderWidth}px solid var(--line)`,
        background: "var(--surface)",
        color: "var(--ink)",
        fontSize: "1.2rem",
        cursor: "pointer",
        font: "inherit",
    };
}
function LoadingState({ count }) {
    return (_jsx("div", { "aria-busy": "true", "aria-label": "Loading worlds", style: { display: "flex", flexDirection: "column", gap: 14 }, children: Array.from({ length: count }, (_, i) => (_jsx("div", { style: {
                height: 84,
                borderRadius: "var(--radius)",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                opacity: 0.55,
            } }, i))) }));
}
function EmptyState({ mascotName, onHome }) {
    return (_jsxs("div", { role: "status", style: {
            margin: "auto",
            maxWidth: 360,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "32px 20px",
            border: "1px dashed var(--line)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
        }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 44 }, children: "\uD83D\uDDFA\uFE0F" }), _jsx("strong", { style: { fontSize: "1.1rem" }, children: "No worlds to explore yet" }), _jsx("p", { style: { margin: 0, color: "var(--dim)", fontSize: ".9rem" }, children: mascotName
                    ? `${mascotName} is still charting the map. Check back soon!`
                    : "New adventures are on the way. Check back soon!" }), _jsx("button", { type: "button", onClick: onHome, style: {
                    alignSelf: "center",
                    marginTop: 4,
                    padding: "10px 20px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    fontWeight: 700,
                    cursor: "pointer",
                    font: "inherit",
                }, children: "Back to home" })] }));
}
//# sourceMappingURL=WorldSelectScreen.js.map
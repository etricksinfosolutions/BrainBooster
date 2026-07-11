import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useEffect } from "react";
import { useNavigation, useShellState, useBranding, useAccessibility, } from "../../runtime/context.js";
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
function parseLevel(u, index) {
    const o = asRecord(u);
    const id = str(o["id"]) ?? str(o["levelId"]) ?? (num(o["id"]) != null ? String(o["id"]) : undefined);
    if (!id)
        return null;
    const starsRaw = num(o["stars"]);
    return {
        id,
        name: str(o["name"]) ?? str(o["title"]) ?? `Level ${index + 1}`,
        locked: bool(o["locked"]) ?? false,
        completed: bool(o["completed"]) ?? bool(o["done"]) ?? (starsRaw != null && starsRaw > 0),
        stars: starsRaw != null ? Math.max(0, Math.min(3, Math.round(starsRaw))) : null,
        checkpoint: bool(o["checkpoint"]) ?? bool(o["milestone"]) ?? bool(o["boss"]) ?? false,
        activities: asArray(o["activities"]),
    };
}
/** Levels come from `params.levels` or, when world-select forwarded the world, `params.world.levels`. */
function useLevels(params) {
    return useMemo(() => {
        const direct = asArray(params["levels"]);
        const fromWorld = asArray(asRecord(params["world"])["levels"]);
        const source = direct.length > 0 ? direct : fromWorld;
        return source.map(parseLevel).filter((l) => l !== null);
    }, [params]);
}
// --- Winding-trail geometry --------------------------------------------------------------------
const ROW_H = 92; // vertical spacing between nodes (px)
const PAD = 44; // top/bottom padding (px)
const AMP = 26; // horizontal swing of the path (% of width)
function segmentPath(a, b) {
    const my = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
}
// -----------------------------------------------------------------------------------------------
export function LevelSelectScreen() {
    const { params, navigate, back } = useNavigation();
    const state = useShellState();
    const branding = useBranding();
    const a11y = useAccessibility();
    const worldId = str(params["worldId"]) ?? null;
    const world = asRecord(params["world"]);
    const worldName = str(world["name"]) ?? str(world["title"]) ?? str(params["worldName"]) ?? null;
    const worldAccent = str(world["accent"]) ?? null;
    const levels = useLevels(params);
    const booting = state.session.status === "booting";
    // The last checkpoint the player left off at, used to flag the "current" node when this is its world.
    const checkpoint = state.progress.lastCheckpoint;
    const currentLevelId = checkpoint && checkpoint.worldId === worldId ? checkpoint.levelId : null;
    const noMotion = a11y.reducedMotion;
    const borderWidth = a11y.highContrast ? 2 : 1;
    const nodeSize = a11y.bigButtons ? 64 : 52;
    const doneCount = levels.filter((l) => l.completed).length;
    const pct = levels.length > 0 ? Math.round((doneCount / levels.length) * 100) : 0;
    // Geometry: node 1 at the top, winding down. Recompute only when the level set changes.
    const { height, nodes } = useMemo(() => {
        const h = PAD * 2 + levels.length * ROW_H;
        const ns = levels.map((level, index) => ({
            level,
            index,
            x: 50 + Math.sin(index * 0.9) * AMP,
            y: PAD + index * ROW_H + ROW_H / 2,
        }));
        return { height: h, nodes: ns };
    }, [levels]);
    const currentRef = useRef(null);
    useEffect(() => {
        currentRef.current?.scrollIntoView({ block: "center", behavior: noMotion ? "auto" : "smooth" });
    }, [noMotion, currentLevelId]);
    const accent = worldAccent ?? "var(--accent)";
    const shell = styled({
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font)",
        "--w-accent": accent,
    });
    const header = {
        position: "sticky",
        top: 0,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "16px clamp(12px, 4vw, 28px) 12px",
        background: "linear-gradient(var(--bg) 78%, transparent)",
    };
    // No world chosen — recover gracefully rather than render an empty trail.
    if (!worldId && levels.length === 0 && !booting) {
        return (_jsxs("div", { className: "screen level-select", style: shell, children: [_jsx("div", { style: header, children: _jsx(TopBar, { onBack: back, title: "Levels", a11y: a11y, borderWidth: borderWidth }) }), _jsx(NoWorldState, { onPick: () => navigate("world-select") })] }));
    }
    return (_jsxs("div", { className: "screen level-select", style: shell, children: [_jsxs("div", { style: header, children: [_jsx(TopBar, { onBack: back, title: worldName ?? "Levels", a11y: a11y, borderWidth: borderWidth }), levels.length > 0 ? (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("span", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, "aria-label": "World progress", style: { position: "relative", flex: 1, height: 10, borderRadius: 999, background: "var(--line)", overflow: "hidden" }, children: _jsx("span", { style: styled({
                                        position: "absolute",
                                        inset: 0,
                                        width: `${pct}%`,
                                        borderRadius: 999,
                                        background: "var(--w-accent)",
                                        "--w-accent": accent,
                                    }) }) }), _jsxs("span", { style: { color: "var(--dim)", fontSize: ".82rem", whiteSpace: "nowrap" }, children: [doneCount, "/", levels.length] })] })) : null] }), booting ? (_jsx(LoadingState, {})) : levels.length === 0 ? (_jsx(EmptyLevelsState, { worldName: worldName, mascotName: branding.mascot?.name ?? null, onBack: () => navigate("world-select") })) : (_jsx("div", { style: { flex: 1, overflowY: "auto", padding: "0 clamp(12px, 4vw, 28px) 40px" }, children: _jsxs("div", { style: { position: "relative", height, maxWidth: 520, margin: "0 auto" }, children: [_jsx("svg", { viewBox: `0 0 100 ${height}`, preserveAspectRatio: "none", "aria-hidden": "true", style: { position: "absolute", inset: 0, width: "100%", height: "100%" }, children: nodes.map((n, i) => {
                                if (i === 0)
                                    return null;
                                const prev = nodes[i - 1];
                                if (!prev)
                                    return null;
                                const reached = prev.level.completed;
                                return (_jsx("path", { d: segmentPath(prev, n), fill: "none", stroke: reached ? "var(--w-accent)" : "var(--line)", strokeWidth: 6, strokeLinecap: "round", strokeDasharray: reached ? undefined : "1 12", vectorEffect: "non-scaling-stroke" }, `seg-${n.level.id}`));
                            }) }), nodes.map((n) => (_jsx(LevelNode, { node: n, size: nodeSize, borderWidth: borderWidth, accent: accent, current: n.level.id === currentLevelId, noMotion: noMotion, buttonRef: n.level.id === currentLevelId ? currentRef : undefined, onSelect: () => navigate("activity", {
                                ...(worldId ? { worldId } : {}),
                                levelId: n.level.id,
                                activities: n.level.activities,
                            }) }, n.level.id)))] }) }))] }));
}
// --- Level node --------------------------------------------------------------------------------
function LevelNode(props) {
    const { node, size, borderWidth, accent, current, noMotion } = props;
    const l = node.level;
    const locked = l.locked;
    const wrap = styled({
        position: "absolute",
        left: `${node.x}%`,
        top: node.y,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        "--w-accent": accent,
    });
    const dim = props.node.level.checkpoint ? size * 1.18 : size;
    const button = {
        width: dim,
        height: dim,
        borderRadius: l.checkpoint ? "28%" : "50%",
        display: "grid",
        placeItems: "center",
        fontSize: dim * 0.4,
        fontWeight: 800,
        background: locked ? "var(--surface)" : l.completed ? "var(--w-accent)" : "var(--surface)",
        color: locked ? "var(--dim)" : l.completed ? "var(--accent-ink)" : "var(--ink)",
        border: `${borderWidth + 1}px solid ${locked ? "var(--line)" : "var(--w-accent)"}`,
        boxShadow: current ? "0 0 0 5px color-mix(in srgb, var(--w-accent) 35%, transparent)" : "none",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.65 : 1,
        transition: noMotion ? "none" : "transform .12s ease",
        font: "inherit",
        position: "relative",
    };
    const face = locked ? "🔒" : l.checkpoint ? "🚩" : node.index + 1;
    const label = locked
        ? `${l.name}, locked`
        : `${l.name}${l.checkpoint ? ", checkpoint" : ""}${l.stars != null ? `, ${l.stars} of 3 stars` : ""}`;
    return (_jsxs("div", { style: wrap, children: [_jsx("button", { type: "button", ref: props.buttonRef, onClick: props.onSelect, disabled: locked, "aria-disabled": locked, "aria-current": current ? "step" : undefined, "aria-label": label, style: button, children: face }), !locked && l.stars != null ? (_jsx("span", { "aria-hidden": "true", style: { display: "flex", gap: 1, fontSize: ".68rem", lineHeight: 1 }, children: [1, 2, 3].map((i) => (_jsx("span", { style: { color: i <= (l.stars ?? 0) ? "var(--w-accent)" : "var(--line)" }, children: "\u2605" }, i))) })) : null, _jsx("span", { style: {
                    maxWidth: 96,
                    textAlign: "center",
                    fontSize: ".72rem",
                    color: locked ? "var(--dim)" : "var(--ink)",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }, children: l.name })] }));
}
// --- Chrome + states ---------------------------------------------------------------------------
function TopBar(props) {
    const s = props.a11y.bigButtons ? 52 : 42;
    return (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsx("button", { type: "button", onClick: props.onBack, "aria-label": "Go back", style: {
                    flex: "0 0 auto",
                    width: s,
                    height: s,
                    borderRadius: "50%",
                    border: `${props.borderWidth}px solid var(--line)`,
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    font: "inherit",
                }, children: "\u2190" }), _jsx("h1", { style: { margin: 0, fontSize: "clamp(1.15rem, 4vw, 1.5rem)", fontWeight: 800 }, children: props.title })] }));
}
function LoadingState() {
    return (_jsx("div", { "aria-busy": "true", "aria-label": "Loading levels", style: { flex: 1, display: "grid", placeItems: "center", padding: 40 }, children: _jsx("div", { style: {
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "4px solid var(--line)",
                borderTopColor: "var(--accent)",
                animation: "none",
            } }) }));
}
function panel() {
    return {
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
    };
}
function primaryBtn() {
    return {
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
    };
}
function NoWorldState({ onPick }) {
    return (_jsx("div", { style: { flex: 1, display: "grid", placeItems: "center", padding: 20 }, children: _jsxs("div", { role: "status", style: panel(), children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 44 }, children: "\uD83E\uDDED" }), _jsx("strong", { style: { fontSize: "1.1rem" }, children: "Pick a world first" }), _jsx("p", { style: { margin: 0, color: "var(--dim)", fontSize: ".9rem" }, children: "Choose a world from the adventure map to see its levels." }), _jsx("button", { type: "button", onClick: onPick, style: primaryBtn(), children: "Choose a world" })] }) }));
}
function EmptyLevelsState({ worldName, mascotName, onBack, }) {
    return (_jsx("div", { style: { flex: 1, display: "grid", placeItems: "center", padding: 20 }, children: _jsxs("div", { role: "status", style: panel(), children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 44 }, children: "\uD83D\uDEA7" }), _jsx("strong", { style: { fontSize: "1.1rem" }, children: worldName ? `${worldName} has no levels yet` : "No levels yet" }), _jsx("p", { style: { margin: 0, color: "var(--dim)", fontSize: ".9rem" }, children: mascotName
                        ? `${mascotName} is still building this world. Try another one!`
                        : "This world is still being built. Try another one!" }), _jsx("button", { type: "button", onClick: onBack, style: primaryBtn(), children: "Back to worlds" })] }) }));
}
//# sourceMappingURL=LevelSelectScreen.js.map
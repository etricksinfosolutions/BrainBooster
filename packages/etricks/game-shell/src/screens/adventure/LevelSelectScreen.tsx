import { type ReactNode, type CSSProperties, type RefObject, useMemo, useRef, useEffect } from "react";
import {
  useNavigation,
  useShellState,
  useBranding,
  useAccessibility,
} from "../../runtime/context.js";

/**
 * LevelSelectScreen ("level-select") — the levels within the selected world.
 *
 * Game-NEUTRAL: reads `params.worldId` and the world's level list from opaque navigation params (or a
 * future state slice) — never a hardcoded world. It draws a winding completion path with
 * checkpoints and a progress bar; picking an unlocked level routes to `activity` with
 * `{ worldId, levelId }`. Locked levels are non-interactive and announced as such. Neutral placeholders
 * fill in for any missing names.
 *
 * Ported from the reference web app's level-map trail and generalised per the de-branding rules:
 * every colour is a CSS custom property, every label comes from data.
 */

// --- Neutral level model -----------------------------------------------------------------------

interface AdventureLevel {
  id: string;
  name: string;
  locked: boolean;
  completed: boolean;
  /** 0..3 stars earned (optional). */
  stars: number | null;
  /** A milestone/boss node the path pauses at. */
  checkpoint: boolean;
  /** The level's playable activities, forwarded opaquely to the activity host. */
  activities: unknown[];
}

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;
function styled(s: StyleVars): CSSProperties {
  return s;
}

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function bool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function parseLevel(u: unknown, index: number): AdventureLevel | null {
  const o = asRecord(u);
  const id = str(o["id"]) ?? str(o["levelId"]) ?? (num(o["id"]) != null ? String(o["id"]) : undefined);
  if (!id) return null;
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
function useLevels(params: Readonly<Record<string, unknown>>): AdventureLevel[] {
  return useMemo(() => {
    const direct = asArray(params["levels"]);
    const fromWorld = asArray(asRecord(params["world"])["levels"]);
    const source = direct.length > 0 ? direct : fromWorld;
    return source.map(parseLevel).filter((l): l is AdventureLevel => l !== null);
  }, [params]);
}

// --- Winding-trail geometry --------------------------------------------------------------------

const ROW_H = 92; // vertical spacing between nodes (px)
const PAD = 44; // top/bottom padding (px)
const AMP = 26; // horizontal swing of the path (% of width)

interface TrailNode {
  level: AdventureLevel;
  index: number;
  x: number; // % from left
  y: number; // px from top
}

function segmentPath(a: TrailNode, b: TrailNode): string {
  const my = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
}

// -----------------------------------------------------------------------------------------------

export function LevelSelectScreen(): ReactNode {
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
    const ns: TrailNode[] = levels.map((level, index) => ({
      level,
      index,
      x: 50 + Math.sin(index * 0.9) * AMP,
      y: PAD + index * ROW_H + ROW_H / 2,
    }));
    return { height: h, nodes: ns };
  }, [levels]);

  const currentRef = useRef<HTMLButtonElement>(null);
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

  const header: CSSProperties = {
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
    return (
      <div className="screen level-select" style={shell}>
        <div style={header}>
          <TopBar onBack={back} title="Levels" a11y={a11y} borderWidth={borderWidth} />
        </div>
        <NoWorldState onPick={() => navigate("world-select")} />
      </div>
    );
  }

  return (
    <div className="screen level-select" style={shell}>
      <div style={header}>
        <TopBar
          onBack={back}
          title={worldName ?? "Levels"}
          a11y={a11y}
          borderWidth={borderWidth}
        />
        {levels.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label="World progress"
              style={{ position: "relative", flex: 1, height: 10, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}
            >
              <span
                style={styled({
                  position: "absolute",
                  inset: 0,
                  width: `${pct}%`,
                  borderRadius: 999,
                  background: "var(--w-accent)",
                  "--w-accent": accent,
                })}
              />
            </span>
            <span style={{ color: "var(--dim)", fontSize: ".82rem", whiteSpace: "nowrap" }}>
              {doneCount}/{levels.length}
            </span>
          </div>
        ) : null}
      </div>

      {booting ? (
        <LoadingState />
      ) : levels.length === 0 ? (
        <EmptyLevelsState
          worldName={worldName}
          mascotName={branding.mascot?.name ?? null}
          onBack={() => navigate("world-select")}
        />
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "0 clamp(12px, 4vw, 28px) 40px" }}>
          <div style={{ position: "relative", height, maxWidth: 520, margin: "0 auto" }}>
            {/* completion path: each segment coloured by whether the child has reached it */}
            <svg
              viewBox={`0 0 100 ${height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              {nodes.map((n, i) => {
                if (i === 0) return null;
                const prev = nodes[i - 1];
                if (!prev) return null;
                const reached = prev.level.completed;
                return (
                  <path
                    key={`seg-${n.level.id}`}
                    d={segmentPath(prev, n)}
                    fill="none"
                    stroke={reached ? "var(--w-accent)" : "var(--line)"}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={reached ? undefined : "1 12"}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {/* level nodes */}
            {nodes.map((n) => (
              <LevelNode
                key={n.level.id}
                node={n}
                size={nodeSize}
                borderWidth={borderWidth}
                accent={accent}
                current={n.level.id === currentLevelId}
                noMotion={noMotion}
                buttonRef={n.level.id === currentLevelId ? currentRef : undefined}
                onSelect={() =>
                  navigate("activity", {
                    ...(worldId ? { worldId } : {}),
                    levelId: n.level.id,
                    activities: n.level.activities,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Level node --------------------------------------------------------------------------------

function LevelNode(props: {
  node: TrailNode;
  size: number;
  borderWidth: number;
  accent: string;
  current: boolean;
  noMotion: boolean;
  buttonRef?: RefObject<HTMLButtonElement>;
  onSelect: () => void;
}): ReactNode {
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

  const button: CSSProperties = {
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

  return (
    <div style={wrap}>
      <button
        type="button"
        ref={props.buttonRef}
        onClick={props.onSelect}
        disabled={locked}
        aria-disabled={locked}
        aria-current={current ? "step" : undefined}
        aria-label={label}
        style={button}
      >
        {face}
      </button>

      {!locked && l.stars != null ? (
        <span aria-hidden="true" style={{ display: "flex", gap: 1, fontSize: ".68rem", lineHeight: 1 }}>
          {[1, 2, 3].map((i) => (
            <span key={i} style={{ color: i <= (l.stars ?? 0) ? "var(--w-accent)" : "var(--line)" }}>
              ★
            </span>
          ))}
        </span>
      ) : null}

      <span
        style={{
          maxWidth: 96,
          textAlign: "center",
          fontSize: ".72rem",
          color: locked ? "var(--dim)" : "var(--ink)",
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {l.name}
      </span>
    </div>
  );
}

// --- Chrome + states ---------------------------------------------------------------------------

function TopBar(props: {
  onBack: () => void;
  title: string;
  a11y: { bigButtons: boolean };
  borderWidth: number;
}): ReactNode {
  const s = props.a11y.bigButtons ? 52 : 42;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        onClick={props.onBack}
        aria-label="Go back"
        style={{
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
        }}
      >
        ←
      </button>
      <h1 style={{ margin: 0, fontSize: "clamp(1.15rem, 4vw, 1.5rem)", fontWeight: 800 }}>{props.title}</h1>
    </div>
  );
}

function LoadingState(): ReactNode {
  return (
    <div
      aria-busy="true"
      aria-label="Loading levels"
      style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "4px solid var(--line)",
          borderTopColor: "var(--accent)",
          animation: "none",
        }}
      />
    </div>
  );
}

function panel(): CSSProperties {
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

function primaryBtn(): CSSProperties {
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

function NoWorldState({ onPick }: { onPick: () => void }): ReactNode {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 20 }}>
      <div role="status" style={panel()}>
        <span aria-hidden="true" style={{ fontSize: 44 }}>
          🧭
        </span>
        <strong style={{ fontSize: "1.1rem" }}>Pick a world first</strong>
        <p style={{ margin: 0, color: "var(--dim)", fontSize: ".9rem" }}>
          Choose a world from the adventure map to see its levels.
        </p>
        <button type="button" onClick={onPick} style={primaryBtn()}>
          Choose a world
        </button>
      </div>
    </div>
  );
}

function EmptyLevelsState({
  worldName,
  mascotName,
  onBack,
}: {
  worldName: string | null;
  mascotName: string | null;
  onBack: () => void;
}): ReactNode {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 20 }}>
      <div role="status" style={panel()}>
        <span aria-hidden="true" style={{ fontSize: 44 }}>
          🚧
        </span>
        <strong style={{ fontSize: "1.1rem" }}>
          {worldName ? `${worldName} has no levels yet` : "No levels yet"}
        </strong>
        <p style={{ margin: 0, color: "var(--dim)", fontSize: ".9rem" }}>
          {mascotName
            ? `${mascotName} is still building this world. Try another one!`
            : "This world is still being built. Try another one!"}
        </p>
        <button type="button" onClick={onBack} style={primaryBtn()}>
          Back to worlds
        </button>
      </div>
    </div>
  );
}

import { type ReactNode, type CSSProperties, useMemo } from "react";
import {
  useNavigation,
  useShellState,
  useBranding,
  useAccessibility,
  useShell,
} from "../../runtime/context.js";

/**
 * WorldSelectScreen ("world-select") — the adventure map of worlds.
 *
 * Game-NEUTRAL: it renders whatever world data the game supplies through navigation params (or a
 * future state slice), never a hardcoded catalogue. Each world shows a lock/unlock state and a
 * progress indicator; picking an unlocked world routes to `level-select` with `{ worldId }`. When no
 * worlds are supplied it renders a graceful empty state so a partially-built game still navigates.
 *
 * Ported from the reference web app's level-map trail — the winding-trail + region-band feel — then
 * generalised: no world names, mascots, or brand colours are baked in; every value is data-driven and
 * every colour comes from CSS custom properties the shell sets on :root.
 */

// --- Neutral world model (parsed defensively from opaque params) -------------------------------

interface AdventureWorld {
  id: string;
  name: string;
  /** Emoji/glyph emblem for the world (optional; a neutral marker is shown when absent). */
  icon: string | null;
  /** Per-world accent colour (optional; falls back to the theme accent). */
  accent: string | null;
  blurb: string | null;
  locked: boolean;
  /** Progress: how many of this world's levels are done, and the total (both optional). */
  done: number | null;
  total: number | null;
  /** The raw descriptor, forwarded to level-select so it can read the world's levels. */
  raw: Record<string, unknown>;
}

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;
/** Lets us set CSS custom properties inline without `any` (React CSSProperties has no index sig). */
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

function parseWorld(u: unknown, index: number): AdventureWorld | null {
  const o = asRecord(u);
  const id = str(o["id"]) ?? str(o["worldId"]);
  if (!id) return null;
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
function useWorlds(params: Readonly<Record<string, unknown>>, fallback: unknown[]): AdventureWorld[] {
  return useMemo(() => {
    const fromParams = asArray(params["worlds"]);
    const source = fromParams.length > 0 ? fromParams : fallback;
    return source.map(parseWorld).filter((w): w is AdventureWorld => w !== null);
  }, [params, fallback]);
}

// -----------------------------------------------------------------------------------------------

export function WorldSelectScreen(): ReactNode {
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

  const shell: CSSProperties = {
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

  const header: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    position: "sticky",
    top: 0,
    zIndex: 2,
    paddingBottom: 8,
    background: "linear-gradient(var(--bg) 70%, transparent)",
  };

  return (
    <div className="screen world-select" style={shell}>
      <div style={header}>
        <button
          type="button"
          onClick={back}
          aria-label="Go back"
          style={backButtonStyle(a11y.bigButtons, borderWidth)}
        >
          ←
        </button>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "clamp(1.15rem, 4vw, 1.5rem)", fontWeight: 800, margin: 0 }}>
            Choose a World
          </h1>
          <p style={{ margin: 0, color: "var(--dim)", fontSize: ".85rem" }}>
            {worlds.length > 0
              ? `${explored} of ${worlds.length} unlocked`
              : branding.displayName}
          </p>
        </div>
      </div>

      {booting ? (
        <LoadingState count={4} />
      ) : worlds.length === 0 ? (
        <EmptyState mascotName={branding.mascot?.name ?? null} onHome={() => navigate("home")} />
      ) : (
        <ol
          aria-label="Adventure worlds"
          style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}
        >
          {worlds.map((w, i) => (
            <WorldNode
              key={w.id}
              world={w}
              index={i}
              current={w.id === currentWorldId}
              connectTop={i > 0}
              connectBottom={i < worlds.length - 1}
              transition={transition}
              borderWidth={borderWidth}
              bigButtons={a11y.bigButtons}
              onSelect={() => navigate("level-select", { worldId: w.id, world: w.raw })}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

// --- World node (a station on the map trail) ---------------------------------------------------

function WorldNode(props: {
  world: AdventureWorld;
  index: number;
  current: boolean;
  connectTop: boolean;
  connectBottom: boolean;
  transition: string;
  borderWidth: number;
  bigButtons: boolean;
  onSelect: () => void;
}): ReactNode {
  const { world: w, index, current, connectTop, connectBottom, transition, borderWidth, bigButtons } =
    props;
  const accent = w.accent ?? "var(--accent)";
  const locked = w.locked;
  const emblemSize = bigButtons ? 72 : 58;

  const pct =
    w.total && w.total > 0 && w.done != null
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

  const emblem: CSSProperties = {
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

  const card: CSSProperties = {
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

  return (
    <li style={rowStyle}>
      {/* trail connectors behind the emblem */}
      <Connector show={connectTop} half="top" size={emblemSize} />
      <Connector show={connectBottom} half="bottom" size={emblemSize} />

      <span style={emblem} aria-hidden="true">
        {locked ? "🔒" : (w.icon ?? index + 1)}
      </span>

      <button
        type="button"
        onClick={props.onSelect}
        disabled={locked}
        aria-disabled={locked}
        aria-label={label}
        style={card}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <strong style={{ fontSize: "1.05rem", fontWeight: 800 }}>{w.name}</strong>
          {current && !locked ? (
            <span style={pill()} aria-hidden="true">
              Continue
            </span>
          ) : locked ? (
            <span style={{ color: "var(--dim)", fontSize: ".8rem" }}>Locked</span>
          ) : null}
        </span>

        {w.blurb ? (
          <span style={{ color: "var(--dim)", fontSize: ".85rem", lineHeight: 1.35 }}>{w.blurb}</span>
        ) : null}

        {pct != null ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={`${w.name} progress`}
              style={{
                position: "relative",
                flex: 1,
                height: 8,
                borderRadius: 999,
                background: "var(--line)",
                overflow: "hidden",
              }}
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
            <span style={{ color: "var(--dim)", fontSize: ".78rem", whiteSpace: "nowrap" }}>
              {w.done}/{w.total}
            </span>
          </span>
        ) : null}
      </button>
    </li>
  );
}

/** A short segment of the winding trail joining consecutive world emblems. */
function Connector({ show, half, size }: { show: boolean; half: "top" | "bottom"; size: number }): ReactNode {
  if (!show) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        left: size / 2 + 4,
        transform: "translateX(-50%)",
        width: 4,
        borderRadius: 4,
        background: "var(--line)",
        top: half === "top" ? 0 : "50%",
        bottom: half === "bottom" ? 0 : "50%",
      }}
    />
  );
}

// --- Shared bits -------------------------------------------------------------------------------

function pill(): CSSProperties {
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

function backButtonStyle(bigButtons: boolean, borderWidth: number): CSSProperties {
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

function LoadingState({ count }: { count: number }): ReactNode {
  return (
    <div aria-busy="true" aria-label="Loading worlds" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            height: 84,
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({ mascotName, onHome }: { mascotName: string | null; onHome: () => void }): ReactNode {
  return (
    <div
      role="status"
      style={{
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
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 44 }}>
        🗺️
      </span>
      <strong style={{ fontSize: "1.1rem" }}>No worlds to explore yet</strong>
      <p style={{ margin: 0, color: "var(--dim)", fontSize: ".9rem" }}>
        {mascotName
          ? `${mascotName} is still charting the map. Check back soon!`
          : "New adventures are on the way. Check back soon!"}
      </p>
      <button
        type="button"
        onClick={onHome}
        style={{
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
        }}
      >
        Back to home
      </button>
    </div>
  );
}

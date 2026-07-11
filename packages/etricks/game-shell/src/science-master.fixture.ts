import { defineGame } from "@etricks/game-definition";
import { SCREENS } from "./screens.js";
import { defineGameShell, type GameShellConfig } from "./shell-config.js";

/**
 * Science Master — the Wave 2 validation fixture.
 *
 * It is a COMPLETE, publishable game expressed as nothing but configuration: a cyan/teal laboratory
 * theme, the guide "Atom", and its own currency names — handed to the exact same game-shell that runs
 * every other game, with ZERO new UI. This is the Golden Rule made concrete: a second premium product
 * that differs from the reference game only by this declarative config. The theme + branding tokens
 * mirror the canonical Science Master identity pinned by `identity.test.ts`; the currency skin lives on
 * the shell manifest (the server owns the amounts — this only names them).
 */

/** Identity + laboratory theme + branding (mascot "Atom"). A minimal, valid `GameDefinition`. */
const scienceMasterDefinition = defineGame({
  definitionVersion: 1,
  id: "science-master",
  title: "Science Master",
  engines: ["activity"],
  locales: ["en"],
  progression: { mode: "levels", levels: 3 },
  theme: {
    palette: {
      bg: "#eaf6fd",
      surface: "#ffffff",
      ink: "#0b3a52",
      dim: "#4f7c93",
      accent: "#1189d1",
      accentInk: "#ffffff",
      ok: "#12b886",
      bad: "#e5484d",
      line: "#cbe6f6",
    },
    cornerRadius: 18,
    motion: "energetic",
    artStyle: "laboratory",
    soundTheme: "sci-fi",
  },
  branding: {
    displayName: "Science Master",
    tagline: "Discover how the world works, one experiment at a time.",
    appId: "com.etricks.sciencemaster",
    mascot: {
      name: "Atom",
      promptSeed: "friendly round science robot with antenna, cyan glow",
    },
  },
});

/**
 * The declarative shell manifest: it enables the full default screen set and skins the currencies —
 * soft "Spark", hard "Crystal", progression "Insight". Everything else keeps the safe premium baseline.
 */
const scienceMasterManifest = defineGameShell({
  enabledScreens: [...SCREENS],
  economy: {
    soft: { label: "Spark", icon: "✨" },
    hard: { label: "Crystal", icon: "💠" },
    xp: { label: "Insight", icon: "🧠" },
    showStreak: true,
  },
});

/** Everything `mountGame` needs to run Science Master — definition + manifest, no code, no ports. */
export const scienceMasterConfig: GameShellConfig = {
  definition: scienceMasterDefinition,
  shell: scienceMasterManifest,
};

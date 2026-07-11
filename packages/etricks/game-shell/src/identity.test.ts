import { test } from "node:test";
import assert from "node:assert/strict";
import { defineGame } from "@etricks/game-definition";
import { resolveGameIdentity } from "./identity.js";
import { DEFAULT_THEME } from "./theme.js";
import { DEFAULT_ECONOMY } from "./economy.js";
import { defineGameShell } from "./shell-config.js";

/**
 * The identity resolver is the shell's single entry point for "how does this game look and read?".
 * These tests pin two things: a bare game falls back to neutral defaults (nothing Brain-Booster leaks
 * in), and a second, fully distinct game identity — Science Master's laboratory/cyan look — resolves
 * purely from config and is visibly different from the neutral default. That distinctness is the proof
 * of the Golden Rule: no shell code changed, only the game's declarative definition.
 */

/** A minimal, valid game with no theme/branding — should resolve entirely to defaults. */
const bareGame = defineGame({
  definitionVersion: 1,
  id: "bare-game",
  title: "Bare Game",
  engines: ["activity"],
  locales: ["en"],
  progression: { mode: "endless" },
});

/**
 * An inline equivalent of the Science Master identity (theme + branding). Reconstructed here rather
 * than imported across the package boundary to keep the shell package self-contained, but it mirrors
 * exactly the tokens declared in games/science-master/src/game.ts.
 */
const scienceMasterLike = defineGame({
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

test("resolveGameIdentity on a bare game gives neutral defaults", () => {
  const id = resolveGameIdentity(bareGame);
  assert.deepEqual(id.theme, DEFAULT_THEME);
  assert.deepEqual(id.economy, DEFAULT_ECONOMY);
  // Branding falls back to the definition's title, with no mascot.
  assert.equal(id.branding.displayName, "Bare Game");
  assert.equal(id.branding.mascot, null);
  assert.equal(id.branding.appId, null);
  // The resolved identity carries the original definition through unchanged.
  assert.equal(id.definition, bareGame);
});

test("economy is skinned from the shell manifest, not the definition", () => {
  const manifest = defineGameShell({
    economy: { soft: { label: "Star Dust", icon: "✨" }, showStreak: true },
  });
  const id = resolveGameIdentity(bareGame, manifest);
  assert.equal(id.economy.soft.label, "Star Dust");
  assert.equal(id.economy.soft.icon, "✨");
  // Unspecified currencies still fall back to neutral defaults.
  assert.deepEqual(id.economy.hard, DEFAULT_ECONOMY.hard);
});

test("Science Master resolves to a distinct cyan laboratory identity with mascot Atom", () => {
  const id = resolveGameIdentity(scienceMasterLike);
  assert.equal(id.theme.accent, "#1189d1");
  assert.equal(id.theme.artStyle, "laboratory");
  assert.equal(id.theme.soundTheme, "sci-fi");
  assert.equal(id.theme.motion, "energetic");
  assert.equal(id.branding.displayName, "Science Master");
  assert.equal(id.branding.appId, "com.etricks.sciencemaster");
  assert.equal(id.branding.mascot?.name, "Atom");
  assert.match(id.branding.mascot?.promptSeed ?? "", /robot/);
});

test("Science Master's theme is DISTINCT from the neutral default", () => {
  const id = resolveGameIdentity(scienceMasterLike);
  assert.notDeepEqual(id.theme, DEFAULT_THEME);
  assert.notEqual(id.theme.accent, DEFAULT_THEME.accent);
  assert.notEqual(id.theme.bg, DEFAULT_THEME.bg);
});

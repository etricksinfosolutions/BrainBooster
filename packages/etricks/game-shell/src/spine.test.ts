import { test } from "node:test";
import assert from "node:assert/strict";
import { defineGame } from "@etricks/game-definition";
import { resolveTheme, DEFAULT_THEME, themeVars } from "./theme.js";
import { resolveEconomy, DEFAULT_ECONOMY } from "./economy.js";
import { resolveBranding } from "./branding.js";
import { defineGameShell } from "./shell-config.js";

// A bare game — no theme, no branding, no economy — must still resolve to a finished, NEUTRAL
// identity. Nothing Brain-Booster-specific may leak into the defaults (Golden Rule).
const bareGame = defineGame({
  definitionVersion: 1,
  id: "bare",
  title: "Bare Game",
  engines: ["activity"],
  locales: ["en"],
  progression: { mode: "levels", levels: 1 },
});

test("a bare game resolves to safe neutral defaults, with no Brain Booster leakage", () => {
  const theme = resolveTheme(bareGame.theme);
  const econ = resolveEconomy();
  const branding = resolveBranding(bareGame);
  assert.deepEqual(theme, DEFAULT_THEME);
  assert.deepEqual(econ, DEFAULT_ECONOMY);
  assert.equal(branding.displayName, "Bare Game"); // falls back to definition.title, not a placeholder
  assert.equal(branding.mascot, null);
  const blob = JSON.stringify({ theme, econ, branding }).toLowerCase();
  assert.ok(!blob.includes("brain"), "no default may mention Brain Booster");
  assert.ok(!blob.includes("tigo"), "no default may mention Tigo the mascot");
});

// The core Phase-1 claim: Brain Booster's identity is expressible as PURE CONFIG — theme tokens,
// branding, and economy labels — with no code. This is the shape apps/web will hand to the shell.
const brainBooster = defineGame({
  definitionVersion: 1,
  id: "brain-booster",
  title: "Brain Booster Kids",
  engines: ["activity"],
  locales: ["en"],
  progression: { mode: "levels", levels: 3 },
  theme: {
    palette: {
      bg: "#f2f0fa",
      surface: "#ffffff",
      ink: "#2b2350",
      dim: "#6f639a",
      accent: "#7a5cc8",
      accentInk: "#ffffff",
    },
    motion: "playful",
    artStyle: "storybook",
    soundTheme: "adventure",
  },
  branding: {
    displayName: "Brain Booster Kids",
    tagline: "Learn while you play!",
    appId: "com.etricks.brainbooster",
    mascot: { name: "Tigo", promptSeed: "friendly orange tiger cub, rounded, waving" },
  },
});

test("Brain Booster's identity round-trips through the shell as pure config", () => {
  const theme = resolveTheme(brainBooster.theme);
  assert.equal(theme.accent, "#7a5cc8");
  assert.equal(theme.motion, "playful");
  assert.equal(theme.artStyle, "storybook");

  const branding = resolveBranding(brainBooster);
  assert.equal(branding.displayName, "Brain Booster Kids");
  assert.equal(branding.mascot?.name, "Tigo");

  // Its currencies are named via config ("Brain Coins"), never hardcoded in a screen.
  const shell = defineGameShell({ economy: { soft: { label: "Brain Coin", icon: "🪙" } } });
  const econ = resolveEconomy(shell.economy);
  assert.equal(econ.soft.label, "Brain Coin");
  assert.equal(econ.hard.label, DEFAULT_ECONOMY.hard.label); // unspecified currency keeps the default
});

test("themeVars flattens a resolved theme into CSS custom properties screens read", () => {
  const vars = themeVars(resolveTheme(brainBooster.theme));
  assert.equal(vars["--accent"], "#7a5cc8");
  assert.equal(vars["--radius"], "20px");
  assert.ok(vars["--font"].length > 0);
});

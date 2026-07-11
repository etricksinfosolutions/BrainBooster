import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS, Screen, LAUNCH_FLOW } from "./screens.js";
import { defineGameShell, GameShellManifest } from "./shell-config.js";
import { mountGame } from "./mount.js";

test("the screen set covers the mandatory launch flow and never skips to activity", () => {
  // Every launch-flow screen is a real, known screen...
  for (const s of LAUNCH_FLOW) assert.ok(SCREENS.includes(s), `${s} is a known screen`);
  // ...and the flow ends at home, not directly at an activity (ADR-0027 mandatory principle).
  assert.equal(LAUNCH_FLOW[LAUNCH_FLOW.length - 1], "home");
  assert.notEqual(LAUNCH_FLOW[0], "activity");
  assert.ok(SCREENS.includes("activity"));
});

test("Screen enum accepts known screens and rejects unknown ones", () => {
  assert.equal(Screen.parse("shop"), "shop");
  assert.throws(() => Screen.parse("nonsense"));
});

test("shell manifest applies a safe premium baseline by default", () => {
  const m = defineGameShell({});
  assert.equal(m.features.onboarding, true);
  assert.equal(m.features.cloudSync, true);
  assert.equal(m.features.leaderboard, false); // opt-in
  assert.equal(m.dailyRewardDays, 7);
});

test("a game can narrow enabled screens and toggle features", () => {
  const m: GameShellManifest = defineGameShell({
    enabledScreens: ["splash", "loading", "home", "level-select", "activity", "result"],
    features: { ads: true, leaderboard: true, premium: false },
  });
  assert.deepEqual(m.enabledScreens?.includes("shop"), false);
  assert.equal(m.features.ads, true);
  assert.equal(m.features.premium, false);
});

test("mountGame validates its inputs before touching the DOM", () => {
  // Missing definition → clear error (no config).
  assert.throws(() => mountGame({} as never, { nodeType: 1 }), /requires a config with a `definition`/);
  // Missing render target → clear error (actual rendering needs a DOM, exercised in apps/web).
  assert.throws(
    () => mountGame({ definition: { id: "x" } as never }, null as never),
    /requires a DOM element/,
  );
});

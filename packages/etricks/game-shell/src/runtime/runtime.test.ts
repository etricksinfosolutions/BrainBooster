import { test } from "node:test";
import assert from "node:assert/strict";
import { defineGame } from "@etricks/game-definition";
import { resolveGameIdentity } from "../identity.js";
import { createMockPorts } from "../adapters/mock.js";
import { canTransition, routeAfterBoot } from "./navigation.js";
import { initialState } from "./state.js";
import { rootReducer } from "./reducer.js";
import { bootstrapRuntime, bootOptionsFromManifest } from "./bootstrap.js";

const identity = resolveGameIdentity(
  defineGame({
    definitionVersion: 1,
    id: "runtime-test",
    title: "Runtime Test",
    engines: ["activity"],
    locales: ["fr", "en"],
    progression: { mode: "levels", levels: 2 },
  }),
);

// --- Navigation FSM ---------------------------------------------------------

test("navigation FSM allows the legal launch + play flow", () => {
  assert.ok(canTransition("splash", "loading"));
  assert.ok(canTransition("loading", "home"));
  assert.ok(canTransition("home", "level-select"));
  assert.ok(canTransition("level-select", "activity"));
  assert.ok(canTransition("activity", "result"));
  assert.ok(canTransition("result", "reward"));
  assert.ok(canTransition("reward", "home"));
});

test("navigation FSM rejects illegal transitions (never open straight into an activity)", () => {
  assert.equal(canTransition("splash", "activity"), false);
  assert.equal(canTransition("loading", "activity"), false);
  assert.equal(canTransition("world-select", "activity"), false); // must go via level-select
  assert.equal(canTransition("shop", "activity"), false);
});

test("routeAfterBoot picks onboarding / login / home by session state", () => {
  assert.equal(routeAfterBoot({ hasSession: true, onboardingEnabled: true, loginEnabled: true, onboardingSeen: false }), "home");
  assert.equal(routeAfterBoot({ hasSession: false, onboardingEnabled: true, loginEnabled: true, onboardingSeen: false }), "onboarding");
  assert.equal(routeAfterBoot({ hasSession: false, onboardingEnabled: true, loginEnabled: true, onboardingSeen: true }), "login");
  assert.equal(routeAfterBoot({ hasSession: false, onboardingEnabled: false, loginEnabled: false, onboardingSeen: true }), "home");
});

// --- Reducer ----------------------------------------------------------------

test("initialState derives from the game identity", () => {
  const s = initialState(identity);
  assert.equal(s.navigation.screen, "splash");
  assert.equal(s.session.status, "booting");
  assert.equal(s.settings.language, "fr"); // first locale
  assert.deepEqual(s.theme, identity.theme);
});

test("NAVIGATE follows the FSM: legal moves push history, illegal moves are no-ops", () => {
  let s = initialState(identity);
  s = rootReducer(s, { type: "NAVIGATE", to: "loading" });
  assert.equal(s.navigation.screen, "loading");
  assert.deepEqual(s.navigation.history, ["splash"]);

  const before = s;
  s = rootReducer(s, { type: "NAVIGATE", to: "activity" }); // illegal from loading
  assert.equal(s, before, "illegal navigation returns the same state object");

  s = rootReducer(s, { type: "NAVIGATE", to: "home" });
  s = rootReducer(s, { type: "NAVIGATE_BACK" });
  assert.equal(s.navigation.screen, "loading");
});

test("BOOT_COMPLETE moves the session to ready, applies profile/economy, and routes", () => {
  const s = rootReducer(initialState(identity), {
    type: "BOOT_COMPLETE",
    profile: { playerId: "p1", displayName: "Kid", premium: true, locale: "en" },
    economy: { coins: 30, diamonds: 2, xp: 100, streakDays: 3 },
    lastCheckpoint: { worldId: "w1", levelId: "l2" },
    online: true,
    onboardingSeen: true,
    route: "home",
  });
  assert.equal(s.session.status, "ready");
  assert.equal(s.session.playerId, "p1");
  assert.equal(s.premium, true);
  assert.equal(s.economy.coins, 30);
  assert.deepEqual(s.progress.lastCheckpoint, { worldId: "w1", levelId: "l2" });
  assert.equal(s.navigation.screen, "home");
});

test("settings/accessibility/error actions patch the right slice", () => {
  let s = initialState(identity);
  s = rootReducer(s, { type: "UPDATE_SETTINGS", patch: { music: false } });
  assert.equal(s.settings.music, false);
  assert.equal(s.settings.sound, true); // untouched
  s = rootReducer(s, { type: "UPDATE_ACCESSIBILITY", patch: { reducedMotion: true } });
  assert.equal(s.accessibility.reducedMotion, true);
  s = rootReducer(s, { type: "SET_ERROR", error: { fatal: false, kind: "offline", message: "no net" } });
  assert.equal(s.error?.kind, "offline");
  s = rootReducer(s, { type: "CLEAR_ERROR" });
  assert.equal(s.error, null);
});

// --- Bootstrap (through the ports, hot-swappable) ---------------------------

test("bootstrapRuntime loads through the ports and routes a first-run player", async () => {
  const ports = createMockPorts();
  const action = await bootstrapRuntime(ports, bootOptionsFromManifest(undefined));
  assert.equal(action.type, "BOOT_COMPLETE");
  assert.equal(action.profile, null); // mock auth: not signed in yet
  assert.equal(action.route, "onboarding"); // first run, onboarding enabled by default
  assert.deepEqual(action.economy, { coins: 0, diamonds: 0, xp: 0, streakDays: 0 });
});

test("bootstrapRuntime routes a returning player straight home", async () => {
  const ports = createMockPorts();
  await ports.auth!.signInGuest(); // now current() returns a profile
  const action = await bootstrapRuntime(ports, bootOptionsFromManifest(undefined));
  assert.notEqual(action.profile, null);
  assert.equal(action.route, "home");
});

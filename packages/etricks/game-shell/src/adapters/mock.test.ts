/**
 * Tests for the in-memory mock adapters. These prove the dev/test doubles behave like a real session:
 * auth state transitions, economy mutation with a >= 0 spend clamp, and analytics capture. Uses
 * node:test + node:assert/strict per repo convention.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createMockAuthPort,
  createMockEconomyPort,
  createMockAnalyticsPort,
  createMockPorts,
} from "./mock.js";

test("auth: current() is null until guest sign-in, then returns the profile", async () => {
  const auth = createMockAuthPort();

  assert.equal(await auth.current(), null);

  const profile = await auth.signInGuest();
  assert.equal(profile.premium, false);
  assert.match(profile.playerId, /^guest-\d+$/);

  const current = await auth.current();
  assert.deepEqual(current, profile);

  await auth.signOut();
  assert.equal(await auth.current(), null);
});

test("economy: award raises coins and returns the new balance", async () => {
  const economy = createMockEconomyPort();

  const w1 = await economy.award({ coins: 30 }, "level-complete");
  assert.equal(w1.coins, 30);

  const w2 = await economy.award({ coins: 20, xp: 5 }, "bonus");
  assert.equal(w2.coins, 50);
  assert.equal(w2.xp, 5);

  assert.equal((await economy.wallet()).coins, 50);
});

test("economy: spend clamps every currency at zero", async () => {
  const economy = createMockEconomyPort({ coins: 40 });

  const after = await economy.spend({ coins: 100 }, "overspend");
  assert.equal(after.coins, 0, "spend must not go negative");

  const again = await economy.spend({ coins: 10 }, "still-broke");
  assert.equal(again.coins, 0);
});

test("analytics: track records events in order in the inspectable array", () => {
  const analytics = createMockAnalyticsPort();

  analytics.track("game_start");
  analytics.track("level_complete", { level: 3, score: 900 });

  assert.equal(analytics.events.length, 2);
  assert.deepEqual(analytics.events[0], { event: "game_start" });
  assert.deepEqual(analytics.events[1], { event: "level_complete", props: { level: 3, score: 900 } });
});

test("createMockPorts: assembles all ports; overrides win", () => {
  const custom = createMockAnalyticsPort();
  const ports = createMockPorts({ analytics: custom });

  assert.ok(ports.auth && ports.save && ports.economy && ports.rewards);
  assert.ok(ports.leaderboard && ports.commerce && ports.notifications && ports.content);
  assert.equal(ports.analytics, custom);
});

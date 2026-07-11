/**
 * Golden-Rule guard (Sentinel).
 *
 * The platform packages (@etricks/game-shell and @etricks/game-definition) MUST
 * stay entirely game-agnostic. No individual game — least of all our reference
 * game, Brain Booster, or its "Tigo" mascot — may leak its name or concepts into
 * the shared platform source. This is the "Golden Rule": platform code knows
 * nothing about any specific game.
 *
 * This test walks the SOURCE (non-test) TypeScript files of both platform
 * packages and fails loudly if a game-specific token ever appears. It is a
 * merge-gate: a future PR that hardcodes Brain-Booster behaviour into the shell
 * will turn this suite red before it can land.
 *
 * Directory paths are resolved relative to THIS file (via import.meta.url) so the
 * check keeps working no matter where the repo is checked out.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Tokens that betray game-specific content sneaking into platform packages. */
const FORBIDDEN_PATTERNS: readonly RegExp[] = [/brain\s*booster/i, /\btigo\b/i];

/**
 * Strip comments before scanning. The Golden Rule bans game-specific *code* (a hardcoded
 * `displayName: "Brain Booster"`, a `if (game === "tigo")`), NOT prose that documents how a
 * generalization was extracted from the reference game — those explanatory comments are valuable and
 * allowed. Removing comments keeps the guard catching real violations (string literals / identifiers
 * survive stripping) while letting the code stay well-documented about its Brain Booster lineage.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

// This file lives at packages/game-shell/src/golden-rule.test.ts, so the two
// platform package source roots are reachable via relative hops.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME_SHELL_SRC = HERE; // packages/game-shell/src
const GAME_DEFINITION_SRC = path.resolve(
  HERE,
  "..",
  "..",
  "game-definition",
  "src",
); // packages/game-definition/src

const SCAN_ROOTS: readonly string[] = [GAME_SHELL_SRC, GAME_DEFINITION_SRC];

/**
 * Recursively collect every non-test .ts file under `dir`. Test files (whose
 * name ends in .test.ts, like this one) are excluded so that the guard patterns
 * written here don't trip the guard itself.
 */
function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    // A package may legitimately not exist in every checkout slice; skip it.
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

test("platform source contains no game-specific (Brain Booster / Tigo) tokens", () => {
  const violations: string[] = [];

  for (const root of SCAN_ROOTS) {
    for (const file of collectSourceFiles(root)) {
      const contents = stripComments(readFileSync(file, "utf8"));
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(contents)) {
          violations.push(`${file} matched ${pattern}`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Platform packages must stay game-agnostic (Golden Rule). Offenders:\n${violations.join(
      "\n",
    )}`,
  );
});

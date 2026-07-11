import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ShellProvider } from "./runtime/context.js";
import type { ScreenComponent } from "./runtime/screen-registry.js";
import { defaultScreens } from "./screens/index.js";
import { scienceMasterConfig } from "./science-master.fixture.js";

/**
 * SCIENCE MASTER GATE — the Wave 2 acceptance proof.
 *
 * A single test that manufactures a whole game from configuration alone: every registered default
 * screen is rendered inside a `ShellProvider` fed ONLY `scienceMasterConfig` (no per-screen props, no
 * game code). It proves three things at once:
 *   1. Zero-new-UI: not one of the ~25 screens throws when driven purely by config.
 *   2. Themed identity reaches the pixels: the game's own name ("Science Master") and mascot ("Atom")
 *      appear in the rendered markup — the config actually skins the shell.
 *   3. De-branding: NONE of the reference game's identity ("Brain Booster" / "Brain Coin" / "Tigo")
 *      leaks through — the shell carries no game-specific baggage.
 *
 * NO JSX (per the merge brief): screens are constructed with `React.createElement`, rendered to static
 * markup with `react-dom/server`. Effects do not run under static rendering, so each screen renders
 * against the provider's initial (booting) state — exactly the propless render we want to validate.
 */

/** Render one propless screen inside the Science Master shell and return its static HTML. */
function renderScreen(Component: ScreenComponent): string {
  return renderToStaticMarkup(
    createElement(ShellProvider, { config: scienceMasterConfig }, createElement(Component)),
  );
}

test("Science Master gate: every default screen renders from config alone, branded only as Science Master", () => {
  const entries = Object.entries(defaultScreens);
  // The full ADR-0027 screen vocabulary must be registered (launch → home → play → economy → support).
  assert.ok(entries.length >= 25, `expected the full default screen set, got ${entries.length}`);

  // 1) Render EVERY registered screen; a throw fails the gate with the offending screen id.
  const markupByScreen: string[] = [];
  for (const [id, Component] of entries) {
    assert.ok(Component, `screen "${id}" must have a registered component`);
    let markup = "";
    assert.doesNotThrow(() => {
      markup = renderScreen(Component as ScreenComponent);
    }, `screen "${id}" must render without throwing under the Science Master config`);
    markupByScreen.push(markup);
  }
  const aggregate = markupByScreen.join("\n");

  // 2) The manufactured game's declared identity actually reaches the rendered screens.
  assert.ok(aggregate.includes("Science Master"), "the game's display name should render somewhere");
  assert.ok(aggregate.includes("Atom"), "the game's mascot name should render somewhere");

  // 3) De-branding guard: none of the reference game's identity may appear in a different game's shell.
  for (const forbidden of ["Brain Booster", "Brain Coin", "Tigo"]) {
    assert.ok(!aggregate.includes(forbidden), `de-branded: "${forbidden}" must not appear in any screen`);
  }
});

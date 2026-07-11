import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Activity } from "@etricks/activity-engine";
import { createActivitySession, gradeResponse } from "@etricks/activity-engine";
import { ShellProvider } from "../runtime/context.js";
import { ActivityPlayer } from "./ActivityPlayer.js";
import { scienceMasterConfig } from "../science-master.fixture.js";

/**
 * Wave 3 proof: the game-neutral ActivityPlayer turns real activity-engine content into a playable
 * DOM question, and the engine grades the expected response. This is what makes Science Master (and
 * every config-only game) actually PLAYABLE through the shell — not just navigable.
 */

const mcActivity: Activity = {
  id: "sci-mc-0001",
  tags: ["science"],
  content: {
    type: "multiple-choice",
    prompt: "Which gas do plants absorb from the air for photosynthesis?",
    choices: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 1,
  },
};

test("ActivityPlayer renders a real science question with its choices as a playable DOM", () => {
  const markup = renderToStaticMarkup(
    createElement(
      ShellProvider,
      { config: scienceMasterConfig },
      createElement(ActivityPlayer, { gameId: "science-master", activities: [mcActivity], onComplete: () => {} }),
    ),
  );
  assert.match(markup, /photosynthesis/, "the question prompt renders");
  assert.match(markup, /Carbon dioxide/, "the answer choices render");
  assert.match(markup, /1\/1/, "the progress indicator renders");
});

test("the engine grades the player's response as the player wires it", () => {
  const session = createActivitySession(mcActivity, undefined, "test:sci-mc-0001");
  // The player submits { choiceIndex } for choice activities (ChoiceView → useActivityPlay.submit).
  const correctIdx = (session.prepared as { correctIndex: number }).correctIndex;
  const right = gradeResponse(session, { choiceIndex: correctIdx });
  const wrong = gradeResponse(session, { choiceIndex: (correctIdx + 1) % 4 });
  assert.equal(right.solved, true, "correct choice grades as solved");
  assert.ok(right.stars >= 1, "a correct answer earns stars");
  assert.equal(wrong.solved, false, "a wrong choice grades as unsolved");
});

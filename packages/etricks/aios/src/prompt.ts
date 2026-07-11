import type { GenerationSpec } from "./spec.js";
import type { LanguageModelRequest } from "./ports.js";

/**
 * Prompt construction for quiz manufacturing.
 *
 * The system message is stable across a run (good for prompt caching); the user message
 * carries the batch size and the list of prompts already produced, so the model doesn't
 * repeat itself. The JSON contract mirrors QuizItem exactly — AIOS still validates every
 * item against the engine's Zod schema, so this is guidance, not a trusted boundary.
 */

const JSON_CONTRACT = `Return ONLY a JSON object of the form:
{"items":[{"prompt":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"...","difficulty":"easy|medium|hard","tags":["..."]}]}
Rules:
- 4 choices per question; exactly one correct; "correctIndex" is the 0-based index of the correct choice.
- All choices distinct and plausible; do not signal the answer by length or phrasing.
- "explanation" is one short factual sentence.
- No markdown, no prose, no code fences — just the JSON object.`;

export function buildSystemPrompt(spec: GenerationSpec): string {
  return [
    `You write factual, unambiguous multiple-choice quiz questions for the game "${spec.gameId}".`,
    `Topic: ${spec.topic}. Language: ${spec.locale}.`,
    `Every question must have exactly one defensible correct answer and no trick wording.`,
    JSON_CONTRACT,
  ].join("\n\n");
}

function difficultyGuidance(spec: GenerationSpec): string {
  if (!spec.difficultyMix) return "Mix easy, medium, and hard questions.";
  const parts = Object.entries(spec.difficultyMix)
    .filter(([, w]) => w > 0)
    .map(([d, w]) => `${d} (~${w})`);
  return `Aim for this rough difficulty balance: ${parts.join(", ")}.`;
}

export function buildUserPrompt(
  spec: GenerationSpec,
  batchSize: number,
  avoidPrompts: readonly string[],
): LanguageModelRequest["user"] {
  const lines = [
    `Write ${batchSize} new ${spec.topic} questions.`,
    difficultyGuidance(spec),
  ];
  if (avoidPrompts.length > 0) {
    lines.push(
      `Do NOT repeat or paraphrase any of these already-used questions:`,
      ...avoidPrompts.map((p) => `- ${p}`),
    );
  }
  return lines.join("\n");
}

export function buildRequest(
  spec: GenerationSpec,
  batchSize: number,
  avoidPrompts: readonly string[],
): LanguageModelRequest {
  return {
    system: buildSystemPrompt(spec),
    user: buildUserPrompt(spec, batchSize, avoidPrompts),
  };
}

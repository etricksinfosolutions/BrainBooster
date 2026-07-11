import type { MemorySpec } from "./memory-spec.js";
import type { LanguageModelRequest } from "./ports.js";

/**
 * Prompt construction for memory manufacturing.
 *
 * The model only proposes CONCEPTS (a label, a difficulty, tags) — AIOS derives the stable id
 * and the image AssetRef itself, so the model never dictates asset locations. As with quiz,
 * this is guidance: every pair is validated against the memory engine's Zod schema afterwards.
 */

const JSON_CONTRACT = `Return ONLY a JSON object of the form:
{"items":[{"label":"...","difficulty":"easy|medium|hard","tags":["..."]}]}
Rules:
- Each "label" is a single, concrete, visually depictable concept (a noun you could show as one clear picture).
- Labels must be distinct within the theme; no synonyms or near-duplicates.
- No markdown, no prose, no code fences — just the JSON object.`;

export function buildMemorySystemPrompt(spec: MemorySpec): string {
  return [
    `You curate concept sets for a picture-matching (memory) game called "${spec.gameId}".`,
    `Theme: ${spec.theme}. Language: ${spec.locale}.`,
    `Every concept must be concrete and instantly recognisable as a single image.`,
    JSON_CONTRACT,
  ].join("\n\n");
}

function difficultyGuidance(spec: MemorySpec): string {
  if (!spec.difficultyMix) return "Mix easy, medium, and hard concepts.";
  const parts = Object.entries(spec.difficultyMix)
    .filter(([, w]) => w > 0)
    .map(([d, w]) => `${d} (~${w})`);
  return `Aim for this rough difficulty balance: ${parts.join(", ")}.`;
}

export function buildMemoryUserPrompt(
  spec: MemorySpec,
  batchSize: number,
  avoidLabels: readonly string[],
): string {
  const lines = [
    `List ${batchSize} new ${spec.theme} concepts.`,
    difficultyGuidance(spec),
  ];
  if (avoidLabels.length > 0) {
    lines.push(
      `Do NOT repeat any of these already-used concepts:`,
      ...avoidLabels.map((l) => `- ${l}`),
    );
  }
  return lines.join("\n");
}

export function buildMemoryRequest(
  spec: MemorySpec,
  batchSize: number,
  avoidLabels: readonly string[],
): LanguageModelRequest {
  return {
    system: buildMemorySystemPrompt(spec),
    user: buildMemoryUserPrompt(spec, batchSize, avoidLabels),
  };
}

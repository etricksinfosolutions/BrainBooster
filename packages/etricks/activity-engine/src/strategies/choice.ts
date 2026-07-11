import { z } from "zod";
import { AssetRef } from "@etricks/contracts";
import type { ResolvedConfig } from "../config.js";
import { shuffle, type Rng } from "../rng.js";
import type { ActivityStrategy, StrategyGrade } from "../types.js";

/**
 * The single-select family: multiple-choice, true/false, image-quiz, audio-quiz. Four activity
 * types, one mechanic — pick the right option among several. Sharing the prepare/grade core here
 * is the engine thesis in miniature: adding "image-quiz" is a schema + an asset field, not a new
 * gameplay implementation.
 */

const Choices = z.array(z.string().min(1)).min(2).max(6);

/** Prepared form for every single-select activity — choices possibly shuffled, correct tracked. */
export interface PreparedChoice {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  /** Present for image-quiz. */
  image?: z.infer<typeof AssetRef>;
  /** Present for audio-quiz. */
  audio?: z.infer<typeof AssetRef>;
}

export interface ChoiceResponse {
  choiceIndex: number;
}

/** Shuffle choices (per config) while tracking where the correct answer lands. */
function layoutChoices(
  choices: string[],
  correctIndex: number,
  config: ResolvedConfig,
  rng: Rng,
): { choices: string[]; correctIndex: number } {
  if (!config.shuffle) return { choices: choices.slice(), correctIndex };
  const order = shuffle(
    choices.map((_, i) => i),
    rng,
  );
  return {
    choices: order.map((i) => choices[i]!),
    correctIndex: order.indexOf(correctIndex),
  };
}

function gradeChoice(prepared: PreparedChoice, response: ChoiceResponse): StrategyGrade {
  const correct = response?.choiceIndex === prepared.correctIndex;
  return { correctUnits: correct ? 1 : 0, totalUnits: 1, detail: { correct } };
}

// --- multiple-choice ---------------------------------------------------------------------------

export const MultipleChoiceContent = z
  .object({
    type: z.literal("multiple-choice"),
    prompt: z.string().min(1),
    choices: Choices,
    correctIndex: z.number().int().nonnegative(),
    explanation: z.string().optional(),
  })
  .refine((c) => c.correctIndex < c.choices.length, {
    message: "correctIndex must point at an existing choice",
    path: ["correctIndex"],
  });
export type MultipleChoiceContent = z.infer<typeof MultipleChoiceContent>;

export const multipleChoiceStrategy: ActivityStrategy<
  MultipleChoiceContent,
  PreparedChoice,
  ChoiceResponse
> = {
  type: "multiple-choice",
  contentSchema: MultipleChoiceContent,
  prepare(content, config, rng) {
    const laid = layoutChoices(content.choices, content.correctIndex, config, rng);
    return { prompt: content.prompt, explanation: content.explanation, ...laid };
  },
  grade: gradeChoice,
};

// --- true-false --------------------------------------------------------------------------------

export const TrueFalseContent = z.object({
  type: z.literal("true-false"),
  statement: z.string().min(1),
  answer: z.boolean(),
  explanation: z.string().optional(),
});
export type TrueFalseContent = z.infer<typeof TrueFalseContent>;

export interface TrueFalseResponse {
  value: boolean;
}

export const trueFalseStrategy: ActivityStrategy<
  TrueFalseContent,
  { statement: string; answer: boolean; explanation?: string },
  TrueFalseResponse
> = {
  type: "true-false",
  contentSchema: TrueFalseContent,
  prepare: (content) => ({
    statement: content.statement,
    answer: content.answer,
    explanation: content.explanation,
  }),
  grade: (prepared, response) => {
    const correct = response?.value === prepared.answer;
    return { correctUnits: correct ? 1 : 0, totalUnits: 1, detail: { correct } };
  },
};

// --- image-quiz ----------------------------------------------------------------------------------

export const ImageQuizContent = z
  .object({
    type: z.literal("image-quiz"),
    image: AssetRef,
    prompt: z.string().min(1).optional(),
    choices: Choices,
    correctIndex: z.number().int().nonnegative(),
    explanation: z.string().optional(),
  })
  .refine((c) => c.correctIndex < c.choices.length, {
    message: "correctIndex must point at an existing choice",
    path: ["correctIndex"],
  });
export type ImageQuizContent = z.infer<typeof ImageQuizContent>;

export const imageQuizStrategy: ActivityStrategy<ImageQuizContent, PreparedChoice, ChoiceResponse> =
  {
    type: "image-quiz",
    contentSchema: ImageQuizContent,
    prepare(content, config, rng) {
      const laid = layoutChoices(content.choices, content.correctIndex, config, rng);
      return {
        prompt: content.prompt ?? content.image.alt ?? "",
        explanation: content.explanation,
        image: content.image,
        ...laid,
      };
    },
    grade: gradeChoice,
  };

// --- audio-quiz (future-ready asset pipeline; mechanic is live + gradable today) ----------------

export const AudioQuizContent = z
  .object({
    type: z.literal("audio-quiz"),
    audio: AssetRef,
    prompt: z.string().min(1).optional(),
    choices: Choices,
    correctIndex: z.number().int().nonnegative(),
    explanation: z.string().optional(),
  })
  .refine((c) => c.correctIndex < c.choices.length, {
    message: "correctIndex must point at an existing choice",
    path: ["correctIndex"],
  });
export type AudioQuizContent = z.infer<typeof AudioQuizContent>;

export const audioQuizStrategy: ActivityStrategy<AudioQuizContent, PreparedChoice, ChoiceResponse> =
  {
    type: "audio-quiz",
    contentSchema: AudioQuizContent,
    prepare(content, config, rng) {
      const laid = layoutChoices(content.choices, content.correctIndex, config, rng);
      return {
        prompt: content.prompt ?? content.audio.alt ?? "",
        explanation: content.explanation,
        audio: content.audio,
        ...laid,
      };
    },
    grade: gradeChoice,
  };

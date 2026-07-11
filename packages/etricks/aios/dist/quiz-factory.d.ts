import { type QuizPayload as QuizPayloadT } from "@etricks/quiz-engine";
import type { LanguageModel } from "./ports.js";
import { GenerationSpec } from "./spec.js";
import type { ContentFactory, GenerateOptions, GenerationResult } from "./factory.js";
export declare function generateQuizQuestions(spec: GenerationSpec, model: LanguageModel, options?: GenerateOptions): Promise<GenerationResult<QuizPayloadT>>;
/** The registered factory for (engine: "quiz", contentType: "questions"). */
export declare const quizQuestionFactory: ContentFactory<GenerationSpec, QuizPayloadT>;
//# sourceMappingURL=quiz-factory.d.ts.map
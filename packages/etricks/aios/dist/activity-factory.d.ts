import { type ActivityPayload as ActivityPayloadT, type ActivityType } from "@etricks/activity-engine";
import type { LanguageModel } from "./ports.js";
import { ActivitySpec } from "./activity-spec.js";
import type { ContentFactory, GenerateOptions, GenerationResult } from "./factory.js";
export declare function generateActivities(spec: ActivitySpec, model: LanguageModel, options?: GenerateOptions): Promise<GenerationResult<ActivityPayloadT>>;
/**
 * One registered factory per activity type: (engine: "activity", contentType: "<type>").
 * Registering all of them keeps `generateContent` purely additive — a game asks for the type it
 * wants and the registry already has it.
 */
export declare function activityFactoryFor(type: ActivityType): ContentFactory<ActivitySpec, ActivityPayloadT>;
//# sourceMappingURL=activity-factory.d.ts.map
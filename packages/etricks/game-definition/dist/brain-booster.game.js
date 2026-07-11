import { defineGame } from "./game-definition.js";
/**
 * The reference game definition — Brain Booster.
 *
 * Mirrors what the backend currently hand-assembles into a GameManifest, but expressed as the
 * authored composition: TWO heterogeneous engines (quiz + memory), a versioned pack for each,
 * an endless progression, a subscription + rewarded ads. The second engine proves a game
 * composes multiple, differently-shaped engines — the composition contract holds. When the
 * definition→manifest compiler lands, this becomes the single source the backend publishes
 * from. See docs/game-definition.md.
 */
export const brainBoosterGame = defineGame({
    definitionVersion: 1,
    id: "brain-booster",
    title: "Brain Booster",
    engines: ["quiz", "memory"],
    locales: ["en"],
    monetization: { subscription: true, ads: "rewarded" },
    progression: { mode: "endless" },
    content: [
        { packId: "brain-booster-quiz-gk-en", engine: "quiz", version: "1.0.0" },
        { packId: "brain-booster-memory-animals-en", engine: "memory", version: "1.0.0" },
    ],
});
//# sourceMappingURL=brain-booster.game.js.map
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
export declare const brainBoosterGame: {
    definitionVersion: number;
    id: string;
    title: string;
    engines: ("quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation")[];
    locales: string[];
    monetization: {
        subscription: boolean;
        oneTimePurchase: boolean;
        ads: "none" | "rewarded" | "interstitial" | "banner";
    };
    progression: {
        mode: "endless" | "levels" | "campaign" | "daily";
        levels?: number | undefined;
    };
    content: {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation";
        version: string;
    }[];
};
//# sourceMappingURL=brain-booster.game.d.ts.map
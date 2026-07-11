import type { ShellPorts } from "../ports.js";
import type { GameShellManifest } from "../shell-config.js";
import type { Action } from "./reducer.js";
/** Feature flags that affect routing; defaulted so a bare manifest still boots sensibly. */
export interface BootOptions {
    onboardingEnabled: boolean;
    loginEnabled: boolean;
    onboardingSeen: boolean;
    online: boolean;
}
export declare function bootOptionsFromManifest(manifest: GameShellManifest | undefined, overrides?: Partial<BootOptions>): BootOptions;
/**
 * Run boot against the ports and produce the `BOOT_COMPLETE` action. Deterministic given deterministic
 * ports (e.g. the mock adapters), which is what the tests rely on.
 */
export declare function bootstrapRuntime(ports: ShellPorts, options: BootOptions): Promise<Extract<Action, {
    type: "BOOT_COMPLETE";
}>>;
//# sourceMappingURL=bootstrap.d.ts.map
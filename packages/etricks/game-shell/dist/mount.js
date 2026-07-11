import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShellProvider } from "./runtime/context.js";
import { ShellErrorBoundary } from "./runtime/error-boundary.js";
import { RuntimeRoot } from "./runtime/RuntimeRoot.js";
import { composeRegistries } from "./runtime/screen-registry.js";
export function mountGame(config, target, options = {}) {
    if (!config || !config.definition) {
        throw new Error("[game-shell] mountGame requires a config with a `definition`.");
    }
    if (!target) {
        throw new Error("[game-shell] mountGame requires a DOM element to render into.");
    }
    const screens = Array.isArray(options.screens)
        ? composeRegistries(...options.screens)
        : options.screens ?? {};
    const root = createRoot(target);
    root.render(_jsx(StrictMode, { children: _jsx(ShellProvider, { config: config, children: _jsx(ShellErrorBoundary, { children: _jsx(RuntimeRoot, { screens: screens }) }) }) }));
    return {
        unmount() {
            root.unmount();
        },
    };
}
//# sourceMappingURL=mount.js.map
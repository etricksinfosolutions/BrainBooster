import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useShellState } from "./context.js";
export function RuntimeRoot({ screens }) {
    const { navigation } = useShellState();
    const Screen = screens[navigation.screen];
    if (Screen)
        return _jsx(Screen, {});
    return (_jsx("div", { "data-shell-screen": navigation.screen, style: { padding: 24, font: "inherit" }, children: _jsxs("p", { style: { color: "var(--dim)" }, children: ["Screen \u201C", navigation.screen, "\u201D is not registered yet."] }) }));
}
//# sourceMappingURL=RuntimeRoot.js.map
import { type ReactNode } from "react";
import { useShellState } from "./context.js";
import type { ScreenRegistry } from "./screen-registry.js";

/**
 * The runtime root (Wave 1b). Renders the screen component registered for the current navigation
 * screen. Knows nothing about any specific screen or game — it just looks up the registry. Until a
 * screen is registered (Wave 2), it shows a neutral placeholder so the shell still boots and the FSM
 * is observable end-to-end.
 */
export interface RuntimeRootProps {
  screens: ScreenRegistry;
}

export function RuntimeRoot({ screens }: RuntimeRootProps): ReactNode {
  const { navigation } = useShellState();
  const Screen = screens[navigation.screen];
  if (Screen) return <Screen />;
  return (
    <div data-shell-screen={navigation.screen} style={{ padding: 24, font: "inherit" }}>
      <p style={{ color: "var(--dim)" }}>
        Screen “{navigation.screen}” is not registered yet.
      </p>
    </div>
  );
}

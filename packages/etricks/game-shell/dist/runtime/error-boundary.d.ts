import { Component, type ReactNode, type ErrorInfo } from "react";
/**
 * Universal error boundary (Wave 1b). Wraps the runtime so a render error in any screen degrades to a
 * recoverable fallback instead of a white screen. Game-agnostic: the fallback is a plain, themeable
 * message with a retry; games never implement their own. Fatal vs recoverable modes (offline,
 * maintenance, version-mismatch) are represented in `ShellError` and can drive richer fallbacks later.
 */
export interface ErrorBoundaryProps {
    children: ReactNode;
    /** Optional custom fallback; receives the error and a reset callback. */
    fallback?: (error: Error, reset: () => void) => ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
}
interface ErrorBoundaryState {
    error: Error | null;
}
export declare class ShellErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    reset: () => void;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=error-boundary.d.ts.map
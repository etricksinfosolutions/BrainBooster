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

export class ShellErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <div role="alert" style={{ padding: 24, textAlign: "center", font: "inherit" }}>
        <p style={{ fontSize: 40, margin: "8px 0" }}>😕</p>
        <p style={{ fontWeight: 700 }}>Something went wrong.</p>
        <button type="button" onClick={this.reset} style={{ marginTop: 12 }}>
          Try again
        </button>
      </div>
    );
  }
}

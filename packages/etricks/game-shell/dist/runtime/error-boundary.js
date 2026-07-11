import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
export class ShellErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        this.props.onError?.(error, info);
    }
    reset = () => this.setState({ error: null });
    render() {
        const { error } = this.state;
        if (!error)
            return this.props.children;
        if (this.props.fallback)
            return this.props.fallback(error, this.reset);
        return (_jsxs("div", { role: "alert", style: { padding: 24, textAlign: "center", font: "inherit" }, children: [_jsx("p", { style: { fontSize: 40, margin: "8px 0" }, children: "\uD83D\uDE15" }), _jsx("p", { style: { fontWeight: 700 }, children: "Something went wrong." }), _jsx("button", { type: "button", onClick: this.reset, style: { marginTop: 12 }, children: "Try again" })] }));
    }
}
//# sourceMappingURL=error-boundary.js.map
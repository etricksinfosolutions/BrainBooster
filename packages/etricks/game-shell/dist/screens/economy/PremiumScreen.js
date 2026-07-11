import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { usePorts, useShellState, useShellDispatch, useBranding, } from "../../runtime/context.js";
import { EconomyScreen, Card, ActionButton, StateBlock, useUiTokens, asRecord, asArray, asStr, } from "./_shared.js";
function parseFirstProduct(v) {
    const rows = asArray(v);
    for (let i = 0; i < rows.length; i++) {
        const r = asRecord(rows[i]);
        if (!r)
            continue;
        const id = asStr(r["id"]);
        if (!id)
            continue;
        return {
            id,
            title: asStr(r["title"]) ?? "Premium",
            price: asStr(r["price"]),
            feature: asStr(r["feature"]) ?? "premium",
        };
    }
    return null;
}
const BENEFITS = [
    { icon: "🚫", text: "No advertisements" },
    { icon: "🎁", text: "Exclusive cosmetics & skins" },
    { icon: "⚡", text: "Bonus rewards on every level" },
    { icon: "✨", text: "Faster progression" },
    { icon: "☁️", text: "Priority cloud backup" },
];
export function PremiumScreen() {
    const ports = usePorts();
    const premium = useShellState().premium;
    const dispatch = useShellDispatch();
    const branding = useBranding();
    const t = useUiTokens();
    const [phase, setPhase] = useState("loading");
    const [product, setProduct] = useState(null);
    const [buying, setBuying] = useState(false);
    const [failed, setFailed] = useState(null);
    const load = useCallback(() => {
        // Already entitled: no product fetch needed, show the "you're premium" state.
        if (premium) {
            setPhase("ready");
            return;
        }
        if (!ports.commerce) {
            setPhase("error");
            return;
        }
        setPhase("loading");
        let live = true;
        ports.commerce
            .products()
            .then((v) => {
            if (!live)
                return;
            setProduct(parseFirstProduct(v));
            setPhase("ready");
        })
            .catch(() => live && setPhase("error"));
        return () => {
            live = false;
        };
    }, [ports.commerce, premium]);
    useEffect(() => load(), [load]);
    const buy = useCallback(async () => {
        if (!ports.commerce || !product || buying)
            return;
        setBuying(true);
        setFailed(null);
        try {
            await ports.commerce.purchase(product.id);
            // Server is the source of truth — confirm the entitlement before flipping state.
            const entitled = await ports.commerce.isEntitled(product.feature);
            if (entitled) {
                dispatch({ type: "SET_PREMIUM", premium: true });
            }
            else {
                setFailed("Purchase could not be verified. If you were charged, try Restore.");
            }
        }
        catch {
            setFailed("Something went wrong with the purchase. Please try again.");
        }
        finally {
            setBuying(false);
        }
    }, [ports.commerce, product, buying, dispatch]);
    const restore = useCallback(async () => {
        if (!ports.commerce || buying)
            return;
        setBuying(true);
        setFailed(null);
        try {
            await ports.commerce.restore();
            const entitled = await ports.commerce.isEntitled(product?.feature ?? "premium");
            if (entitled)
                dispatch({ type: "SET_PREMIUM", premium: true });
            else
                setFailed("No previous purchase found to restore.");
        }
        catch {
            setFailed("Could not restore purchases. Please try again.");
        }
        finally {
            setBuying(false);
        }
    }, [ports.commerce, buying, product, dispatch]);
    if (phase === "loading") {
        return (_jsx(EconomyScreen, { title: "Premium", children: _jsx(StateBlock, { kind: "loading", message: "Loading premium options\u2026" }) }));
    }
    if (phase === "error") {
        return (_jsx(EconomyScreen, { title: "Premium", children: _jsx(StateBlock, { kind: "error", message: "Premium is unavailable right now.", onRetry: () => load() }) }));
    }
    // Entitled state.
    if (premium) {
        return (_jsx(EconomyScreen, { title: "Premium", children: _jsxs(Card, { style: { textAlign: "center" }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 56 }, children: "👑" }), _jsx("h2", { style: { margin: "8px 0", fontSize: `calc(1.3rem * ${t.fontScale})` }, children: "You are Premium!" }), _jsxs("p", { style: { margin: 0, color: "var(--dim)" }, children: ["Thanks for supporting ", branding.displayName, ". Every premium benefit is unlocked."] }), _jsx("ul", { style: { listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 8 }, children: BENEFITS.map((b) => (_jsxs("li", { style: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 20 }, children: b.icon }), _jsx("span", { children: b.text })] }, b.text))) })] }) }));
    }
    // Upsell state.
    return (_jsx(EconomyScreen, { title: "Premium", subtitle: `Get the most out of ${branding.displayName}`, children: _jsxs(Card, { style: { textAlign: "center" }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 56 }, children: "✨" }), _jsx("h2", { style: { margin: "8px 0 4px", fontSize: `calc(1.3rem * ${t.fontScale})` }, children: product?.title ?? "Go Premium" }), product?.price ? (_jsx("p", { style: { margin: "0 0 4px", fontWeight: 800, fontSize: `calc(1.15rem * ${t.fontScale})`, color: "var(--accent)" }, children: product.price })) : null, _jsx("p", { style: { margin: 0, color: "var(--dim)" }, children: "Unlock everything, forever." }), _jsx("ul", { style: { listStyle: "none", padding: 0, margin: "20px 0", display: "grid", gap: 10, textAlign: "left" }, children: BENEFITS.map((b) => (_jsxs("li", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsx("span", { "aria-hidden": "true", style: {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: "var(--bg)",
                                    border: t.border,
                                    fontSize: 18,
                                    flexShrink: 0,
                                }, children: b.icon }), _jsx("span", { style: { fontSize: `calc(1rem * ${t.fontScale})` }, children: b.text })] }, b.text))) }), failed ? (_jsx("p", { role: "alert", style: { margin: "0 0 12px", color: "var(--bad)", fontWeight: 700 }, children: failed })) : null, _jsx(ActionButton, { full: true, onClick: buy, disabled: buying || !product, ariaLabel: product ? `Upgrade to ${product.title}` : "Upgrade to premium", children: buying ? "Opening secure checkout…" : product?.price ? `Upgrade — ${product.price}` : "Upgrade to Premium" }), _jsx("div", { style: { marginTop: 10 }, children: _jsx(ActionButton, { variant: "ghost", full: true, onClick: restore, disabled: buying, ariaLabel: "Restore purchases", children: "Restore purchase" }) }), _jsx("p", { style: { margin: "12px 0 0", fontSize: ".78rem", color: "var(--dim)" }, children: "Payment is handled securely by your app store. A parent or account holder completes the purchase." })] }) }));
}
//# sourceMappingURL=PremiumScreen.js.map
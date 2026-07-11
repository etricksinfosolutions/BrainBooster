import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  usePorts,
  useShellState,
  useShellDispatch,
  useBranding,
} from "../../runtime/context.js";
import {
  EconomyScreen,
  Card,
  ActionButton,
  StateBlock,
  useUiTokens,
  asRecord,
  asArray,
  asStr,
} from "./_shared.js";

/**
 * PremiumScreen ("premium") — the subscription/upgrade upsell. Entitlement is read from authoritative
 * state (`state.premium`); the purchase is validated server-side through the commerce port
 * (`purchase()` → `isEntitled()`), and only then does the shell flip local premium state (ADR-0021).
 * Benefit copy is generic and the app name comes from branding.displayName — no brand or price literals.
 */

interface Product {
  id: string;
  title: string;
  price: string | null;
  feature: string;
}

function parseFirstProduct(v: unknown): Product | null {
  const rows = asArray(v);
  for (let i = 0; i < rows.length; i++) {
    const r = asRecord(rows[i]);
    if (!r) continue;
    const id = asStr(r["id"]);
    if (!id) continue;
    return {
      id,
      title: asStr(r["title"]) ?? "Premium",
      price: asStr(r["price"]),
      feature: asStr(r["feature"]) ?? "premium",
    };
  }
  return null;
}

const BENEFITS: { icon: string; text: string }[] = [
  { icon: "🚫", text: "No advertisements" },
  { icon: "🎁", text: "Exclusive cosmetics & skins" },
  { icon: "⚡", text: "Bonus rewards on every level" },
  { icon: "✨", text: "Faster progression" },
  { icon: "☁️", text: "Priority cloud backup" },
];

export function PremiumScreen(): ReactNode {
  const ports = usePorts();
  const premium = useShellState().premium;
  const dispatch = useShellDispatch();
  const branding = useBranding();
  const t = useUiTokens();

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [product, setProduct] = useState<Product | null>(null);
  const [buying, setBuying] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

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
        if (!live) return;
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
    if (!ports.commerce || !product || buying) return;
    setBuying(true);
    setFailed(null);
    try {
      await ports.commerce.purchase(product.id);
      // Server is the source of truth — confirm the entitlement before flipping state.
      const entitled = await ports.commerce.isEntitled(product.feature);
      if (entitled) {
        dispatch({ type: "SET_PREMIUM", premium: true });
      } else {
        setFailed("Purchase could not be verified. If you were charged, try Restore.");
      }
    } catch {
      setFailed("Something went wrong with the purchase. Please try again.");
    } finally {
      setBuying(false);
    }
  }, [ports.commerce, product, buying, dispatch]);

  const restore = useCallback(async () => {
    if (!ports.commerce || buying) return;
    setBuying(true);
    setFailed(null);
    try {
      await ports.commerce.restore();
      const entitled = await ports.commerce.isEntitled(product?.feature ?? "premium");
      if (entitled) dispatch({ type: "SET_PREMIUM", premium: true });
      else setFailed("No previous purchase found to restore.");
    } catch {
      setFailed("Could not restore purchases. Please try again.");
    } finally {
      setBuying(false);
    }
  }, [ports.commerce, buying, product, dispatch]);

  if (phase === "loading") {
    return (
      <EconomyScreen title="Premium">
        <StateBlock kind="loading" message="Loading premium options…" />
      </EconomyScreen>
    );
  }
  if (phase === "error") {
    return (
      <EconomyScreen title="Premium">
        <StateBlock kind="error" message="Premium is unavailable right now." onRetry={() => load()} />
      </EconomyScreen>
    );
  }

  // Entitled state.
  if (premium) {
    return (
      <EconomyScreen title="Premium">
        <Card style={{ textAlign: "center" }}>
          <span aria-hidden="true" style={{ fontSize: 56 }}>
            {"👑"}
          </span>
          <h2 style={{ margin: "8px 0", fontSize: `calc(1.3rem * ${t.fontScale})` }}>
            You are Premium!
          </h2>
          <p style={{ margin: 0, color: "var(--dim)" }}>
            Thanks for supporting {branding.displayName}. Every premium benefit is unlocked.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 8 }}>
            {BENEFITS.map((b) => (
              <li key={b.text} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                <span aria-hidden="true" style={{ fontSize: 20 }}>
                  {b.icon}
                </span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </EconomyScreen>
    );
  }

  // Upsell state.
  return (
    <EconomyScreen title="Premium" subtitle={`Get the most out of ${branding.displayName}`}>
      <Card style={{ textAlign: "center" }}>
        <span aria-hidden="true" style={{ fontSize: 56 }}>
          {"✨"}
        </span>
        <h2 style={{ margin: "8px 0 4px", fontSize: `calc(1.3rem * ${t.fontScale})` }}>
          {product?.title ?? "Go Premium"}
        </h2>
        {product?.price ? (
          <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: `calc(1.15rem * ${t.fontScale})`, color: "var(--accent)" }}>
            {product.price}
          </p>
        ) : null}
        <p style={{ margin: 0, color: "var(--dim)" }}>Unlock everything, forever.</p>

        <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", display: "grid", gap: 10, textAlign: "left" }}>
          {BENEFITS.map((b) => (
            <li key={b.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                aria-hidden="true"
                style={{
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
                }}
              >
                {b.icon}
              </span>
              <span style={{ fontSize: `calc(1rem * ${t.fontScale})` }}>{b.text}</span>
            </li>
          ))}
        </ul>

        {failed ? (
          <p role="alert" style={{ margin: "0 0 12px", color: "var(--bad)", fontWeight: 700 }}>
            {failed}
          </p>
        ) : null}

        <ActionButton
          full
          onClick={buy}
          disabled={buying || !product}
          ariaLabel={product ? `Upgrade to ${product.title}` : "Upgrade to premium"}
        >
          {buying ? "Opening secure checkout…" : product?.price ? `Upgrade — ${product.price}` : "Upgrade to Premium"}
        </ActionButton>
        <div style={{ marginTop: 10 }}>
          <ActionButton variant="ghost" full onClick={restore} disabled={buying} ariaLabel="Restore purchases">
            Restore purchase
          </ActionButton>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: ".78rem", color: "var(--dim)" }}>
          Payment is handled securely by your app store. A parent or account holder completes the purchase.
        </p>
      </Card>
    </EconomyScreen>
  );
}

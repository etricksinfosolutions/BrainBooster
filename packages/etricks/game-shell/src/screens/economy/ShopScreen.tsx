import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  usePorts,
  useEconomy,
  useShellState,
  useShellDispatch,
} from "../../runtime/context.js";
import {
  EconomyScreen,
  SectionTitle,
  StateBlock,
  useUiTokens,
  asRecord,
  asArray,
  asStr,
  asNum,
} from "./_shared.js";

/**
 * ShopScreen ("shop") — buy cosmetic/skin items priced in the game's soft or hard currency. The catalog
 * is content-owned: it's fetched from the content port when present; a small NEUTRAL placeholder catalog
 * keeps the shop functional offline/in dev. Every price is denominated in the currency SKIN
 * (state.economySkin) and every purchase goes through the authoritative economy port
 * (`economy.spend()`) — the shell never mutates the wallet itself (ADR-0027 §5). A live wallet HUD sits
 * in the header. No Brain-Booster item names anywhere.
 */

type CurrencyKind = "soft" | "hard";

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  currency: CurrencyKind;
  price: number;
  category: string;
}

/**
 * Neutral fallback catalog — cosmetic slots only, no game-specific or brand names. Used when no content
 * port is injected or it returns an empty pack, so the shop is never blank in dev. Real games serve
 * their own catalog through the content port. Prices are placeholder catalog data, not wallet amounts.
 */
const FALLBACK_CATALOG: ShopItem[] = [
  { id: "frame-sunrise", name: "Sunrise Frame", icon: "🖼️", currency: "soft", price: 100, category: "Frames" },
  { id: "frame-forest", name: "Forest Frame", icon: "🌿", currency: "soft", price: 120, category: "Frames" },
  { id: "sticker-star", name: "Star Sticker", icon: "⭐", currency: "soft", price: 60, category: "Stickers" },
  { id: "sticker-rocket", name: "Rocket Sticker", icon: "🚀", currency: "soft", price: 80, category: "Stickers" },
  { id: "theme-aurora", name: "Aurora Theme", icon: "🌈", currency: "hard", price: 5, category: "Themes" },
  { id: "theme-midnight", name: "Midnight Theme", icon: "🌙", currency: "hard", price: 6, category: "Themes" },
];

function parseCatalog(v: unknown): ShopItem[] {
  const rec = asRecord(v);
  const rows = asArray(rec ? rec["items"] : v);
  const items = rows.map((raw, i): ShopItem | null => {
    const r = asRecord(raw);
    if (!r) return null;
    const price = asNum(r["price"]);
    if (price === null || price < 0) return null;
    const currency: CurrencyKind = asStr(r["currency"]) === "hard" ? "hard" : "soft";
    return {
      id: asStr(r["id"]) ?? `item-${i}`,
      name: asStr(r["name"]) ?? asStr(r["title"]) ?? "Item",
      icon: asStr(r["icon"]) ?? "🎁",
      currency,
      price,
      category: asStr(r["category"]) ?? "Items",
    };
  });
  return items.filter((x): x is ShopItem => x !== null);
}

export function ShopScreen(): ReactNode {
  const ports = usePorts();
  const wallet = useEconomy();
  const skin = useShellState().economySkin;
  const dispatch = useShellDispatch();
  const t = useUiTokens();

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<Set<string>>(() => new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setPhase("loading");
    let live = true;
    const fallback = () => {
      if (live) {
        setItems(FALLBACK_CATALOG);
        setPhase("ready");
      }
    };
    if (!ports.content) {
      fallback();
      return () => {
        live = false;
      };
    }
    ports.content
      .pack("cosmetics")
      .then((v) => {
        if (!live) return;
        const parsed = parseCatalog(v);
        setItems(parsed.length > 0 ? parsed : FALLBACK_CATALOG);
        setPhase("ready");
      })
      .catch(() => fallback());
    return () => {
      live = false;
    };
  }, [ports.content]);

  useEffect(() => load(), [load]);

  const byCategory = useMemo(() => {
    const map = new Map<string, ShopItem[]>();
    for (const it of items) {
      const list = map.get(it.category) ?? [];
      list.push(it);
      map.set(it.category, list);
    }
    return [...map.entries()];
  }, [items]);

  const buy = useCallback(
    async (item: ShopItem) => {
      if (owned.has(item.id) || busyId) return;
      setNotice(null);
      const balance = item.currency === "hard" ? wallet.diamonds : wallet.coins;
      const label = item.currency === "hard" ? skin.hard.label : skin.soft.label;
      if (balance < item.price) {
        setNotice(`Not enough ${label} for ${item.name}.`);
        return;
      }
      if (!ports.economy) {
        setNotice("Purchases are unavailable right now.");
        return;
      }
      setBusyId(item.id);
      try {
        const delta = item.currency === "hard" ? { diamonds: item.price } : { coins: item.price };
        const next = await ports.economy.spend(delta, `shop:${item.id}`);
        dispatch({ type: "SET_WALLET", economy: next });
        setOwned((prev) => new Set(prev).add(item.id));
        setNotice(`${item.name} unlocked!`);
      } catch {
        setNotice(`Could not buy ${item.name}. Please try again.`);
      } finally {
        setBusyId(null);
      }
    },
    [owned, busyId, wallet.diamonds, wallet.coins, skin, ports.economy, dispatch],
  );

  if (phase === "loading") {
    return (
      <EconomyScreen title="Shop" hud>
        <StateBlock kind="loading" message="Loading the shop…" />
      </EconomyScreen>
    );
  }
  if (phase === "error") {
    return (
      <EconomyScreen title="Shop" hud>
        <StateBlock kind="error" message="The shop is unavailable right now." onRetry={() => load()} />
      </EconomyScreen>
    );
  }
  if (items.length === 0) {
    return (
      <EconomyScreen title="Shop" hud>
        <StateBlock kind="empty" message="No items in the shop yet — check back soon!" />
      </EconomyScreen>
    );
  }

  return (
    <EconomyScreen title="Shop" subtitle="Spend your rewards on cosmetics" hud>
      {notice ? (
        <p
          role="status"
          style={{
            margin: "0 0 12px",
            padding: t.pad,
            borderRadius: "var(--radius)",
            border: t.border,
            background: "var(--surface)",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {notice}
        </p>
      ) : null}

      {byCategory.map(([category, list]) => (
        <div key={category}>
          <SectionTitle>{category}</SectionTitle>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {list.map((item) => {
              const isOwned = owned.has(item.id);
              const icon = item.currency === "hard" ? skin.hard.icon : skin.soft.icon;
              const balance = item.currency === "hard" ? wallet.diamonds : wallet.coins;
              const affordable = balance >= item.price;
              const isBusy = busyId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => buy(item)}
                    disabled={isOwned || isBusy}
                    aria-label={
                      isOwned
                        ? `${item.name}, owned`
                        : `Buy ${item.name} for ${item.price} ${item.currency === "hard" ? skin.hard.label : skin.soft.label}`
                    }
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: t.pad + 4,
                      minHeight: t.minTarget,
                      borderRadius: "var(--radius)",
                      border: isOwned ? t.strongBorder : t.border,
                      background: "var(--surface)",
                      color: "var(--ink)",
                      fontFamily: "var(--font)",
                      cursor: isOwned || isBusy ? "default" : "pointer",
                      opacity: isOwned || affordable ? 1 : 0.6,
                      transition: t.transition,
                    }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 40 }}>
                      {item.icon}
                    </span>
                    <strong style={{ fontSize: `calc(.92rem * ${t.fontScale})`, textAlign: "center" }}>
                      {item.name}
                    </strong>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: "var(--radius)",
                        background: isOwned ? "var(--ok)" : "var(--accent)",
                        color: "var(--accent-ink)",
                        fontWeight: 800,
                        fontSize: ".9rem",
                      }}
                    >
                      {isOwned ? "Owned ✓" : isBusy ? "Buying…" : (
                        <>
                          <span aria-hidden="true">{icon}</span>
                          {item.price}
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </EconomyScreen>
  );
}

import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useShell, useEconomy, useShellState } from "../../runtime/context.js";
import { EconomyScreen, Card, SectionTitle, useUiTokens } from "./_shared.js";
/**
 * WeeklyRewardsScreen ("weekly-rewards") — the weekly analog of the daily ladder. Where daily tracks a
 * single day at a time, this tracks multi-week milestones off the authoritative login streak
 * (state.economy.streakDays). Each milestone is a full week (7 days); the server owns and grants the
 * actual amounts, so the ladder shows the currency skin + reached/locked state rather than fabricated
 * numbers. Tier count follows the game's daily ladder length so a game re-scales both from one config.
 */
const DAYS_PER_WEEK = 7;
export function WeeklyRewardsScreen() {
    const { config } = useShell();
    const wallet = useEconomy();
    const skin = useShellState().economySkin;
    const t = useUiTokens();
    // Number of weekly tiers mirrors the daily ladder length (default 7) so both scale from one knob.
    const weeks = Math.max(1, config.shell?.dailyRewardDays ?? 7);
    const streak = wallet.streakDays;
    const weeksReached = Math.floor(streak / DAYS_PER_WEEK);
    const dayInWeek = streak % DAYS_PER_WEEK;
    const towardNext = Math.round((dayInWeek / DAYS_PER_WEEK) * 100);
    return (_jsxs(EconomyScreen, { title: "Weekly Rewards", subtitle: `${streak} day streak`, hud: true, children: [_jsxs(Card, { style: { marginBottom: 16 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }, children: [_jsxs("div", { children: [_jsxs("strong", { style: { fontSize: `calc(1.1rem * ${t.fontScale})` }, children: ["Week ", Math.min(weeksReached + 1, weeks), " of ", weeks] }), _jsx("p", { style: { margin: "2px 0 0", color: "var(--dim)" }, children: dayInWeek === 0
                                            ? "A new week begins — keep your streak alive!"
                                            : `${DAYS_PER_WEEK - dayInWeek} day${DAYS_PER_WEEK - dayInWeek === 1 ? "" : "s"} to your next weekly reward` })] }), _jsx("span", { "aria-hidden": "true", style: { fontSize: 30 }, children: "📅" })] }), _jsx("div", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": towardNext, "aria-label": "Progress to next weekly reward", style: {
                            marginTop: 12,
                            height: 12,
                            borderRadius: "var(--radius)",
                            background: "var(--bg)",
                            border: t.border,
                            overflow: "hidden",
                        }, children: _jsx("div", { style: {
                                width: `${towardNext}%`,
                                height: "100%",
                                background: "var(--accent)",
                                transition: t.transition,
                            } }) })] }), _jsx(SectionTitle, { children: "Weekly milestones" }), _jsx("ol", { "aria-label": "Weekly reward ladder", style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }, children: Array.from({ length: weeks }, (_, i) => {
                    const requiredDays = (i + 1) * DAYS_PER_WEEK;
                    const reached = weeksReached >= i + 1;
                    const isCurrent = weeksReached === i;
                    const isMilestone = i === weeks - 1;
                    const state = reached ? "reached" : isCurrent ? "current" : "locked";
                    return (_jsxs("li", { "aria-label": `Week ${i + 1}, reach ${requiredDays} day streak: ${state}`, style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: t.pad,
                            borderRadius: "var(--radius)",
                            border: isCurrent ? t.strongBorder : t.border,
                            background: reached ? "var(--accent)" : "var(--surface)",
                            color: reached ? "var(--accent-ink)" : "var(--ink)",
                            opacity: state === "locked" ? 0.6 : 1,
                        }, children: [_jsx("span", { "aria-hidden": "true", style: {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: reached ? "none" : t.border,
                                    background: reached ? "var(--bg)" : "transparent",
                                    fontSize: 22,
                                    flexShrink: 0,
                                }, children: isMilestone ? skin.hard.icon : skin.soft.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsxs("strong", { style: { fontSize: `calc(1rem * ${t.fontScale})` }, children: ["Week ", i + 1] }), _jsxs("p", { style: {
                                            margin: "2px 0 0",
                                            fontSize: ".85rem",
                                            color: reached ? "var(--accent-ink)" : "var(--dim)",
                                        }, children: ["Reach a ", requiredDays, "-day streak", isMilestone ? " · grand bonus" : ""] })] }), _jsx("span", { "aria-hidden": "true", style: { fontSize: 20 }, children: reached ? "✓" : isCurrent ? "⏳" : "🔒" })] }, i));
                }) }), _jsx("p", { style: { marginTop: 16, color: "var(--dim)", fontSize: ".85rem", textAlign: "center" }, children: "Weekly rewards are granted automatically as your streak reaches each milestone." })] }));
}
//# sourceMappingURL=WeeklyRewardsScreen.js.map
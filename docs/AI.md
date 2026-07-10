# BrainBooster AI Platform

Eight agents under [`agents/`](../agents). Each is a dependency-free Node module
with a **deterministic, rule-based default** (so it runs offline and is unit-tested)
and a documented **port seam** for a real model in production. AI manufactures
content; it never invents gameplay.

| Agent | Input → Output | LLM seam |
|---|---|---|
| **content-generator** | topic/seed → validated quiz activity | `llm.complete(prompt)` |
| **personalization** | attempt history → strengths/weaknesses + next skill | — (pure) |
| **difficulty-balancer** | completion/retry/abandon stats → difficulty delta | — (pure) |
| **analytics** | event stream → DAU / retention / funnel | — (pure) |
| **quality-review** | activity → pass/reject + issues (publish gate) | — (pure) |
| **curriculum** | age + goal → prerequisite-ordered learning path | — (pure) |
| **localization** | strings + locale → translated strings + missing list | `translate(text, locale)` |
| **moderation** | username / text → allow/block + reasons + suggestion | — (pure) |

## Design principles
- **Deterministic by default** — seeded RNG (`packages/shared` `seeded()`), no
  network, reproducible output. Makes CI green without a model or API key.
- **Injectable model** — production passes a port; callers don't change.
- **Quality-gated** — everything generated flows through `quality-review` before
  publish (structural + child-safety checks).

## Run an agent
```bash
node agents/content-generator/cli.js math 5   # prints 5 approved math activities
node --test "agents/**/*.test.js"             # 32 unit tests
```

## Wiring a real model (example)
```js
import { generateActivity } from './agents/content-generator/index.js'
const llm = { complete: (p) => callClaude(p) } // your provider adapter
await generateActivity({ topic: 'animals', seed: 1, llm })
```

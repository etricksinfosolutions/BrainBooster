# Contributing

## Workflow
1. Branch from `main`: `feat/…`, `fix/…`, `docs/…`.
2. Keep the build green: run the relevant tests before pushing.
3. Open a PR; CI (`ci.yml`, `platform.yml`) must pass.

## Tests are required
- New agent/service logic → add `*.test.js` (node:test) next to it.
- Game changes → add/extend Vitest tests in `apps/web/src/tests`.
- Don't merge red.

## Code style
- ESM everywhere in agents/services; small, pure functions; comments explain *why*.
- Match the surrounding file's naming and density. No premature abstraction — extract
  a shared package only once ≥2 real callers need it.
- Agents must stay deterministic by default (seeded), with a model port for prod.

## Commit messages
Conventional-commits style: `feat(web): …`, `fix(server): …`, `docs: …`.

## What not to do
- Don't add heavy dependencies to agents/services without justification.
- Don't commit secrets, build artifacts (`dist/`, `node_modules/`), or generated bundles.
- Don't remove/rename shipping game features without an issue + parity note.

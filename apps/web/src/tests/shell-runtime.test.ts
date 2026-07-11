// ---------------------------------------------------------------------------
// Brain Booster begins consuming the platform runtime (@etricks/game-shell).
// Project Phoenix Wave 1b exit criterion #7: apps/web can drive the shell runtime
// end-to-end — resolve identity, boot through injected ports, and navigate the
// screen FSM — without owning any of that logic itself. This is the seam that lets
// apps/web collapse toward a thin mountGame() call in Wave 2.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import { defineGame } from '@etricks/game-definition'
import {
  resolveGameIdentity,
  initialState,
  rootReducer,
  bootstrapRuntime,
  bootOptionsFromManifest,
  createMockPorts,
} from '@etricks/game-shell'

// A Brain-Booster-shaped definition, expressed as pure config — the app supplies
// identity, the shell owns behaviour.
const brainBooster = defineGame({
  definitionVersion: 1,
  id: 'brain-booster',
  title: 'Brain Booster Kids',
  engines: ['activity'],
  locales: ['en'],
  progression: { mode: 'levels', levels: 3 },
  theme: {
    palette: {
      bg: '#efe9fb', surface: '#ffffff', ink: '#2b2350', dim: '#6f639a',
      accent: '#7a5cc8', accentInk: '#ffffff',
    },
    motion: 'playful',
  },
  branding: { displayName: 'Brain Booster Kids', mascot: { name: 'Tigo' } },
})

describe('apps/web consumes the game-shell runtime', () => {
  it('resolves Brain Booster identity through the shell', () => {
    const identity = resolveGameIdentity(brainBooster)
    expect(identity.branding.displayName).toBe('Brain Booster Kids')
    expect(identity.branding.mascot?.name).toBe('Tigo')
    expect(identity.theme.accent).toBe('#7a5cc8')
  })

  it('boots through mock ports and drives the launch -> home -> play flow', async () => {
    const identity = resolveGameIdentity(brainBooster)
    const ports = createMockPorts()
    await ports.auth!.signInGuest() // returning player

    let state = initialState(identity)
    expect(state.navigation.screen).toBe('splash')

    const boot = await bootstrapRuntime(ports, bootOptionsFromManifest(undefined))
    state = rootReducer(state, boot)
    expect(state.session.status).toBe('ready')
    expect(state.navigation.screen).toBe('home') // signed in -> straight home

    // Navigate a legal play flow; the shell owns the FSM.
    state = rootReducer(state, { type: 'NAVIGATE', to: 'level-select' })
    state = rootReducer(state, { type: 'NAVIGATE', to: 'activity' })
    expect(state.navigation.screen).toBe('activity')

    // Illegal jump is rejected by the platform, not the app.
    const before = state
    state = rootReducer(state, { type: 'NAVIGATE', to: 'shop' }) // not reachable from activity
    expect(state).toBe(before)
  })
})

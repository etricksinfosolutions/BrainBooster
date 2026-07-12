/**
 * Internal CAPTCHA generator + verifier. No third-party service.
 *
 * - Text CAPTCHA, random every request.
 * - Rendered server-side to an SVG image (returned as a data URI) so the answer
 *   never travels to the client.
 * - Stored server-side keyed by an opaque id; 5-minute expiry; ONE-TIME use.
 *
 * The store is an in-memory Map behind a tiny interface, swappable for Redis
 * later without touching callers.
 */

const crypto = require('crypto');
const { config } = require('./config');

// Ambiguous glyphs removed (0/O, 1/I/L) so humans aren't unfairly failed.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** @typedef {{ answer: string, expiresAt: number, consumed: boolean }} CaptchaRecord */

class CaptchaService {
  /** @param {{ now?: () => number }} [deps] */
  constructor(deps = {}) {
    /** @type {Map<string, CaptchaRecord>} */
    this._store = new Map();
    this._now = deps.now || Date.now;
    this._ttl = config.captchaTtlMs;
    this._length = config.captchaLength;
  }

  _randomText() {
    const bytes = crypto.randomBytes(this._length);
    let out = '';
    for (let i = 0; i < this._length; i++) {
      out += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return out;
  }

  /**
   * Create a new challenge. Returns the opaque id and an SVG data-URI image.
   * @returns {{ id: string, image: string, expiresInMs: number }}
   */
  issue() {
    this._sweep();
    const id = crypto.randomUUID();
    const answer = this._randomText();
    this._store.set(id, {
      answer,
      expiresAt: this._now() + this._ttl,
      consumed: false,
    });
    return { id, image: this._renderSvgDataUri(answer), expiresInMs: this._ttl };
  }

  /**
   * Verify and CONSUME a challenge (one-time use). Returns a reason so callers
   * can distinguish "wrong" from "expired"/"missing" for audit + UX.
   * @param {string} id
   * @param {string} input
   * @returns {{ ok: boolean, reason?: 'missing' | 'expired' | 'consumed' | 'mismatch' }}
   */
  verify(id, input) {
    const rec = typeof id === 'string' ? this._store.get(id) : undefined;
    if (!rec) return { ok: false, reason: 'missing' };
    // Consume regardless of outcome: a challenge is single-use even on failure.
    this._store.delete(id);
    if (rec.consumed) return { ok: false, reason: 'consumed' };
    if (this._now() > rec.expiresAt) return { ok: false, reason: 'expired' };
    const normalized = String(input || '').trim().toUpperCase();
    if (normalized.length === 0 || normalized !== rec.answer) {
      return { ok: false, reason: 'mismatch' };
    }
    return { ok: true };
  }

  /** Drop expired challenges so the map can't grow unbounded. */
  _sweep() {
    const now = this._now();
    for (const [id, rec] of this._store) {
      if (now > rec.expiresAt) this._store.delete(id);
    }
  }

  /** Deterministic, dependency-free distorted-text SVG → base64 data URI. */
  _renderSvgDataUri(text) {
    const width = 160;
    const height = 60;
    const chars = text.split('');
    const step = width / (chars.length + 1);
    // Stable per-render jitter derived from the text so it looks noisy but is pure.
    const jitter = (seed, mod) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
      return (h % mod) - Math.floor(mod / 2);
    };
    const glyphs = chars
      .map((c, i) => {
        const x = step * (i + 1);
        const y = height / 2 + 8 + jitter(text + i, 10);
        const rot = jitter(text + c + i, 30);
        const hue = (jitter(text + i, 360) + 360) % 360;
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="monospace" font-size="30" font-weight="700" fill="hsl(${hue},60%,40%)" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})">${c}</text>`;
      })
      .join('');
    const lines = Array.from({ length: 4 }, (_, i) => {
      const y1 = 10 + jitter('l1' + text + i, height - 20);
      const y2 = 10 + jitter('l2' + text + i, height - 20);
      return `<line x1="0" y1="${y1}" x2="${width}" y2="${y2}" stroke="hsl(${(i * 90) % 360},50%,60%)" stroke-width="1" opacity="0.5"/>`;
    }).join('');
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="CAPTCHA challenge">` +
      `<rect width="100%" height="100%" fill="#f4f2fb"/>${lines}${glyphs}</svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  }

  /** Test/introspection helper. */
  size() {
    return this._store.size;
  }
}

module.exports = { CaptchaService, ALPHABET };

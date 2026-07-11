import { describe, it, expect } from 'vitest';
import { accessibilityClass } from '../state/store';

// Wires docs/launch/ACCESSIBILITY_AUDIT.md Gap A1: reducedMotion / highContrast
// were declared but never consumed. accessibilityClass() is the renderer that
// turns those settings into app-shell classes (see styles.css .reduced-motion /
// .high-contrast). Kept pure so it is testable without a DOM.
describe('accessibilityClass', () => {
  it('is empty when no accessibility setting is on', () => {
    expect(accessibilityClass({ reducedMotion: false, highContrast: false })).toBe('');
  });
  it('emits reduced-motion when enabled', () => {
    expect(accessibilityClass({ reducedMotion: true, highContrast: false })).toBe('reduced-motion');
  });
  it('emits high-contrast when enabled', () => {
    expect(accessibilityClass({ reducedMotion: false, highContrast: true })).toBe('high-contrast');
  });
  it('emits both, space-separated, when both enabled', () => {
    expect(accessibilityClass({ reducedMotion: true, highContrast: true })).toBe('reduced-motion high-contrast');
  });
});

import { describe, it, expect } from 'vitest';
import { canTransition, allowedTransitions } from './statusRules.js';

describe('status transitions', () => {
  it('allows the normal forward flow', () => {
    expect(canTransition('new', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'resolved')).toBe(true);
  });

  it('allows reopening a resolved inquiry', () => {
    expect(canTransition('resolved', 'in_progress')).toBe(true);
  });

  it('rejects skipping a step or going backwards', () => {
    expect(canTransition('new', 'resolved')).toBe(false);
    expect(canTransition('in_progress', 'new')).toBe(false);
    expect(canTransition('resolved', 'new')).toBe(false);
  });

  it('returns no transitions for an unknown status', () => {
    expect(allowedTransitions('bogus')).toEqual([]);
  });
});
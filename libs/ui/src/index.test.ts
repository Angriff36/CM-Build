import { describe, expect, it } from 'vitest';
import { brandColors, tokensSummary } from './index';

describe('tokens summary', () => {
  it('exposes the primary brand color token', () => {
    const summary = tokensSummary();
    expect(summary.brandColors.primary).toBe(brandColors.primary);
  });
});
